"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, X, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "./toast";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  supportedFormats?: string[];
  loading?: boolean;
}

export function FileUpload({
  onUpload,
  accept = ".csv,.xlsx,.xls",
  maxSize = 5, // 5MB default
  supportedFormats = ["CSV", "Excel"],
  loading = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        variant: "error",
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
      });
      return false;
    }

    // Check file type
    const validExtensions = accept.split(',').map(ext => ext.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        variant: "error",
        title: "Invalid file type",
        description: `Please upload a ${supportedFormats.join(' or ')} file`,
      });
      return false;
    }

    return true;
  }, [accept, maxSize, supportedFormats, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, [validateFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, [validateFile]);

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onUpload(selectedFile);
        setSelectedFile(null);
        toast({
          title: "Upload successful",
          description: "File has been processed successfully",
        });
      } catch (error) {
        toast({
          variant: "error",
          title: "Upload failed",
          description: error instanceof Error ? error.message : "An error occurred during upload",
        });
      }
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            isDragOver
              ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
              : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <motion.div
            animate={{ scale: isDragOver ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="space-y-4"
          >
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              isDragOver ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-100 dark:bg-slate-800"
            }`}>
              <Upload className={`w-8 h-8 ${
                isDragOver ? "text-blue-600" : "text-slate-400"
              }`} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {isDragOver ? "Drop your file here" : "Upload subscriber file"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Supports {supportedFormats.join(", ")} • Max {maxSize}MB
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatFileSize(selectedFile.size)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">File ready for upload</span>
                </div>
              </div>
            </div>
            <button
              onClick={clearSelection}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <AlertCircle className="w-4 h-4" />
                Existing subscribers with same email will be updated
              </div>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload File
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}