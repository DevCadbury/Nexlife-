import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI not found in environment variables");
  console.error("Please ensure .env file exists with MONGODB_URI");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function hashPassword(password) {
  return bcrypt.hashSync(String(password), 10);
}

async function createDevAccount() {
  console.log("\n🔐 DEV Account Creation Tool");
  console.log("=" .repeat(50));
  console.log("⚠️  WARNING: DEV role has highest privileges");
  console.log("   - Can delete superadmin accounts");
  console.log("   - Hidden from all other users");
  console.log("   - Has full system access");
  console.log("=" .repeat(50) + "\n");

  try {
    // Get account details
    const name = await question("Enter DEV account name: ");
    const email = await question("Enter DEV account email: ");
    const password = await question("Enter DEV account password (min 12 chars): ");

    if (!name || !email || !password) {
      console.error("\n❌ All fields are required!");
      rl.close();
      process.exit(1);
    }

    if (password.length < 12) {
      console.error("\n❌ Password must be at least 12 characters long!");
      rl.close();
      process.exit(1);
    }

    // Confirm creation
    console.log("\n📋 Account Details:");
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: dev (HIGHEST PRIVILEGE)`);

    const confirm = await question("\n⚠️  Create this DEV account? (yes/no): ");

    if (confirm.toLowerCase() !== "yes") {
      console.log("\n❌ DEV account creation cancelled");
      rl.close();
      process.exit(0);
    }

    // Connect to database
    console.log("\n🔄 Connecting to database...");
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("✅ Connected to database");

    const db = client.db();
    const staffCollection = db.collection("staff");

    // Check if email already exists
    const existing = await staffCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existing) {
      console.error(`\n❌ Email ${email} already exists!`);
      console.error(`   Name: ${existing.name}`);
      console.error(`   Role: ${existing.role}`);
      await client.close();
      rl.close();
      process.exit(1);
    }

    // Create DEV account
    console.log("\n🔄 Creating DEV account...");
    const doc = {
      email: email.toLowerCase(),
      name: name,
      role: "dev",
      passwordHash: hashPassword(password),
      notifications: true,
      createdAt: new Date(),
      createdBy: "system",
      isSystemAccount: true,
    };

    const result = await staffCollection.insertOne(doc);

    console.log("\n✅ DEV account created successfully!");
    console.log(`   Account ID: ${result.insertedId}`);
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: dev`);
    console.log("\n📝 Login Credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: [as entered]`);
    console.log(`   Login URL: https://nexlife-admin.vercel.app/login`);
    console.log("\n⚠️  IMPORTANT:");
    console.log("   - Store these credentials securely");
    console.log("   - This account is hidden from all other users");
    console.log("   - Only DEV accounts can see/modify other DEV accounts");
    console.log("   - DEV can delete superadmin accounts");
    console.log("\n🔒 Security Recommendations:");
    console.log("   - Use a strong, unique password");
    console.log("   - Enable 2FA if available");
    console.log("   - Keep credentials in a password manager");
    console.log("   - Never share DEV credentials");

    await client.close();
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating DEV account:", error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the creation process
createDevAccount();
