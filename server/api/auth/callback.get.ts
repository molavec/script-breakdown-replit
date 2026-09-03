import * as oidc from 'openid-client';
import { callbackUrl, getAuthSession, getOidcConfig, normalizeReplitUser, safeReturnPath } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event);
  const { state, codeVerifier, returnTo } = session.data;
  try {
    if (!state || !codeVerifier) throw new Error('Invalid login session');
    const tokens = await oidc.authorizationCodeGrant(
      await getOidcConfig(),
      getRequestURL(event),
      { expectedState: state, pkceCodeVerifier: codeVerifier },
    );
    const claims = tokens.claims();
    if (!claims) throw new Error('Identity token missing from authorization response');
    await session.update({ user: normalizeReplitUser(claims as Record<string, unknown>), state: undefined, codeVerifier: undefined, returnTo: undefined });
    return sendRedirect(event, safeReturnPath(returnTo));
  } catch (error) {
    console.error('Replit authentication callback failed:', error);
    await session.clear();
    const destination = encodeURIComponent(safeReturnPath(returnTo));
    return sendRedirect(event, `/login?error=authentication_failed&returnTo=${destination}`);
  }
});