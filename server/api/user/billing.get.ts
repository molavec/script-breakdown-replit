import { requireUser } from '../../utils/auth';
import { db } from '../../utils/db';
import { users } from '../../utils/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const [userRecord] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

  if (!userRecord) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  const plan = userRecord.plan || 'FREE';
  
  let dailyLimit = 25;
  let monthlyLimit = 750;

  if (plan === 'PRO') {
    dailyLimit = parseInt(process.env.PRO_PLAN_DAILY_TOKEN_LIMIT || '250', 10);
    monthlyLimit = parseInt(process.env.PRO_PLAN_MONTHLY_TOKEN_LIMIT || '7500', 10);
  } else if (plan === 'TEAM') {
    dailyLimit = parseInt(process.env.TEAM_PLAN_DAILY_TOKEN_LIMIT || '1000', 10);
    monthlyLimit = parseInt(process.env.TEAM_PLAN_MONTHLY_TOKEN_LIMIT || '30000', 10);
  } else {
    dailyLimit = parseInt(process.env.FREE_PLAN_DAILY_TOKEN_LIMIT || '25', 10);
    monthlyLimit = parseInt(process.env.FREE_PLAN_MONTHLY_TOKEN_LIMIT || '750', 10);
  }

  const now = new Date();
  const lastDate = new Date(userRecord.lastTokenUsageDate);
  const isNewDay =
    now.getFullYear() > lastDate.getFullYear() ||
    now.getMonth() > lastDate.getMonth() ||
    now.getDate() > lastDate.getDate();

  const isNewMonth =
    now.getFullYear() > lastDate.getFullYear() ||
    now.getMonth() > lastDate.getMonth();

  return {
    plan,
    dailyUsage: isNewDay ? 0 : userRecord.dailyTokenUsage,
    monthlyUsage: isNewMonth ? 0 : userRecord.monthlyTokenUsage,
    dailyLimit,
    monthlyLimit
  };
});
