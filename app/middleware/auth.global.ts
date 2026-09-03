export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = new Set(['/login', '/signup', '/logout'])
  const isPublicRoute = publicRoutes.has(to.path)
  const isServerRootRequest = import.meta.server && to.path === '/'
  const { user, refresh, loginUrl } = useAuth()

  await refresh()

  if (!user.value && !isPublicRoute) {
    // Replit Autoscale probes GET / and requires a 200 response. Let the
    // server render the root route; browser-side navigation still redirects.
    if (isServerRootRequest) {
      return
    }

    return navigateTo(loginUrl(to.fullPath), { external: true })
  }

  if (user.value && (to.path === '/login' || to.path === '/signup')) {
    return navigateTo(getSafeReturnTo(to.query.returnTo))
  }
})