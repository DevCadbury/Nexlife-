"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Plus, X, AlertCircle, CheckCircle, Users } from "lucide-react";
import { useToast } from "./toast";

interface BulkEmailInputProps {
  onSubmit: (emails: string[]) => Promise<void>;
  loading?: boolean;
}

export function BulkEmailInput({ onSubmit, loading = false }: BulkEmailInputProps) {
  const [emailText, setEmailText] = useState("");
  const [validEmails, setValidEmails] = useState<string[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const processEmails = () => {
    if (!emailText.trim()) {
      toast({
        variant: "warning",
        title: "No emails provided",
        description: "Please enter at least one email address",
      });
      return;
    }

    setIsProcessing(true);

    // Split by commas, newlines, or spaces
    const emails = emailText
      .split(/[,\n\s]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const valid: string[] = [];
    const invalid: string[] = [];

    emails.forEach(email => {
      if (validateEmail(email)) {
        // Remove duplicates
        if (!valid.includes(email)) {
          valid.push(email);
        }
      } else {
        invalid.push(email);
      }
    });

    setValidEmails(valid);
    setInvalidEmails(invalid);
    setIsProcessing(false);

    if (invalid.length > 0) {
      toast({
        variant: "warning",
        title: `${invalid.length} invalid email${invalid.length > 1 ? 's' : ''} found`,
        description: "Please review and correct the invalid email addresses",
      });
    }

    if (valid.length > 0) {
      toast({
        variant: "success",
        title: `${valid.length} valid email${valid.length > 1 ? 's' : ''} processed`,
        description: "Ready to add subscribers",
      });
    }
  };

  const handleSubmit = async () => {
    if (validEmails.length === 0) {
      toast({
        variant: "error",
        title: "No valid emails",
        description: "Please add at least one valid email address",
      });
      return;
    }

    try {
      await onSubmit(validEmails);
      setEmailText("");
      setValidEmails([]);
      setInvalidEmails([]);
      toast({
        variant: "success",
        title: "Subscribers added",
        description: `Successfully processed ${validEmails.length} email${validEmails.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Failed to add subscribers",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const clearAll = () => {
    setEmailText("");
    setValidEmails([]);
    setInvalidEmails([]);
  };

  const removeValidEmail = (email: string) => {
    setValidEmails(prev => prev.filter(e => e !== email));
  };

  const addInvalidEmailBack = (email: string) => {
    setInvalidEmails(prev => prev.filter(e => e !== email));
    setEmailText(prev => {
      const newText = prev.trim();
      return newText ? `${newText}, ${email}` : email;
    });
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Bulk Add Subscribers
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Email Addresses
          </label>
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            disabled={loading}
            placeholder="Enter email addresses separated by commas, spaces, or new lines...

Example:
john@example.com, jane@company.com
user@domain.org
admin@site.net"
            className="w-full h-32 px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Separate multiple email addresses with commas, spaces, or line breaks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={processEmails}
            disabled={!emailText.trim() || isProcessing || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Validate Emails
              </>
            )}
          </button>

          {(validEmails.length > 0 || invalidEmails.length > 0) && (
            <button
              onClick={clearAll}
              disabled={loading}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              Clear All
            </button>
          )}
        </div>
      </motion.div>

      {/* Valid Emails */}
      {validEmails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800 dark:text-green-300">
                Valid Emails ({validEmails.length})
              </h4>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add {validEmails.length} Subscriber{validEmails.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {validEmails.map((email, index) => (
              <motion.div
                key={email}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm"
              >
                <span>{email}</span>
                <button
                  onClick={() => removeValidEmail(email)}
                  disabled={loading}
                  className="p-0.5 hover:bg-green-200 dark:hover:bg-green-800/50 rounded transition-colors disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Invalid Emails */}
      {invalidEmails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-800 dark:text-red-300">
              Invalid Emails ({invalidEmails.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {invalidEmails.map((email, index) => (
              <motion.div
                key={email}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm"
              >
                <span>{email}</span>
                <button
                  onClick={() => addInvalidEmailBack(email)}
                  disabled={loading}
                  className="p-0.5 hover:bg-red-200 dark:hover:bg-red-800/50 rounded transition-colors disabled:opacity-50"
                  title="Move back to input"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}