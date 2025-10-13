import express from "express";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getCollections, addLog } from "../db.js";
import { requireAuth } from "./auth.js";
import { sendEmail } from "../config/email.js";

const router = express.Router();

function hashPassword(password) {
  return bcrypt.hashSync(String(password), 10);
}

// Generate random password
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// List staff - SUPERADMIN & DEV ONLY (DEV users are hidden from superadmins)
router.get("/", requireAuth(["superadmin", "dev"]), async (req, res) => {
  const { staff } = await getCollections();
  
  // If user is superadmin, hide DEV role users
  const query = req.user?.role === "superadmin" ? { role: { $ne: "dev" } } : {};
  
  const items = await staff
    .find(query)
    .project({ passwordHash: 0 })
    .sort({ createdAt: -1 })
    .toArray();
  res.json({ total: items.length, items });
});

// Create staff - SUPERADMIN & DEV ONLY (only DEV can create DEV role)
router.post("/", requireAuth(["superadmin", "dev"]), async (req, res) => {
  const { email, name, role = "admin", password } = req.body || {};
  if (!email || !name)
    return res.status(400).json({ error: "Missing fields" });
  
  // Only DEV can create DEV role users
  if (role === "dev" && req.user?.role !== "dev") {
    return res.status(403).json({ error: "Insufficient permissions to create DEV role" });
  }
  
  const { staff } = await getCollections();
  const exists = await staff.findOne({ email: String(email).toLowerCase() });
  if (exists) return res.status(409).json({ error: "Email already exists" });

  // Generate password if not provided
  const finalPassword = password || generatePassword();

  const doc = {
    email: String(email).toLowerCase(),
    name: String(name),
    role: String(role),
    passwordHash: hashPassword(finalPassword),
    notifications: true, // Default notifications enabled
    createdAt: new Date(),
  };
  const r = await staff.insertOne(doc);

  // Send welcome email with credentials
  try {
    await sendEmail(email, 'staffWelcome', {
      name: name,
      email: email,
      password: finalPassword,
      role: role,
      loginUrl: 'https://nexlife-admin.vercel.app/login'
    });
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
    // Don't fail the creation if email fails
  }

  await addLog({
    type: "staff.created",
    refId: r.insertedId,
    actorId: req.user?.id,
    meta: { email: doc.email, role: doc.role },
  });
  res.json({ success: true, id: r.insertedId, generatedPassword: !password ? finalPassword : undefined });
});

// Update staff role/name - SUPERADMIN & DEV ONLY (superadmins can't edit other superadmins or DEV)
router.patch("/:id", requireAuth(["superadmin", "dev"]), async (req, res) => {
  const { name, role } = req.body || {};
  const _id = new ObjectId(req.params.id);
  const { staff } = await getCollections();
  
  // Check target user's role
  const targetUser = await staff.findOne({ _id });
  if (!targetUser) return res.status(404).json({ error: "User not found" });
  
  // Superadmins cannot edit other superadmins or DEV users
  if (req.user?.role === "superadmin" && (targetUser.role === "superadmin" || targetUser.role === "dev")) {
    return res.status(403).json({ error: "Cannot modify other superadmin or DEV accounts" });
  }
  
  // Only DEV can update to DEV role
  if (role === "dev" && req.user?.role !== "dev") {
    return res.status(403).json({ error: "Insufficient permissions to assign DEV role" });
  }
  
  await staff.updateOne(
    { _id },
    { $set: { ...(name && { name }), ...(role && { role }) } }
  );
  await addLog({
    type: "staff.updated",
    refId: _id,
    actorId: req.user?.id,
    meta: { name, role },
  });
  res.json({ success: true });
});

// Reset password - SUPERADMIN & DEV ONLY (superadmins can't reset other superadmins or DEV)
router.post(
  "/:id/reset-password",
  requireAuth(["superadmin", "dev"]),
  async (req, res) => {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ error: "Password required" });
    const _id = new ObjectId(req.params.id);
    const { staff } = await getCollections();
    
    // Check target user's role
    const targetUser = await staff.findOne({ _id });
    if (!targetUser) return res.status(404).json({ error: "User not found" });
    
    // Superadmins cannot reset password for other superadmins or DEV users
    if (req.user?.role === "superadmin" && (targetUser.role === "superadmin" || targetUser.role === "dev")) {
      return res.status(403).json({ error: "Cannot reset password for other superadmin or DEV accounts" });
    }
    
    await staff.updateOne(
      { _id },
      { $set: { passwordHash: hashPassword(password) } }
    );
    await addLog({
      type: "staff.reset_password",
      refId: _id,
      actorId: req.user?.id,
    });
    res.json({ success: true });
  }
);

// Toggle notifications - SUPERADMIN & DEV ONLY (superadmins can't modify other superadmins or DEV)
router.patch("/:id/notifications", requireAuth(["superadmin", "dev"]), async (req, res) => {
  const { enabled } = req.body || {};
  const _id = new ObjectId(req.params.id);
  const { staff } = await getCollections();
  
  // Check target user's role
  const targetUser = await staff.findOne({ _id });
  if (!targetUser) return res.status(404).json({ error: "User not found" });
  
  // Superadmins cannot modify other superadmins or DEV users
  if (req.user?.role === "superadmin" && (targetUser.role === "superadmin" || targetUser.role === "dev")) {
    return res.status(403).json({ error: "Cannot modify other superadmin or DEV accounts" });
  }
  
  await staff.updateOne(
    { _id },
    { $set: { notifications: Boolean(enabled) } }
  );
  await addLog({
    type: "staff.notifications_updated",
    refId: _id,
    actorId: req.user?.id,
    meta: { enabled: Boolean(enabled) },
  });
  res.json({ success: true });
});

// Delete staff - SUPERADMIN & DEV ONLY (superadmins can't delete other superadmins, only DEV can delete superadmins)
router.delete("/:id", requireAuth(["superadmin", "dev"]), async (req, res) => {
  const _id = new ObjectId(req.params.id);
  const { staff } = await getCollections();
  
  // Check target user's role
  const targetUser = await staff.findOne({ _id });
  if (!targetUser) return res.status(404).json({ error: "User not found" });
  
  // Superadmins cannot delete other superadmins or DEV users
  if (req.user?.role === "superadmin" && (targetUser.role === "superadmin" || targetUser.role === "dev")) {
    return res.status(403).json({ error: "Cannot delete other superadmin or DEV accounts" });
  }
  
  // DEV users cannot delete other DEV users (protection)
  if (req.user?.role === "dev" && targetUser.role === "dev" && req.user?.id !== targetUser._id.toString()) {
    return res.status(403).json({ error: "Cannot delete other DEV accounts" });
  }
  
  await staff.deleteOne({ _id });
  await addLog({ type: "staff.deleted", refId: _id, actorId: req.user?.id });
  res.json({ success: true });
});

export default router;
