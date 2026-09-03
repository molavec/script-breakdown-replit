export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = new Set(['/login', '/signup', '/logout'])
  const isPublicRoute = publicRoutes.has(to.path)
  const { user, refresh, loginUrl } = useAuth()

  await refresh()

  if (!user.value && !isPublicRoute) {
    return navigateTo(loginUrl(to.fullPath), { external: true })
  }

  if (user.value && (to.path === '/login' || to.path === '/signup')) {
    return navigateTo(getSafeReturnTo(to.query.returnTo))
  }
})