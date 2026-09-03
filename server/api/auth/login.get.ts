import * as oidc from 'openid-client';
import { callbackUrl, getAuthSession, getOidcConfig, safeReturnPath } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event);
  const state = oidc.randomState();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  await session.update({
    state,
    codeVerifier,
    returnTo: safeReturnPath(getQuery(event).returnTo),
  });
  const url = oidc.buildAuthorizationUrl(await getOidcConfig(), {
    redirect_uri: callbackUrl(event),
    response_type: 'code',
    scope: 'openid profile email',
    state,
    code_challenge: await oidc.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: 'S256',
  });
  return sendRedirect(event, url.href);
});