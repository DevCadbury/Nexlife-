import express from "express";
import { getCollections, addLog } from "../db.js";
import { requireAuth } from "./auth.js";

const router = express.Router();

// GET /api/templates - Get all templates
router.get("/", requireAuth(), async (req, res) => {
  try {
    const { templates } = await getCollections();
    
    const templateList = await templates
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Ensure all templates have a subject field (for backward compatibility)
    const templatesWithSubject = templateList.map(t => ({
      ...t,
      subject: t.subject || ""
    }));
    
    res.json({ 
      success: true, 
      items: templatesWithSubject 
    });
  } catch (err) {
    console.error("Get templates failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/templates/:id - Get single template
router.get("/:id", requireAuth(), async (req, res) => {
  try {
    const { ObjectId } = await import("mongodb");
    const { templates } = await getCollections();
    
    const template = await templates.findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    // Ensure template has subject field (for backward compatibility)
    res.json({ 
      success: true, 
      template: {
        ...template,
        subject: template.subject || ""
      }
    });
  } catch (err) {
    console.error("Get template failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/templates - Create new template
router.post("/", requireAuth(), async (req, res) => {
  try {
    const { name, subject, htmlContent, description } = req.body || {};
    
    if (!name || !htmlContent) {
      return res.status(400).json({ error: "Name and HTML content are required" });
    }
    
    const { templates } = await getCollections();
    const { id: userId, name: userName } = req.user;
    
    const template = {
      name,
      subject: subject || "",
      htmlContent,
      description: description || "",
      createdBy: userId,
      createdByName: userName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await templates.insertOne(template);
    
    await addLog({
      type: "template.created",
      actorId: userId,
      actorName: userName,
      meta: { 
        templateId: result.insertedId.toString(),
        templateName: name 
      }
    });
    
    res.json({ 
      success: true, 
      templateId: result.insertedId,
      template: { ...template, _id: result.insertedId }
    });
  } catch (err) {
    console.error("Create template failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/templates/:id - Update template
router.put("/:id", requireAuth(), async (req, res) => {
  try {
    const { ObjectId } = await import("mongodb");
    const { name, subject, htmlContent, description } = req.body || {};
    const { templates } = await getCollections();
    const { id: userId, name: userName } = req.user;
    
    if (!name || !htmlContent) {
      return res.status(400).json({ error: "Name and HTML content are required" });
    }
    
    const updateData = {
      name,
      subject: subject || "",
      htmlContent,
      description: description || "",
      updatedAt: new Date(),
      updatedBy: userId,
      updatedByName: userName,
    };
    
    const result = await templates.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    await addLog({
      type: "template.updated",
      actorId: userId,
      actorName: userName,
      meta: { 
        templateId: req.params.id,
        templateName: name 
      }
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error("Update template failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/templates/:id - Delete template
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const { ObjectId } = await import("mongodb");
    const { templates } = await getCollections();
    const { id: userId, name: userName } = req.user;
    
    const template = await templates.findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    await templates.deleteOne({ _id: new ObjectId(req.params.id) });
    
    await addLog({
      type: "template.deleted",
      actorId: userId,
      actorName: userName,
      meta: { 
        templateId: req.params.id,
        templateName: template.name 
      }
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error("Delete template failed", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
