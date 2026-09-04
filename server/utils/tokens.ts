import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from './schema';

export async function checkAndConsumeTokens(userId: string, tokensToConsume: number) {
  const config = useRuntimeConfig();
  // Intentamos obtener el usuario actual de la BD
  const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!userRecord) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found for token tracking',
    });
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
    // Default to FREE
    dailyLimit = parseInt(process.env.FREE_PLAN_DAILY_TOKEN_LIMIT || '25', 10);
    monthlyLimit = parseInt(process.env.FREE_PLAN_MONTHLY_TOKEN_LIMIT || '750', 10);
  }

  const now = new Date();
  const lastDate = new Date(userRecord.lastTokenUsageDate);

  // Verificar si es un nuevo día
  const isNewDay =
    now.getFullYear() > lastDate.getFullYear() ||
    now.getMonth() > lastDate.getMonth() ||
    now.getDate() > lastDate.getDate();

  // Verificar si es un nuevo mes
  const isNewMonth =
    now.getFullYear() > lastDate.getFullYear() ||
    now.getMonth() > lastDate.getMonth();

  let newDaily = isNewDay ? 0 : userRecord.dailyTokenUsage;
  let newMonthly = isNewMonth ? 0 : userRecord.monthlyTokenUsage;

  newDaily += tokensToConsume;
  newMonthly += tokensToConsume;

  if (newDaily > dailyLimit || newMonthly > monthlyLimit) {
    throw createError({
      statusCode: 429,
      statusMessage: `Token limit exceeded. Daily usage: ${newDaily}/${dailyLimit}. Monthly usage: ${newMonthly}/${monthlyLimit}.`,
    });
  }

  // Actualizar usuario en DB
  await db.update(users)
    .set({
      dailyTokenUsage: newDaily,
      monthlyTokenUsage: newMonthly,
      lastTokenUsageDate: now,
      updatedAt: now,
    })
    .where(eq(users.id, userId));

  return true;
}
