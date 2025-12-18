#!/usr/bin/env node
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function testSMTP() {
  section('🔧 Testing SMTP Configuration');
  
  const config = {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
  
  // Check for missing credentials
  if (!config.user || !config.pass) {
    log('❌ SMTP credentials missing!', 'red');
    log('Please set SMTP_USER and SMTP_PASS in .env file', 'yellow');
    return false;
  }
  
  log(`Host: ${config.host}`, 'blue');
  log(`Port: ${config.port}`, 'blue');
  log(`User: ${config.user}`, 'blue');
  log(`Pass: ${'*'.repeat(config.pass.length)}`, 'blue');
  
  try {
    log('\n📡 Creating transporter...', 'yellow');
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
      pool: false,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      debug: true,
      logger: true,
    });
    
    log('✅ Transporter created', 'green');
    
    log('\n🔍 Verifying connection...', 'yellow');
    await transporter.verify();
    log('✅ SMTP connection verified!', 'green');
    
    // Send test email
    log('\n📧 Sending test email...', 'yellow');
    const testTo = process.env.TEST_EMAIL || config.user;
    const info = await transporter.sendMail({
      from: `Nexlife Test <${config.user}>`,
      to: testTo,
      subject: 'SMTP Test Email - Nexlife Backend',
      text: 'If you receive this email, SMTP is working correctly!',
      html: '<h2>✅ SMTP Test Successful</h2><p>Your email configuration is working correctly.</p>',
    });
    
    log(`✅ Test email sent to ${testTo}`, 'green');
    log(`Message ID: ${info.messageId}`, 'blue');
    
    transporter.close();
    return true;
  } catch (error) {
    log('\n❌ SMTP Test Failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    
    if (error.code === 'EAUTH') {
      log('\n💡 Authentication failed. Possible issues:', 'yellow');
      log('  1. Wrong email or password', 'yellow');
      log('  2. Email address case mismatch (use lowercase)', 'yellow');
      log('  3. Account locked due to failed attempts', 'yellow');
      log('  4. Need to reset password in Hostinger', 'yellow');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      log('\n💡 Connection timeout. Possible issues:', 'yellow');
      log('  1. Wrong SMTP host or port', 'yellow');
      log('  2. Firewall blocking connection', 'yellow');
      log('  3. Hostinger service down', 'yellow');
    }
    
    return false;
  }
}

async function testIMAP() {
  section('📥 Testing IMAP Configuration');
  
  const config = {
    host: process.env.IMAP_HOST || 'imap.hostinger.com',
    port: parseInt(process.env.IMAP_PORT) || 993,
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASS,
    secure: process.env.IMAP_SECURE !== 'false',
  };
  
  // Check for missing credentials
  if (!config.user || !config.pass) {
    log('⚠️  IMAP credentials missing - skipping IMAP test', 'yellow');
    return true;
  }
  
  log(`Host: ${config.host}`, 'blue');
  log(`Port: ${config.port}`, 'blue');
  log(`User: ${config.user}`, 'blue');
  log(`Pass: ${'*'.repeat(config.pass.length)}`, 'blue');
  log(`Secure: ${config.secure}`, 'blue');
  
  try {
    log('\n📡 Connecting to IMAP server...', 'yellow');
    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      logger: false,
    });
    
    await client.connect();
    log('✅ IMAP connection established!', 'green');
    
    log('\n📊 Checking mailbox status...', 'yellow');
    const lock = await client.getMailboxLock('INBOX');
    try {
      const status = await client.status('INBOX', {
        messages: true,
        unseen: true,
      });
      log(`Total messages: ${status.messages}`, 'blue');
      log(`Unseen messages: ${status.unseen}`, 'blue');
      log('✅ IMAP mailbox accessible!', 'green');
    } finally {
      lock.release();
    }
    
    await client.logout();
    return true;
  } catch (error) {
    log('\n❌ IMAP Test Failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    
    if (error.code === 'EAUTH') {
      log('\n💡 Authentication failed. Possible issues:', 'yellow');
      log('  1. Wrong email or password', 'yellow');
      log('  2. IMAP credentials different from SMTP', 'yellow');
      log('  3. IMAP not enabled in Hostinger', 'yellow');
    }
    
    return false;
  }
}

async function checkEnvironment() {
  section('🔍 Environment Variables Check');
  
  const required = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
  ];
  
  const optional = [
    'IMAP_HOST',
    'IMAP_PORT',
    'IMAP_USER',
    'IMAP_PASS',
    'CONTACT_TO',
    'TEST_EMAIL',
  ];
  
  let allGood = true;
  
  log('\nRequired Variables:', 'yellow');
  for (const key of required) {
    const value = process.env[key];
    if (value) {
      const display = key.includes('PASS') ? '*'.repeat(value.length) : value;
      log(`  ✅ ${key}: ${display}`, 'green');
    } else {
      log(`  ❌ ${key}: NOT SET`, 'red');
      allGood = false;
    }
  }
  
  log('\nOptional Variables:', 'yellow');
  for (const key of optional) {
    const value = process.env[key];
    if (value) {
      const display = key.includes('PASS') ? '*'.repeat(value.length) : value;
      log(`  ✅ ${key}: ${display}`, 'blue');
    } else {
      log(`  ⚠️  ${key}: not set`, 'yellow');
    }
  }
  
  return allGood;
}

async function main() {
  log('\n🚀 Nexlife Email Configuration Test', 'cyan');
  log('Testing SMTP and IMAP connections...\n', 'cyan');
  
  // Check environment variables
  const envOk = await checkEnvironment();
  if (!envOk) {
    log('\n❌ Missing required environment variables!', 'red');
    log('Please create a .env file with all required variables.', 'yellow');
    process.exit(1);
  }
  
  // Test SMTP
  const smtpOk = await testSMTP();
  
  // Test IMAP
  const imapOk = await testIMAP();
  
  // Final results
  section('📊 Test Results Summary');
  log(`SMTP: ${smtpOk ? '✅ PASSED' : '❌ FAILED'}`, smtpOk ? 'green' : 'red');
  log(`IMAP: ${imapOk ? '✅ PASSED' : '❌ FAILED'}`, imapOk ? 'green' : 'red');
  
  if (smtpOk && imapOk) {
    log('\n🎉 All tests passed! Your email configuration is correct.', 'green');
    log('You can now deploy to Vercel with confidence.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please fix the issues above.', 'yellow');
    log('Check EMAIL_FIX_VERCEL.md for troubleshooting steps.', 'yellow');
    process.exit(1);
  }
}

// Run tests
main().catch((error) => {
  log('\n❌ Unexpected error:', 'red');
  console.error(error);
  process.exit(1);
});
