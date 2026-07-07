import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * Shared admin authorization check.
 * Returns true if the request has a valid admin session token,
 * or if the database is empty (first-run / not yet seeded).
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const count = await prisma.widyaiswara.count();
    if (count === 0) {
      return true; // first-run: allow seeding
    }
  } catch {
    // DB not available — deny
    return false;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  return token === 'admin-session-token';
}
