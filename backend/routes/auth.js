import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getCollections } from "../db.js";
import { logSystem, ActivityLevel } from "../config/logger.js";

const router = express.Router();

function signToken(payload) {
  const secret = process.env.JWT_SECRET || "dev-secret-change";
  return jwt.sign(payload, secret, { expiresIn: "12h" });
}

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export async function seedSuperAdmin() {
  const { staff } = await getCollections();
  const email = process.env.SUPERADMIN_EMAIL || "superadmin@nexlife.local";
  const password = process.env.SUPERADMIN_PASSWORD || "Nexlife@2025";
  const name = process.env.SUPERADMIN_NAME || "Super Admin";
  const existing = await staff.findOne({ email: email.toLowerCase() });
  if (!existing) {
    await staff.insertOne({
      email: email.toLowerCase(),
      name,
      passwordHash: hashPassword(password),
      role: "superadmin",
      createdAt: new Date(),
    });
    // eslint-disable-next-line no-console
    console.log("Seeded superadmin:", email);
  }
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  const { staff } = await getCollections();
  const user = await staff.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = bcrypt.compareSync(String(password), user.passwordHash || "");
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken({
    id: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
  });
  // log auth login success
  try {
    await logSystem(req, {
      level: ActivityLevel.SUCCESS,
      type: "auth.login",
      message: `User ${user.name || user.email} logged in`,
      actorId: String(user._id),
      actorName: user.name || user.email,
      status: "success",
    });
  } catch {}
  res.json({
    token,
    user: { id: user._id, email: user.email, role: user.role, name: user.name },
  });
});

// Logout helper for API usage (clears cookie when used via backend login page)
router.post("/logout", async (req, res) => {
  res.setHeader(
    "Set-Cookie",
    `nxl_jwt=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  try {
    if (req.user?.id) {
      await logSystem(req, {
        level: ActivityLevel.INFO,
        type: "auth.logout",
        message: `User ${req.user.name || req.user.email} logged out`,
        actorId: String(req.user.id),
        actorName: req.user.name || req.user.email,
        status: "success",
      });
    } else {
      await logSystem(req, {
        level: ActivityLevel.INFO,
        type: "auth.logout",
        message: `User logged out`,
        status: "success",
      });
    }
  } catch {}
  return res.json({ success: true });
});

// Current user
router.get("/me", async (req, res) => {
  const header = req.headers.authorization || "";
  const cookies = (req.headers.cookie || "").split(";").reduce((acc, p) => {
    const [k, v] = p.split("=");
    if (k && v) acc[k.trim()] = decodeURIComponent(v);
    return acc;
  }, {});
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : cookies["nxl_jwt"];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev-secret-change";
    const payload = jwt.verify(token, secret);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return res.status(401).json({ error: "Unauthorized - Token expired" });
    }

    // Validate required payload fields
    if (!payload.id || !payload.email) {
      return res.status(401).json({ error: "Unauthorized - Invalid token payload" });
    }

    const { staff } = await getCollections();
    const user = await staff.findOne(
      {
        _id: payload.id
          ? new (
              await import("mongodb")
            ).ObjectId(payload.id)
          : null,
      },
      { projection: { passwordHash: 0, resetCode: 0, resetExpiresAt: 0 } }
    );

    if (!user) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name || "",
        role: user.role,
      },
    });
  } catch (e) {
    console.error("Token verification failed:", e.message);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
});

// Update own profile (name only)
router.post("/me", async (req, res) => {
  const header = req.headers.authorization || "";
  const cookies = (req.headers.cookie || "").split(";").reduce((acc, p) => {
    const [k, v] = p.split("=");
    if (k && v) acc[k.trim()] = decodeURIComponent(v);
    return acc;
  }, {});
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : cookies["nxl_jwt"];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev-secret-change";
    const payload = jwt.verify(token, secret);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return res.status(401).json({ error: "Unauthorized - Token expired" });
    }

    // Validate required payload fields
    if (!payload.id || !payload.email) {
      return res.status(401).json({ error: "Unauthorized - Invalid token payload" });
    }

    const { staff } = await getCollections();
    const name = String((req.body?.name || "").trim());
    if (!name) return res.status(400).json({ error: "Name is required" });

    await staff.updateOne(
      { _id: new (await import("mongodb")).ObjectId(payload.id) },
      { $set: { name } }
    );

    return res.json({ success: true });
  } catch (e) {
    console.error("Token verification failed:", e.message);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
});

// Change password (authenticated)
router.post("/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (
    !req.headers.authorization &&
    !(req.headers.cookie || "").includes("nxl_jwt=")
  ) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password too short" });
  }

  const secret = process.env.JWT_SECRET || "dev-secret-change";

  try {
    const token = (req.headers.authorization || "").startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : (
          (req.headers.cookie || "")
            .split(";")
            .map((p) => p.trim())
            .find((p) => p.startsWith("nxl_jwt=")) || ""
        ).split("=")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    const payload = jwt.verify(token, secret);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return res.status(401).json({ error: "Unauthorized - Token expired" });
    }

    // Validate required payload fields
    if (!payload.id || !payload.email) {
      return res.status(401).json({ error: "Unauthorized - Invalid token payload" });
    }

    const { staff } = await getCollections();
    const user = await staff.findOne({
      _id: payload.id
        ? new (
            await import("mongodb")
          ).ObjectId(payload.id)
        : null,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      oldPassword &&
      !bcrypt.compareSync(String(oldPassword), user.passwordHash || "")
    ) {
      return res.status(400).json({ error: "Old password incorrect" });
    }

    await staff.updateOne(
      { _id: user._id },
      { $set: { passwordHash: hashPassword(newPassword) } }
    );

    try {
      await logSystem(req, {
        level: ActivityLevel.SUCCESS,
        type: "auth.password.change",
        message: `Password changed for ${user.email}`,
        actorId: String(user._id),
        actorName: user.name || user.email,
        status: "success",
      });
    } catch {}

    return res.json({ success: true });
  } catch (e) {
    console.error("Token verification failed:", e.message);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
});

// Forgot password - issue OTP
router.post("/forgot", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email required" });
  const { staff } = await getCollections();
  const user = await staff.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(200).json({ success: true }); // don't reveal
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await staff.updateOne(
    { _id: user._id },
    { $set: { resetCode: code, resetExpiresAt: expiresAt } }
  );
  const { sendEmail } = await import("../config/email.js");
  await sendEmail(user.email, "otp", { code });
  try {
    await logSystem(req, {
      level: ActivityLevel.INFO,
      type: "auth.password.forgot",
      message: `Forgot password requested for ${user.email}`,
      actorId: String(user._id),
      actorName: user.name || user.email,
      status: "requested",
    });
  } catch {}
  res.json({ success: true, expiresAt });
});

// Check if an email exists (used by forgot password UI)
router.get("/check-email", async (req, res) => {
  const email = String(req.query.email || "")
    .toLowerCase()
    .trim();
  if (!email) return res.status(400).json({ error: "Email required" });
  const { staff } = await getCollections();
  const user = await staff.findOne({ email });
  return res.json({ exists: !!user });
});

// Reset using OTP
router.post("/reset", async (req, res) => {
  const { email, code, newPassword } = req.body || {};
  if (!email || !code || !newPassword)
    return res.status(400).json({ error: "Missing fields" });
  const { staff } = await getCollections();
  const user = await staff.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.resetCode || !user.resetExpiresAt)
    return res.status(400).json({ error: "No reset requested" });
  if (user.resetCode !== String(code))
    return res.status(400).json({ error: "Invalid code" });
  if (new Date(user.resetExpiresAt).getTime() < Date.now())
    return res.status(400).json({ error: "Code expired" });
  await staff.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash: hashPassword(newPassword) },
      $unset: { resetCode: "", resetExpiresAt: "" },
    }
  );
  try {
    await logSystem(req, {
      level: ActivityLevel.SUCCESS,
      type: "auth.password.reset",
      message: `Password reset via OTP for ${user.email}`,
      actorId: String(user._id),
      actorName: user.name || user.email,
      status: "success",
    });
  } catch {}
  res.json({ success: true });
});

// Verify OTP without resetting password (to gate UI)
router.post("/verify-otp", async (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) return res.status(400).json({ error: "Missing fields" });
  const { staff } = await getCollections();
  const user = await staff.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.resetCode || !user.resetExpiresAt)
    return res.status(400).json({ error: "No reset requested" });
  if (user.resetCode !== String(code))
    return res.status(400).json({ error: "Invalid code" });
  if (new Date(user.resetExpiresAt).getTime() < Date.now())
    return res.status(400).json({ error: "Code expired" });
  return res.json({ valid: true, expiresAt: user.resetExpiresAt });
});

function getTokenFromReq(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  const cookies = (req.headers.cookie || "").split(";").reduce((acc, p) => {
    const [k, v] = p.split("=");
    if (k && v) acc[k.trim()] = decodeURIComponent(v);
    return acc;
  }, {});
  return cookies["nxl_jwt"] || null;
}

export function requireAuth(roles = []) {
  return (req, res, next) => {
    const token = getTokenFromReq(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    try {
      const secret = process.env.JWT_SECRET || "dev-secret-change";
      const payload = jwt.verify(token, secret);

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        return res.status(401).json({ error: "Unauthorized - Token expired" });
      }

      // Validate required payload fields
      if (!payload.id || !payload.email) {
        return res.status(401).json({ error: "Unauthorized - Invalid token payload" });
      }

      req.user = payload;

      // Check role-based access if roles are specified
      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ error: "Forbidden - Insufficient permissions" });
      }

      next();
    } catch (e) {
      console.error("Token verification failed:", e.message);
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }
  };
}

export default router;
