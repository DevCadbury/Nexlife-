import { addLog } from "../db.js";

export const ActivityLevel = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  SUCCESS: "success",
};

export const ActivityCategory = {
  COMMUNICATION: "communication", // calls, emails, sms, meetings, notes
  SALES: "sales", // lead create/update, opportunities, deals
  ENGAGEMENT: "engagement", // customer portal, tickets, feedback, purchases
  SYSTEM: "system", // login/logout, roles, imports/exports, edits/deletes, automations
  TASKS: "tasks", // task lifecycle and reminders
};

// Normalizes and writes an activity log entry
export async function logActivity({
  req,
  level = ActivityLevel.INFO,
  type = "general",
  message = "",
  actorId,
  actorName,
  customerId,
  customerName,
  refId,
  category,
  channel, // call, email, sms, meeting, chat
  outcome, // completed, answered, missed, won, lost, opened, bounced, etc
  status, // open, closed, pending, scheduled, sent, failed, etc
  meta = {},
}) {
  const ip =
    req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req?.socket?.remoteAddress ||
    undefined;
  const userAgent = req?.headers?.["user-agent"];

  const entry = {
    level,
    type,
    message,
    actorId,
    actorName,
    customerId,
    customerName,
    refId,
    category,
    channel,
    outcome,
    status,
    ip,
    userAgent,
    meta,
  };

  // Persist and ensure timestamp field (alias of createdAt for frontend)
  const saved = await addLog(entry);
  return { ...saved, timestamp: saved.createdAt };
}

// Convenience helpers per category
export async function logSystem(req, data) {
  return logActivity({ req, category: ActivityCategory.SYSTEM, ...data });
}

export async function logCommunication(req, data) {
  return logActivity({
    req,
    category: ActivityCategory.COMMUNICATION,
    ...data,
  });
}

export async function logSales(req, data) {
  return logActivity({ req, category: ActivityCategory.SALES, ...data });
}

export async function logEngagement(req, data) {
  return logActivity({ req, category: ActivityCategory.ENGAGEMENT, ...data });
}

export async function logTask(req, data) {
  return logActivity({ req, category: ActivityCategory.TASKS, ...data });
}

export default {
  logActivity,
  logSystem,
  logCommunication,
  logSales,
  logEngagement,
  logTask,
  ActivityLevel,
  ActivityCategory,
};
