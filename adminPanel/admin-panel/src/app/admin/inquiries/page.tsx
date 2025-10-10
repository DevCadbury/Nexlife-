"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  Star,
  X,
  Send,
  Paperclip,
  Image,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MessageSquare,
  Eye,
  CheckCircle,
  Trash2,
  User,
  FileText,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  LayoutGrid,
  Table,
  Grid3X3,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Toaster, useToast } from "@/components/ui/toast";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

type Inquiry = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  status: "new" | "read" | "replied" | string;
  createdAt?: string;
  seenBy?: string[];
  replies?: {
    at: string;
    subject?: string;
    message?: string;
    fromName?: string;
  }[];
};

export default function Inquiries() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("latest");
  const [loading, setLoading] = useState(true);

  // Utility function to get profile picture URL from email (works regardless of Gravatar account)
  const getProfilePictureUrl = (email: string, size: number = 40) => {
    if (!email) return "";

    // Create a consistent hash from email for deterministic avatars
    const hash = btoa(email.toLowerCase().trim()).replace(/=/g, '').substring(0, 32);

    // Use DiceBear with multiple avatar styles for variety
    // This ensures EVERY user gets a unique, professional-looking avatar
    const avatarStyles = ['avataaars', 'bottts', 'initials', 'personas'];
    const randomStyle = avatarStyles[Math.abs(hash.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % avatarStyles.length];

    const dicebearUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(email)}&size=${size}&backgroundColor=transparent`;

    return dicebearUrl;
  };  type ViewMode = "cards" | "table" | "grid";
  const [viewMode, setViewMode] = useState<ViewMode>(
    (typeof window !== "undefined" &&
      (localStorage.getItem("nxl_view_mode") as ViewMode)) ||
      "table"
  );
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [tableSort, setTableSort] = useState<
    "lastAt" | "name" | "count" | "status" | "unread"
  >("lastAt");
  const [dateFrom, setDateFrom] = useState<string>(
    ((typeof window !== "undefined" &&
      (localStorage.getItem("nxl_df") || "")) as string) || ""
  );
  const [dateTo, setDateTo] = useState<string>(
    ((typeof window !== "undefined" &&
      (localStorage.getItem("nxl_dt") || "")) as string) || ""
  );
  // legacy inline reply state removed in favor of Dialog composer
  const [active, setActive] = useState<Inquiry | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [sendingThreadReply, setSendingThreadReply] = useState(false);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [adminName, setAdminName] = useState("");
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    align: "left" as "left" | "center" | "right",
    fontSize: "normal" as "small" | "normal" | "large",
    color: "default" as "default" | "red" | "blue" | "green" | "yellow",
  });
  const [formCollapsed, setFormCollapsed] = useState(true);
  const [replyComposerMinimized, setReplyComposerMinimized] = useState(false);
  const [composerHeight, setComposerHeight] = useState(400);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(
    null
  );
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Auto-resize textarea based on content
  const autoResizeTextarea = () => {
    if (textareaRef) {
      textareaRef.style.height = "auto";
      textareaRef.style.height = Math.max(120, textareaRef.scrollHeight) + "px";
    }
  };

  // Auto-resize textarea when message changes
  useEffect(() => {
    autoResizeTextarea();
  }, [replyMessage]);

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/inquiries/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success) {
      return response.data.imageUrl;
    } else {
      throw new Error("Failed to upload image");
    }
  };

  // Insert image at cursor position
  const insertImage = (url: string) => {
    if (textareaRef) {
      const start = textareaRef.selectionStart;
      const end = textareaRef.selectionEnd;
      const text = replyMessage;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const imageText = `\n![Image](${url})\n`;
      const newText = before + imageText + after;
      setReplyMessage(newText);

      // Set cursor position after the image
      setTimeout(() => {
        textareaRef.focus();
        textareaRef.setSelectionRange(
          start + imageText.length,
          start + imageText.length
        );
      }, 0);
    }
    setShowImageDialog(false);
    setImageUrl("");
    setImageFile(null);
  };

  // Handle image upload (either URL or file)
  const handleImageUpload = async () => {
    try {
      setUploadingImage(true);
      let finalUrl = "";

      if (imageFile) {
        // Upload local file to Cloudinary
        finalUrl = await uploadImageToCloudinary(imageFile);
      } else if (imageUrl.trim()) {
        // Use provided URL
        finalUrl = imageUrl.trim();
      } else {
        error?.("Please provide an image URL or select a file");
        return;
      }

      insertImage(finalUrl);
      success?.("Image inserted successfully!");
    } catch (error: any) {
      console.error("Image upload error:", error);
      error?.(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setImageFile(file);
        setImageUrl(""); // Clear URL when file is selected
      } else {
        error?.("Please select an image file");
      }
    }
  };

  // Apply text formatting
  const applyFormatting = (format: string) => {
    if (textareaRef) {
      const start = textareaRef.selectionStart;
      const end = textareaRef.selectionEnd;
      const text = replyMessage;
      const selectedText = text.substring(start, end);

      let formattedText = selectedText;
      switch (format) {
        case "bold":
          formattedText = `**${selectedText}**`;
          break;
        case "italic":
          formattedText = `*${selectedText}*`;
          break;
        case "underline":
          formattedText = `__${selectedText}__`;
          break;
        case "strikethrough":
          formattedText = `~~${selectedText}~~`;
          break;
        case "code":
          formattedText = `\`${selectedText}\``;
          break;
        case "quote":
          formattedText = `> ${selectedText}`;
          break;
        case "link":
          formattedText = `[${selectedText}](url)`;
          break;
      }

      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + formattedText + after;
      setReplyMessage(newText);

      // Set cursor position after the formatted text
      setTimeout(() => {
        textareaRef.focus();
        textareaRef.setSelectionRange(
          start + formattedText.length,
          start + formattedText.length
        );
      }, 0);
    }
  };
  const [bulkLoading, setBulkLoading] = useState(false);
  const [rowLoadingEmail, setRowLoadingEmail] = useState<string | null>(null);
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null);
  const [dashboardConnection, setDashboardConnection] =
    useState<EventSource | null>(null);
  const [attachments, setAttachments] = useState<
    {
      filename: string;
      contentType: string;
      content: string;
      preview?: string;
    }[]
  >([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [priorityById, setPriorityById] = useState<Record<string, string>>({});
  const [tagsById, setTagsById] = useState<Record<string, string[]>>({});
  const [seenBy, setSeenBy] = useState<Record<string, string[]>>({});
  const [notesByEmail, setNotesByEmail] = useState<Record<string, string>>({});
  const [reminderByEmail, setReminderByEmail] = useState<
    Record<string, string>
  >({});
  const [assigneesByEmail, setAssigneesByEmail] = useState<
    Record<string, string[]>
  >({});

  // Toast helpers
  const { success, error, warn, info } = useToast();

  // Function to extract clean reply content from HTML emails
  const extractCleanReply = (message: string): string => {
    if (!message) return message;

    // If it's HTML, try to extract the actual reply content
    if (/<\w+[^>]*>/i.test(message)) {
      // Create a temporary div to parse HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = message;

      // Look for the first paragraph that doesn't start with "On" (quoted content)
      const paragraphs = tempDiv.querySelectorAll("p");
      for (const p of paragraphs) {
        const text = p.textContent?.trim() || "";
        if (text && !text.startsWith("On ") && !text.startsWith(">")) {
          return text;
        }
      }

      // Fallback: get text content and split by common quote patterns
      const textContent = tempDiv.textContent || message;
      const lines = textContent.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (
          trimmed &&
          !trimmed.startsWith("On ") &&
          !trimmed.startsWith(">") &&
          !trimmed.includes("wrote:")
        ) {
          return trimmed;
        }
      }
    }

    // For plain text, remove quoted content
    const lines = message.split("\n");
    const cleanLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.startsWith("On ") &&
        !trimmed.startsWith(">") &&
        !trimmed.includes("wrote:")
      ) {
        cleanLines.push(trimmed);
      } else if (trimmed.startsWith("On ") || trimmed.includes("wrote:")) {
        break; // Stop at quoted content
      }
    }

    return cleanLines.join("\n") || message;
  };

  // Render message with markdown images
  const renderMessage = (message: string) => {
    if (!message) return "";

    const cleanMessage = extractCleanReply(message);

    // Split message by markdown images
    const parts = cleanMessage.split(/(!\[.*?\]\(.*?\))/g);

    return parts.map((part, index) => {
      // Check if this part is a markdown image
      const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        const [, alt, src] = imageMatch;
        return (
          <div key={index} className="my-2">
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg border border-slate-600 shadow-sm"
              style={{ maxHeight: "300px" }}
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        );
      }

      // Regular text
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  // File attachment handling
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const base64Content = content.split(",")[1]; // Remove data:type;base64, prefix

        setAttachments((prev) => [
          ...prev,
          {
            filename: file.name,
            contentType: file.type,
            content: base64Content,
            preview: file.type.startsWith("image/") ? content : undefined,
          },
        ]);

        if (file.type.startsWith("image/")) {
          setAttachmentPreviews((prev) => [...prev, content]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) return "🖼️";
    if (contentType.includes("pdf")) return "📄";
    if (contentType.includes("word") || contentType.includes("document"))
      return "📝";
    if (contentType.includes("excel") || contentType.includes("spreadsheet"))
      return "📊";
    if (contentType.includes("zip") || contentType.includes("archive"))
      return "📦";
    return "📎";
  };

  // Thread state (group by customer email)
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [thread, setThread] = useState<Inquiry[] | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [selectedInquiryForSeenBy, setSelectedInquiryForSeenBy] = useState<any>(null);
  type ThreadEvent = {
    type: "inbound" | "reply";
    at: string;
    subject?: string;
    message?: string;
    fromName?: string;
    inquiryId?: string;
    status?: string;
    inbound?: boolean;
    note?: string | null;
    replyIdx?: number;
  };
  const [threadEvents, setThreadEvents] = useState<ThreadEvent[] | null>(null);
  const [openNotes, setOpenNotes] = useState<Record<number, boolean>>({});
  const [agentName, setAgentName] = useState<string>("");
  const [role, setRole] = useState<string>("");

  // Function to decode JWT token and get user role and name
  const getUserRoleFromToken = () => {
    if (typeof window === "undefined") return { role: "", name: "" };
    try {
      let token = localStorage.getItem("token");

      // Fallback: check cookie if no token in localStorage
      if (!token) {
        const cookies = document.cookie
          .split(";")
          .reduce((acc: Record<string, string>, cookie) => {
            const [key, value] = cookie.trim().split("=");
            if (key === "nxl_jwt") acc[key] = decodeURIComponent(value);
            return acc;
          }, {});
        token = cookies.nxl_jwt;

        // Store in localStorage for future use
        if (token) {
          localStorage.setItem("token", token);
        }
      }

      if (!token) return { role: "", name: "" };

      // Decode JWT payload (simple base64 decode)
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("JWT payload:", payload);
      console.log(
        "Token parts:",
        token
          .split(".")
          .map((part, i) => `Part ${i}: ${part.substring(0, 50)}...`)
      );

      // Check multiple possible role fields
      const role =
        payload.role ||
        payload.userRole ||
        payload.user?.role ||
        payload.roleName ||
        "";

      // Check multiple possible name fields
      const name =
        payload.name || payload.userName || payload.user?.name || "Admin";

      console.log("Extracted role:", role, "name:", name);
      return { role, name };
    } catch (error) {
      console.error("Error decoding token:", error);
      return { role: "", name: "" };
    }
  };

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("nxl_agent_name")
        : "";
    if (saved) setAgentName(saved);

    // Get role and name from JWT token
    const userData = getUserRoleFromToken();
    console.log("Detected user role:", userData.role, "name:", userData.name);

    // Set agentName from JWT if not already saved
    if (userData.name && !saved) {
      setAgentName(userData.name);
      if (typeof window !== "undefined") {
        localStorage.setItem("nxl_agent_name", userData.name);
      }
    }

    // Fallback: if no role in token, check localStorage as backup
    const fallbackRole =
      userData.role ||
      (typeof window !== "undefined" ? localStorage.getItem("nxl_role") : "") ||
      "";
    setAdminName(userData.name);

    // If still no role, show a warning and suggest logout
    if (!fallbackRole) {
      console.warn(
        "No role detected! Please logout and login again to get a fresh token with role."
      );
      console.log("Current token:", localStorage.getItem("token"));

      // Add a temporary logout button for testing
      if (typeof window !== "undefined") {
        const logoutBtn = document.createElement("button");
        logoutBtn.textContent = "🔄 Refresh Token (Logout)";
        logoutBtn.style.cssText =
          "position:fixed;top:10px;right:10px;z-index:9999;background:red;color:white;padding:10px;border:none;border-radius:5px;cursor:pointer;";
        logoutBtn.onclick = () => {
          localStorage.removeItem("token");
          // Also clear cookie
          document.cookie = "nxl_jwt=; Path=/; SameSite=Lax; Max-Age=0";
          window.location.href = "/login";
        };

        // Also add a login button if no token
        const loginBtn = document.createElement("button");
        loginBtn.textContent = "🔑 Login";
        loginBtn.style.cssText =
          "position:fixed;top:50px;right:10px;z-index:9999;background:green;color:white;padding:10px;border:none;border-radius:5px;cursor:pointer;";
        loginBtn.onclick = () => {
          window.location.href = "/login";
        };
        document.body.appendChild(loginBtn);
        document.body.appendChild(logoutBtn);
      }
    }

    setRole(fallbackRole.toLowerCase());
  }, []);

  function exportCsv(kind: "csv" | "excel" | "pdf" = "csv") {
    const headers = [
      "name",
      "email",
      "phone",
      "subject",
      "message",
      "status",
      "createdAt",
    ];
    const rows = items.map((i) =>
      [
        JSON.stringify(i.name || ""),
        JSON.stringify(i.email || ""),
        JSON.stringify(i.phone || ""),
        JSON.stringify(i.subject || ""),
        JSON.stringify((i.message || "").replace(/\n/g, " ").slice(0, 200)),
        JSON.stringify(i.status || ""),
        JSON.stringify(i.createdAt || ""),
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries.${kind === "csv" ? "csv" : "csv"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function load() {
    setLoading(true);
    try {
      const r = await api.get("/inquiries", {
        params: {
          limit: 1000,
          ...(status && { status }),
          ...(q && { q }),
        },
      });
      const fetchedItems = r.data.items || [];
      setItems(fetchedItems);

      // Populate seenBy from server data
      const newSeenBy: Record<string, any[]> = {};
      for (const item of fetchedItems) {
        if (item.seenBy && Array.isArray(item.seenBy)) {
          newSeenBy[item.email.toLowerCase()] = item.seenBy;
        }
      }
      setSeenBy(newSeenBy);
    } catch (e) {
      console.error("Failed to load inquiries", e);
    } finally {
      setLoading(false);
    }
  }

  // Auto-open thread if email parameter is provided
  useEffect(() => {
    const email = searchParams.get("email");
    if (email && items.length > 0) {
      const inquiry = items.find((item) => item.email === email);
      if (inquiry) {
        openThread(email);
      }
    }
  }, [searchParams, items]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SSE connection for real-time updates
  useEffect(() => {
    if (activeEmail) {
      const url = `/api/inquiries/threads/${encodeURIComponent(
        activeEmail
      )}/stream`;
      console.log("Connecting to SSE:", url);
      const eventSource = new EventSource(url);
      setSseConnection(eventSource);

      eventSource.onopen = () => {
        console.log("SSE connection opened for:", activeEmail);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("SSE message received:", data);
          if (data.type === "thread_update" && data.subtype === "new_reply") {
            // Refresh thread data when new reply arrives
            openThread(activeEmail);
            success(`New reply from ${data.from}`);
          }
        } catch (error) {
          console.error("SSE message parse error:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        console.error("SSE readyState:", eventSource.readyState);
        eventSource.close();
        setSseConnection(null);
      };

      return () => {
        console.log("Closing SSE connection for:", activeEmail);
        eventSource.close();
        setSseConnection(null);
      };
    }
  }, [activeEmail]);

  // Dashboard notification connection for all admin/staff
  useEffect(() => {
    const url = "/api/inquiries/notifications/stream";
    console.log("Connecting to dashboard notifications:", url);
    const eventSource = new EventSource(url);
    setDashboardConnection(eventSource);

    eventSource.onopen = () => {
      console.log("Dashboard notification SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Dashboard notification received:", data);
        // Trigger load on any dashboard notification to ensure real-time updates
        load();
        // Show specific notification for new replies
        if (
          data.type === "dashboard_notification" &&
          data.subtype === "new_reply"
        ) {
          success(
            `New reply added to ${data.inquiryEmail} by ${data.fromName}`
          );
        }
      } catch (error) {
        console.error("Dashboard notification parse error:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Dashboard notification connection error:", error);
      console.error("Dashboard SSE readyState:", eventSource.readyState);
      eventSource.close();
      setDashboardConnection(null);
    };

    return () => {
      console.log("Closing dashboard notification SSE connection");
      eventSource.close();
      setDashboardConnection(null);
    };
  }, []);

  // Load pinned/seens from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = localStorage.getItem("nxl_pinned_inquiries");
    if (p) setPinned(new Set(JSON.parse(p)));
    const nt = localStorage.getItem("nxl_notes");
    if (nt) setNotesByEmail(JSON.parse(nt));
    const rm = localStorage.getItem("nxl_reminders");
    if (rm) setReminderByEmail(JSON.parse(rm));
    const as = localStorage.getItem("nxl_assignees");
    if (as) setAssigneesByEmail(JSON.parse(as));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "nxl_pinned_inquiries",
      JSON.stringify(Array.from(pinned))
    );
  }, [pinned]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("nxl_notes", JSON.stringify(notesByEmail));
  }, [notesByEmail]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("nxl_reminders", JSON.stringify(reminderByEmail));
  }, [reminderByEmail]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("nxl_assignees", JSON.stringify(assigneesByEmail));
  }, [assigneesByEmail]);

  // simple reminder checker
  useEffect(() => {
    const int = setInterval(() => {
      const now = Date.now();
      for (const [email, iso] of Object.entries(reminderByEmail)) {
        if (!iso) continue;
        const t = new Date(iso).getTime();
        if (t && t <= now) {
          success?.(`Reminder due for ${email}`);
          setReminderByEmail((m) => ({ ...m, [email]: "" }));
        }
      }
    }, 30000);
    return () => clearInterval(int);
  }, [reminderByEmail]);

  // Auto-refresh when q/status change (debounced)
  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  const filtered = useMemo(() => {
    let list = items;
    // Date range filter
    if (dateFrom || dateTo) {
      const fromTs = dateFrom
        ? new Date(dateFrom + "T00:00:00").getTime()
        : -Infinity;
      const toTs = dateTo ? new Date(dateTo + "T23:59:59").getTime() : Infinity;
      list = list.filter((i) => {
        const t = new Date(i.createdAt || 0).getTime();
        return t >= fromTs && t <= toTs;
      });
    }
    if (sort === "latest")
      list = [...list].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    if (sort === "oldest")
      list = [...list].sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
      );
    if (sort === "name")
      list = [...list].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    if (sort === "status")
      list = [...list].sort((a, b) =>
        (a.status || "").localeCompare(b.status || "")
      );
    return list;
  }, [items, sort]);

  type ThreadTile = {
    email: string;
    name: string;
    latest: Inquiry;
    count: number;
    lastAt?: string;
    anyNew: boolean;
    newRepliesCount: number;
  };

  const tiles = useMemo<ThreadTile[]>(() => {
    const byEmail = new Map<string, Inquiry[]>();
    for (const it of filtered) {
      if (!it.email) continue;
      const key = it.email.toLowerCase();
      if (!byEmail.has(key)) byEmail.set(key, []);
      byEmail.get(key)!.push(it);
    }
    const list: ThreadTile[] = [];
    for (const [email, arr] of byEmail.entries()) {
      const sorted = [...arr].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      const latest = sorted[0];
      const unread = arr.filter((x) => x.status === "new").length;

      // Find the most recent activity timestamp (including admin replies)
      let lastActivityAt = new Date(latest.createdAt || 0);

      // Check all inquiries for the most recent updatedAt or createdAt
      for (const inquiry of arr) {
        const inquiryTime = new Date(inquiry.updatedAt || inquiry.createdAt || 0);
        if (inquiryTime > lastActivityAt) {
          lastActivityAt = inquiryTime;
        }

        // Check replies for even more recent activity
        if (Array.isArray(inquiry.replies)) {
          for (const reply of inquiry.replies) {
            const replyTime = new Date(reply.at || 0);
            if (replyTime > lastActivityAt) {
              lastActivityAt = replyTime;
            }
          }
        }
      }

      // Calculate total message count (inquiries + replies)
      let totalMessageCount = arr.length; // Start with number of inquiries
      for (const inquiry of arr) {
        if (Array.isArray(inquiry.replies)) {
          totalMessageCount += inquiry.replies.length;
        }
      }

      list.push({
        email,
        name: latest.name || "Unknown",
        latest,
        count: totalMessageCount,
        lastAt: lastActivityAt.toISOString(),
        anyNew: unread > 0,
        newRepliesCount: unread,
      });
    }
    const sortedTiles = list.sort(
      (a, b) =>
        new Date(b.lastAt || 0).getTime() - new Date(a.lastAt || 0).getTime()
    );
    // pinned first
    sortedTiles.sort(
      (a, b) => (pinned.has(b.email) ? 1 : 0) - (pinned.has(a.email) ? 1 : 0)
    );
    // apply table sorting if table view
    const by = tableSort;
    if (by === "name") sortedTiles.sort((a, b) => a.name.localeCompare(b.name));
    if (by === "count") sortedTiles.sort((a, b) => b.count - a.count);
    if (by === "status")
      sortedTiles.sort((a, b) =>
        (a.latest.status || "").localeCompare(b.latest.status || "")
      );
    if (by === "unread")
      sortedTiles.sort((a, b) => (b.anyNew ? 1 : 0) - (a.anyNew ? 1 : 0));
    // lastAt is default already
    return sortedTiles;
  }, [filtered, tableSort, pinned]);

  async function mark(id: string, s: string) {
    try {
      try {
        console.log("[Inquiries] mark", id, s);
      } catch {}
      await api.patch(`/inquiries/${id}/status`, { status: s });
      await load();
      if (s === "read") info?.("Marked as read");
      else if (s === "replied") success?.("Marked closed");
      else warn?.("Status updated");
    } catch (e) {
      try {
        console.error("[Inquiries] mark error", e);
      } catch {}
      error?.("Failed to update status");
    }
  }

  function openCard(i: Inquiry) {
    setActive(i);
    setReplySubject(i.subject || `Re: ${i.name || "Inquiry"}`);
    setReplyMessage("");
    setAttachments([]);
    // mark seen by agent
    if (i.email && agentName) {
      api.patch(`/inquiries/${i._id}/mark-seen`, { agentName }).catch((err) => {
        console.error("Failed to mark inquiry as seen:", err);
      });
    }
  }

  async function openThread(email: string) {
    setActiveEmail(email);
    setLoadingThread(true);
    setReplyComposerMinimized(true); // Minimize by default for better chat reading
    try {
      // Use unified backend thread endpoint
      const r = await api.get("/inquiries/threads", { params: { email } });
      const events: ThreadEvent[] = (r.data?.events || []).map((e: any) => ({
        type: e.type,
        at: e.at,
        subject: e.subject,
        message: e.message,
        fromName: e.fromName,
        inquiryId: e.inquiryId,
        status: e.status,
        inbound: e.inbound,
        note: e.note,
        replyIdx: e.replyIdx,
      }));
      setThreadEvents(events);
      setThread(null);
      const last = events[events.length - 1];
      setReplySubject(last?.subject || `Re: ${email}`);
      setReplyMessage("");
    } finally {
      setLoadingThread(false);
    }
    // mark all inquiries as read when opening thread
    try {
      await api.patch(`/inquiries/threads/mark-read-all`, { email });
    } catch (e) {
      console.error("Failed to mark thread as read:", e);
    }
    // mark seen by agent
    if (agentName) {
      api.patch("/inquiries/threads/mark-seen", { email, agentName }).catch((err) => {
        console.error("Failed to mark thread as seen:", err);
      });
    }
  }

  async function markUnreadLatest(email: string) {
    const t = tiles.find((x) => x.email === email);
    if (!t) return;
    try {
      try {
        console.log("[Inquiries] markUnreadLatest", email, t.latest._id);
      } catch {}
      await api.patch(`/inquiries/${t.latest._id}/mark-unread`, {});
      await load();
      warn?.("Marked as unread");
    } catch (e) {
      try {
        console.error("[Inquiries] markUnread error", e);
      } catch {}
      error?.("Failed to mark unread");
    }
  }

  async function saveMetaForEmail(email: string) {
    const tile = tiles.find((x) => x.email === email);
    if (!tile) return;
    const id = tile.latest._id;
    try {
      await api.patch(`/inquiries/${id}/meta`, {
        priority: priorityById[email],
        tags: tagsById[email],
        notes: notesByEmail[email?.toLowerCase?.() || email],
        assignees: assigneesByEmail[email],
        reminderAt: reminderByEmail[email],
      });
      success?.("Saved");
    } catch (e) {
      error?.("Save failed");
    }
  }

  async function sendReply() {
    if (!active) return;
    if (!replySubject || !replyMessage) return;
    try {
      setSendingReply(true);
      await api.post(`/inquiries/${active._id}/reply`, {
        subject: replySubject,
        message: replyMessage,
        attachments,
      });
      await mark(active._id, "replied");
      setActive(null);
      success?.("Reply sent");
    } catch (e) {
      error?.("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  }

  async function deleteInquiry(email: string) {
    try {
      // Find the inquiry ID for this email
      const tile = tiles.find((t) => t.email === email);
      if (!tile) {
        error?.("Inquiry not found");
        return;
      }

      // Delete all inquiries for this email
      const inquiriesToDelete = items.filter(item => item.email?.toLowerCase() === email.toLowerCase());
      
      await Promise.all(
        inquiriesToDelete.map(inquiry => api.delete(`/inquiries/${inquiry._id}`))
      );

      await load();
      success?.(`Inquiry thread for ${email} has been permanently deleted`);
    } catch (e: any) {
      error?.(e.response?.data?.error || "Failed to delete inquiry thread");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
      suppressHydrationWarning={true}
    >
      {/* Toaster Host */}
      <Toaster />

      {/* Full Page Loading Animation */}
      {loading && tiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 backdrop-blur-xl"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
                animate={{
                  x: [0, Math.random() * 100 - 50, 0],
                  y: [0, Math.random() * 100 - 50, 0],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                suppressHydrationWarning={true}
              />
            ))}

            {/* Gradient orbs */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Main Animated Logo/Icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl border-4 border-white/20 dark:border-white/10">
                <MessageSquare className="w-12 h-12 text-white drop-shadow-lg" />
              </div>

              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-blue-400/50"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </motion.div>

            {/* Loading Text with enhanced styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-2"
            >
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent">
                Loading Enquiries
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
                Fetching the latest customer communications...
              </p>
            </motion.div>

            {/* Enhanced Animated Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 1, 0.3],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                  className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 shadow-lg"
                />
              ))}
            </motion.div>

            {/* Enhanced Progress Bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="w-80 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner"
            >
              <motion.div
                animate={{
                  x: ["-120%", "120%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full shadow-lg"
              />
            </motion.div>

            {/* Loading percentage simulation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-slate-500 dark:text-slate-400 font-medium"
            >
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Preparing your dashboard...
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between"
        suppressHydrationWarning={true}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Enquiries</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage customer communications and support tickets
            </p>
          </div>
        </div>
        <div className="relative">
          <details className="group">
            <summary className="list-none rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-sm">
              <Download className="w-4 h-4 inline mr-2" />
              Export ▾
            </summary>
            <div className="absolute right-0 mt-1 w-40 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/95 backdrop-blur shadow-xl p-2 text-sm grid gap-1 z-50">
              <button
                className="text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded transition-colors"
                onClick={() => exportCsv()}
              >
                CSV
              </button>
              <button
                className="text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded transition-colors"
                onClick={() => exportCsv("excel")}
              >
                Excel
              </button>
              <button
                className="text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded transition-colors"
                onClick={() => exportCsv("pdf")}
              >
                PDF
              </button>
            </div>
          </details>
        </div>
      </motion.div>

      {/* Filters strip - improved UI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="md:sticky md:top-20 z-[5] space-y-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 backdrop-blur-xl p-6 shadow-xl dark:shadow-2xl"
        suppressHydrationWarning={true}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-500" />
            <Input
              className="pl-8 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
              placeholder="Search name, email, subject, message…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name (A→Z)</option>
            <option value="status">Status (A→Z)</option>
          </Select>
          <Input
            type="date"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
          />
          <Input
            type="date"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
          />
          <div className="ml-auto flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 px-2 hidden sm:inline">View:</span>
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              className={`h-12 px-3 gap-2 transition-all duration-200 ${
                viewMode === "cards"
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md ring-2 ring-blue-500/20"
                  : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}
              onClick={() => setViewMode("cards")}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              className={`h-12 px-3 gap-2 transition-all duration-200 ${
                viewMode === "table"
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md ring-2 ring-blue-500/20"
                  : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}
              onClick={() => setViewMode("table")}
              title="Table view"
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              className={`h-12 px-3 gap-2 transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md ring-2 ring-blue-500/20"
                  : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}
              onClick={() => setViewMode("grid")}
              title="Messages grid"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
            <Button
              variant="outline"
              size="sm"
              className="h-12 px-3 gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
              onClick={async () => {
                setBulkLoading(true);
                try {
                  // refresh list quickly
                  await load();
                  success?.("Refreshed");
                } finally {
                  setBulkLoading(false);
                }
              }}
              title="Refresh"
            >
              {bulkLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="hidden sm:inline">Refreshing</span>
                </span>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status chips with counts */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "", label: "All", count: items.length },
            {
              key: "new",
              label: "New",
              count: items.filter((i) => i.status === "new").length,
            },
            {
              key: "read",
              label: "In Progress",
              count: items.filter((i) => i.status === "read").length,
            },
            {
              key: "replied",
              label: "Closed",
              count: items.filter((i) => i.status === "replied").length,
            },
          ].map((o) => (
            <button
              key={o.key || "all"}
              onClick={() => {
                setStatus(o.key);
                setPage(1);
              }}
              className={`h-9 px-4 rounded-full border text-sm flex items-center gap-2 transition-all duration-200 hover:scale-105 font-medium ${
                (status || "") === o.key
                  ? "border-blue-500 bg-blue-500/20 text-blue-700 dark:text-blue-300 shadow-lg ring-2 ring-blue-500/20"
                  : "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
              }`}
            >
              <span>{o.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center ${
                (status || "") === o.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-600 dark:bg-slate-500 text-white"
              }`}>
                {o.count}
              </span>
            </button>
          ))}
          {(q || status || sort !== "latest") && (
            <Button
              variant="outline"
              className="h-8 px-2 ml-auto"
              onClick={() => {
                setQ("");
                setStatus("");
                setSort("latest");
                setPage(1);
                setDateFrom("");
                setDateTo("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </motion.div>

      {/* Empty state */}
      {!loading && tiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 backdrop-blur-xl rounded-2xl p-12 text-center shadow-2xl dark:shadow-slate-900/50 relative overflow-hidden"
          suppressHydrationWarning={true}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            {/* Animated icon */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl"
            >
              <MessageSquare className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-bold text-slate-900 dark:text-white mb-3"
            >
              No enquiries found
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto"
            >
              Try adjusting your filters or search terms to find what you're looking for. New enquiries will appear here automatically.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={() => {
                  setQ("");
                  setStatus("");
                  setSort("latest");
                  setPage(1);
                  setDateFrom("");
                  setDateTo("");
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 px-8 py-3 rounded-xl font-semibold"
              >
                <Search className="w-4 h-4 mr-2" />
                Clear all filters
              </Button>
            </motion.div>

            {/* Floating elements for extra visual appeal */}
            <div className="absolute top-8 right-8 opacity-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-6 h-6 text-blue-400" />
              </motion.div>
            </div>
            <div className="absolute bottom-8 left-8 opacity-20">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Only show view modes when there are enquiries */}
      {!loading && tiles.length > 0 && (
        <>
          {viewMode === "grid" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          suppressHydrationWarning={true}
        >
          {filtered.slice((page - 1) * perPage, page * perPage).map((i, index) => {
            const variant =
              i.status === "replied"
                ? "success"
                : i.status === "read"
                ? "secondary"
                : "warning";

            // Priority color mapping for grid
            const priorityColors = {
              urgent: "from-red-500 to-red-600",
              high: "from-orange-500 to-orange-600",
              medium: "from-yellow-500 to-yellow-600",
              low: "from-green-500 to-green-600",
              "": "from-slate-500 to-slate-600"
            };

            const priorityColor = priorityColors[priorityById[i.email] as keyof typeof priorityColors] || priorityColors[""];

            return (
              <motion.div
                key={i._id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 backdrop-blur-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/20 transition-all duration-500 hover:-translate-y-2 cursor-pointer group overflow-hidden"
                onClick={() => openThread(i.email)}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Header */}
                <div className="relative z-10 p-4 flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="min-w-0 flex items-center gap-3 flex-1">
                    {/* Enhanced Avatar */}
                    <div className="relative">
                      <img
                        src={getProfilePictureUrl(i.email)}
                        alt={`${i.name || 'User'} avatar`}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-white/20 object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-white/20 hidden">
                        <span className="text-white font-bold text-sm">
                          {(i.name || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                        i.status === "new"
                          ? "bg-red-500 animate-pulse"
                          : i.status === "replied"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Name with badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                          {i.name || "Unknown"}
                        </h4>

                        {/* Priority badge */}
                        {priorityById[i.email] && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`px-1.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${priorityColor} shadow-lg`}
                          >
                            {priorityById[i.email].toUpperCase()}
                          </motion.span>
                        )}

                        {/* Pinned badge */}
                        {pinned.has(i.email) && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="px-1.5 py-0.5 rounded-full text-xs font-semibold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600"
                          >
                            📌
                          </motion.span>
                        )}
                      </div>

                      {/* Email */}
                      <div className="text-cyan-600 dark:text-cyan-400 text-sm truncate group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-300">
                        {i.email}
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={variant as any} className="shadow-lg text-xs">
                      {i.status}
                    </Badge>
                  </div>
                </div>

                {/* Body */}
                <div className="relative z-10 px-4 py-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 flex-1">
                  {i.subject && (
                    <div className="font-semibold mb-2 text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {i.subject}
                    </div>
                  )}
                  <div className="opacity-90 line-clamp-2 whitespace-pre-wrap group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                    {i.message}
                  </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 px-4 pb-4 mt-auto">
                  <div className="text-xs text-slate-500 dark:text-slate-500 flex items-center justify-between">
                    <span className="group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors duration-300">
                      {i.createdAt ? new Date(i.createdAt).toLocaleString() : ""}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-100 transition-all duration-300">
                      <motion.button
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-7 w-7 grid place-items-center rounded-lg border border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 shadow-sm hover:shadow-lg"
                        title="View thread"
                        onClick={(e) => {
                          e.stopPropagation();
                          openThread(i.email);
                        }}
                      >
                        <Eye className="w-3 h-3 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-7 w-7 grid place-items-center rounded-lg border border-slate-300 dark:border-slate-600 hover:border-green-500/40 bg-white/50 dark:bg-slate-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 shadow-sm hover:shadow-lg"
                        title="Quick reply"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCard(i);
                        }}
                      >
                        <Send className="w-3 h-3 text-slate-600 dark:text-slate-400 group-hover:text-green-600" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-7 w-7 grid place-items-center rounded-lg border border-slate-300 dark:border-slate-600 hover:border-blue-500/40 bg-white/50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm hover:shadow-lg"
                        title="Mark read"
                        onClick={(e) => {
                          e.stopPropagation();
                          mark(i._id, "read");
                        }}
                      >
                        <CheckCircle className="w-3 h-3 text-slate-600 dark:text-slate-400 group-hover:text-blue-600" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl ring-0 ring-indigo-500/0 group-hover:ring-2 group-hover:ring-indigo-500/30 transition-all duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Threads cards or table */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {loading && tiles.length === 0 && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 backdrop-blur-xl rounded-2xl p-6 shadow-xl dark:shadow-slate-900/50"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer rounded-2xl" />

                  <div className="flex items-start gap-4">
                    {/* Avatar skeleton */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 animate-pulse" />

                    <div className="flex-1 space-y-3">
                      {/* Name skeleton */}
                      <div className="h-5 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded animate-pulse w-3/4" />

                      {/* Email skeleton */}
                      <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded animate-pulse w-1/2" />

                      {/* Message skeleton */}
                      <div className="space-y-2">
                        <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded animate-pulse w-full" />
                        <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded animate-pulse w-2/3" />
                      </div>
                    </div>

                    {/* Status skeleton */}
                    <div className="h-6 w-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full animate-pulse" />
                  </div>

                  {/* Footer skeleton */}
                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded animate-pulse w-1/3" />
                  </div>
                </motion.div>
              ))}
            </>
          )}
          {tiles.map((t) => {
            const latest = t.latest;
            const badgeVariant = t.anyNew
              ? "warning"
              : latest.status === "replied"
              ? "success"
              : "secondary";

            // Priority color mapping
            const priorityColors = {
              urgent: "from-red-500 to-red-600",
              high: "from-orange-500 to-orange-600",
              medium: "from-yellow-500 to-yellow-600",
              low: "from-green-500 to-green-600",
              "": "from-slate-500 to-slate-600"
            };

            const priorityColor = priorityColors[priorityById[t.email] as keyof typeof priorityColors] || priorityColors[""];

            return (
              <motion.div
                key={t.email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative group"
              >
                <div
                  className="relative border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 backdrop-blur-xl p-6 flex flex-col gap-3 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/20 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  onClick={() => openThread(t.email)}
                >
                  {/* Animated background gradient on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Header with enhanced name display */}
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar with status indicator */}
                      <div className="relative">
                        <img
                          src={getProfilePictureUrl(t.email)}
                          alt={`${t.name} avatar`}
                          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-white/20 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-white/20 hidden">
                          <span className="text-white font-bold text-lg">
                            {(t.name || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {/* Status indicator dot */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                          t.anyNew
                            ? "bg-red-500 animate-pulse"
                            : latest.status === "replied"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`} />
                      </div>

                      {/* Name and badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                            {t.name}
                          </h3>

                          {/* Priority badge */}
                          {priorityById[t.email] && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${priorityColor} shadow-lg`}
                            >
                              {priorityById[t.email].toUpperCase()}
                            </motion.span>
                          )}

                          {/* Pinned badge */}
                          {pinned.has(t.email) && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                              className="px-2 py-1 rounded-full text-xs font-semibold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600 shadow-lg"
                            >
                              📌 PINNED
                            </motion.span>
                          )}

                          {/* Unread count badge */}
                          {t.newRepliesCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 }}
                              className="px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 shadow-lg animate-pulse border border-red-600"
                            >
                              +{t.newRepliesCount}
                            </motion.span>
                          )}
                        </div>

                        {/* Email */}
                        <p className="text-slate-600 dark:text-slate-400 text-sm truncate group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                          {t.email}
                        </p>

                        {/* Message count */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                            {t.count} message{t.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex flex-col items-end gap-2">
                      {t.anyNew ? (
                        <Badge variant="warning" className="px-3 py-1 text-xs font-semibold shadow-lg bg-red-600 hover:bg-red-700 text-white border-red-700 animate-pulse">
                          New Message
                        </Badge>
                      ) : latest.status === "replied" ? (
                        <Badge variant="success" className="px-3 py-1 text-xs font-semibold shadow-lg bg-green-600 hover:bg-green-700 text-white border-green-700">
                          Replied
                        </Badge>
                      ) : (
                        <div className="relative group">
                          <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold shadow-lg bg-gray-600 hover:bg-gray-700 text-white border-gray-700 cursor-help">
                            Seen
                          </Badge>
                          {role === "superadmin" && seenBy[t.email?.toLowerCase() || ""] && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                              Seen by: {(seenBy[t.email.toLowerCase()] || []).join(", ")}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delete button for superadmin */}
                      {role === "superadmin" && (
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete the entire inquiry thread for ${t.name}? This action cannot be undone.`)) {
                              deleteInquiry(t.email);
                            }
                          }}
                          className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors duration-200"
                          title="Delete inquiry thread"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}

                      {/* Note indicator */}
                      {latest && (latest as any).note && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="px-2 py-1 rounded-full text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 shadow-lg"
                        >
                          📝 Has Note
                        </motion.span>
                      )}
                    </div>
                  </div>

                  {/* Message preview */}
                  <div className="relative z-10 space-y-2">
                    {latest.subject && (
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                        {latest.subject}
                      </div>
                    )}
                    <div className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                      {latest.message}
                    </div>
                  </div>

                  {/* Footer with timestamp and actions */}
                  <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {latest.createdAt
                        ? new Date(latest.createdAt).toLocaleString()
                        : ""}
                    </div>

                    <div className="flex items-center gap-2 opacity-100 transition-all duration-300">
                      <motion.button
                        whileHover={{ scale: 1.1, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`h-8 px-3 rounded-lg border text-xs font-medium transition-all duration-200 ${
                          pinned.has(t.email)
                            ? "border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20"
                            : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                        title={pinned.has(t.email) ? "Unpin" : "Pin"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPinned((prev) => {
                            const c = new Set(prev);
                            if (c.has(t.email)) c.delete(t.email);
                            else c.add(t.email);
                            return c;
                          });
                        }}
                      >
                        <Star className={`w-3 h-3 ${pinned.has(t.email) ? 'fill-current' : ''}`} />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openThread(t.email);
                        }}
                        className="h-8 px-3 rounded-lg border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        View Thread
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openCard(latest);
                        }}
                        className="h-8 px-3 rounded-lg border border-green-300 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Quick Reply
                      </motion.button>
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-2xl ring-0 ring-indigo-500/0 group-hover:ring-2 group-hover:ring-indigo-500/30 transition-all duration-500 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {viewMode === "table" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 backdrop-blur-xl overflow-hidden shadow-2xl dark:shadow-slate-900/50"
          suppressHydrationWarning={true}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {[
                    { k: "select", l: "", w: "w-12" },
                    { k: "name", l: "Customer", w: "min-w-[200px]" },
                    { k: "email", l: "Contact", w: "min-w-[200px]" },
                    { k: "count", l: "Messages", w: "w-20" },
                    { k: "lastAt", l: "Last Activity", w: "min-w-[140px]" },
                    { k: "status", l: "Status", w: "w-24" },
                    { k: "unread", l: "Read Status", w: "w-24" },
                    { k: "priority", l: "Priority", w: "w-24" },
                    { k: "tags", l: "Tags", w: "min-w-[150px]" },
                    { k: "actions", l: "Actions", w: "min-w-[200px]" },
                  ].map((h) => (
                    <th key={h.k} className={`p-4 text-left font-bold text-slate-700 dark:text-slate-300 ${h.w}`}>
                      {h.k === "select" ? (
                        <input
                          type="checkbox"
                          checked={
                            selected.size > 0 &&
                            selected.size ===
                              tiles.slice((page - 1) * perPage, page * perPage)
                                .length
                          }
                          onChange={(e) => {
                            const pageSlice = tiles.slice(
                              (page - 1) * perPage,
                              page * perPage
                            );
                            if (e.target.checked) {
                              setSelected(new Set(pageSlice.map((t) => t.email)));
                            } else {
                              setSelected(new Set());
                            }
                          }}
                          className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                        />
                      ) : (
                        <button
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 flex items-center gap-1"
                          onClick={() => h.k !== "email" && h.k !== "actions" && h.k !== "select" && setTableSort(h.k as any)}
                          disabled={h.k === "email" || h.k === "actions" || h.k === "select"}
                        >
                          {h.l}
                          {tableSort === (h.k as typeof tableSort) && h.k !== "email" && h.k !== "actions" && h.k !== "select" && (
                            <motion.span
                              initial={{ rotate: 0 }}
                              animate={{ rotate: 180 }}
                              className="text-indigo-600 dark:text-indigo-400"
                            >
                              ▲
                            </motion.span>
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tiles.slice((page - 1) * perPage, page * perPage).map((t) => (
                  <motion.tr
                    key={t.email}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(t.email)}
                        onChange={(e) => {
                          const c = new Set(selected);
                          if (e.target.checked) c.add(t.email);
                          else c.delete(t.email);
                          setSelected(c);
                        }}
                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Enhanced Avatar */}
                        <div className="relative">
                          <img
                            src={getProfilePictureUrl(t.email)}
                            alt={`${t.name} avatar`}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-white/20 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 border border-white/20 hidden">
                            <span className="text-white font-bold">
                              {(t.name || "?").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {/* Status indicator */}
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                            t.anyNew
                              ? "bg-red-500 animate-pulse"
                              : t.latest.status === "replied"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`} />
                        </div>

                        {/* Name and badges */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                              {t.name}
                            </span>

                            {/* Priority badge */}
                            {priorityById[t.email] && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${
                                  priorityById[t.email] === 'urgent' ? 'from-red-500 to-red-600' :
                                  priorityById[t.email] === 'high' ? 'from-orange-500 to-orange-600' :
                                  priorityById[t.email] === 'medium' ? 'from-yellow-500 to-yellow-600' :
                                  'from-green-500 to-green-600'
                                } shadow-lg`}
                              >
                                {priorityById[t.email].toUpperCase()}
                              </motion.span>
                            )}

                            {/* Pinned badge */}
                            {pinned.has(t.email) && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="px-2 py-0.5 rounded-full text-xs font-semibold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600"
                              >
                                📌
                              </motion.span>
                            )}

                            {/* Unread badge */}
                            {t.newRepliesCount > 0 && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"
                              >
                                +{t.newRepliesCount}
                              </motion.span>
                            )}
                          </div>

                          {/* Email */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`mailto:${t.email}?subject=${encodeURIComponent(`Re: ${t.latest.subject || 'Inquiry'}`)}`, '_blank');
                            }}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors duration-200 cursor-pointer"
                            title="Send Email"
                          >
                            ✉️ {t.email}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 font-medium">
                      <div className="flex flex-col gap-1">
                        {/* Phone with WhatsApp icon */}
                        {t.latest.phone && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(t.latest.phone || '');
                                success?.(`Phone number ${t.latest.phone} copied to clipboard! 📱`);
                              }}
                              className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors duration-200 cursor-pointer"
                              title="Click to copy phone number"
                            >
                              📱 {t.latest.phone}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://wa.me/${t.latest.phone?.replace(/\D/g, "")}`, '_blank');
                              }}
                              className="p-1 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                              title="Open WhatsApp"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                              </svg>
                            </button>
                          </div>
                        )}

                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {t.count}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                      {t.lastAt ? new Date(t.lastAt).toLocaleString() : ""}
                    </td>
                    <td className="p-4">
                      {t.latest.status === "replied" ? (
                        <Badge variant="success" className="shadow-lg bg-green-600 hover:bg-green-700 text-white border-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Replied
                        </Badge>
                      ) : t.latest.status === "read" ? (
                        <Badge variant="secondary" className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white border-blue-700">
                          <Eye className="w-3 h-3 mr-1" />
                          Seen
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="shadow-lg bg-orange-600 hover:bg-orange-700 text-white border-orange-700 animate-pulse">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {t.anyNew ? (
                        <Badge variant="warning" className="shadow-lg bg-red-600 hover:bg-red-700 text-white border-red-700 animate-pulse">
                          Unread
                        </Badge>
                      ) : (
                        <div className="relative">
                          <Badge variant="secondary" className="shadow-lg bg-gray-600 hover:bg-gray-700 text-white border-gray-700 cursor-help group">
                            Read
                          </Badge>
                          {role === "superadmin" && seenBy[t.email?.toLowerCase() || ""] && (
                            <div 
                              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-slate-900 text-white text-sm rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto cursor-pointer whitespace-nowrap z-20 border border-slate-700 min-w-[200px] hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInquiryForSeenBy(t);
                              }}
                              onMouseEnter={() => {
                                // Keep tooltip visible when hovering over it
                              }}
                              onMouseLeave={() => {
                                // Tooltip will hide via CSS when not hovering on badge or tooltip
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-4 h-4 text-blue-400" />
                                <span className="font-semibold text-blue-300">Seen by {Array.isArray(seenBy[t.email.toLowerCase()]) ? seenBy[t.email.toLowerCase()].length : 0} staff</span>
                              </div>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {(Array.isArray(seenBy[t.email.toLowerCase()]) ? seenBy[t.email.toLowerCase()] : []).slice(0, 3).map((entry, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-300">{typeof entry === 'object' ? entry.agentName : entry}</span>
                                    <span className="text-slate-500">
                                      {typeof entry === 'object' && entry.seenAt ? 
                                        new Date(entry.seenAt).toLocaleDateString() : 
                                        'Unknown'
                                      }
                                    </span>
                                  </div>
                                ))}
                                {(Array.isArray(seenBy[t.email.toLowerCase()]) ? seenBy[t.email.toLowerCase()].length : 0) > 3 && (
                                  <div className="text-xs text-slate-400 text-center pt-1 border-t border-slate-700">
                                    +{(Array.isArray(seenBy[t.email.toLowerCase()]) ? seenBy[t.email.toLowerCase()].length : 0) - 3} more...
                                  </div>
                                )}
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Select
                        value={priorityById[t.email] || ""}
                        onChange={(e) =>
                          setPriorityById((m) => ({
                            ...m,
                            [t.email]: e.target.value,
                          }))
                        }
                        className="w-24 h-8 text-xs"
                      >
                        <option value="">None</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {(tagsById[t.email] || []).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs shadow-sm">
                            {tag}
                          </Badge>
                        ))}
                        <Input
                          placeholder="Add tag"
                          className="h-6 px-2 w-20 text-xs"
                          onKeyDown={(e: any) => {
                            if (
                              e.key === "Enter" &&
                              e.currentTarget.value.trim()
                            ) {
                              const val = e.currentTarget.value.trim();
                              setTagsById((m) => ({
                                ...m,
                                [t.email]: Array.from(
                                  new Set([...(m[t.email] || []), val])
                                ),
                              }));
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <Button
                          className="h-6 px-2 text-xs"
                          onClick={() => saveMetaForEmail(t.email)}
                        >
                          Save
                        </Button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 opacity-100 transition-all duration-300">
                        <motion.button
                          whileHover={{ scale: 1.1, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openThread(t.email)}
                          className="h-8 px-3 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-600 dark:border-blue-700"
                          title="View Thread"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openCard(t.latest)}
                          className="h-8 px-3 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                          title="Quick Reply"
                        >
                          <Send className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async () => {
                            await mark(t.latest._id, "read");
                          }}
                          className="h-8 px-3 rounded-lg bg-slate-500 hover:bg-slate-600 text-white text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                          title="Mark Read"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </motion.button>
                        {t.anyNew && (
                          <motion.button
                            whileHover={{ scale: 1.1, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              setRowLoadingEmail(t.email);
                              try {
                                await api.patch(
                                  `/inquiries/threads/mark-read-all`,
                                  { email: t.email }
                                );
                                await load();
                                success?.("Marked all as read");
                              } finally {
                                setRowLoadingEmail(null);
                              }
                            }}
                            className="h-8 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                            title="Mark All Read"
                          >
                            <Eye className="w-3 h-3" />
                          </motion.button>
                        )}
                        {role === "superadmin" && (
                          <motion.button
                            whileHover={{ scale: 1.1, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              const confirmed = window.confirm(
                                `Are you sure you want to delete the entire inquiry thread for ${t.email}? This action cannot be undone and will permanently remove all messages in this conversation.`
                              );
                              if (!confirmed) return;

                              try {
                                setRowLoadingEmail(t.email);
                                // Delete all inquiries for this email
                                const inquiriesToDelete = items.filter(item => item.email?.toLowerCase() === t.email.toLowerCase());
                                await Promise.all(
                                  inquiriesToDelete.map(inquiry => api.delete(`/inquiries/${inquiry._id}`))
                                );
                                await load();
                                success?.(`Inquiry thread for ${t.email} has been permanently deleted`);
                              } catch (e: any) {
                                error?.(e.response?.data?.error || "Failed to delete inquiry thread");
                              } finally {
                                setRowLoadingEmail(null);
                              }
                            }}
                            className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-red-700"
                            title="Delete Entire Thread (Superadmin Only)"
                          >
                            <Trash2 className="w-3 h-3" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">Rows per page:</span>
              <Select
                value={String(perPage)}
                onChange={(e) => {
                  setPerPage(parseInt(e.target.value) || 10);
                  setPage(1);
                }}
                className="w-20 h-8 text-sm"
              >
                {[10, 12, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Showing {Math.min((page - 1) * perPage + 1, tiles.length)} - {Math.min(page * perPage, tiles.length)} of {tiles.length} inquiries
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1 text-sm"
              >
                <ChevronUp className="w-3 h-3 rotate-90" />
                Prev
              </motion.button>
              <span className="text-sm text-slate-600 dark:text-slate-400 px-3">
                Page {page} of {Math.max(1, Math.ceil(tiles.length / perPage))}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setPage((p) =>
                    Math.min(Math.ceil(tiles.length / perPage) || 1, p + 1)
                  )
                }
                disabled={page >= Math.ceil(tiles.length / perPage)}
                className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1 text-sm"
              >
                Next
                <ChevronUp className="w-3 h-3 -rotate-90" />
              </motion.button>
            </div>
          </div>
          {selected.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-900/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{selected.size}</span>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  inquiries selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(new Set())}
                  className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm transition-colors duration-200"
                >
                  Clear selection
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    setBulkLoading(true);
                    try {
                      await Promise.all(
                        Array.from(selected).map((email) =>
                          api.patch(`/inquiries/threads/mark-read-all`, {
                            email,
                          })
                        )
                      );
                      await load();
                      success?.("Marked selected as read");
                      setSelected(new Set());
                    } finally {
                      setBulkLoading(false);
                    }
                  }}
                  className="h-8 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors duration-200 shadow-lg"
                >
                  {bulkLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Applying…
                    </span>
                  ) : (
                    "Mark selected as read"
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      </>
      )}

      {/* Pagination removed per request */}

      {/* Drawer / Modal */}
      {active && (
        <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <div className="text-slate-900 dark:text-white">
                <DialogTitle>Inquiry</DialogTitle>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => setActive(null)}
              >
                ✕
              </button>
            </DialogHeader>
            <div className="p-4 space-y-3">
              <div className="text-sm">
                <div className="text-slate-400">From</div>
                <div className="font-semibold">{active.name}</div>
                <div className="text-cyan-300">{active.email}</div>
                {active.phone && <div>{active.phone}</div>}
                {active.phone && (
                  <div className="text-xs mt-1 flex items-center gap-2">
                    <a
                      className="text-green-400 underline"
                      href={`https://wa.me/${active.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                    <a
                      className="text-cyan-400 underline"
                      href={`mailto:${
                        active.email
                      }?subject=${encodeURIComponent(replySubject || "")}`}
                    >
                      Email
                    </a>
                  </div>
                )}
              </div>
              {active.subject && (
                <div className="text-sm">
                  <div className="text-slate-400">Subject</div>
                  <div className="font-medium">{active.subject}</div>
                </div>
              )}
              <Accordion>
                <AccordionItem title="Message">
                  <div className="whitespace-pre-wrap">{active.message}</div>
                </AccordionItem>
                <AccordionItem title="Metadata">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-slate-400">Created</div>
                    <div>
                      {active.createdAt
                        ? new Date(active.createdAt).toLocaleString()
                        : ""}
                    </div>
                    <div className="text-slate-400">Status</div>
                    <div>{active.status}</div>
                    {active.phone && (
                      <>
                        <div className="text-slate-400">Phone</div>
                        <div>{active.phone}</div>
                      </>
                    )}
                  </div>
                </AccordionItem>
                <AccordionItem title="Attachments">
                  <div className="text-xs text-slate-400">
                    Attach files when replying below.
                  </div>
                </AccordionItem>
              </Accordion>
              <div className="grid gap-2">
                <Input
                  placeholder="Reply subject"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                />
                <Textarea
                  rows={6}
                  placeholder="Write your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
                {/* Internal notes / assignments / reminder */}
                <Accordion>
                  <AccordionItem title="Internal notes">
                    <Textarea
                      rows={3}
                      placeholder="Notes visible only to your team..."
                      value={
                        notesByEmail[active.email?.toLowerCase() || ""] || ""
                      }
                      onChange={(e) =>
                        setNotesByEmail((m) => ({
                          ...m,
                          [active.email!.toLowerCase()]: e.target.value,
                        }))
                      }
                    />
                    <div className="mt-2 text-xs text-slate-400">
                      Note will be attached to this reply in the thread.
                    </div>
                  </AccordionItem>
                  <AccordionItem title="Assign & reminder">
                    <div className="grid gap-2 text-sm">
                      <Input
                        placeholder="Assign members (comma-separated)"
                        value={(
                          assigneesByEmail[active.email!.toLowerCase()] || []
                        ).join(", ")}
                        onChange={(e) =>
                          setAssigneesByEmail((m) => ({
                            ...m,
                            [active.email!.toLowerCase()]: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">Reminder</span>
                        <Input
                          type="datetime-local"
                          value={
                            reminderByEmail[active.email!.toLowerCase()] || ""
                          }
                          onChange={(e) =>
                            setReminderByEmail((m) => ({
                              ...m,
                              [active.email!.toLowerCase()]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() =>
                            setReminderByEmail((m) => ({
                              ...m,
                              [active.email!.toLowerCase()]: "",
                            }))
                          }
                        >
                          Clear
                        </Button>
                        <Button
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() =>
                            setReminderByEmail((m) => ({
                              ...m,
                              [active.email!.toLowerCase()]: new Date(
                                Date.now() + 3600 * 1000
                              )
                                .toISOString()
                                .slice(0, 16),
                            }))
                          }
                        >
                          Snooze 1h
                        </Button>
                      </div>
                    </div>
                  </AccordionItem>
                </Accordion>
                {/* Attachments */}
                <div className="text-xs text-slate-400">
                  Attachments (optional)
                </div>
                <input
                  type="file"
                  multiple
                  className="text-sm"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []).slice(0, 5);
                    const mapped = await Promise.all(
                      files.map(
                        (f) =>
                          new Promise<{
                            filename: string;
                            contentType: string;
                            content: string;
                            preview?: string;
                          }>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                              const res = reader.result as string; // data URL
                              const base64 = res.split(",")[1] || res;
                              resolve({
                                filename: f.name,
                                contentType:
                                  f.type || "application/octet-stream",
                                content: base64,
                                preview: res,
                              });
                            };
                            reader.onerror = (err) => reject(String(err));
                            reader.readAsDataURL(f);
                          })
                      )
                    );
                    setAttachments(mapped);
                  }}
                />
                {attachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {attachments.map((a, idx) => (
                      <div
                        key={idx}
                        className="border border-slate-800 rounded p-2 text-xs flex flex-col gap-2"
                      >
                        {a.preview && a.contentType.startsWith("image/") ? (
                          <img
                            src={a.preview}
                            alt={a.filename}
                            className="w-full h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="h-24 grid place-items-center bg-slate-900/50 rounded">
                            {a.contentType}
                          </div>
                        )}
                        <div className="truncate" title={a.filename}>
                          {a.filename}
                        </div>
                        <Button
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setActive(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={async () => {
                      // include note
                      await (async () => {
                        if (!active) return;
                        if (!replySubject || !replyMessage) return;
                        try {
                          setSendingReply(true);
                          await api.post(`/inquiries/${active._id}/reply`, {
                            subject: replySubject,
                            message: replyMessage,
                            attachments,
                            note:
                              notesByEmail[active.email!.toLowerCase()] || "",
                          });
                          await mark(active._id, "replied");
                          setActive(null);
                          success?.("Reply sent");
                        } catch (e) {
                          error?.("Failed to send reply");
                        } finally {
                          setSendingReply(false);
                        }
                      })();
                    }}
                    disabled={sendingReply}
                  >
                    {sendingReply ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                      </span>
                    ) : (
                      "Send Reply"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Thread Modal */}
      <Dialog
        open={!!activeEmail}
        onOpenChange={(v) => {
          if (!v) {
            setActiveEmail(null);
            setThread(null);
            setThreadEvents(null);
          }
        }}
      >
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 border-2 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-2xl shadow-2xl">
          <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-blue-600/10 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-blue-900/20 border-t border-b border-slate-200/50 dark:border-slate-700/50 p-4 pr-12 rounded-t-2xl relative">
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-slate-900 dark:text-white font-bold">
                  Conversation • {activeEmail}
                </DialogTitle>
              </div>
              <button
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-110 border border-slate-300/50 dark:border-slate-600/50"
                onClick={() => {
                  setActiveEmail(null);
                  setThread(null);
                  setThreadEvents(null);
                  setAttachments([]);
                  setAttachmentPreviews([]);
                }}
              >
                <X className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
            {activeEmail && seenBy[activeEmail?.toLowerCase() || ""] && (
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Seen by:{" "}
                  {(seenBy[activeEmail.toLowerCase()] || []).join(", ")}
                </div>
                {replyComposerMinimized && (
                  <button
                    onClick={() => setReplyComposerMinimized(false)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded hover:bg-indigo-900/20"
                    title="Open Reply Composer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Quick Reply
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-gradient-to-b from-slate-50/80 via-white/60 to-slate-100/80 dark:from-slate-900/80 dark:via-slate-800/60 dark:to-slate-900/80 backdrop-blur-sm">
            {activeEmail && seenBy[activeEmail?.toLowerCase() || ""] && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Seen by: {(seenBy[activeEmail.toLowerCase()] || []).join(", ")}
              </div>
            )}
            {loadingThread && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900/40 via-slate-800/30 to-slate-900/40 p-4 animate-pulse shadow-lg"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full animate-pulse shadow-md" />
                      <div className="h-4 w-32 bg-gradient-to-r from-slate-700 to-slate-800 animate-pulse rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gradient-to-r from-slate-700 to-slate-800 animate-pulse rounded" />
                      <div className="h-3 w-3/5 bg-gradient-to-r from-slate-700 to-slate-800 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loadingThread && (!threadEvents || threadEvents.length === 0) && (
              <div className="text-center py-12 animate-in fade-in duration-500">
                <div className="p-4 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 mx-auto w-fit mb-4 shadow-lg">
                  <MessageSquare className="w-16 h-16 mx-auto text-slate-500 dark:text-slate-400" />
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-lg font-medium">No messages yet</div>
                <div className="text-slate-500 dark:text-slate-500 text-sm mt-1">Start the conversation by sending a reply below</div>
              </div>
            )}
            {!loadingThread &&
              threadEvents &&
              threadEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 items-start transition-all duration-300 hover:scale-[1.02] ${
                    ev.type === "inbound" || ev.inbound
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                  className={`max-w-[75%] rounded-2xl p-4 shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-[1.02] animate-in slide-in-from-bottom-4 fade-in ${
                    ev.type === "inbound" || ev.inbound
                      ? "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-300 dark:border-blue-700/50 text-slate-900 dark:text-slate-100 hover:from-blue-200 hover:to-blue-100 dark:hover:from-blue-800/40 dark:hover:to-blue-700/30"
                      : "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-300 dark:border-emerald-700/50 text-slate-900 dark:text-slate-100 hover:from-emerald-200 hover:to-emerald-100 dark:hover:from-emerald-800/40 dark:hover:to-emerald-700/30"
                  }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            ev.type === "inbound" || ev.inbound
                              ? "bg-blue-400"
                              : "bg-emerald-400"
                          }`}
                        />
                        <span className="font-semibold">
                          {ev.fromName ||
                            (ev.type === "reply"
                              ? adminName || "Admin"
                              : "Unknown")}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          • {ev.type === "reply" ? "Reply" : "Inbound"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          {ev.at ? new Date(ev.at).toLocaleString() : ""}
                        </span>
                        {(() => {
                          console.log(
                            "Delete button check - role:",
                            role,
                            "ev.type:",
                            ev.type,
                            "isSuperadmin:",
                            role === "superadmin",
                            "isReply:",
                            ev.type === "reply"
                          );
                          return role === "superadmin" && ev.type === "reply";
                        })() && (
                          <button
                            className="text-red-400 hover:text-red-300"
                            title="Delete message"
                            onClick={async () => {
                              if (!ev.inquiryId || ev.replyIdx == null) return;
                              if (!confirm("Delete this reply?")) return;
                              try {
                                const token = localStorage.getItem("token");
                                console.log("Delete request - token:", token);
                                if (!token) {
                                  error?.("No authentication token found");
                                  return;
                                }

                                console.log(
                                  "Sending delete request with token:",
                                  token.substring(0, 50) + "..."
                                );
                                await api.delete(
                                  `/inquiries/${ev.inquiryId}/replies/${ev.replyIdx}`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );
                                success?.("Reply deleted");
                                if (activeEmail) await openThread(activeEmail);
                              } catch (e: any) {
                                const errorMsg =
                                  e.response?.data?.error ||
                                  "Failed to delete reply";
                                error?.(errorMsg);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Subject */}
                    {ev.subject && (
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                        {ev.subject}
                      </div>
                    )}

                    {/* Message Content */}
                    <div className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                      {renderMessage(ev.message || "")}
                    </div>
                    {/* Note Section */}
                    {ev.note && (
                      <div className="mt-3">
                        <button
                          className="text-xs px-3 py-1.5 rounded-lg bg-amber-900/20 text-amber-300 border border-amber-700/40 hover:bg-amber-900/30 transition-colors flex items-center gap-1"
                          onClick={() =>
                            setOpenNotes((m) => ({ ...m, [idx]: !m[idx] }))
                          }
                        >
                          {openNotes[idx] ? (
                            <>
                              <X className="w-3 h-3" />
                              Hide note
                            </>
                          ) : (
                            <>
                              <FileText className="w-3 h-3" />
                              Show note
                            </>
                          )}
                        </button>
                        {openNotes[idx] && (
                          <div className="mt-2 text-xs text-amber-300 bg-amber-900/20 border border-amber-700/40 rounded-lg p-3 whitespace-pre-wrap">
                            {ev.note}
                          </div>
                        )}
                        {ev.replyIdx !== undefined && (
                          <div className="mt-1 text-[10px] text-slate-500">
                            Note #{(ev.replyIdx || 0) + 1}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Action Buttons */}
                    <div className="mt-3 flex items-center gap-2">
                      {ev.type !== "reply" && ev.inquiryId && (
                        <button
                          className="text-xs px-3 py-1.5 rounded-lg bg-indigo-900/20 text-indigo-300 border border-indigo-700/40 hover:bg-indigo-900/30 transition-colors flex items-center gap-1"
                          onClick={() => {
                            setReplySubject(`Re: ${ev.subject || activeEmail}`);
                            setReplyMessage("");
                            (window as any)._nxl_reply_to = ev.inquiryId;
                            (window as any)._nxl_attachments = [];
                          }}
                        >
                          <MessageSquare className="w-3 h-3" />
                          Reply
                        </button>
                      )}
                      {ev.type !== "reply" &&
                        ev.inquiryId &&
                        ev.status === "new" && (
                          <button
                            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900/20 text-slate-300 border border-slate-700/40 hover:bg-slate-900/30 transition-colors flex items-center gap-1"
                            onClick={async () => {
                              await api.patch(
                                `/inquiries/${ev.inquiryId}/mark-read`,
                                {}
                              );
                              if (activeEmail) await openThread(activeEmail);
                              await load();
                            }}
                          >
                            <CheckCircle className="w-3 h-3" />
                            Mark read
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {/* Floating Compose Button - Only show when minimized */}
          {threadEvents &&
            threadEvents.length > 0 &&
            replyComposerMinimized && (
              <div className="fixed bottom-6 right-6 z-50">
                <button
                  onClick={() => setReplyComposerMinimized(false)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-700 dark:to-purple-700 dark:hover:from-indigo-800 dark:hover:to-purple-800 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center gap-2 border border-indigo-500/50 dark:border-indigo-600/50 backdrop-blur-sm"
                  title="Open Reply Composer"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-medium">Reply</span>
                </button>
              </div>
            )}

          {/* Enhanced Reply Composer */}
          {threadEvents &&
            threadEvents.length > 0 &&
            !replyComposerMinimized && (
              <div
                className="flex-shrink-0 border-t border-slate-200/50 dark:border-slate-700/50 p-4 bg-gradient-to-r from-slate-100/90 via-white/80 to-slate-50/90 dark:from-slate-800/90 dark:via-slate-900/80 dark:to-slate-800/90 backdrop-blur-sm resize-y overflow-hidden relative rounded-b-2xl"
                style={{ height: `${composerHeight}px` }}
              >
                {/* Resize Handle */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 cursor-ns-resize"
                  onMouseDown={(e) => {
                    const startY = e.clientY;
                    const startHeight = composerHeight;

                    const handleMouseMove = (e: MouseEvent) => {
                      const newHeight = Math.max(
                        200,
                        Math.min(800, startHeight - (e.clientY - startY))
                      );
                      setComposerHeight(newHeight);
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener(
                        "mousemove",
                        handleMouseMove
                      );
                      document.removeEventListener("mouseup", handleMouseUp);
                    };

                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);
                  }}
                />
                <div className="space-y-4 h-full overflow-y-auto pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <MessageSquare className="w-4 h-4" />
                      <span>Reply to latest message</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFormCollapsed(!formCollapsed)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
                      >
                        {formCollapsed ? (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Show Details
                          </>
                        ) : (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Hide Details
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setReplyComposerMinimized(true)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
                        title="Minimize Reply Composer"
                      >
                        <X className="w-3 h-3" />
                        Minimize
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Form Fields */}
                  {!formCollapsed && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      {/* Admin Name - Read Only */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          From:
                        </label>
                        <Input
                          className="bg-slate-800/50 border-slate-700 text-slate-300 text-base h-12 px-4"
                          value={adminName || "Admin"}
                          readOnly
                          disabled
                        />
                        <p className="text-xs text-slate-500">
                          Auto-filled from your account
                        </p>
                      </div>

                      {/* Subject */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Subject:
                        </label>
                        <Input
                          placeholder="Enter reply subject..."
                          value={replySubject}
                          onChange={(e) => setReplySubject(e.target.value)}
                          className="text-base h-12 px-4"
                        />
                      </div>
                    </div>
                  )}

                  {/* Text Formatting Tools */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300">
                        Message:
                      </label>
                      <div className="text-xs text-slate-500">
                        {replyMessage.length} characters
                      </div>
                    </div>

                    <div className="w-full border border-slate-700 rounded-lg bg-slate-800/30 relative">
                      {/* Enhanced Formatting Toolbar */}
                      <div className="flex items-center gap-1 p-2 border-b border-slate-700 flex-wrap">
                        {/* Text Style */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                            onClick={() => applyFormatting("bold")}
                            title="Bold"
                          >
                            <Bold className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                            onClick={() => applyFormatting("italic")}
                            title="Italic"
                          >
                            <Italic className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                            onClick={() => applyFormatting("underline")}
                            title="Underline"
                          >
                            <Underline className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                            onClick={() => applyFormatting("strikethrough")}
                            title="Strikethrough"
                          >
                            <Strikethrough className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="w-px h-6 bg-slate-600 mx-1" />

                        {/* Alignment */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${
                              textFormatting.align === "left"
                                ? "bg-slate-600"
                                : ""
                            }`}
                            onClick={() =>
                              setTextFormatting((prev) => ({
                                ...prev,
                                align: "left",
                              }))
                            }
                            title="Align Left"
                          >
                            <AlignLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${
                              textFormatting.align === "center"
                                ? "bg-slate-600"
                                : ""
                            }`}
                            onClick={() =>
                              setTextFormatting((prev) => ({
                                ...prev,
                                align: "center",
                              }))
                            }
                            title="Align Center"
                          >
                            <AlignCenter className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${
                              textFormatting.align === "right"
                                ? "bg-slate-600"
                                : ""
                            }`}
                            onClick={() =>
                              setTextFormatting((prev) => ({
                                ...prev,
                                align: "right",
                              }))
                            }
                            title="Align Right"
                          >
                            <AlignRight className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="w-px h-6 bg-slate-600 mx-1" />

                        {/* Additional Formatting */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                            onClick={() => applyFormatting("code")}
                            title="Code"
                          >
                            <Code className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                            onClick={() => applyFormatting("quote")}
                            title="Quote"
                          >
                            <Quote className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                            onClick={() => applyFormatting("link")}
                            title="Link"
                          >
                            <Link className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                            onClick={() => setShowImageDialog(true)}
                            title="Insert Image"
                          >
                            <Image className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="w-px h-6 bg-slate-600 mx-1" />

                        {/* List Tools */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                            onClick={() => {
                              const start = textareaRef?.selectionStart || 0;
                              const end = textareaRef?.selectionEnd || 0;
                              const text = replyMessage;
                              const selectedText = text.substring(start, end);
                              const before = text.substring(0, start);
                              const after = text.substring(end);
                              const listText = selectedText
                                ? `- ${selectedText}`
                                : `- `;
                              const newText = before + listText + after;
                              setReplyMessage(newText);
                              setTimeout(() => {
                                textareaRef?.focus();
                                textareaRef?.setSelectionRange(
                                  start + listText.length,
                                  start + listText.length
                                );
                              }, 0);
                            }}
                            title="Bullet List"
                          >
                            <List className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                            onClick={() => {
                              const start = textareaRef?.selectionStart || 0;
                              const end = textareaRef?.selectionEnd || 0;
                              const text = replyMessage;
                              const selectedText = text.substring(start, end);
                              const before = text.substring(0, start);
                              const after = text.substring(end);
                              const listText = selectedText
                                ? `1. ${selectedText}`
                                : `1. `;
                              const newText = before + listText + after;
                              setReplyMessage(newText);
                              setTimeout(() => {
                                textareaRef?.focus();
                                textareaRef?.setSelectionRange(
                                  start + listText.length,
                                  start + listText.length
                                );
                              }, 0);
                            }}
                            title="Numbered List"
                          >
                            <ListOrdered className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Message Textarea with Send Button */}
                      <div className="relative w-full">
                        <Textarea
                          ref={setTextareaRef}
                          placeholder="Write your reply here... (Use the formatting tools above for bold, italic, underline, and alignment)"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-3 text-sm resize-none border-0 bg-transparent focus:ring-0 text-slate-100 text-base leading-relaxed min-h-[120px] pr-16"
                          style={{
                            fontWeight: textFormatting.bold ? "bold" : "normal",
                            fontStyle: textFormatting.italic
                              ? "italic"
                              : "normal",
                            textDecoration: textFormatting.underline
                              ? "underline"
                              : "none",
                            textAlign: textFormatting.align,
                          }}
                        />

                        {/* Send Button inside textarea */}
                        <button
                          onClick={async () => {
                            if (!activeEmail || !replySubject || !replyMessage)
                              return;
                            try {
                              setSendingThreadReply(true);
                              const inquiryId =
                                (window as any)._nxl_reply_to || undefined;
                              await api.post(`/inquiries/threads/reply`, {
                                email: activeEmail,
                                subject: replySubject,
                                message: replyMessage,
                                fromName: adminName || "Admin",
                                note:
                                  notesByEmail[activeEmail.toLowerCase()] || "",
                                attachments: attachments,
                                ...(inquiryId ? { inquiryId } : {}),
                              });
                              (window as any)._nxl_reply_to = undefined;
                              setReplyMessage("");
                              setReplySubject("");
                              setAttachments([]);
                              setAttachmentPreviews([]);
                              await openThread(activeEmail);
                              await load();
                              success?.("Reply sent successfully! 🎉");
                            } catch (e: any) {
                              error?.(
                                e.response?.data?.error ||
                                  "Failed to send reply"
                              );
                            } finally {
                              setSendingThreadReply(false);
                            }
                          }}
                          disabled={sendingThreadReply || !replyMessage.trim()}
                          className="absolute bottom-3 right-3 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Send Reply"
                        >
                          {sendingThreadReply ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <Send className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* File Attachments */}
                  <div className="space-y-2 mb-0">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        Attachments:
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                      />
                      <label
                        htmlFor="file-upload"
                        className="text-sm px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800/70 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Paperclip className="w-4 h-4" />
                        Add Files
                      </label>
                    </div>

                    {/* Attachment Previews */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg border border-slate-700/50"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-700/50">
                              {attachment.contentType.startsWith("image/") ? (
                                <Image className="w-4 h-4 text-blue-400" />
                              ) : attachment.contentType.includes("pdf") ? (
                                <FileText className="w-4 h-4 text-red-400" />
                              ) : (
                                <Download className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <span className="text-xs text-slate-300 flex-1 truncate">
                              {attachment.filename}
                            </span>
                            {attachment.preview && (
                              <img
                                src={attachment.preview}
                                alt="Preview"
                                className="w-8 h-8 object-cover rounded"
                              />
                            )}
                            <button
                              onClick={() => removeAttachment(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>

      {/* Image Insert Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <DialogTitle>
                <Image className="w-5 h-5" />
                Insert Image
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {/* File Upload Option */}
            <div>
              <label className="text-sm font-medium text-slate-300">
                Upload Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer cursor-pointer"
              />
              {imageFile && (
                <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  Selected: {imageFile.name}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-slate-800 text-slate-400">OR</span>
              </div>
            </div>

            {/* URL Option */}
            <div>
              <label className="text-sm font-medium text-slate-300">
                Image URL
              </label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageFile(null); // Clear file when URL is entered
                }}
                className="mt-1"
                disabled={!!imageFile}
              />
            </div>

            <div className="text-xs text-slate-500">
              Upload a local image file or enter an image URL. Images will be
              optimized and displayed in the message.
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImageDialog(false);
                setImageUrl("");
                setImageFile(null);
              }}
              disabled={uploadingImage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImageUpload}
              disabled={(!imageUrl.trim() && !imageFile) || uploadingImage}
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Insert Image"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SeenBy Details Dialog */}
      <Dialog open={!!selectedInquiryForSeenBy} onOpenChange={(v) => !v && setSelectedInquiryForSeenBy(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Inquiry Seen History
                </DialogTitle>
              </div>
              <button
                onClick={() => setSelectedInquiryForSeenBy(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                title="Close"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
              </button>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            {selectedInquiryForSeenBy && (
              <>
                {/* Inquiry Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <img
                      src={getProfilePictureUrl(selectedInquiryForSeenBy.email)}
                      alt={`${selectedInquiryForSeenBy.name} avatar`}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border border-white/20 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border border-white/20 hidden">
                      <span className="text-white font-bold text-lg">
                        {(selectedInquiryForSeenBy.name || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {selectedInquiryForSeenBy.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {selectedInquiryForSeenBy.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {selectedInquiryForSeenBy.count} messages
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Status: {selectedInquiryForSeenBy.latest.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {selectedInquiryForSeenBy.latest.subject && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Latest Subject: {selectedInquiryForSeenBy.latest.subject}
                      </p>
                    </div>
                  )}
                </div>

                {/* Seen By List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    Seen by Staff Members ({Array.isArray(seenBy[selectedInquiryForSeenBy.email?.toLowerCase() || ""]) ? seenBy[selectedInquiryForSeenBy.email.toLowerCase()].length : 0})
                  </h4>
                  
                  {Array.isArray(seenBy[selectedInquiryForSeenBy.email?.toLowerCase() || ""]) && seenBy[selectedInquiryForSeenBy.email.toLowerCase()].length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {seenBy[selectedInquiryForSeenBy.email.toLowerCase()]
                        .sort((a: any, b: any) => {
                          const dateA = typeof a === 'object' && a.seenAt ? new Date(a.seenAt).getTime() : 0;
                          const dateB = typeof b === 'object' && b.seenAt ? new Date(b.seenAt).getTime() : 0;
                          return dateB - dateA; // Most recent first
                        })
                        .map((entry: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-sm">
                                  {(typeof entry === 'object' ? entry.agentName : entry).charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white text-sm">
                                  {typeof entry === 'object' ? entry.agentName : entry}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Viewed this inquiry
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {typeof entry === 'object' && entry.seenAt ? 
                                  new Date(entry.seenAt).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : 'Unknown date'
                                }
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {typeof entry === 'object' && entry.seenAt ? 
                                  new Date(entry.seenAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : ''
                                }
                              </p>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No staff members have viewed this inquiry yet.</p>
                    </div>
                  )}
                </div>

                {/* Additional Inquiry Details */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Inquiry Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Created:</span>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedInquiryForSeenBy.latest.createdAt ? 
                          new Date(selectedInquiryForSeenBy.latest.createdAt).toLocaleString() : 
                          'Unknown'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Last Activity:</span>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedInquiryForSeenBy.lastAt ? 
                          new Date(selectedInquiryForSeenBy.lastAt).toLocaleString() : 
                          'Unknown'
                        }
                      </p>
                    </div>
                    {selectedInquiryForSeenBy.latest.phone && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {selectedInquiryForSeenBy.latest.phone}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Status:</span>
                      <p className="font-medium text-slate-900 dark:text-white capitalize">
                        {selectedInquiryForSeenBy.latest.status}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInquiryForSeenBy(null)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (selectedInquiryForSeenBy) {
                  openThread(selectedInquiryForSeenBy.email);
                  setSelectedInquiryForSeenBy(null);
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              View Full Thread
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
