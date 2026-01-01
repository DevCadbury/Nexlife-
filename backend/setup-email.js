#!/usr/bin/env node

/**
 * Email Setup Helper for Nexlife Backend
 *
 * This script helps you set up email configuration interactively
 * Run with: node setup-email.js
 */

import fs from "fs";
import path from "path";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log("🚀 Nexlife Backend Email Setup");
console.log("===============================\n");

console.log(
  "This script will help you configure email settings for your Nexlife backend."
);
console.log("You will need your Hostinger email credentials.\n");

async function setupEmail() {
  try {
    // Check if .env already exists
    const envPath = path.join(process.cwd(), ".env");
    const envExists = fs.existsSync(envPath);

    if (envExists) {
      const overwrite = await question(
        "⚠️  .env file already exists. Overwrite? (y/N): "
      );
      if (overwrite.toLowerCase() !== "y") {
        console.log("Setup cancelled.");
        rl.close();
        return;
      }
    }

    console.log("\n📧 Hostinger Email Configuration");
    console.log("----------------------------------");

    const smtpHost =
      (await question("SMTP Host (e.g., smtpout.secureserver.net or smtp.hostinger.com): ")) ||
      "smtpout.secureserver.net";
    const smtpPort = (await question("SMTP Port (default: 587): ")) || "587";
    const smtpSecure = await question("Use SSL/TLS? (y/N): ");
    const smtpUser = await question(
      "Email address (e.g., contact@nexlifeinternational.com): "
    );
    const smtpPass = await question("Email password: ");
    const contactTo =
      (await question(
        "Contact form recipient (default: same as SMTP user): "
      )) || smtpUser;

    console.log("\n🔧 Server Configuration");
    console.log("------------------------");

    const port = (await question("Server port (default: 4000): ")) || "4000";
    const dashPassword =
      (await question("Dashboard password (default: Nexlife@2025): ")) ||
      "Nexlife@2025";

    console.log("\n🗄️  Database Configuration");
    console.log("----------------------------");

    const mongoUri =
      (await question(
        "MongoDB URI (default: mongodb://localhost:27017/nexlife): "
      )) || "mongodb://localhost:27017/nexlife";
    const mongoDb =
      (await question("MongoDB Database name (default: nexlife): ")) ||
      "nexlife";

    console.log("\n👤 Super Admin Configuration");
    console.log("-------------------------------");
    const superEmail =
      (await question(
        "Superadmin email (default: superadmin@nexlife.local): "
      )) || "superadmin@nexlife.local";
    const superPass =
      (await question("Superadmin password (default: Nexlife@2025): ")) ||
      "Nexlife@2025";
    const jwtSecret =
      (await question("JWT secret (default: generate random): ")) ||
      Math.random().toString(36).slice(2) + Date.now();

    // Generate .env content
    const envContent = `# Nexlife Backend Environment Variables
# Generated on ${new Date().toISOString()}

# Server Configuration
PORT=${port}
NODE_ENV=production

# Dashboard Authentication
DASH_PASSWORD=${dashPassword}

# MongoDB Configuration
MONGODB_URI=${mongoUri}
MONGODB_DB=${mongoDb}

# Hostinger Email Configuration
SMTP_HOST=${smtpHost}
SMTP_PORT=${smtpPort}
SMTP_SECURE=${smtpSecure.toLowerCase() === "y" ? "true" : "false"}
SMTP_USER=${smtpUser}
SMTP_PASS=${smtpPass}

# Email Recipients
CONTACT_TO=${contactTo}

# Authentication
JWT_SECRET=${jwtSecret}
SUPERADMIN_EMAIL=${superEmail}
SUPERADMIN_PASSWORD=${superPass}

# Optional: Additional email settings
# EMAIL_FROM_NAME=Nexlife International
# EMAIL_REPLY_TO=noreply@nexlifeinternational.com
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);

    console.log("\n✅ Configuration saved to .env file");
    console.log("\n📋 Next Steps:");
    console.log("1. Test your email configuration: npm run test-email");
    console.log("2. Start your server: npm start");
    console.log("3. Visit your dashboard: http://localhost:" + port);
    console.log("\n📖 For detailed setup instructions, see EMAIL_SETUP.md");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
  } finally {
    rl.close();
  }
}

setupEmail();
