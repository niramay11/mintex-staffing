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

        // Build message object and save to storage
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const payload = {
            id,
            name,
            email,
            message,
            read: false,
            created_at: new Date().toISOString(),
        };

        const fileContent = JSON.stringify(payload);
        const fileName = `${id}.json`;

        const { error: storageError } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(fileName, new TextEncoder().encode(fileContent), {
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

        // Send email notification if SMTP is configured
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        if (smtpUser && smtpPass && !smtpUser.includes('your-gmail')) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user: smtpUser, pass: smtpPass },
                });
                await transporter.sendMail({
                    from: smtpUser,
                    to: smtpUser,
                    replyTo: email,
                    subject: `New Enquiry from ${name} - Mintex Staffing`,
                    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                    html: `<h3>New Website Enquiry</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><br/><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
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
