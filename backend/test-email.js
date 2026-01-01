#!/usr/bin/env node

/**
 * Email Test Script for Nexlife Backend
 *
 * This script helps you test the email configuration
 * Run with: node test-email.js
 */

import dotenv from "dotenv";
import { sendEmail, validateEmail } from "./config/email.js";

dotenv.config();

// Test configuration
const testConfig = {
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  testEmail: process.env.TEST_EMAIL || process.env.SMTP_USER,
};

console.log("🧪 Nexlife Email Configuration Test");
console.log("=====================================\n");

// Check environment variables
console.log("📋 Configuration Check:");
console.log(`SMTP Host: ${testConfig.smtpHost}`);
console.log(`SMTP Port: ${testConfig.smtpPort}`);
console.log(`SMTP User: ${testConfig.smtpUser ? "✅ Set" : "❌ Missing"}`);
console.log(`SMTP Pass: ${testConfig.smtpPass ? "✅ Set" : "❌ Missing"}`);
console.log(`Test Email: ${testConfig.testEmail}\n`);

// Validate email format
if (testConfig.testEmail && !validateEmail(testConfig.testEmail)) {
  console.log("❌ Invalid test email format");
  process.exit(1);
}

// Check if required variables are set
if (!testConfig.smtpUser || !testConfig.smtpPass) {
  console.log("❌ Missing required SMTP credentials");
  console.log("Please set SMTP_USER and SMTP_PASS in your .env file");
  process.exit(1);
}

// Test email sending
async function testEmailSending() {
  console.log("📧 Testing Email Sending...");

  const testData = {
    name: "Test User",
    email: testConfig.testEmail,
    subject: "Email Configuration Test",
    message:
      "This is a test email to verify that your Nexlife backend email configuration is working correctly. If you receive this email, your setup is successful!",
    productName: "Test Product",
  };

  try {
    // Test contact template
    console.log("Testing contact template...");
    const contactResult = await sendEmail(
      testConfig.testEmail,
      "contact",
      testData
    );

    if (contactResult.success) {
      console.log("✅ Contact template test passed");
      console.log(`   Message ID: ${contactResult.messageId}`);
    } else {
      console.log("❌ Contact template test failed");
      console.log(`   Error: ${contactResult.error}`);
    }

    // Test newsletter template
    console.log("\nTesting newsletter template...");
    const newsletterResult = await sendEmail(
      testConfig.testEmail,
      "newsletter",
      { email: testConfig.testEmail }
    );

    if (newsletterResult.success) {
      console.log("✅ Newsletter template test passed");
      console.log(`   Message ID: ${newsletterResult.messageId}`);
    } else {
      console.log("❌ Newsletter template test failed");
      console.log(`   Error: ${newsletterResult.error}`);
    }

    // Test inquiry template
    console.log("\nTesting inquiry template...");
    const inquiryResult = await sendEmail(
      testConfig.testEmail,
      "inquiry",
      testData
    );

    if (inquiryResult.success) {
      console.log("✅ Inquiry template test passed");
      console.log(`   Message ID: ${inquiryResult.messageId}`);
    } else {
      console.log("❌ Inquiry template test failed");
      console.log(`   Error: ${inquiryResult.error}`);
    }

    console.log("\n🎉 Email testing completed!");
    console.log("Check your email inbox for the test messages.");
  } catch (error) {
    console.log("❌ Email test failed with error:");
    console.log(error.message);
    process.exit(1);
  }
}

// Run the test
testEmailSending().catch(console.error);

