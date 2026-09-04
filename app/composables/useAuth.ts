export interface AuthUser {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  username: string | null
}

type AuthResponse = Record<string, unknown> & { user?: Record<string, unknown> | null }

const AUTH_ROUTES = new Set(['/login', '/signup', '/logout'])

export function getSafeReturnTo(value: unknown, fallback = '/') {
  const returnTo = Array.isArray(value) ? value[0] : value

  if (typeof returnTo !== 'string' || !returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\')) {
    return fallback
  }

  const path = returnTo.split(/[?#]/)[0]
  if (!path || AUTH_ROUTES.has(path) || path.startsWith('/api/')) {
    return fallback
  }

  return returnTo
}

function normalizeUser(response: unknown): AuthUser | null {
  if (!response || typeof response !== 'object') {
    return null
  }

  const data = response as AuthResponse
  const user = data.user && typeof data.user === 'object' ? data.user : data
  const id = user.id ?? user.sub

  if (typeof id !== 'string' || !id) {
    return null
  }

  const username = typeof user.username === 'string' ? user.username : null
  const firstName = typeof user.firstName === 'string' ? user.firstName : typeof user.first_name === 'string' ? user.first_name : ''
  const lastName = typeof user.lastName === 'string' ? user.lastName : typeof user.last_name === 'string' ? user.last_name : ''
  const suppliedName = typeof user.name === 'string' ? user.name : `${firstName} ${lastName}`.trim()

  return {
    id,
    name: suppliedName || username || 'Replit user',
    email: typeof user.email === 'string' ? user.email : null,
    avatarUrl: typeof user.avatarUrl === 'string'
      ? user.avatarUrl
      : typeof user.profileImageUrl === 'string'
        ? user.profileImageUrl
        : typeof user.profile_image_url === 'string'
          ? user.profile_image_url
          : typeof user.imageUrl === 'string'
            ? user.imageUrl
            : null,
    username,
  }
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth:user', () => null)
  const pending = useState('auth:pending', () => false)
  const resolved = useState('auth:resolved', () => false)
  const error = useState<string | null>('auth:error', () => null)
  const requestFetch = useRequestFetch()

  async function refresh(force = false) {
    if (resolved.value && !force) {
      return user.value
    }

    pending.value = true
    error.value = null

    try {
      user.value = normalizeUser(await requestFetch('/api/auth/me'))
    } catch (cause: unknown) {
      const status = typeof cause === 'object' && cause && 'statusCode' in cause
        ? Number(cause.statusCode)
        : undefined

      user.value = null
      if (status && status !== 401 && status !== 403) {
        error.value = 'We could not verify your Replit session. Please try again.'
      }
    } finally {
      pending.value = false
      resolved.value = true
    }

    return user.value
  }

  function loginUrl(returnTo?: unknown) {
    return `/api/auth/login?returnTo=${encodeURIComponent(getSafeReturnTo(returnTo))}`
  }

  function signIn(returnTo?: unknown) {
    return navigateTo(loginUrl(returnTo), { external: true })
  }

  async function logout() {
    pending.value = true
    user.value = null
    resolved.value = false
    error.value = null

    try {
      await requestFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      error.value = 'We could not complete sign-out. Please try again.'
      return
    } finally {
      pending.value = false
    }

    return navigateTo('/')
  }

  return {
    user,
    pending,
    resolved,
    error,
    refresh,
    loginUrl,
    signIn,
    logout,
  }
}