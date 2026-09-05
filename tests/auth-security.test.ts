import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizeReplitUser, safeReturnPath } from '../server/utils/auth'
import { isStoredObjectName } from '../server/utils/storage'

describe('authentication safety', () => {
  it('accepts only local return destinations', () => {
    assert.equal(safeReturnPath('/projects/123?tab=scenes'), '/projects/123?tab=scenes')
    assert.equal(safeReturnPath('https://attacker.example'), '/')
    assert.equal(safeReturnPath('//attacker.example/path'), '/')
    assert.equal(safeReturnPath('/\\attacker.example'), '/')
  })

  it('normalizes stable Replit identity claims', () => {
    assert.deepEqual(normalizeReplitUser({
      sub: 'user-123',
      username: 'director',
      email: 'director@example.com',
      first_name: 'Normal',
      last_name: 'Person',
      profile_image_url: 'https://example.com/avatar.png',
    }), {
      id: 'user-123',
      username: 'director',
      email: 'director@example.com',
      firstName: 'Normal',
      lastName: 'Person',
      profileImageUrl: 'https://example.com/avatar.png',
    })
  })

  it('prevents one user from reading another user upload path', () => {
    const owner = 'owner-user'
    const other = 'other-user'
    const ownerScope = Buffer.from(owner).toString('base64url')
    const path = `uploads/${ownerScope}/00000000-0000-4000-8000-000000000000.png`

    assert.equal(isStoredObjectName(path, owner), true)
    assert.equal(isStoredObjectName(path, other), false)
    assert.equal(isStoredObjectName('uploads/00000000-0000-4000-8000-000000000000.png', owner), false)
  })
})

describe('server authorization coverage', () => {
  it('keeps the initial project list request authenticated and server-rendered', async () => {
    const composable = await readFile('app/composables/useProjectData.ts', 'utf8')
    const dashboard = await readFile('app/components/project/ProjectDashboard.vue', 'utf8')

    assert.ok(composable.includes('const requestFetch = useRequestFetch()'))
    assert.ok(composable.includes("requestFetch<Project[]>('/api/projects')"))
    assert.ok(!composable.includes("return await $fetch<Project[]>('/api/projects')"))
    assert.ok(dashboard.includes("await useAsyncData('projects_list'"))
    assert.ok(!dashboard.includes("useLazyAsyncData('projects_list'"))
    assert.ok(dashboard.includes('v-else-if="error"'))
    assert.ok(dashboard.includes('@click="refresh()"'))
    assert.ok(dashboard.includes('v-else-if="projects?.length === 0"'))
  })

  it('requires auth or ownership in every non-auth API route', async () => {
    const routes = [
      'server/api/projects/index.get.ts',
      'server/api/projects/index.post.ts',
      'server/api/projects/[projectId]/index.get.ts',
      'server/api/projects/[projectId]/index.delete.ts',
      'server/api/projects/[projectId]/scenes.get.ts',
      'server/api/projects/[projectId]/scenes/index.post.ts',
      'server/api/projects/[projectId]/stats.put.ts',
      'server/api/projects/[projectId]/columns/list.get.ts',
      'server/api/projects/[projectId]/columns/reorder.put.ts',
      'server/api/projects/[projectId]/columns/[columnId].put.ts',
      'server/api/projects/[projectId]/columns/[columnId].delete.ts',
      'server/api/scenes/[sceneId].get.ts',
      'server/api/scenes/[sceneId]/index.put.ts',
      'server/api/scenes/[sceneId]/index.delete.ts',
      'server/api/scenes/[sceneId]/shots.get.ts',
      'server/api/scenes/[sceneId]/shots.post.ts',
      'server/api/cells/[id].put.ts',
      'server/api/upload.post.ts',
      'server/api/storage/[...path].get.ts',
      'server/api/chat.post.ts',
    ]

    for (const route of routes) {
      const source = await readFile(route, 'utf8')
      assert.match(
        source,
        /require(?:User|ProjectOwner|SceneOwner|ShotOwner|CellOwner)\(event/,
        `${route} must enforce authentication`,
      )
    }
  })

  it('keeps legacy projects unowned while owner-scoping list and creation', async () => {
    const schema = await readFile('server/utils/schema.ts', 'utf8')
    const listing = await readFile('server/api/projects/index.get.ts', 'utf8')
    const creation = await readFile('server/api/projects/index.post.ts', 'utf8')

    assert.ok(schema.includes("ownerUserId: varchar('owner_user_id', { length: 255 })"))
    assert.ok(!schema.includes("ownerUserId: varchar('owner_user_id', { length: 255 }).notNull()"))
    assert.ok(listing.includes('eq(projects.ownerUserId, user.id)'))
    assert.ok(creation.includes('ownerUserId: user.id'))
  })

  it('does not allow column ownership fields to be reassigned', async () => {
    const source = await readFile('server/api/projects/[projectId]/columns/[columnId].put.ts', 'utf8')

    assert.ok(!source.includes('.set(body)'))
    assert.ok(!source.match(/const updates[\s\S]*projectId:/))
    assert.ok(!source.match(/const updates[\s\S]*sceneId:/))
  })

  it('never permits shared caching of authenticated storage objects', async () => {
    const source = await readFile('server/api/storage/[...path].get.ts', 'utf8')

    assert.ok(source.includes("'Cache-Control', 'private, no-store'"))
    assert.ok(!source.includes("'Cache-Control', 'public"))
  })

  it('selects nested resources without temporal-dead-zone aliases', async () => {
    const source = await readFile('server/utils/auth.ts', 'utf8')

    assert.ok(source.includes('db.select({ scene: scenes })'))
    assert.ok(source.includes('db.select({ shot: shots })'))
  })
})