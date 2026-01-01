import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Helper function to inline CSS styles for email compatibility
// Extracts <style> tags and applies them as inline styles
function inlineStyles(html) {
  if (!html || typeof html !== 'string') return html;
  
  // Extract all <style> tags content
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styles = {};
  let match;
  
  while ((match = styleRegex.exec(html)) !== null) {
    const cssContent = match[1];
    // Parse CSS rules
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let ruleMatch;
    
    while ((ruleMatch = ruleRegex.exec(cssContent)) !== null) {
      const selector = ruleMatch[1].trim();
      const rules = ruleMatch[2].trim();
      
      // Store styles for each selector
      if (!styles[selector]) {
        styles[selector] = [];
      }
      styles[selector].push(rules);
    }
  }
  
  // If no styles found or HTML already has extensive inline styles, return as-is
  if (Object.keys(styles).length === 0 || html.includes('style=') && html.split('style=').length > 10) {
    return html;
  }
  
  // Apply inline styles to matching elements
  let inlinedHtml = html;
  
  // Simple selector matching for common cases
  Object.keys(styles).forEach(selector => {
    const styleRules = styles[selector].join('; ');
    
    // Handle class selectors
    if (selector.startsWith('.')) {
      const className = selector.slice(1).split(/[\s:.,]/)[0];
      const classRegex = new RegExp(`(<[^>]+class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*)(>)`, 'gi');
      inlinedHtml = inlinedHtml.replace(classRegex, (match, opening, closing) => {
        if (opening.includes('style=')) {
          return opening.replace(/style=["']([^"']*)["']/, `style="$1; ${styleRules}"`) + closing;
        } else {
          return `${opening} style="${styleRules}"${closing}`;
        }
      });
    }
    
    // Handle element selectors (body, table, td, etc.)
    if (/^[a-z]+$/i.test(selector)) {
      const elementRegex = new RegExp(`(<${selector}[^>]*)(>)`, 'gi');
      inlinedHtml = inlinedHtml.replace(elementRegex, (match, opening, closing) => {
        if (opening.includes('style=')) {
          return opening.replace(/style=["']([^"']*)["']/, `style="$1; ${styleRules}"`) + closing;
        } else {
          return `${opening} style="${styleRules}"${closing}`;
        }
      });
    }
    
    // Handle ID selectors
    if (selector.startsWith('#')) {
      const id = selector.slice(1).split(/[\s:.,]/)[0];
      const idRegex = new RegExp(`(<[^>]+id=["']${id}["'][^>]*)(>)`, 'gi');
      inlinedHtml = inlinedHtml.replace(idRegex, (match, opening, closing) => {
        if (opening.includes('style=')) {
          return opening.replace(/style=["']([^"']*)["']/, `style="$1; ${styleRules}"`) + closing;
        } else {
          return `${opening} style="${styleRules}"${closing}`;
        }
      });
    }
  });
  
  return inlinedHtml;
}

// GoDaddy SMTP Configuration
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST || "smtpout.secureserver.net";
  const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  // Validate required credentials
  if (!smtpUser || !smtpPass) {
    console.error('[EMAIL] Missing SMTP credentials - SMTP_USER or SMTP_PASS not set');
    throw new Error('SMTP credentials not configured');
  }

  console.log(`[EMAIL] Creating transporter for ${smtpUser} via ${smtpHost}:${smtpPort}`);

  const config = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for 587
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // Hostinger-specific settings for better compatibility
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    // Important for Vercel/serverless environments
    pool: false, // Disable connection pooling in serverless
    maxConnections: 1,
    maxMessages: 1,
    // Add longer timeout for serverless cold starts
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,
    socketTimeout: 60000,
    // Disable debug logging to reduce console spam
    debug: false,
    logger: false,
  };

  return nodemailer.createTransport(config);
};

// Email templates
export const emailTemplates = {
  contact: (data) => ({
    subject: `[Nexlife Website] Contact Form - ${data.subject || 'New Inquiry'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22d3ee, #6366f1); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-top: 0;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${
                data.name
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${
                data.email
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Phone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${
                data.phone || 'Not provided'
              }</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Subject:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${
                data.subject || 'No subject'
              }</td>
            </tr>
            ${data.productName ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Product Interest:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${data.productName}</td>
            </tr>
            ` : ''}
          </table>
          <h3 style="color: #1e293b; margin-top: 20px;">Message</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1;">
            ${convertMarkdownToHtml(data.message)}
          </div>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p>This email was sent from the Nexlife International website contact form.</p>
          <p>Reply directly to this email to respond to ${data.name}.</p>
        </div>
      </div>
    `,
    text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Subject: ${data.subject || 'No subject'}
${data.productName ? `Product Interest: ${data.productName}` : ''}

Message:
${convertMarkdownToText(data.message)}

---
This email was sent from the Nexlife International website contact form.
Reply directly to this email to respond to ${data.name}.
    `,
  }),

  contactConfirmation: (data) => ({
    subject: `Thank you for contacting Nexlife International`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22d3ee, #6366f1); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${data.name}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Thank you for reaching out to Nexlife International. We have received your message and our team will get back to you within 24 hours.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Your Message Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #1e293b;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
                <td style="padding: 8px 0; color: #1e293b;">${data.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Phone:</td>
                <td style="padding: 8px 0; color: #1e293b;">${data.phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Subject:</td>
                <td style="padding: 8px 0; color: #1e293b;">${data.subject || 'General Inquiry'}</td>
              </tr>
              ${data.productName ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Product Interest:</td>
                <td style="padding: 8px 0; color: #1e293b;">${data.productName}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Received:</td>
                <td style="padding: 8px 0; color: #1e293b;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">📋 What happens next?</p>
            <ul style="margin: 10px 0 0 0; color: #1e40af; padding-left: 20px;">
              <li>Our team will review your message within 24 hours</li>
              <li>We'll send you a detailed response to your inquiry</li>
              <li>For urgent matters, feel free to call us directly</li>
            </ul>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #166534; font-weight: bold;">📄 Product Catalogue Attached!</p>
            <p style="margin: 0; color: #166534; font-size: 14px;">
              We've attached our comprehensive product catalogue for your reference. Browse through our wide range of pharmaceutical products while you wait for our response.
            </p>
          </div>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p><strong>Contact Information:</strong></p>
          <p>📧 Email: Info@nexlifeinternational.com</p>
          <p>📞 Phone: +91 96648 43790 | +91 84015 46910</p>
          <p>💬 WhatsApp: <a href="https://wa.me/919664843790" style="color: #22d3ee;">+91 96648 43790</a></p>
          <p>📍 Address: S-223, Angel Business Center – 2, Near ABC Circle, Mota Varachha, Surat - 394101 (Gujarat)</p>
          <p style="margin-top: 15px;">This is an automated confirmation email. Please do not reply to this message.</p>
        </div>
      </div>
    `,
    text: `
Thank you for contacting Nexlife International!

Hello ${data.name}!

Thank you for reaching out to Nexlife International. We have received your message and our team will get back to you within 24 hours.

Your Message Details:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone || 'Not provided'}
- Subject: ${data.subject || 'General Inquiry'}
${data.productName ? `- Product Interest: ${data.productName}` : ''}
- Received: ${new Date().toLocaleString()}

What happens next?
- Our team will review your message within 24 hours
- We'll send you a detailed response to your inquiry
- For urgent matters, feel free to call us directly

Product Catalogue Attached!
We've attached our comprehensive product catalogue for your reference. Browse through our wide range of pharmaceutical products while you wait for our response.

Contact Information:
Email: Info@nexlifeinternational.com
Phone: +91 96648 43790 | +91 84015 46910
WhatsApp: https://wa.me/919664843790
Address: S-223, Angel Business Center – 2, Near ABC Circle, Mota Varachha, Surat - 394101 (Gujarat)

---
This is an automated confirmation email. Please do not reply to this message.
    `,
  }),

  newsletter: (data) => ({
    subject: `[Nexlife Newsletter] New Subscription - ${data.email}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22d3ee, #6366f1); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">New Newsletter Subscription</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <p style="color: #1e293b; font-size: 16px;">A new user has subscribed to the newsletter:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0; font-weight: bold; color: #1e293b;">Email: ${
              data.email
            }</p>
            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Subscribed on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p>This email was sent from the Nexlife International website newsletter signup.</p>
        </div>
      </div>
    `,
    text: `
New Newsletter Subscription

Email: ${data.email}
Subscribed on: ${new Date().toLocaleString()}

---
This email was sent from the Nexlife International website newsletter signup.
    `,
  }),

  inquiryConfirmation: (data) => ({
    subject: `Thank you for contacting Nexlife International - Inquiry #${data.inquiryId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22d3ee, #6366f1); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Thank You for Your Inquiry</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${data.name}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Thank you for reaching out to Nexlife International. We have received your inquiry and our team will get back to you within 24 hours.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Your Inquiry Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Inquiry ID:</td>
                <td style="padding: 8px 0; color: #1e293b;">#${data.inquiryId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Subject:</td>
                <td style="padding: 8px 0; color: #1e293b;">${data.subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Received:</td>
                <td style="padding: 8px 0; color: #1e293b;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">📋 What happens next?</p>
            <ul style="margin: 10px 0 0 0; color: #92400e; padding-left: 20px;">
              <li>Our team will review your inquiry within 24 hours</li>
              <li>We'll send you a detailed response with product information</li>
              <li>For urgent matters, feel free to call us directly</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #475569; margin-bottom: 15px;">While you wait, you can download our product catalogue:</p>
            <a href="${data.catalogueUrl}" style="background: linear-gradient(135deg, #22d3ee, #6366f1); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              📄 Download Product Catalogue
            </a>
          </div>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p><strong>Contact Information:</strong></p>
          <p>📧 Email: Info@nexlifeinternational.com</p>
          <p>📞 Phone: +91 96648 43790 | +91 84015 46910</p>
          <p>💬 WhatsApp: <a href="https://wa.me/919664843790" style="color: #22d3ee;">+91 96648 43790</a></p>
          <p style="margin-top: 15px;">This is an automated confirmation email. Please do not reply to this message.</p>
        </div>
      </div>
    `,
    text: `
Thank you for contacting Nexlife International!

Hello ${data.name}!

Thank you for reaching out to Nexlife International. We have received your inquiry and our team will get back to you within 24 hours.

Your Inquiry Details:
- Inquiry ID: #${data.inquiryId}
- Subject: ${data.subject}
- Received: ${new Date().toLocaleString()}

What happens next?
- Our team will review your inquiry within 24 hours
- We'll send you a detailed response with product information
- For urgent matters, feel free to call us directly

Download our product catalogue: ${data.catalogueUrl}

Contact Information:
Email: Info@nexlifeinternational.com
Phone: +91 96648 43790 | +91 84015 46910
WhatsApp: https://wa.me/919664843790

---
This is an automated confirmation email. Please do not reply to this message.
    `,
  }),

  otp: (data) => ({
    subject: `[Nexlife Security] Your verification code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22d3ee, #6366f1); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Verification Code</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc; text-align:center;">
          <p style="color: #1e293b; font-size: 16px;">Use this code to verify your email or reset your password. It expires in 5 minutes.</p>
          <div style="display:inline-block; background: white; padding: 16px 24px; border-radius: 8px; border-left: 4px solid #22d3ee; font-size: 28px; font-weight: 800; letter-spacing: 4px; color:#0f172a;">
            ${data.code}
          </div>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
    text: `Your verification code is ${data.code}. It expires in 5 minutes.`,
  }),

  rawHtml: (data) => ({
    subject: data.subject || 'Update from Nexlife International',
    html: inlineStyles(data.html), // Inline CSS for email client compatibility
    text: data.text || 'Please view this email in an HTML-compatible email client.',
  }),

  campaign: (data) => ({
    subject: data.subject || 'Important Update from Nexlife International',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.subject || 'Nexlife International'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
<div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
<!-- Header with Gradient -->
<div style="background: linear-gradient(135deg, #22d3ee 0%, #6366f1 50%, #a855f7 100%); padding: 40px 20px; text-align: center;">
<h1 style="margin: 0; font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px;">${data.subject || 'Important Update'}</h1>
<p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Nexlife International</p>
</div>
<!-- Content -->
<div style="padding: 40px 30px;">
${data.announcement ? `<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
<p style="margin: 0; color: #92400e; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📢 ANNOUNCEMENT</p>
</div>` : ''}
<div style="color: #1e293b; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
${convertMarkdownToHtml(data.message)}
</div>
<!-- Company Info Section -->
<div style="background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%); border-radius: 12px; padding: 30px; margin: 30px 0; border: 2px solid #e0e7ff;">
<div style="text-align: center; margin-bottom: 20px;">
<h2 style="margin: 0 0 10px 0; color: #1e293b; font-size: 24px; font-weight: 700;">🌿 Nexlife International</h2>
<p style="margin: 0; color: #475569; font-size: 16px; font-weight: 600;">Your Trusted Partner in Global Pharmaceutical Solutions</p>
</div>
<div style="color: #475569; font-size: 14px; line-height: 1.8; text-align: center;">
<p style="margin: 0 0 15px 0;">Based in <strong style="color: #6366f1;">Surat, India</strong>, Nexlife International is a global leader in</p>
<p style="margin: 0 0 15px 0;"><strong style="color: #6366f1;">pharmaceutical import and export.</strong></p>
<p style="margin: 0 0 15px 0;">We deliver <strong style="color: #22c55e;">WHO-GMP, ISO, and CE certified</strong> medicines across</p>
<p style="margin: 0 0 20px 0;"><strong>Asia, Africa, Europe, and South America.</strong></p>
<div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #e0e7ff;">
<p style="margin: 0; color: #1e293b; font-size: 14px;">Our portfolio includes <strong style="color: #6366f1;">tablets, injections, syrups, creams,</strong> and <strong style="color: #6366f1;">medical devices</strong> —</p>
<p style="margin: 5px 0 0 0; color: #1e293b; font-size: 14px;">ensuring <strong style="color: #22c55e;">quality, safety, and reliability</strong> at every step.</p>
</div>
<p style="margin: 20px 0 0 0; color: #6366f1; font-size: 16px; font-weight: 600; font-style: italic;">Innovating healthcare, delivering trust — worldwide.</p>
</div>
<!-- Contact Buttons -->
<div style="text-align: center; margin-top: 25px;">
<a href="https://www.nexlifeinternational.com/catalogue.pdf" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 5px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">📄 Download Catalogue</a>
<a href="https://www.nexlifeinternational.com/contact" style="display: inline-block; background: linear-gradient(135deg, #22d3ee, #6366f1); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 5px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">📞 Contact Us</a>
<a href="https://wa.me/919664843790" style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 5px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">💬 WhatsApp</a>
</div>
</div>
${data.note ? `<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
<p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">📝 Note: ${data.note}</p>
</div>` : ''}
</div>
<!-- Footer -->
<div style="background: #1e293b; padding: 30px; text-align: center;">
<div style="margin-bottom: 20px;">
<p style="margin: 0 0 10px 0; color: #e2e8f0; font-weight: 600; font-size: 14px;">Contact Information</p>
<p style="margin: 5px 0; color: #94a3b8; font-size: 13px;">📧 Email: <a href="mailto:Info@nexlifeinternational.com" style="color: #22d3ee; text-decoration: none;">Info@nexlifeinternational.com</a></p>
<p style="margin: 5px 0; color: #94a3b8; font-size: 13px;">📞 Phone: +91 96648 43790 | +91 84015 46910</p>
<p style="margin: 5px 0; color: #94a3b8; font-size: 13px;">💬 WhatsApp: <a href="https://wa.me/919664843790" style="color: #22d3ee; text-decoration: none;">+91 96648 43790</a></p>
<p style="margin: 5px 0; color: #94a3b8; font-size: 13px;">📍 S-223, Angel Business Center – 2, Mota Varachha, Surat - 394101</p>
</div>
<div style="border-top: 1px solid #334155; padding-top: 20px; margin-top: 20px;">
<p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px;">© ${new Date().getFullYear()} Nexlife International. All rights reserved.</p>
<p style="margin: 0; color: #64748b; font-size: 11px;"><a href="https://www.nexlifeinternational.com" style="color: #64748b; text-decoration: none;">Visit Website</a> | <a href="https://www.nexlifeinternational.com/contact" style="color: #64748b; text-decoration: none; margin: 0 5px;">Contact</a> | <a href="mailto:Info@nexlifeinternational.com?subject=Unsubscribe" style="color: #64748b; text-decoration: none;">Unsubscribe</a></p>
</div>
</div>
</div>
</body>
</html>`,
    text: `
${data.subject || 'Important Update from Nexlife International'}

${data.announcement ? '📢 ANNOUNCEMENT\n\n' : ''}

${convertMarkdownToText(data.message)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌿 Nexlife International
Your Trusted Partner in Global Pharmaceutical Solutions

Based in Surat, India, Nexlife International is a global leader in pharmaceutical import and export.

We deliver WHO-GMP, ISO, and CE certified medicines across Asia, Africa, Europe, and South America.

Our portfolio includes tablets, injections, syrups, creams, and medical devices — ensuring quality, safety, and reliability at every step.

Innovating healthcare, delivering trust — worldwide.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contact Information:
📧 Email: Info@nexlifeinternational.com
📞 Phone: +91 96648 43790 | +91 84015 46910
💬 WhatsApp: https://wa.me/919664843790
📍 Address: S-223, Angel Business Center – 2, Mota Varachha, Surat - 394101

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

© ${new Date().getFullYear()} Nexlife International. All rights reserved.
Visit Website: https://www.nexlifeinternational.com
To unsubscribe, reply with "Unsubscribe" in the subject line.
    `,
  }),

  staffWelcome: (data) => ({
    subject: `Welcome to Nexlife International - Your Account Details`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22d3ee, #6366f1); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to Nexlife International</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-top: 0;">Hello ${data.name}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Your staff account has been created successfully. Here are your login credentials:
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Account Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Email:</td>
                <td style="padding: 8px 0; color: #1e293b;">${data.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Password:</td>
                <td style="padding: 8px 0; color: #1e293b; font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${data.password}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Role:</td>
                <td style="padding: 8px 0; color: #1e293b; text-transform: capitalize;">${data.role}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" style="background: linear-gradient(135deg, #22d3ee, #6366f1); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Login to Your Account
            </a>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ Security Notice</p>
            <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
              Please change your password after your first login for security purposes.
            </p>
          </div>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p>This email was sent automatically when your account was created.</p>
          <p>If you have any questions, please contact your administrator.</p>
        </div>
      </div>
    `,
    text: `
Welcome to Nexlife International!

Hello ${data.name}!

Your staff account has been created successfully. Here are your login credentials:

Email: ${data.email}
Password: ${data.password}
Role: ${data.role}

Login URL: ${data.loginUrl}

⚠️ Security Notice: Please change your password after your first login for security purposes.

---
This email was sent automatically when your account was created.
If you have any questions, please contact your administrator.
    `,
  }),

  passwordReset: (data) => ({
    subject: `[Nexlife Security] Password Reset Request`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Gradient -->
          <div style="background: linear-gradient(135deg, #22d3ee 0%, #6366f1 50%, #a855f7 100%); padding: 40px 20px; text-align: center; position: relative;">
            <div style="background: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <div style="background: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px;">Password Reset Request</h1>
            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Nexlife International Admin Panel</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Hello ${data.name || 'User'}!</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              We received a request to reset the password for your Nexlife Admin account. Click the button below to create a new password:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.resetUrl}" style="background: linear-gradient(135deg, #22d3ee, #6366f1); color: white; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); transition: transform 0.2s;">
                🔐 Reset Your Password
              </a>
            </div>

            <!-- Info Box -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%); border-left: 4px solid #6366f1; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 12px 0; color: #1e293b; font-weight: 600; font-size: 14px;">⏰ Important Information:</p>
              <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                <li>This link will expire in <strong style="color: #6366f1;">${data.expiresIn || '24 hours'}</strong></li>
                <li>This link can only be used <strong style="color: #6366f1;">once</strong></li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
            </div>

            <!-- Security Notice -->
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600; font-size: 14px;">🛡️ Security Tips:</p>
              <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                Never share this link with anyone. Nexlife staff will never ask for your password or reset link via email, phone, or chat.
              </p>
            </div>

            <!-- Alternative Link -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="margin: 0; word-break: break-all; color: #6366f1; font-size: 12px; font-family: monospace; background: white; padding: 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
                ${data.resetUrl}
              </p>
            </div>

            <!-- Help Section -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">Need help? Contact us:</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px; width: 80px;">📧 Email:</td>
                  <td style="padding: 6px 0;">
                    <a href="mailto:Info@nexlifeinternational.com" style="color: #6366f1; text-decoration: none; font-size: 13px;">Info@nexlifeinternational.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">📞 Phone:</td>
                  <td style="padding: 6px 0; color: #475569; font-size: 13px;">+91 96648 43790 | +91 84015 46910</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">💬 WhatsApp:</td>
                  <td style="padding: 6px 0;">
                    <a href="https://wa.me/919664843790" style="color: #6366f1; text-decoration: none; font-size: 13px;">+91 96648 43790</a>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #1e293b; padding: 24px 30px; text-align: center;">
            <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px;">
              This is an automated security email from Nexlife International
            </p>
            <p style="margin: 0; color: #64748b; font-size: 12px;">
              © ${new Date().getFullYear()} Nexlife International. All rights reserved.
            </p>
            <p style="margin: 12px 0 0 0; color: #64748b; font-size: 11px;">
              This email was sent to a verified Nexlife admin account
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Password Reset Request - Nexlife International

Hello ${data.name || 'User'}!

We received a request to reset the password for your Nexlife Admin account.

Reset your password by visiting this link:
${data.resetUrl}

⏰ Important Information:
• This link will expire in ${data.expiresIn || '24 hours'}
• This link can only be used once
• If you didn't request this, please ignore this email
• Your password won't change until you create a new one

🛡️ Security Tips:
Never share this link with anyone. Nexlife staff will never ask for your password or reset link via email, phone, or chat.

Need help? Contact us:
📧 Email: Info@nexlifeinternational.com
📞 Phone: +91 96648 43790 | +91 84015 46910
💬 WhatsApp: +91 96648 43790

---
This is an automated security email from Nexlife International
© ${new Date().getFullYear()} Nexlife International. All rights reserved.
    `,
  }),
};

// Convert markdown images to HTML images
export const convertMarkdownToHtml = (text) => {
  if (!text) return "";

  // Convert line breaks to HTML
  let html = text.replace(/\n/g, "<br>");

  // Convert markdown images ![alt](url) to HTML images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    return `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; display: block;" />`;
  });

  // Convert markdown links [text](url) to HTML links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    return `<a href="${url}" style="color: #6366f1; text-decoration: none;">${text}</a>`;
  });

  return html;
};

// Convert markdown to plain text (for text emails)
export const convertMarkdownToText = (text) => {
  if (!text) return "";

  // Convert markdown images ![alt](url) to text description
  let plainText = text.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, url) => {
      return `[Image: ${alt || "Image"} - ${url}]`;
    }
  );

  // Convert markdown links [text](url) to plain text with URL
  plainText = plainText.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, text, url) => {
      return `${text} (${url})`;
    }
  );

  return plainText;
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Send email function
export const sendEmail = async (to, template, data, options = {}) => {
  let transporter = null;
  
  try {
    console.log(`[EMAIL] Attempting to send ${template} email to ${to}`);
    
    transporter = createTransporter();

    // Verify transporter configuration with timeout
    console.log('[EMAIL] Verifying SMTP connection...');
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SMTP verification timeout after 30s')), 30000)
    );
    
    await Promise.race([verifyPromise, timeoutPromise]);
    console.log('[EMAIL] SMTP connection verified successfully');

    const emailTemplate = emailTemplates[template](data);

    const mailOptions = {
      from: `Nexlife International <${process.env.SMTP_USER}>`,
      to: to,
      replyTo: options.replyTo || process.env.SMTP_USER, // ensure replies go to official inbox
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
      ...options,
    };

    console.log(`[EMAIL] Sending email with subject: "${emailTemplate.subject}"`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Email sent successfully. MessageID: ${result.messageId}`);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[EMAIL] ❌ Email sending failed:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      message: error.message,
      stack: error.stack
    });
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP Authentication failed. Please verify your email credentials in Vercel environment variables.';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      errorMessage = 'SMTP connection timeout. Please check your SMTP host and port settings.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'SMTP socket error. This may be due to firewall or network restrictions.';
    }
    
    return { success: false, error: errorMessage, details: error };
  } finally {
    // Close the transporter in serverless environment
    if (transporter) {
      try {
        transporter.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  }
};

// Send multiple emails (for notifications)
export const sendBulkEmail = async (
  recipients,
  template,
  data,
  options = {}
) => {
  const results = [];

  for (const recipient of recipients) {
    const result = await sendEmail(recipient, template, data, options);
    results.push({ recipient, ...result });
  }

  return results;
};

export default {
  createTransporter,
  sendEmail,
  sendBulkEmail,
  validateEmail,
  emailTemplates,
};
