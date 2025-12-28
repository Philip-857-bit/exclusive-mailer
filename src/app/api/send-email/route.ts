import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

type Contact = {
  email: string;
  name: string;
};

// Brand Colors
const PRIMARY_COLOR = '#006633';
const SECONDARY_COLOR = '#EF3A05';

function wrapWithBrandTemplate(content: string, subject: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
            body { font-family: 'Montserrat', sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #ffffff; padding: 20px; text-align: center; border-bottom: 3px solid ${PRIMARY_COLOR}; }
            .logo-text { color: ${PRIMARY_COLOR}; font-size: 24px; font-weight: bold; text-decoration: none; }
            .logo-sub { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: block; margin-top: 5px; }
            .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
            .footer { background-color: #1a1a1a; color: #888888; padding: 30px; text-align: center; font-size: 12px; }
            .footer a { color: ${SECONDARY_COLOR}; text-decoration: none; }
            img { max-width: 100%; height: auto; display: block; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <!-- Ideally use an <img> tag here if a public logo URL exists. Using text fallback for now. -->
                <div class="logo-text">DeEXCLUSIVES</div>
                <span class="logo-sub">Music Organization</span>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} DeExclusives Music Organization. All rights reserved.</p>
                <p>Empowering African Youth through Music and Education.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!subject || !html || !to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let recipients: string[] = [];

    // Logic to resolve recipients
    if (to === 'all') {
      const contacts = await prisma.contact.findMany({ select: { email: true } });
      recipients = contacts.map((c: { email: string }) => c.email);
    } else if (typeof to === 'string' && to.startsWith('profession:')) {
      const profession = to.split(':')[1];
      const contacts = await prisma.contact.findMany({
        where: {
          profession: {
            equals: profession,
            mode: 'insensitive',
          }
        },
        select: { email: true }
      });
      recipients = contacts.map((c: { email: string }) => c.email);
    } else {
      // Direct email list or single email (for testing)
      recipients = Array.isArray(to) ? to : [to];
    }

    // Filter out invalid emails
    recipients = recipients.filter(email => email && email.includes('@'));

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No valid recipients found for criteria' }, { status: 404 });
    }

    const brandedHtml = wrapWithBrandTemplate(html, subject);

    // Using Gmail service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // In a real bulk scenario, better to use BCC or individual sends via queue.
    // For MVP with ~100 contacts, BCC is okay-ish but might hit limits.
    // Let's do a loop or BCC. Gmail has limits. 
    // SAFEST implementation for "bulk" on free gmail is sending individually with delay, 
    // but that will timeout the Vercel function.
    // We will use BCC for now to keep it simple and within one request, limited to 50 at a time if possible.

    // For this MVP, we will send as "BCC" to protect privacy.
    const mailOptions = {
      from: `"DeExclusives Music" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to self
      bcc: recipients, // Blind copy everyone
      subject,
      html: brandedHtml,
    };

    const info = await transporter.sendMail(mailOptions);

    // Track campaign in DB
    await prisma.emailCampaign.create({
      data: {
        subject,
        body: html, // Store original body
        recipientsCount: recipients.length,
        filterProfession: to.startsWith('profession:') ? to.split(':')[1] : 'all',
      }
    });

    return NextResponse.json({ message: `Email sent to ${recipients.length} recipients`, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
