import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const contactNo = formData.get('contactNo') as string;
        const currentLocation = formData.get('currentLocation') as string;
        const jobsStr = formData.get('jobs') as string;
        const resume = formData.get('resume') as File | null;

        if (!name || !email || !contactNo || !currentLocation || !jobsStr) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const jobs = JSON.parse(jobsStr);

        // Build jobs table for the email
        const jobRows = jobs.map((j: { job_code: string; job_title: string; location: string; pay_rate: string }) =>
            `<tr>
                <td style="padding:8px 12px;border:1px solid #e5e7eb;">${j.job_code}</td>
                <td style="padding:8px 12px;border:1px solid #e5e7eb;">${j.job_title}</td>
                <td style="padding:8px 12px;border:1px solid #e5e7eb;">${j.location}</td>
                <td style="padding:8px 12px;border:1px solid #e5e7eb;">${j.pay_rate}</td>
            </tr>`
        ).join('');

        const htmlContent = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <div style="background:#0a0a0a;padding:24px 32px;border-radius:12px 12px 0 0;">
                    <h2 style="color:#57EEFF;margin:0;font-size:20px;">New Job Application</h2>
                    <p style="color:#999;margin:4px 0 0;font-size:13px;">Mintex Staffing - Career Portal</p>
                </div>

                <div style="background:#ffffff;padding:24px 32px;border:1px solid #e5e7eb;">
                    <h3 style="color:#333;margin:0 0 16px;font-size:16px;">Applicant Details</h3>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                        <tr>
                            <td style="padding:6px 0;color:#666;width:140px;font-size:14px;"><strong>Name:</strong></td>
                            <td style="padding:6px 0;color:#333;font-size:14px;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;color:#666;font-size:14px;"><strong>Email:</strong></td>
                            <td style="padding:6px 0;color:#333;font-size:14px;"><a href="mailto:${email}" style="color:#0762AF;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;color:#666;font-size:14px;"><strong>Contact:</strong></td>
                            <td style="padding:6px 0;color:#333;font-size:14px;">${contactNo}</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;color:#666;font-size:14px;"><strong>Location:</strong></td>
                            <td style="padding:6px 0;color:#333;font-size:14px;">${currentLocation}</td>
                        </tr>
                    </table>

                    <h3 style="color:#333;margin:0 0 12px;font-size:16px;">Applied Positions (${jobs.length})</h3>
                    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
                        <thead>
                            <tr style="background:#f3f4f6;">
                                <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;">Job Code</th>
                                <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;">Title</th>
                                <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;">Location</th>
                                <th style="padding:8px 12px;border:1px solid #e5e7eb;text-align:left;">Pay Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${jobRows}
                        </tbody>
                    </table>
                </div>

                <div style="background:#f9fafb;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
                    <p style="color:#999;font-size:12px;margin:0;">This application was submitted via the Mintex Staffing career portal.</p>
                </div>
            </div>
        `;

        const textContent = `
New Job Application - Mintex Staffing

Applicant Details:
- Name: ${name}
- Email: ${email}
- Contact: ${contactNo}
- Location: ${currentLocation}

Applied Positions:
${jobs.map((j: { job_code: string; job_title: string; location: string }) => `  - ${j.job_code}: ${j.job_title} (${j.location})`).join('\n')}
        `.trim();

        // Prepare email attachments
        const attachments: { filename: string; content: Buffer }[] = [];
        if (resume) {
            const buffer = Buffer.from(await resume.arrayBuffer());
            attachments.push({
                filename: resume.name,
                content: buffer,
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const recipients = ['Sanjay@mintextech.com', 'Niramay@mintextech.com'];

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: recipients.join(', '),
            replyTo: email,
            subject: `New Application: ${name} - ${jobs.map((j: { job_title: string }) => j.job_title).join(', ')}`,
            text: textContent,
            html: htmlContent,
            attachments,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Application submitted successfully!' });

    } catch (error) {
        console.error('Application submit error:', error);
        return NextResponse.json(
            { error: 'Failed to submit application. Please try again later.' },
            { status: 500 }
        );
    }
}
