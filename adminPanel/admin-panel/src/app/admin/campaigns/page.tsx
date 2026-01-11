"use client";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import {
  Send,
  Mail,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  X,
  Upload,
  Download,
  Eye,
  Code,
  Palette,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  List,
  Trash2,
  Search,
  FileSpreadsheet,
  UserPlus,
} from "lucide-react";

// Email Templates
const emailTemplates = {
  newsletter: {
    name: "Newsletter",
    preview: "Professional newsletter template with header and footer",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 32px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #333333; font-size: 24px; margin-bottom: 20px; }
    .content p { color: #666666; line-height: 1.6; margin-bottom: 15px; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background-color: #f8f8f8; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{SUBJECT}}</h1>
    </div>
    <div class="content">
      <h2>Hello!</h2>
      {{CONTENT}}
      <a href="#" class="button">Learn More</a>
    </div>
    <div class="footer">
      <p>&copy; 2025 Nexlife International. All rights reserved.</p>
      <p><a href="{{UNSUBSCRIBE_LINK}}" style="color: #999999;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
  },
  promotional: {
    name: "Promotional",
    preview: "Eye-catching promotional template with special offers",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .banner { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 60px 20px; text-align: center; }
    .banner h1 { color: #ffffff; margin: 0; font-size: 42px; font-weight: bold; }
    .banner .offer { background-color: #ffffff; color: #f5576c; padding: 10px 20px; border-radius: 25px; display: inline-block; margin-top: 20px; font-weight: bold; }
    .content { padding: 40px 30px; text-align: center; }
    .content h2 { color: #333333; font-size: 28px; margin-bottom: 20px; }
    .content p { color: #666666; line-height: 1.6; margin-bottom: 15px; font-size: 16px; }
    .cta-button { display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 30px; margin: 30px 0; font-size: 18px; font-weight: bold; }
    .footer { background-color: #333333; padding: 30px; text-align: center; color: #ffffff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">
      <h1>{{SUBJECT}}</h1>
      <div class="offer">SPECIAL OFFER!</div>
    </div>
    <div class="content">
      <h2>Exclusive Deal Just For You</h2>
      {{CONTENT}}
      <a href="#" class="cta-button">Get Started Now</a>
    </div>
    <div class="footer">
      <p>&copy; 2025 Nexlife International. All rights reserved.</p>
      <p style="margin-top: 10px;"><a href="{{UNSUBSCRIBE_LINK}}" style="color: #ffffff;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
  },
  announcement: {
    name: "Announcement",
    preview: "Clean announcement template for important updates",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #3b82f6; }
    .header { background-color: #3b82f6; padding: 30px 20px; text-align: center; border-bottom: 4px solid #2563eb; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .announcement-badge { background-color: #fbbf24; color: #1f2937; padding: 8px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin-bottom: 15px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1f2937; font-size: 24px; margin-bottom: 20px; border-left: 4px solid #3b82f6; padding-left: 15px; }
    .content p { color: #4b5563; line-height: 1.8; margin-bottom: 15px; }
    .highlight-box { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .footer { background-color: #f3f4f6; padding: 25px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="announcement-badge">ANNOUNCEMENT</div>
      <h1>{{SUBJECT}}</h1>
    </div>
    <div class="content">
      <h2>Important Update</h2>
      {{CONTENT}}
      <div class="highlight-box">
        <strong>Note:</strong> This is an important announcement that may require your attention.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 Nexlife International. All rights reserved.</p>
      <p><a href="{{UNSUBSCRIBE_LINK}}" style="color: #6b7280;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
  },
  product: {
    name: "Product Launch",
    preview: "Modern product showcase template",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 20px; text-align: center; }
    .hero h1 { color: #ffffff; margin: 0 0 20px 0; font-size: 36px; }
    .hero .badge { background-color: #10b981; color: #ffffff; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; }
    .product-image { width: 100%; height: 300px; background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); display: flex; align-items: center; justify-center; font-size: 72px; color: #ffffff; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1f2937; font-size: 26px; margin-bottom: 20px; }
    .content p { color: #4b5563; line-height: 1.8; margin-bottom: 15px; }
    .features { background-color: #f9fafb; padding: 30px; margin: 20px 0; border-radius: 10px; }
    .feature-item { display: flex; align-items: start; margin-bottom: 15px; }
    .feature-icon { color: #10b981; margin-right: 15px; font-size: 24px; }
    .cta-button { display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 30px; margin: 30px 0; font-size: 18px; font-weight: bold; text-align: center; }
    .footer { background-color: #1f2937; padding: 30px; text-align: center; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="badge">NEW PRODUCT</div>
      <h1>{{SUBJECT}}</h1>
    </div>
    <div class="product-image">🚀</div>
    <div class="content">
      <h2>Introducing Our Latest Innovation</h2>
      {{CONTENT}}
      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <div><strong>Premium Quality</strong><br/>Manufactured to the highest standards</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <div><strong>Fast Delivery</strong><br/>Quick and reliable shipping</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <div><strong>Expert Support</strong><br/>24/7 customer assistance</div>
        </div>
      </div>
      <center>
        <a href="#" class="cta-button">Explore Now</a>
      </center>
    </div>
    <div class="footer">
      <p>&copy; 2025 Nexlife International. All rights reserved.</p>
      <p style="margin-top: 10px;"><a href="{{UNSUBSCRIBE_LINK}}" style="color: #9ca3af;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
  },
};

export default function Campaigns() {
  // State Management
  const [activeTab, setActiveTab] = useState<"create" | "history" | "templates">("create");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [useHtml, setUseHtml] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("newsletter");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent?: number; failed?: number } | null>(null);
  
  // Template Management
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateHtml, setTemplateHtml] = useState("");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplateHtml, setPreviewTemplateHtml] = useState("");
  
  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Campaign detail expansion state
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  
  // Recipient Management
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [manualEmail, setManualEmail] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientMode, setRecipientMode] = useState<"all" | "selected">("all");
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  
  // File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch subscribers
  const { data: subscribersData, mutate: mutateSubscribers } = useSWR(
    "/subscribers?limit=1000",
    fetcher
  );

  // Fetch campaign history
  const { data: campaignHistoryData, mutate: mutateCampaigns } = useSWR(
    "/subscribers/campaigns?limit=100",
    fetcher
  );

  // Fetch custom templates
  const { data: templatesData, mutate: mutateTemplates } = useSWR(
    "/templates",
    fetcher
  );

  const campaignHistory = campaignHistoryData?.items || [];
  const subscribers = subscribersData?.items || [];
  const customTemplates = templatesData?.items || [];
  const filteredSubscribers = subscribers.filter((sub: any) =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate HTML from template
  const generateEmailHtml = () => {
    const template = emailTemplates[selectedTemplate as keyof typeof emailTemplates];
    if (!template) return "";
    
    let html = template.html;
    html = html.replace(/{{SUBJECT}}/g, subject || "Newsletter");
    html = html.replace(/{{CONTENT}}/g, 
      message.split('\n').map(p => `<p>${p}</p>`).join('')
    );
    html = html.replace(/{{UNSUBSCRIBE_LINK}}/g, "#unsubscribe");
    
    return html;
  };

  useEffect(() => {
    // Only regenerate HTML if using built-in templates, not raw HTML
    if (useHtml && selectedTemplate && selectedTemplate !== "raw") {
      setHtmlContent(generateEmailHtml());
    }
  }, [subject, message, selectedTemplate, useHtml]);

  // Add manual email
  const addManualEmail = () => {
    const email = manualEmail.trim().toLowerCase();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (!selectedRecipients.includes(email)) {
        setSelectedRecipients([...selectedRecipients, email]);
      }
      setManualEmail("");
    }
  };

  // Add bulk emails
  const addBulkEmails = () => {
    const emails = bulkEmails
      .split(/[,\n]/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    
    const newEmails = emails.filter(e => !selectedRecipients.includes(e));
    setSelectedRecipients([...selectedRecipients, ...newEmails]);
    setBulkEmails("");
  };

  // Remove recipient
  const removeRecipient = (email: string) => {
    setSelectedRecipients(selectedRecipients.filter(e => e !== email));
  };

  // Toggle subscriber selection
  const toggleSubscriber = (email: string) => {
    if (selectedRecipients.includes(email)) {
      removeRecipient(email);
    } else {
      setSelectedRecipients([...selectedRecipients, email]);
    }
  };

  // Select all subscribers
  const selectAllSubscribers = () => {
    const allEmails = subscribers.map((s: any) => s.email);
    setSelectedRecipients(allEmails);
  };

  // Clear all recipients
  const clearAllRecipients = () => {
    setSelectedRecipients([]);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const emails = text
        .split(/[,\n\r]/)
        .map(email => email.trim().toLowerCase())
        .filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      
      const newEmails = emails.filter(e => !selectedRecipients.includes(e));
      setSelectedRecipients([...selectedRecipients, ...newEmails]);
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Export recipients template
  const downloadTemplate = () => {
    const csv = "email\nexample1@email.com\nexample2@email.com\nexample3@email.com";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Template Management Functions
  async function saveTemplate() {
    if (!templateName.trim() || !templateHtml.trim() || loading) return;
    
    setLoading(true);
    try {
      if (editingTemplateId) {
        await api.put(`/templates/${editingTemplateId}`, {
          name: templateName,
          subject: templateSubject,
          htmlContent: templateHtml,
          description: templateDescription,
        });
      } else {
        await api.post("/templates", {
          name: templateName,
          subject: templateSubject,
          htmlContent: templateHtml,
          description: templateDescription,
        });
      }
      
      mutateTemplates();
      setTemplateName("");
      setTemplateSubject("");
      setTemplateDescription("");
      setTemplateHtml("");
      setEditingTemplateId(null);
    } catch (error) {

      alert("Failed to save template");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    setLoading(true);
    try {
      await api.delete(`/templates/${id}`);
      mutateTemplates();
    } catch (error) {

      alert("Failed to delete template");
    } finally {
      setLoading(false);
    }
  }

  function loadTemplateForEditing(template: any) {
    setTemplateName(template.name);
    setTemplateSubject(template.subject || "");
    setTemplateDescription(template.description || "");
    setTemplateHtml(template.htmlContent);
    setEditingTemplateId(template._id);
  }

  function cancelEditTemplate() {
    setTemplateName("");
    setTemplateSubject("");
    setTemplateDescription("");
    setTemplateHtml("");
    setEditingTemplateId(null);
  }

  function previewTemplate(html: string) {
    setPreviewTemplateHtml(html);
    setShowTemplatePreview(true);
  }

  function useCustomTemplate(template: any) {
    setHtmlContent(template.htmlContent);
    setUseHtml(true);
    setSelectedTemplate("raw");
    setMessage("");
    // Load subject if template has one (always load, even if empty)
    setSubject(template.subject || "");
    setActiveTab("create");
    // Show confirmation that template was loaded
    const subjectMsg = template.subject ? ` with subject "${template.subject}"` : "";
    setNotification({
      type: 'success',
      message: `Template "${template.name}"${subjectMsg} loaded in Raw HTML mode. Ready to send!`
    });
    setTimeout(() => setNotification(null), 5000);
  }

  // Send campaign
  async function sendCampaign() {
    // Validate based on content type - check if using raw HTML or template
    const isRawHtml = selectedTemplate === "raw" && htmlContent.trim();
    const contentToSend = isRawHtml ? htmlContent : (useHtml ? message : message);
    
    if (!subject.trim() || !contentToSend.trim() || loading) return;
    
    if (recipientMode === "selected" && selectedRecipients.length === 0) {
      alert("Please select at least one recipient");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload: any = {
        subject,
        message: isRawHtml ? htmlContent : (useHtml ? generateEmailHtml() : message),
        isHtml: isRawHtml || useHtml,
      };
      
      if (recipientMode === "selected") {
        payload.recipients = selectedRecipients;
      }

      const r = await api.post("/subscribers/campaign", payload);
      setResult(r.data);
      setSubject("");
      setMessage("");
      setHtmlContent("");
      if (recipientMode === "selected") {
        setSelectedRecipients([]);
      }
      
      // Refresh campaign history
      mutateCampaigns();
    } catch (error) {

      setResult({ sent: 0, failed: 0 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 z-50 max-w-md"
            >
              <div className={`rounded-lg shadow-lg p-4 ${
                notification.type === 'success' ? 'bg-green-500' :
                notification.type === 'error' ? 'bg-red-500' :
                'bg-blue-500'
              } text-white`}>
                <div className="flex items-start gap-3">
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  {notification.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  {notification.type === 'info' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  <p className="flex-1">{notification.message}</p>
                  <button
                    onClick={() => setNotification(null)}
                    className="text-white hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Mail className="w-6 h-6 text-blue-600" />
            Email Campaign Manager
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create and send professional email campaigns to your subscribers
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === "create"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Create Campaign
            </div>
            {activeTab === "create" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === "templates"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Templates ({customTemplates.length})
            </div>
            {activeTab === "templates" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-4 font-medium transition-colors relative ${
              activeTab === "history"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Campaign History
            </div>
            {activeTab === "history" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            )}
          </button>
        </div>

        {activeTab === "create" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Campaign Form - Column 1-2 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Details Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Campaign Details
                </h2>

                <div className="space-y-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter email subject..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  {/* Template Selection */}
                  {useHtml && selectedTemplate !== "raw" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email Template
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(emailTemplates).map(([key, template]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedTemplate(key)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              selectedTemplate === key
                                ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
                            }`}
                          >
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {template.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {template.preview}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content Type Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Content Type
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setUseHtml(false); setSelectedTemplate("newsletter"); }}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          !useHtml
                            ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400"
                        }`}
                      >
                        <List className="w-5 h-5" />
                        Plain Text
                      </button>
                      <button
                        onClick={() => { setUseHtml(true); setSelectedTemplate("newsletter"); }}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          useHtml && selectedTemplate !== "raw"
                            ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400"
                        }`}
                      >
                        <Code className="w-5 h-5" />
                        HTML Template
                      </button>
                      <button
                        onClick={() => { setUseHtml(true); setSelectedTemplate("raw"); }}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          useHtml && selectedTemplate === "raw"
                            ? "border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                            : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-purple-400"
                        }`}
                      >
                        <Palette className="w-5 h-5" />
                        Raw HTML
                      </button>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Message Content *
                    </label>
                    {useHtml && selectedTemplate === "raw" ? (
                      <div className="space-y-3">
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-sm text-purple-800 dark:text-purple-300">
                          <strong>Raw HTML Mode:</strong> Paste your complete HTML email with inline CSS. The CSS will be automatically processed for email client compatibility.
                        </div>
                        <textarea
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-vertical font-mono text-xs"
                          rows={16}
                          placeholder="<!DOCTYPE html>&#10;<html>&#10;<head>&#10;  <style>&#10;    body { font-family: Arial; }&#10;    .container { max-width: 600px; }&#10;  </style>&#10;</head>&#10;<body>&#10;  <div class='container'>Your content here</div>&#10;</body>&#10;</html>"
                          value={htmlContent}
                          onChange={(e) => setHtmlContent(e.target.value)}
                        />
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                        >
                          <Eye className="w-4 h-4" />
                          {showPreview ? "Hide" : "Show"} Preview
                        </button>
                        {showPreview && (
                          <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-300 dark:border-slate-700">
                              Email Preview (CSS will be inlined automatically when sent)
                            </div>
                            <iframe
                              srcDoc={htmlContent}
                              className="w-full min-h-[500px] border-0"
                              title="Email Preview"
                              sandbox="allow-same-origin"
                            />
                          </div>
                        )}
                      </div>
                    ) : useHtml ? (
                      <div className="space-y-3">
                        <textarea
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical font-mono text-sm"
                          rows={8}
                          placeholder="Write your message content (will be inserted into template)..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                          {showPreview ? "Hide" : "Show"} Preview
                        </button>
                        {showPreview && (
                          <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                            <iframe
                              srcDoc={generateEmailHtml()}
                              className="w-full min-h-[500px] border-0"
                              title="Email Preview"
                              sandbox="allow-same-origin"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                        rows={12}
                        placeholder="Write your campaign message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Result Notification */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-6 rounded-xl border ${
                      result.sent && result.sent > 0
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.sent && result.sent > 0 ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
                      )}
                      <div>
                        <h3 className={`font-semibold ${
                          result.sent && result.sent > 0
                            ? "text-green-800 dark:text-green-200"
                            : "text-red-800 dark:text-red-200"
                        }`}>
                          Campaign {result.sent && result.sent > 0 ? "Sent Successfully" : "Failed"}
                        </h3>
                        <p className={`mt-1 ${
                          result.sent && result.sent > 0
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                        }`}>
                          {result.sent || 0} emails sent successfully, {result.failed || 0} failed
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recipient Management Sidebar - Column 3 */}
            <div className="space-y-6">
              {/* Recipients Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 sticky top-6"
              >
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Recipients
                </h2>

                {/* Recipient Mode Toggle */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={() => setRecipientMode("all")}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                      recipientMode === "all"
                        ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    All Subscribers
                  </button>
                  <button
                    onClick={() => setRecipientMode("selected")}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-sm ${
                      recipientMode === "selected"
                        ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    Select Recipients
                  </button>
                </div>

                {recipientMode === "selected" && (
                  <div className="space-y-4">
                    {/* Manual Add */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Add Email
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="email@example.com"
                          value={manualEmail}
                          onChange={(e) => setManualEmail(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addManualEmail()}
                        />
                        <button
                          onClick={addManualEmail}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Bulk Add */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Bulk Add (comma-separated)
                      </label>
                      <textarea
                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        rows={3}
                        placeholder="email1@example.com, email2@example.com"
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                      />
                      <button
                        onClick={addBulkEmails}
                        disabled={!bulkEmails.trim()}
                        className="mt-2 w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Add Emails
                      </button>
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Import from CSV/Excel
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload File
                      </button>
                      <button
                        onClick={downloadTemplate}
                        className="mt-2 w-full bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Template
                      </button>
                    </div>

                    {/* From Subscribers List */}
                    <button
                      onClick={() => setShowRecipientModal(true)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Select from Subscribers
                    </button>

                    {/* Selected Recipients List */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Selected ({selectedRecipients.length})
                        </label>
                        {selectedRecipients.length > 0 && (
                          <button
                            onClick={clearAllRecipients}
                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <div className="max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-700 rounded-lg p-2 space-y-1">
                        {selectedRecipients.length === 0 ? (
                          <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                            No recipients selected
                          </div>
                        ) : (
                          selectedRecipients.map((email) => (
                            <div
                              key={email}
                              className="flex items-center justify-between bg-white dark:bg-slate-800 px-2 py-1.5 rounded group"
                            >
                              <span className="text-xs text-slate-900 dark:text-white truncate flex-1">
                                {email}
                              </span>
                              <button
                                onClick={() => removeRecipient(email)}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {recipientMode === "all" && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800 dark:text-blue-300">
                          All Active Subscribers
                        </div>
                        <div className="text-xs mt-1">
                          Campaign will be sent to {subscribers.length} subscribers
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Send Button */}
                <button
                  onClick={sendCampaign}
                  disabled={loading || !subject.trim() || (selectedTemplate === "raw" ? !htmlContent.trim() : !message.trim())}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Campaign
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </div>
        ) : activeTab === "templates" ? (
          // Templates Management Tab
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create/Edit Template Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                {editingTemplateId ? "Edit Template" : "Create New Template"}
              </h2>

              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Product Launch Template"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Template Subject (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Default Subject <span className="text-xs text-slate-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="e.g., New Product Launch - Special Offer"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Template Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Brief description of this template..."
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* HTML Content */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    HTML Content *
                  </label>
                  <textarea
                    value={templateHtml}
                    onChange={(e) => setTemplateHtml(e.target.value)}
                    placeholder="Paste your HTML template here..."
                    rows={12}
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={saveTemplate}
                    disabled={loading || !templateName.trim() || !templateHtml.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        {editingTemplateId ? "Update Template" : "Save Template"}
                      </>
                    )}
                  </button>
                  {editingTemplateId && (
                    <button
                      onClick={cancelEditTemplate}
                      className="px-4 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {templateHtml.trim() && (
                    <button
                      onClick={() => previewTemplate(templateHtml)}
                      className="px-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Saved Templates List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Saved Templates ({customTemplates.length})
              </h2>

              {customTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-400 mb-2">
                    No templates yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500">
                    Create your first custom template
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {customTemplates.map((template: any) => (
                    <div
                      key={template._id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {template.name}
                          </h3>
                          {template.subject && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                              Subject: {template.subject}
                            </p>
                          )}
                          {template.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {template.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3" />
                            {new Date(template.createdAt).toLocaleDateString()}
                            {template.createdByName && (
                              <span>• by {template.createdByName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => useCustomTemplate(template)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Use
                        </button>
                        <button
                          onClick={() => previewTemplate(template.htmlContent)}
                          className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Preview
                        </button>
                        <button
                          onClick={() => loadTemplateForEditing(template)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTemplate(template._id)}
                          className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          // Campaign History Tab
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
              Campaign History
            </h2>
            
            {campaignHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-400 mb-2">
                  No campaigns yet
                </h3>
                <p className="text-slate-500 dark:text-slate-500">
                  Your sent campaigns will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaignHistory.map((campaign: any, index: number) => {
                  const campaignId = campaign._id || campaign.id || index.toString();
                  const isExpanded = expandedCampaigns.has(campaignId);
                  
                  const toggleExpand = () => {
                    setExpandedCampaigns(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(campaignId)) {
                        newSet.delete(campaignId);
                      } else {
                        newSet.add(campaignId);
                      }
                      return newSet;
                    });
                  };
                  
                  return (
                    <div
                      key={campaign.id || index}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                              {campaign.subject}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(campaign.createdAt).toLocaleString()}
                              </div>
                              {campaign.sentByName && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {campaign.sentByName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === "completed"
                              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                              : campaign.status === "sending"
                              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                              : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                          }`}>
                            {campaign.status}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <div>
                              <span className="text-lg font-bold text-green-700 dark:text-green-300">
                                {campaign.sent || 0}
                              </span>
                              <span className="text-xs text-green-600 dark:text-green-400 ml-1">sent</span>
                            </div>
                          </div>
                          {campaign.failed > 0 && (
                            <div className="flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                              <div>
                                <span className="text-lg font-bold text-red-700 dark:text-red-300">
                                  {campaign.failed}
                                </span>
                                <span className="text-xs text-red-600 dark:text-red-400 ml-1">failed</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={toggleExpand}
                          className="w-full flex items-center justify-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-1.5 border-t border-slate-200 dark:border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {isExpanded ? "Hide" : "Details"}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div className="p-4 space-y-4">
                              {campaign.sentTo && campaign.sentTo.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Successfully Sent To ({campaign.sentTo.length})
                                  </h4>
                                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                                    <div className="flex flex-wrap gap-2">
                                      {campaign.sentTo.map((email: string, i: number) => (
                                        <span
                                          key={i}
                                          className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded"
                                        >
                                          {email}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {campaign.failedTo && campaign.failedTo.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                                    <XCircle className="w-4 h-4" />
                                    Failed To Send ({campaign.failedTo.length})
                                  </h4>
                                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                                    <div className="flex flex-wrap gap-2">
                                      {campaign.failedTo.map((email: string, i: number) => (
                                        <span
                                          key={i}
                                          className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded"
                                        >
                                          {email}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Subscriber Selection Modal */}
        <AnimatePresence>
          {showRecipientModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowRecipientModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Select Subscribers
                  </h3>
                  <button
                    onClick={() => setShowRecipientModal(false)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search subscribers..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={selectAllSubscribers}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Select All
                  </button>
                  <span className="text-slate-400">|</span>
                  <button
                    onClick={clearAllRecipients}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Clear All
                  </button>
                </div>

                {/* Subscriber List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredSubscribers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No subscribers found
                    </div>
                  ) : (
                    filteredSubscribers.map((subscriber: any) => (
                      <div
                        key={subscriber.email}
                        onClick={() => toggleSubscriber(subscriber.email)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRecipients.includes(subscriber.email)
                            ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedRecipients.includes(subscriber.email)
                              ? "border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400"
                              : "border-slate-300 dark:border-slate-600"
                          }`}>
                            {selectedRecipients.includes(subscriber.email) && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {subscriber.email}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Subscribed {new Date(subscriber.subscribedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedRecipients.length} selected
                  </div>
                  <button
                    onClick={() => setShowRecipientModal(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template Preview Modal */}
        <AnimatePresence>
          {showTemplatePreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowTemplatePreview(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Template Preview
                  </h3>
                  <button
                    onClick={() => setShowTemplatePreview(false)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
                  <iframe
                    srcDoc={previewTemplateHtml}
                    className="w-full h-full min-h-[500px] bg-white rounded-lg shadow-lg"
                    title="Template Preview"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
