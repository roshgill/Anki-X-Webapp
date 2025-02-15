"use client";

import { useState } from "react";
import { Upload, Download, FileUp } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
      setDownloadUrl(null);
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("pdf", file); // Ensure the key matches the curl command

    // Log form data for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await axios.post(
        "https://ankix.pythonanywhere.com/upload",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 100)
            );
            setProgress(percentCompleted);
          },
        }
      );
      const url = URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("An error occurred while processing your file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FileUp className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Convert Your PDF into Anki Flashcards</h1>
          <p className="text-muted-foreground">
            Upload a PDF, get an Anki import file, and start reviewing
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="w-full cursor-pointer"
            >
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <span className="mt-4 block text-sm text-muted-foreground">
                  {file ? file.name : "Drop your PDF here or click to browse"}
                </span>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {error && (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            )}

            {isUploading && (
              <div className="w-full mt-4 space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Processing... (This takes a minute)
                </p>
              </div>
            )}

            {file && !isUploading && (
              <Button
                onClick={handleUpload}
                className="mt-4"
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Convert to Flashcards
              </Button>
            )}

            {downloadUrl && (
              <a
                href={downloadUrl}
                className="mt-4 inline-flex items-center text-primary hover:underline"
                download
              >
                <Download className="mr-2 h-4 w-4" />
                Download Flashcards
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}