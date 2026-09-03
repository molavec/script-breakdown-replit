import { getAuthSession } from '../../utils/auth';
export default defineEventHandler(async (event) => {
  await (await getAuthSession(event)).clear();
  return { ok: true };
});