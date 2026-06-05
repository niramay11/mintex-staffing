import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminPassword, hashPassword } from '@/lib/portal-auth';
import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

function adminGuard(req: NextRequest) {
  return verifyAdminPassword(req.headers.get('x-admin-password') ?? '');
}

// POST /api/admin/clients/[id]/email — send portal credentials to client
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const { data: client, error } = await supabaseAdmin
    .from('clients')
    .select('name, email')
    .eq('id', id)
    .single();

  if (error || !client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  // Generate a new random password and save it
  const newPassword = randomBytes(6).toString('hex'); // 12-char hex password
  await supabaseAdmin
    .from('clients')
    .update({ password_hash: hashPassword(newPassword) })
    .eq('id', id);

  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mintexstaffing.com'}/portal/login`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Mintex Staffing" <${process.env.SMTP_USER}>`,
    to: client.email,
    subject: 'Your Mintex Client Portal Access',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
        <img src="https://mintexstaffing.com/logo.svg" alt="Mintex Staffing" style="height:40px; margin-bottom:24px;" />
        <h2 style="color:#f97316; margin:0 0 8px;">Welcome to the Mintex Client Portal</h2>
        <p style="color:#94a3b8; margin:0 0 24px;">Hi ${client.name}, your portal access is ready.</p>
        <div style="background:#1e293b; border-radius:8px; padding:20px; margin-bottom:24px;">
          <p style="margin:0 0 8px;"><strong>Portal URL:</strong> <a href="${portalUrl}" style="color:#f97316;">${portalUrl}</a></p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${client.email}</p>
          <p style="margin:0;"><strong>Password:</strong> ${newPassword}</p>
        </div>
        <p style="color:#64748b; font-size:13px;">Please change your password after first login. If you have questions, contact your account manager.</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true, email: client.email });
}
