"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Download, ChevronDown, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSourceStore } from "@/store/use-agent-creation/use-source-store";
import { uploadFileToSupabase } from "@/utils/upload";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function FilesPage() {
  const {
    file: uploadedFiles,
    setFileSource,
    removeFileSource,
  } = useSourceStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      try {
        setIsUploading(true);
        const uploadedFile = await uploadFileToSupabase(file);

        setFileSource(
          uploadedFile.url,
          uploadedFile.name,
          uploadedFile.size,
          uploadedFile.type
        );

        toast.success("File uploaded successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Error uploading file");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      try {
        setIsUploading(true);
        const uploadedFile = await uploadFileToSupabase(file);

        setFileSource(
          uploadedFile.url,
          uploadedFile.name,
          uploadedFile.size,
          uploadedFile.type
        );

        toast.success("File uploaded successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Error uploading file");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDeleteFile = async (id: string, filePath: string) => {
    try {
      const supabase = createClient();
      await supabase.storage.from("files").remove([filePath]);
      removeFileSource(id);
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting file");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Files</h2>

      {/* File upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center flex flex-col items-center justify-center gap-2 ${isUploading ? "opacity-50 pointer-events-none" : ""
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Download className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {isUploading
            ? "Uploading..."
            : "Drag & drop files here, or click to select files"}
        </p>
        <p className="text-xs text-muted-foreground">
          Supported File Types: pdf, doc, docx, txt
        </p>
        <input
          type="file"
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
        />
        <label
          htmlFor="file-upload"
          className="mt-2 cursor-pointer text-primary hover:underline text-sm"
        >
          Browse files
        </label>
      </div>

      <p className="text-sm text-muted-foreground">
        If you are uploading a PDF, make sure you can select/highlight the text.
      </p>

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Files</h3>

          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between border rounded-md p-3 mb-2"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded">
                  <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{file.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {file.mimeType.split("/")[1].toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(file.fileSize / 1024).toFixed(0)} KB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  // TODO: implete delete file functionality on supabase
                  onClick={() => handleDeleteFile(file.id, file.fileUrl)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(file.fileUrl, "_blank")}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
