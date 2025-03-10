"use client";

import { useState } from "react";
import { Upload, Download, FileUp, ChevronLeft, ChevronRight, X } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Interfaces define the structure of objects. Variable names and their types
interface Flashcard {
  front: string;
  back?: string; // Make back optional for cloze cards
  type: "basic" | "cloze"; // Add type field
}

interface FlashcardPage {
  flashcards: Flashcard[];
}

export default function Home() {
  // Here the type for file is set to either File or null. Initially, it is null.
  // setFile represents the hook that will be used to update the file state.
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  // Type for flashcardPages is set to an array of FlashcardPage objects. Initially, it is an empty array.
  const [flashcardPages, setFlashcardPages] = useState<FlashcardPage[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [pageGroup, setPageGroup] = useState(0);
  const [cardType, setCardType] = useState<"basic" | "cloze">("basic");
  const [activeTab, setActiveTab] = useState<"flashcards" | "vision">("flashcards");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  // This function takes an event as an argument, explicitly types as an event triggered by a change on an HTML input element, such as when a file is selected.
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(file => file.type === "application/pdf");
    if (validFiles.length > 0) {
      setFile(validFiles[0]);
      setError(null);
      setDownloadUrl(null);
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(file => file.type === "image/jpeg");
    if (validFiles.length > 0) {
      setImages(prevImages => [...prevImages, ...validFiles]);
      setError(null);
      const previews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...previews]);
    } else {
      setError("Please select valid JPG images");
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    const updatedPreviews = [...imagePreviews];
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setImages(updatedImages);
    setImagePreviews(updatedPreviews);
  };

  // Called after the user clicks the "Convert to Flashcards" button
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("cardType", cardType);

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

  const handleImageUpload = async () => {
    if (images.length === 0) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    // const base64Images = await Promise.all(images.map(file => {
    //   return new Promise<string>((resolve, reject) => {
    //   const reader = new FileReader();
    //   reader.onloadend = () => {
    //     const result = reader.result as string;
    //     const base64String = result.split(",")[1]; // Extract only the base64 part
    //     resolve(base64String);
    //   };
    //   reader.onerror = reject;
    //   reader.readAsDataURL(file);
    //   });
    // }));

    images.forEach((file) => {
      formData.append("images", file); // Directly send the File object
    });
    formData.append("cardType", cardType);

    // console.log("Base64 Image [0]:", base64Images[0]); // View first image
    // console.log("Base64 Length:", base64Images[0]?.length || "Empty!");

    // formData.append("images", JSON.stringify(base64Images));
    // formData.append("cardType", cardType);

    // Log form data for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/process_images",
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
      setError("An error occurred while processing your images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditFlashcard = (pageIndex: number, cardIndex: number, field: 'front' | 'back' | 'type', value: string) => {
    const updatedPages = [...flashcardPages];
    updatedPages[pageIndex].flashcards[cardIndex][field] = value as "basic" | "cloze";
    setFlashcardPages(updatedPages);
  };

  const handleDeleteFlashcard = (pageIndex: number, cardIndex: number) => {
    const updatedPages = [...flashcardPages];
    updatedPages[pageIndex].flashcards.splice(cardIndex, 1);
    setFlashcardPages(updatedPages);
  };

  const handleGenerateImportFile = async () => { 
    const newFormData = new FormData();
    newFormData.append("flashcardPages", JSON.stringify(flashcardPages));
    newFormData.append("cardType", cardType);

    try {
      const response = await axios.post(
        "https://roshanankix.pythonanywhere.com/import_file",
        newFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-start justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-left space-y-4">
          <div className="flex justify-center">
            <FileUp className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Anki-X v0.0.3</h1>
          <p className="text-muted-foreground">
            Update: You can now generate basic + cloze cards! Upload a PDF (Up to 100 pages) or JPG images, edit your flashcards, and generate an Anki import file! Flashcards are created based on <a href="https://www.supermemo.com/en/blog/twenty-rules-of-formulating-knowledge" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">SuperMemo's principles</a> for flashcard creation. Each page is processed using the o3-mini model (arguably the top reasoning model as of today). Tell me how I can make this service better so that you'll actually want to use it! Email: RoshanAnkiX@gmail.com | Reddit: __01000010
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center space-x-4">
            <Button onClick={() => setActiveTab("flashcards")} className={activeTab === "flashcards" ? "bg-primary text-white" : ""}>
              Flashcards
            </Button>
            <Button onClick={() => setActiveTab("vision")} className={activeTab === "vision" ? "bg-primary text-white" : ""}>
              Visual AI Cards
            </Button>
          </div>

          {activeTab === "flashcards" && (
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
                <div className="flex flex-col space-y-2 mt-4">
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as "basic" | "cloze")}
                    className="w-full p-2 border rounded mb-2"
                  >
                    <option value="basic">Basic</option>
                    <option value="cloze">Cloze</option>
                  </select>
                  <div className="flex space-x-2">
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
                        {card.back && (
                        <input
                          type="text"
                          value={card.back}
                          onChange={(e) => handleEditFlashcard(selectedPage, cardIndex, 'back', e.target.value)}
                          className="w-full p-2 border rounded mb-2"
                          placeholder="Back"
                        />
                        )}
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
          )}

          {activeTab === "vision" && (
            <div className="flex flex-col items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="w-full cursor-pointer"
              >
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <span className="mt-4 block text-sm text-muted-foreground">
                    {images.length > 0 ? `${images.length} image(s) selected` : "Drop your JPG images here or click to browse"}
                  </span>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept=".jpg, .jpeg"
                  onChange={handleImageChange}
                  className="hidden"
                  multiple
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

              {imagePreviews.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h2 className="text-lg font-bold">Image Previews</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-auto" />
                        <Button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-0 right-0 bg-destructive text-white p-1 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {images.length > 0 && !isUploading && (
                <div className="flex flex-col space-y-2 mt-4">
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as "basic" | "cloze")}
                    className="w-full p-2 border rounded mb-2"
                  >
                    <option value="basic">Basic</option>
                    <option value="cloze">Cloze</option>
                  </select>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleImageUpload}
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
                        {card.back && (
                        <input
                          type="text"
                          value={card.back}
                          onChange={(e) => handleEditFlashcard(selectedPage, cardIndex, 'back', e.target.value)}
                          className="w-full p-2 border rounded mb-2"
                          placeholder="Back"
                        />
                        )}
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
          )}
        </div>
      </div>
    </div>
  );
}