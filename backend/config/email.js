import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Hostinger SMTP Configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true" || false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your Hostinger email address
      pass: process.env.SMTP_PASS, // Your Hostinger email password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Email templates
export const emailTemplates = {
  contact: (data) => ({
    subject: `[Nexlife Website] Contact Form - ${data.subject}`,
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
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #475569;">Subject:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${
                data.subject
              }</td>
            </tr>
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
Subject: ${data.subject}

Message:
${convertMarkdownToText(data.message)}

---
This email was sent from the Nexlife International website contact form.
Reply directly to this email to respond to ${data.name}.
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
  try {
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

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

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
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
