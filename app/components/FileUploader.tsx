"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, File, X, FileText, Image, Music } from "lucide-react";
import { Button } from "./Button";

interface FileUploaderProps {
  onFilesSelected?: (files: File[]) => void;
  onUpload?: () => void;
  isUploading?: boolean;
}

const allowedTypes = [
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "audio/mpeg",
  "audio/wav",
  "audio/mp3",
];

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("audio/")) return Music;
  return FileText;
};

export function FileUploader({
  onFilesSelected,
  onUpload,
  isUploading = false,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      allowedTypes.some((type) => file.type === type || file.name.endsWith(".pdf") || file.name.endsWith(".txt") || file.name.endsWith(".mp3") || file.name.endsWith(".wav"))
    );

    setFiles((prev) => [...prev, ...droppedFiles]);
    onFilesSelected?.(droppedFiles);
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
    onFilesSelected?.(selectedFiles);
  }, [onFilesSelected]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-2xl border-2 border-dashed p-12 transition-all duration-300",
          "flex flex-col items-center justify-center text-center",
          isDragging
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
            : "border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600",
          "bg-slate-50/50 dark:bg-slate-900/50"
        )}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.txt,.jpg,.jpeg,.png,.mp3,.wav"
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
            isDragging
              ? "bg-blue-100 dark:bg-blue-900/30"
              : "bg-slate-100 dark:bg-slate-800"
          )}
        >
          <Upload
            className={cn(
              "h-8 w-8 transition-colors duration-300",
              isDragging
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-400 dark:text-slate-500"
            )}
          />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Drop files here
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          or click to browse
        </p>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          PDF, TXT, JPG, PNG, MP3, WAV up to 50MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Selected files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3",
                    "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                    "transition-all duration-200"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              );
            })}
          </div>
          <Button
            onClick={onUpload}
            isLoading={isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? "Processing..." : "Upload & Process Evidence"}
          </Button>
        </div>
      )}
    </div>
  );
}
