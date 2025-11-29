"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface RestoredImage {
  url: string;
  width: number;
  height: number;
}

interface RestoreResponse {
  success: boolean;
  data?: {
    images: RestoredImage[];
    prompt: string;
  };
  error?: string;
}

interface VideoResponse {
  success: boolean;
  data?: {
    video: {
      url: string;
    };
  };
  error?: string;
}

export default function PhotoRestorer() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    setError(null);
    setIsUploading(true);
    setRestoredImage(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to FAL storage
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload image");
      }

      // Store the uploaded URL for restoration
      setOriginalImage(uploadResult.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setOriginalImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestore = async () => {
    if (!originalImage) return;

    setIsRestoring(true);
    setError(null);

    try {
      const response = await fetch("/api/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: originalImage,
          prompt: prompt || undefined,
        }),
      });

      const result: RestoreResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to restore photo");
      }

      if (result.data?.images && result.data.images.length > 0) {
        setRestoredImage(result.data.images[0].url);
      } else {
        throw new Error("No restored image received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore photo");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!restoredImage) return;

    setIsGeneratingVideo(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: restoredImage,
          prompt: videoPrompt || undefined,
          duration: "5",
        }),
      });

      const result: VideoResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to generate video");
      }

      if (result.data?.video?.url) {
        setGeneratedVideo(result.data.video.url);
      } else {
        throw new Error("No video URL received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate video");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        // Create a file list containing the dropped file
        const fileList = files as FileList;
        const mockEvent = {
          target: { files: fileList },
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(mockEvent);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-6xl mx-auto p-6 flex-1">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* <Image
            src="/buildclub-long.png"
            alt="BuildClub"
            width={120}
            height={40}
            className="h-10 w-auto"
          /> */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            RestoreFlow
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Transform your old black and white photos into vibrant, modern images and bring them to life with AI video generation
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Restore → Enhance → Animate with cutting-edge AI models
        </p>
      </div>

      {/* Upload Area */}
      {!originalImage && (
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-4">
            <div className="text-6xl">📸</div>
            <div>
              <p className="text-lg font-medium">
                {isUploading ? "Uploading..." : "Drop your photo here or click to select"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Supports JPG, PNG, and other image formats
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Custom Prompt Input */}
      {originalImage && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Custom Restoration Prompt (Optional)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., 'Restore this vintage family photo with warm, natural colors and enhance the clothing details'"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            rows={3}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Leave empty to use the default restoration prompt
          </p>
        </div>
      )}

      {/* Image Comparison */}
      {originalImage && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Original Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Original Photo</h3>
            <div className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={originalImage}
                alt="Original photo"
                width={400}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <button
                           onClick={() => {
               setOriginalImage(null);
               setRestoredImage(null);
               setGeneratedVideo(null);
               setPrompt("");
               setVideoPrompt("");
               setError(null);
             }}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Upload different photo
            </button>
          </div>

          {/* Restored Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Restored Photo</h3>
            <div className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 min-h-[300px] flex items-center justify-center">
              {isRestoring ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Restoring your photo...
                  </p>
                </div>
              ) : restoredImage ? (
                <Image
                  src={restoredImage}
                  alt="Restored photo"
                  width={400}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">✨</div>
                  <p>Restored photo will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

             {/* Video Generation Section */}
       {restoredImage && (
         <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border">
           <h3 className="text-xl font-semibold mb-4 text-center">🎬 Generate Video</h3>
           
           <div className="mb-4">
             <label className="block text-sm font-medium mb-2">
               Video Animation Prompt (Optional)
             </label>
             <textarea
               value={videoPrompt}
               onChange={(e) => setVideoPrompt(e.target.value)}
               placeholder="E.g., 'The person smiles gently and looks around with natural eye movements'"
               className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
               rows={2}
             />
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
               Describe how you want the photo to come to life
             </p>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <h4 className="font-medium">Restored Photo</h4>
               <div className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                 <Image
                   src={restoredImage}
                   alt="Restored photo for video"
                   width={300}
                   height={300}
                   className="w-full h-auto object-cover"
                 />
               </div>
             </div>

             <div className="space-y-4">
               <h4 className="font-medium">Generated Video</h4>
               <div className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 min-h-[200px] flex items-center justify-center">
                 {isGeneratingVideo ? (
                   <div className="text-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                     <p className="text-gray-600 dark:text-gray-300">
                       Generating video... (30-60 seconds)
                     </p>
                   </div>
                 ) : generatedVideo ? (
                   <video
                     src={generatedVideo}
                     controls
                     className="w-full h-auto rounded"
                     style={{ maxHeight: '300px' }}
                   />
                 ) : (
                   <div className="text-center text-gray-500 dark:text-gray-400">
                     <div className="text-4xl mb-2">🎬</div>
                     <p>Video will appear here</p>
                   </div>
                 )}
               </div>
             </div>
           </div>

           <div className="flex gap-4 justify-center mt-6">
             <button
               onClick={handleGenerateVideo}
               disabled={isGeneratingVideo || !restoredImage}
               className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
             >
               {isGeneratingVideo ? "Generating Video..." : "Generate Video"}
             </button>

             {generatedVideo && (
               <a
                 href={generatedVideo}
                 download="restored-video.mp4"
                 className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
               >
                 Download Video
               </a>
             )}
           </div>
         </div>
       )}

       {/* Action Buttons */}
       {originalImage && (
         <div className="flex gap-4 justify-center mt-6">
           <button
             onClick={handleRestore}
             disabled={isRestoring || isUploading}
             className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
           >
             {isRestoring ? "Restoring..." : "Restore Photo"}
           </button>

           {restoredImage && (
             <a
               href={restoredImage}
               download="restored-photo.jpg"
               className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
             >
               Download Restored Photo
             </a>
           )}
         </div>
       )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
                 </div>
       )}

       </div>
       
       {/* Footer */}
       <footer className="mt-auto py-4 border-t border-gray-200 dark:border-gray-700 text-center bg-white dark:bg-gray-900">
         <div className="text-sm text-gray-600 dark:text-gray-400">
           <div>Built using FAL AI & Next.js</div>
           {/* <div>
             Powered by{" "}
             <a 
               className="text-blue-600 hover:text-blue-800 dark:text-blue-400" 
               href="https://buildclub.ai" 
               target="_blank" 
               rel="noopener noreferrer"
             >
               Build Club
             </a>
           </div> */}
         </div>
       </footer>
     </div>
   );
 } 