"use client";

import { useState } from "react";
import { Upload, Download, FileUp, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Interfaces define the structure of objects. Variable names and their types
interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardPage {
  flashcards: Flashcard[];
}

export default function Home() {
  // Here the type for file is set to either File or null. Initially, it is null.
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  // Type for flashcardPages is set to an array of FlashcardPage objects. Initially, it is an empty array.
  const [flashcardPages, setFlashcardPages] = useState<FlashcardPage[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [pageGroup, setPageGroup] = useState(0);

  const pagesPerGroup = 3;
  const totalGroups = Math.ceil(flashcardPages.length / pagesPerGroup);

  const handlePreviousGroup = () => {
    if (pageGroup > 0) {
      setPageGroup(pageGroup - 1);
    }
  };

  const handleNextGroup = () => {
    if (pageGroup < totalGroups - 1) {
      setPageGroup(pageGroup + 1);
    }
  };

  // This function takes an event as an arguement, explicitly types as an event triggered by a change on an HTML input element, such as when a file is selected.
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
        "https://roshanankix.pythonanywhere.com/process_pdf",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setFlashcardPages(response.data);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("An error occurred while processing your file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditFlashcard = (pageIndex: number, cardIndex: number, field: 'front' | 'back', value: string) => {
    const updatedPages = [...flashcardPages];
    updatedPages[pageIndex].flashcards[cardIndex][field] = value;
    setFlashcardPages(updatedPages);
  };

  const handleDeleteFlashcard = (pageIndex: number, cardIndex: number) => {
    const updatedPages = [...flashcardPages];
    updatedPages[pageIndex].flashcards.splice(cardIndex, 1);
    setFlashcardPages(updatedPages);
  };

  const handleGenerateImportFile = async () => {
    try {
      const response = await axios.post(
        "https://roshanankix.pythonanywhere.com/process_pdf",
        { flashcardPages },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const url = URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (err) {
      console.error("Failed to generate import file:", err);
      setError("An error occurred while generating the import file. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FileUp className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Anki-X v0.0.2</h1>
          <p className="text-muted-foreground">
          Upload a PDF, edit your flashcards, and generate an Anki import file! Flashcards are created based on SuperMemo's principles for effective learning. Each page is processed using the GPT-4o model (awaiting API approval for the o1 and o3-mini models). I’d love your feedback—feel free to reach out at RoshanAnkiX@gmail.com or connect with me on Reddit to share your thoughts and suggestions!
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
              <div className="flex space-x-2 mt-4">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Convert to Flashcards
                </Button>
                <Button
                  onClick={handleGenerateImportFile}
                  disabled={isUploading}
                >
                  Generate Import File
                </Button>
              </div>
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

            {flashcardPages.length > 0 && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Button onClick={handlePreviousGroup} disabled={pageGroup === 0}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex space-x-2 overflow-x-auto">
                    {flashcardPages.slice(pageGroup * pagesPerGroup, (pageGroup + 1) * pagesPerGroup).map((_, pageIndex) => (
                      <Button
                        key={pageIndex + pageGroup * pagesPerGroup}
                        onClick={() => setSelectedPage(pageIndex + pageGroup * pagesPerGroup)}
                        className={selectedPage === pageIndex + pageGroup * pagesPerGroup ? "bg-primary text-white" : ""}
                      >
                        Page {pageIndex + 1 + pageGroup * pagesPerGroup}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={handleNextGroup} disabled={pageGroup === totalGroups - 1}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="border p-4 rounded-lg">
                  <h2 className="text-lg font-bold">Page {selectedPage + 1}</h2>
                  {flashcardPages[selectedPage].flashcards.map((card, cardIndex) => (
                    <div key={cardIndex} className="mt-2">
                      <input
                        type="text"
                        value={card.front}
                        onChange={(e) => handleEditFlashcard(selectedPage, cardIndex, 'front', e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        placeholder="Front"
                      />
                      <input
                        type="text"
                        value={card.back}
                        onChange={(e) => handleEditFlashcard(selectedPage, cardIndex, 'back', e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        placeholder="Back"
                      />
                      <Button
                        onClick={() => handleDeleteFlashcard(selectedPage, cardIndex)}
                        className="mt-2"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}