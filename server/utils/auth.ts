import { and, eq } from 'drizzle-orm';
import * as oidc from 'openid-client';
import { db } from './db';
import { breakdownCells, projects, scenes, shots } from './schema';

export interface ReplitUser {
  id: string;
  username: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthSession {
  user?: ReplitUser;
  state?: string;
  codeVerifier?: string;
  returnTo?: string;
}

const sessionOptions = () => ({
  name: 'replit-auth',
  password: process.env.SESSION_SECRET || (() => { throw new Error('SESSION_SECRET must be configured'); })(),
  cookie: { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production' },
});

// H3 primitives are Nitro auto-imports in server code.
export const getAuthSession = (event: any) =>
  useSession<AuthSession>(event, sessionOptions());

export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/';
  }
  return value;
}

export async function getUser(event: any): Promise<ReplitUser | null> {
  if (process.env.MOCK_AUTH === 'true') {
    return {
      id: 'local-mock-user-123',
      username: 'usuario_local',
      email: 'local@example.com',
      firstName: 'Desarrollador',
      lastName: 'Local',
      profileImageUrl: null,
    };
  }
  return (await getAuthSession(event)).data.user || null;
}

export async function requireUser(event: any): Promise<ReplitUser> {
  const user = await getUser(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  return user;
}

const notFound = () => createError({ statusCode: 404, statusMessage: 'Resource not found' });

export async function requireProjectOwner(event: any, projectId: string) {
  const user = await requireUser(event);
  const [project] = await db.select().from(projects).where(and(
    eq(projects.id, projectId),
    eq(projects.ownerUserId, user.id),
  )).limit(1);
  if (!project) throw notFound();
  return project;
}

export async function requireSceneOwner(event: any, sceneId: string) {
  const user = await requireUser(event);
  const [result] = await db.select({ scene: scenes }).from(scenes)
    .innerJoin(projects, eq(scenes.projectId, projects.id))
    .where(and(eq(scenes.id, sceneId), eq(projects.ownerUserId, user.id))).limit(1);
  const scene = result?.scene;
  if (!scene) throw notFound();
  return scene;
}

export async function requireShotOwner(event: any, shotId: string) {
  const user = await requireUser(event);
  const [result] = await db.select({ shot: shots }).from(shots)
    .innerJoin(scenes, eq(shots.sceneId, scenes.id))
    .innerJoin(projects, eq(scenes.projectId, projects.id))
    .where(and(eq(shots.id, shotId), eq(projects.ownerUserId, user.id))).limit(1);
  const shot = result?.shot;
  if (!shot) throw notFound();
  return shot;
}

export async function requireCellOwner(event: any, cellId: string) {
  const user = await requireUser(event);
  const [cell] = await db.select({ cell: breakdownCells }).from(breakdownCells)
    .innerJoin(shots, eq(breakdownCells.shotId, shots.id))
    .innerJoin(scenes, eq(shots.sceneId, scenes.id))
    .innerJoin(projects, eq(scenes.projectId, projects.id))
    .where(and(eq(breakdownCells.id, cellId), eq(projects.ownerUserId, user.id))).limit(1);
  if (!cell) throw notFound();
  return cell;
}

let oidcConfig: Promise<oidc.Configuration> | undefined;
export function getOidcConfig() {
  if (!oidcConfig) {
    const clientId = process.env.REPL_ID;
    if (!clientId) throw new Error('REPL_ID must be configured');
    oidcConfig = oidc.discovery(
      new URL(process.env.ISSUER_URL || 'https://replit.com/oidc'),
      clientId,
      undefined,
      oidc.None(),
    );
  }
  return oidcConfig;
}

export function callbackUrl(event: any) {
  const url = getRequestURL(event);
  return `${url.protocol}//${url.host}/api/auth/callback`;
}

export function normalizeReplitUser(claims: Record<string, unknown>): ReplitUser {
  const id = typeof claims.sub === 'string' ? claims.sub : '';
  if (!id) throw createError({ statusCode: 401, statusMessage: 'Invalid identity claim' });
  return {
    id,
    username: typeof claims.username === 'string'
      ? claims.username
      : typeof claims.preferred_username === 'string' ? claims.preferred_username : null,
    email: typeof claims.email === 'string' ? claims.email : null,
    firstName: typeof claims.first_name === 'string'
      ? claims.first_name : typeof claims.given_name === 'string' ? claims.given_name : null,
    lastName: typeof claims.last_name === 'string'
      ? claims.last_name : typeof claims.family_name === 'string' ? claims.family_name : null,
    profileImageUrl: typeof claims.profile_image_url === 'string' ? claims.profile_image_url : null,
  };
}