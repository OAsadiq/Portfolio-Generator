/**
 * Free-plan limits, for COPY ONLY.
 *
 * The database is the source of truth — `public.free_trade_cap()` in sql/014_trade_cap_15.sql
 * is what actually enforces this, via a trigger the browser can't bypass. This constant
 * exists so the number we *say* matches the number we *enforce*, in one place rather than
 * scattered through JSX.
 *
 * If you change the cap: update the SQL first (that's the real limit), then this. A
 * mismatch was already shipped once — the database said 15 while the create page told
 * people 25.
 */
export const FREE_TRADE_CAP = 15;

/** One-time founding price, in whole dollars. Stripe holds the real price. */
export const KIT_PRICE_USD = 35;
