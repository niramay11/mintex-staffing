import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET = 'messages-data';

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const payload = {
            id,
            name,
            email,
            message,
            read: false,
            created_at: new Date().toISOString(),
        };

        const { error: storageError } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(`${id}.json`, new TextEncoder().encode(JSON.stringify(payload)), {
                contentType: 'application/json',
                upsert: false,
            });

        if (storageError) {
            console.error('Storage save error:', storageError.message);
            return NextResponse.json(
                { error: 'Failed to save message. Please try again later.' },
                { status: 500 }
            );
        }

        // Send email notification
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const notifyEmail = process.env.NOTIFY_EMAIL || smtpUser;

        if (smtpUser && smtpPass && notifyEmail) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user: smtpUser, pass: smtpPass },
                });

                const receivedAt = new Date().toLocaleString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long',
                    day: 'numeric', hour: '2-digit', minute: '2-digit',
                });

                const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0e1626;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e1626;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#07122a;border-radius:16px;overflow:hidden;border:1px solid rgba(87,238,255,0.15);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#071c3a,#051116);padding:28px 32px;border-bottom:1px solid rgba(87,238,255,0.12);">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(87,238,255,0.7);">MINTEX STAFFING</p>
              <h1 style="margin:0;font-size:20px;font-weight:800;color:#ffffff;">New Contact Form Enquiry</h1>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(170,185,210,0.5);">${receivedAt}</p>
            </td>
          </tr>

          <!-- Sender info -->
          <tr>
            <td style="padding:28px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:50%;padding-right:8px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(170,185,210,0.4);">From</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;">${name}</p>
                  </td>
                  <td style="width:50%;padding-left:8px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(170,185,210,0.4);">Reply To</p>
                    <a href="mailto:${email}" style="margin:0;font-size:14px;font-weight:600;color:#57EEFF;text-decoration:none;">${email}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:20px 32px 0;">
              <div style="height:1px;background:rgba(87,238,255,0.1);"></div>
            </td>
          </tr>

          <!-- Message body -->
          <tr>
            <td style="padding:20px 32px 28px;">
              <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(170,185,210,0.4);">Message</p>
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px 20px;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(220,230,245,0.85);white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
            </td>
          </tr>

          <!-- Reply CTA -->
          <tr>
            <td style="padding:0 32px 32px;" align="center">
              <a href="mailto:${email}?subject=Re: Your enquiry to Mintex Staffing"
                 style="display:inline-block;padding:12px 28px;background:rgba(87,238,255,0.1);border:1px solid rgba(87,238,255,0.3);border-radius:10px;font-size:13px;font-weight:700;color:#57EEFF;text-decoration:none;letter-spacing:0.05em;">
                Reply to ${name} →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.05);background:rgba(0,0,0,0.2);">
              <p style="margin:0;font-size:11px;color:rgba(170,185,210,0.3);text-align:center;">
                This notification was sent automatically by mintexstaffing.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

                await transporter.sendMail({
                    from: `"Mintex Staffing" <${smtpUser}>`,
                    to: notifyEmail,
                    replyTo: `"${name}" <${email}>`,
                    subject: `New Enquiry from ${name} — Mintex Staffing`,
                    text: `New contact form submission\n\nFrom: ${name}\nEmail: ${email}\nReceived: ${receivedAt}\n\nMessage:\n${message}\n\n---\nReply directly to this email to respond to ${name}.`,
                    html: htmlBody,
                });
            } catch (mailErr) {
                console.error('Email notification failed (message still saved):', mailErr);
            }
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Contact route error:', error);
        return NextResponse.json(
            { error: 'Failed to send message. Please try again later.' },
            { status: 500 }
        );
    }
}
