import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        // Basic validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Or use host/port if not gmail
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Email Options
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Receiving email (can be same as sender or different)
            replyTo: email,
            subject: `New Enquiry from ${name} - Mintex Staffing`,
            text: `
Name: ${name}
Email: ${email}

Message:
${message}
            `,
            html: `
<h3>New Website Enquiry</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<br/>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
            `,
        };

        // Send Email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        console.error('Email send error:', error);
        return NextResponse.json(
            { error: 'Failed to send email. Please try again later.' },
            { status: 500 }
        );
    }
}
