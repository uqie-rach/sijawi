import { prisma } from '@/lib/prisma';
import { bcrypt } from '@/lib/bcrypt';

export async function GET() {
  try {
    const config = await prisma.adminConfig.findUnique({ where: { id: 'admin-config' } });
    return Response.json({ primaryColor: config?.primaryColor ?? '221 83% 53%' });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const updates: Record<string, string> = {};

    if (body.password) {
      if (typeof body.password !== 'string' || body.password.length < 6) {
        return Response.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      updates.passwordHash = await bcrypt.hash(body.password);
    }

    if (body.primaryColor) {
      if (typeof body.primaryColor !== 'string') {
        return Response.json(
          { error: 'primaryColor must be a string' },
          { status: 400 }
        );
      }
      updates.primaryColor = body.primaryColor;
    }

    if (Object.keys(updates).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    await prisma.adminConfig.upsert({
      where: { id: 'admin-config' },
      update: updates,
      create: {
        id: 'admin-config',
        passwordHash: updates.passwordHash ?? await bcrypt.hash('admin123'),
        primaryColor: updates.primaryColor ?? '221 83% 53%',
      },
    });

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
