"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // Radix for accessibility

interface UploadProps {
  onUpload: (file: File) => Promise<string | null>;
  accept?: string;
  maxSize?: number;
}

export function Upload({ onUpload, accept, maxSize }: UploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false); // State for copy success message
  const [isDragging, setIsDragging] = useState(false); // State for drag highlight
  const dropRef = useRef<HTMLDivElement>(null); // Ref for drop area

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    // Reset state
    setError(null);
    setUploadedUrl(null);

    // Check file size
    if (maxSize && file.size > maxSize) {
      setError(`文件大小不能超过 ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    try {
      setIsUploading(true);
      const fileId = await onUpload(file);
      if (fileId) {
        setUploadedUrl(fileId);
      }
    } catch (error) {
      console.error("文件上传失败:", error);
      setError("上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Validate file type if accept is specified
      if (
        accept &&
        !accept.split(",").some((type) => file.type.match(type.trim()))
      ) {
        setError(`不支持的文件格式，仅支持 ${accept.replace("image/", "")}`);
        return;
      }
      handleFileChange(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file || null);
  };

  const handleCopyUrl = () => {
    if (!uploadedUrl) return;

    try {
      navigator.clipboard.writeText(uploadedUrl);
      setShowCopySuccess(true);
    } catch (err) {
      console.error("复制失败:", err);
      alert("复制失败，请手动复制链接");
    }
  };

  // Hide copy success message after 1 second
  useEffect(() => {
    if (showCopySuccess) {
      const timer = setTimeout(() => {
        setShowCopySuccess(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showCopySuccess]);

  return (
    <div className="space-y-2">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="file-upload">选择图片</Label>
        <div
          ref={dropRef}
          className={`flex flex-col items-center justify-center w-full h-40 max-md:h-30 border-2 border-dashed rounded-md transition-colors
            ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
            } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!isUploading && !uploadedUrl ? (
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
            >
              <UploadCloud className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400 select-none">
                {isDragging ? "释放文件以上传" : "点击或拖拽上传图片"}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 select-none">
                {accept ? `支持格式: ${accept.replace("image/", "")}` : ""}
                {maxSize
                  ? ` (最大 ${(maxSize / 1024 / 1024).toFixed(1)}MB)`
                  : ""}
              </span>
              <VisuallyHidden.Root>
                <Input
                  id="file-upload"
                  type="file"
                  accept={accept}
                  onChange={handleInputChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </VisuallyHidden.Root>
            </label>
          ) : isUploading ? (
            <div className="flex flex-col items-center justify-center select-none">
              <div className="w-8 h-8 border-2 border-t-transparent border-blue-500 rounded-full animate-spin mb-2"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                上传中...
              </span>
            </div>
          ) : uploadedUrl ? (
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center mb-2">
                <Check className="w-5 h-5 text-green-500 mr-1" />
                <span className="text-sm text-green-500 select-none">
                  上传成功
                </span>
              </div>
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs truncate max-w-[80%]">
                        {uploadedUrl}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{uploadedUrl}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-1"
                    onClick={handleCopyUrl}
                    title=""
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500 hover:text-blue-500"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </Button>
                  {showCopySuccess && (
                    <span className="absolute top-[50%] -translate-y-[50%] whitespace-nowrap p-1 rounded-md bg-primary ml-2 text-xs text-primary-foreground animate-fade-in">
                      复制成功
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 select-none"
                onClick={() => setUploadedUrl(null)}
              >
                重新上传
              </Button>
            </div>
          ) : null}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
