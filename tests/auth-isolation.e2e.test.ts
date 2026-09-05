import { type Server } from 'node:http'
import { createServer } from 'node:https'
import { createServer as createTcpServer } from 'node:net'
import { spawn, type ChildProcess } from 'node:child_process'
import { once } from 'node:events'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test, type APIRequestContext, type BrowserContext } from '@playwright/test'
import { exportJWK, generateKeyPair, SignJWT, type KeyLike } from 'jose'
import { Client as ObjectStorageClient } from '@replit/object-storage'

const clientId = 'auth-isolation-e2e'
let appOrigin: string
let issuerOrigin: string

type Claims = {
  sub: string
  email: string
  username: string
  first_name: string
  last_name: string
}

type OwnedResources = {
  projectId: string
  sceneId: string
  shotId: string
  cellId: string
}

let issuer: Server
let app: ChildProcess
let signingKey: KeyLike
let publicJwk: Record<string, unknown>
let nextClaims: Claims | undefined
const authorizationCodes = new Map<string, Claims>()
let certificateDirectory: string
let appOutput = ''

function claimsFor(label: string): Claims {
  const suffix = randomUUID()
  return {
    sub: `${label}-${suffix}`,
    email: `${label}-${suffix}@example.com`,
    username: `${label}-${suffix}`,
    first_name: label,
    last_name: 'Tester',
  }
}

async function listen(server: Server) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('OIDC issuer did not allocate a TCP port')
  return address.port
}

async function getFreePort() {
  const server = createTcpServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Could not allocate a TCP port')
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  return address.port
}

async function waitForApp() {
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${appOrigin}/api/auth/me`)
      if (response.ok) return
    } catch {
      // The development server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error('Nuxt did not become ready within 60 seconds')
}

async function signIn(context: BrowserContext, claims: Claims, returnTo = '/') {
  nextClaims = claims
  const page = await context.newPage()
  await page.goto(`${appOrigin}/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`)
  await page.waitForLoadState('domcontentloaded')

  const me = await context.request.get(`${appOrigin}/api/auth/me`)
  expect(me.status()).toBe(200)
  expect((await me.json()).user).toMatchObject({
    id: claims.sub,
    email: claims.email,
    firstName: claims.first_name,
    lastName: claims.last_name,
  })
  return page
}

async function createOwnedResources(request: APIRequestContext, owner: string): Promise<OwnedResources> {
  const projectResponse = await request.post(`${appOrigin}/api/projects`, {
    data: {
      title: `${owner} ${randomUUID()}`,
      type: 'feature',
      genre: 'thriller',
      description: `${owner} private project`,
    },
  })
  expect(projectResponse.status(), `${await projectResponse.text()}\n${appOutput}`).toBe(200)
  const project = await projectResponse.json()

  const sceneResponse = await request.post(`${appOrigin}/api/projects/${project.id}/scenes`, {
    data: { order: 2, synopsis: `${owner} private scene` },
  })
  expect(sceneResponse.status()).toBe(200)
  const scene = await sceneResponse.json()

  const shotResponse = await request.post(`${appOrigin}/api/scenes/${scene.id}/shots`, { data: {} })
  expect(shotResponse.status()).toBe(200)
  const shot = await shotResponse.json()
  const cell = Object.values(shot.cells as Record<string, { id: string }>)[0]
  expect(cell).toBeTruthy()

  const cellResponse = await request.put(`${appOrigin}/api/cells/${cell.id}`, {
    data: { blocks: [{ id: 'private', type: 'text', content: `${owner} only` }] },
  })
  expect(cellResponse.status()).toBe(200)

  expect((await request.get(`${appOrigin}/api/projects/${project.id}`)).status()).toBe(200)
  expect((await request.get(`${appOrigin}/api/scenes/${scene.id}`)).status()).toBe(200)
  expect((await request.get(`${appOrigin}/api/scenes/${scene.id}/shots`)).status()).toBe(200)

  return { projectId: project.id, sceneId: scene.id, shotId: shot.id, cellId: cell.id }
}

async function expectInitialDashboardProject(request: APIRequestContext, projectId: string, owner: string) {
  const response = await request.get(appOrigin)
  expect(response.status(), `${await response.text()}\n${appOutput}`).toBe(200)
  const html = await response.text()
  expect(html).toContain(projectId)
  expect(html).toContain(owner)
  expect(html).not.toContain('Projects could not be loaded')
}

async function expectNonLeakingNotFound(response: Awaited<ReturnType<APIRequestContext['get']>>) {
  expect(response.status()).toBe(404)
  const body = await response.text()
  expect(body).not.toContain('private project')
  expect(body).not.toContain('private scene')
  expect(body).not.toContain('only')
}

async function proveCrossUserDenial(request: APIRequestContext, resources: OwnedResources, uploadUrl?: string) {
  const attempts = [
    request.get(`${appOrigin}/api/projects/${resources.projectId}`),
    request.delete(`${appOrigin}/api/projects/${resources.projectId}`),
    request.get(`${appOrigin}/api/projects/${resources.projectId}/scenes`),
    request.post(`${appOrigin}/api/projects/${resources.projectId}/scenes`, {
      data: { order: 99, synopsis: 'intrusion' },
    }),
    request.get(`${appOrigin}/api/scenes/${resources.sceneId}`),
    request.put(`${appOrigin}/api/scenes/${resources.sceneId}`, {
      data: { synopsis: 'intrusion', order: 99 },
    }),
    request.delete(`${appOrigin}/api/scenes/${resources.sceneId}`),
    request.get(`${appOrigin}/api/scenes/${resources.sceneId}/shots`),
    request.post(`${appOrigin}/api/scenes/${resources.sceneId}/shots`, { data: {} }),
    request.put(`${appOrigin}/api/cells/${resources.cellId}`, {
      data: { blocks: [{ id: 'intrusion', type: 'text', content: 'intrusion' }] },
    }),
    request.post(`${appOrigin}/api/chat`, {
      data: { projectId: resources.projectId, prompt: 'Do not generate', generationType: 'text' },
    }),
  ]
  if (uploadUrl) attempts.push(request.get(`${appOrigin}${uploadUrl}`))

  for (const response of await Promise.all(attempts)) {
    await expectNonLeakingNotFound(response)
  }
}

test.beforeAll(async () => {
  const keyPair = await generateKeyPair('RS256')
  signingKey = keyPair.privateKey
  publicJwk = {
    ...(await exportJWK(keyPair.publicKey)),
    kid: 'auth-isolation-key',
    use: 'sig',
    alg: 'RS256',
  }

  certificateDirectory = mkdtempSync(join(tmpdir(), 'auth-isolation-oidc-'))
  const keyPath = join(certificateDirectory, 'key.pem')
  const certificatePath = join(certificateDirectory, 'certificate.pem')
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes',
    '-keyout', keyPath,
    '-out', certificatePath,
    '-days', '1',
    '-subj', '/CN=127.0.0.1',
  ], { stdio: 'ignore' })

  issuer = createServer({
    key: readFileSync(keyPath),
    cert: readFileSync(certificatePath),
  }, async (request, response) => {
    const url = new URL(request.url || '/', issuerOrigin)
    response.setHeader('Content-Type', 'application/json')

    if (url.pathname === '/.well-known/openid-configuration') {
      response.end(JSON.stringify({
        issuer: issuerOrigin,
        authorization_endpoint: `${issuerOrigin}/authorize`,
        token_endpoint: `${issuerOrigin}/token`,
        jwks_uri: `${issuerOrigin}/jwks`,
        response_types_supported: ['code'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        token_endpoint_auth_methods_supported: ['none'],
        code_challenge_methods_supported: ['S256'],
      }))
      return
    }

    if (url.pathname === '/jwks') {
      response.end(JSON.stringify({ keys: [publicJwk] }))
      return
    }

    if (url.pathname === '/authorize') {
      if (!nextClaims) {
        response.statusCode = 500
        response.end(JSON.stringify({ error: 'No test claims configured' }))
        return
      }
      const code = randomUUID()
      authorizationCodes.set(code, nextClaims)
      nextClaims = undefined
      const redirect = new URL(url.searchParams.get('redirect_uri')!)
      redirect.searchParams.set('code', code)
      redirect.searchParams.set('state', url.searchParams.get('state')!)
      response.statusCode = 302
      response.setHeader('Location', redirect.href)
      response.end()
      return
    }

    if (url.pathname === '/token' && request.method === 'POST') {
      let body = ''
      for await (const chunk of request) body += chunk
      const code = new URLSearchParams(body).get('code') || ''
      const claims = authorizationCodes.get(code)
      authorizationCodes.delete(code)
      if (!claims) {
        response.statusCode = 400
        response.end(JSON.stringify({ error: 'invalid_grant' }))
        return
      }
      const idToken = await new SignJWT(claims)
        .setProtectedHeader({ alg: 'RS256', kid: 'auth-isolation-key' })
        .setIssuer(issuerOrigin)
        .setAudience(clientId)
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(signingKey)
      response.end(JSON.stringify({
        access_token: randomUUID(),
        token_type: 'Bearer',
        expires_in: 300,
        id_token: idToken,
      }))
      return
    }

    response.statusCode = 404
    response.end(JSON.stringify({ error: 'not_found' }))
  })
  const issuerPort = await listen(issuer)
  issuerOrigin = `https://127.0.0.1:${issuerPort}`
  const appPort = await getFreePort()
  appOrigin = `http://127.0.0.1:${appPort}`

  app = spawn('pnpm', ['exec', 'nuxt', 'dev', '--host', '127.0.0.1', '--port', String(appPort)], {
    env: {
      ...process.env,
      CI: '1',
      NUXT_TELEMETRY_DISABLED: '1',
      NUXT_IGNORE_LOCK: '1',
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
      ISSUER_URL: issuerOrigin,
      REPL_ID: clientId,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  app.stdout?.on('data', chunk => { appOutput += chunk })
  app.stderr?.on('data', chunk => { appOutput += chunk })
  app.once('exit', code => {
    if (code && code !== 0) console.error(`Nuxt exited with ${code}\n${appOutput}`)
  })
  await waitForApp()
})

test.afterAll(async () => {
  app?.kill('SIGTERM')
  if (app && app.exitCode === null) await Promise.race([once(app, 'exit'), new Promise(resolve => setTimeout(resolve, 5_000))])
  if (issuer) await new Promise<void>(resolve => issuer.close(() => resolve()))
  if (certificateDirectory) rmSync(certificateDirectory, { recursive: true, force: true })
})

test('two Replit identities cannot access each other’s work', async ({ browser }) => {
  const contextA = await browser.newContext()
  const contextB = await browser.newContext()
  const claimsA = claimsFor('alice')
  const claimsB = claimsFor('bob')
  let unsafeExternal: BrowserContext | undefined
  let unsafeProtocolRelative: BrowserContext | undefined
  let resourcesA: OwnedResources | undefined
  let resourcesB: OwnedResources | undefined
  let uploadUrl: string | undefined

  try {
    const pageA = await signIn(contextA, claimsA, '/projects/new')
    expect(new URL(pageA.url()).pathname).toBe('/projects/new')
    resourcesA = await createOwnedResources(contextA.request, 'Alice')
    await expectInitialDashboardProject(contextA.request, resourcesA.projectId, 'Alice')

    const upload = await contextA.request.post(`${appOrigin}/api/upload`, {
      multipart: {
        files: {
          name: 'alice-private.png',
          mimeType: 'image/png',
          buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
            'base64',
          ),
        },
      },
    })
    expect(upload.status()).toBe(200)
    uploadUrl = (await upload.json()).urls[0] as string
    const ownerDownload = await contextA.request.get(`${appOrigin}${uploadUrl}`)
    expect(ownerDownload.status()).toBe(200)
    expect(ownerDownload.headers()['cache-control']).toBe('private, no-store')

    await signIn(contextB, claimsB, '/projects/new')
    resourcesB = await createOwnedResources(contextB.request, 'Bob')
    await expectInitialDashboardProject(contextB.request, resourcesB.projectId, 'Bob')

    const projectsB = await contextB.request.get(`${appOrigin}/api/projects`)
    expect(projectsB.status()).toBe(200)
    expect((await projectsB.json()).some((project: { id: string }) => project.id === resourcesA!.projectId)).toBe(false)

    await proveCrossUserDenial(contextB.request, resourcesA, uploadUrl)
    await proveCrossUserDenial(contextA.request, resourcesB)

    unsafeExternal = await browser.newContext()
    const externalPage = await signIn(unsafeExternal, claimsFor('external'), 'https://attacker.example')
    expect(new URL(externalPage.url()).origin).toBe(appOrigin)
    expect(new URL(externalPage.url()).pathname).toBe('/')

    unsafeProtocolRelative = await browser.newContext()
    const protocolPage = await signIn(unsafeProtocolRelative, claimsFor('protocol'), '//attacker.example')
    expect(new URL(protocolPage.url()).origin).toBe(appOrigin)
    expect(new URL(protocolPage.url()).pathname).toBe('/')

    expect((await contextA.request.delete(`${appOrigin}/api/projects/${resourcesA.projectId}`)).status()).toBe(200)
    resourcesA = undefined
    const logoutA = await contextA.request.post(`${appOrigin}/api/auth/logout`)
    expect(logoutA.status()).toBe(200)
    expect(await logoutA.json()).toEqual({ ok: true })
    expect((await (await contextA.request.get(`${appOrigin}/api/auth/me`)).json()).user).toBeNull()
    expect((await contextA.request.get(`${appOrigin}/api/projects`)).status()).toBe(401)
    expect((await contextB.request.get(`${appOrigin}/api/projects/${resourcesB.projectId}`)).status()).toBe(200)

    expect((await contextB.request.delete(`${appOrigin}/api/projects/${resourcesB.projectId}`)).status()).toBe(200)
    resourcesB = undefined
    const logoutB = await contextB.request.post(`${appOrigin}/api/auth/logout`)
    expect(logoutB.status()).toBe(200)
    expect((await (await contextB.request.get(`${appOrigin}/api/auth/me`)).json()).user).toBeNull()
    expect((await contextB.request.get(`${appOrigin}/api/projects`)).status()).toBe(401)
  } finally {
    if (resourcesA) await contextA.request.delete(`${appOrigin}/api/projects/${resourcesA.projectId}`).catch(() => {})
    if (resourcesB) await contextB.request.delete(`${appOrigin}/api/projects/${resourcesB.projectId}`).catch(() => {})
    if (uploadUrl) {
      const objectName = uploadUrl.replace('/api/storage/', '')
      await new ObjectStorageClient().delete(objectName).catch(() => {})
    }
    await Promise.all([
      unsafeExternal?.close(),
      unsafeProtocolRelative?.close(),
      contextA.close(),
      contextB.close(),
    ])
  }
})