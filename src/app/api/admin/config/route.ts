import { connectToDatabase } from '@/lib/mongodb';
import AdminConfig from '@/models/AdminConfig';
import { bcrypt } from '@/lib/bcrypt';

async function ensureConfig() {
  let config = await AdminConfig.findById('admin-config');
  if (!config) {
    config = await AdminConfig.create({
      _id: 'admin-config',
      passwordHash: await bcrypt.hash('admin123'),
      primaryColor: '221 83% 53%',
    });
  }
  return config;
}

export async function GET() {
  try {
    await connectToDatabase();
    const config = await ensureConfig();
    return Response.json({ primaryColor: config.primaryColor });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
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

    await AdminConfig.findByIdAndUpdate(
      'admin-config',
      { $set: updates },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
