import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { niceBytes } from "@/helpers/upload";

interface ImageFile {
  file: File;
  url: string;
  name: string;
  size: number;
  isPrimary?: boolean;
  id: string;
}

interface ExistingImage {
  url: string;
  isPrimary: boolean;
  id?: string;
}

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  onDeleteImage?: (index: number) => void;
  onSetPrimaryImage?: (index: number) => void;
  existingImages?: ExistingImage[];
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  onDeleteImage,
  onSetPrimaryImage,
  existingImages = [],
  className,
}) => {
  // Track uploaded images locally
  const [images, setImages] = useState<ImageFile[]>(() => {
    return existingImages.map((img) => ({
      url: img.url,
      name: img.url.split("/").pop() || "image.jpg",
      size: 0,
      isPrimary: img.isPrimary,
      id: img.id || img.url,
      file: new File([], img.url.split("/").pop() || "image.jpg"),
    }));
  });
  
  // Upload progress simulation
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadingFileSize, setUploadingFileSize] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload from input
  const handleFileUpload = (files: FileList | File[]) => {
    if (!files.length) return;
    
    const filesArray = Array.from(files);
    
    // Start upload simulation
    setUploadProgress(0);
    setUploadingFile(filesArray[0].name);
    setUploadingFileSize(filesArray[0].size);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev !== null && prev < 100) {
          return prev + 10;
        } else {
          clearInterval(interval);
          
          // Process files after upload "completes"
          processUploadedFiles(filesArray);
          
          // Reset upload state
          setUploadingFile(null);
          setUploadingFileSize(null);
          
          return null;
        }
      });
    }, 100);
  };
  
  // Process files after upload
  const processUploadedFiles = (files: File[]) => {
    // Create new image objects
    const newImages: ImageFile[] = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: Math.round(file.size / 1024),
      isPrimary: images.length === 0 && files.indexOf(file) === 0,
      id: `${Date.now()}-${file.name}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    
    // Replace existing images with new ones
    setImages(newImages);
    
    // Notify parent of new files
    onImagesChange(files);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle deleting an image
  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Call parent's delete handler if provided
    if (onDeleteImage) {
      onDeleteImage(index);
    }
    
    // Update local state
    const newImages = [...images];
    
    // Revoke the blob URL to prevent memory leaks
    if (newImages[index].url.startsWith("blob:")) {
      URL.revokeObjectURL(newImages[index].url);
    }
    
    // Remove the image
    newImages.splice(index, 1);
    
    // Update primary image if needed
    if (newImages.length > 0 && images[index].isPrimary) {
      newImages[0].isPrimary = true;
    }
    
    setImages(newImages);
    
    // Update parent if no onDeleteImage was provided
    if (!onDeleteImage) {
      const remainingFiles = newImages.map(img => img.file);
      onImagesChange(remainingFiles);
    }
  };

  // Set an image as primary
  const setPrimaryImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Update local state
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(newImages);
    
    // Call parent handler if provided
    if (onSetPrimaryImage) {
      onSetPrimaryImage(index);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className="border border-dashed border-[#E9EAEB] rounded-xl p-6 flex flex-col items-center justify-center bg-white cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center mb-3 border border-[#E9EAEB]">
          <Image
            src="/images/upload-icon.svg"
            alt="Upload"
            width={24}
            height={24}
          />
        </div>
        <div className="text-center">
          <span className="text-[#2970ff] font-semibold">Click to upload</span>
          <span className="text-[#535862]"> or drag and drop</span>
        </div>
        <p className="text-xs text-[#535862] mt-1">
          PNG and JPG (max. 800×800px) up to 5MB.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      {/* Upload Progress */}
      {uploadProgress !== null && uploadingFile && (
        <div className="flex items-center p-4 bg-white border border-[#E9EAEB] rounded-xl shadow-sm w-full">
          <div className="flex items-center gap-3 w-full">
            {/* File Type Icon */}
            <div className="flex-shrink-0">
              <div className="relative w-8 h-8">
                <Image
                  src="/images/file-page-bg.svg"
                  alt="File"
                  width={32}
                  height={32}
                />
                <div className="absolute bottom-0 right-0 bg-[#2970FF] rounded px-1 py-0.5 text-[10px] font-bold text-white">
                  JPG
                </div>
              </div>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[#414651] truncate">
                  {uploadingFile}
                </p>
              </div>
              <p className="text-xs text-[#535862]">
                {niceBytes(uploadingFileSize as number)}
              </p>
              <div className="w-full bg-[#E9EAEB] rounded-full h-2 mt-3">
                <div
                  className="bg-[#2970FF] h-2 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex items-center p-4 bg-white border border-[#E9EAEB] rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                {/* File Type Icon */}
                <div className="flex-shrink-0">
                  <div className="relative w-8 h-8">
                    <Image
                      src="/images/file-page-bg.svg"
                      alt="File"
                      width={32}
                      height={32}
                    />
                    <div className="absolute bottom-0 right-0 bg-[#2970FF] rounded px-1 py-0.5 text-[10px] font-bold text-white">
                      JPG
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#414651] truncate">
                      {image.name}
                    </p>
                    {image.isPrimary && (
                      <div className="bg-[#E9F1FF] rounded px-2 py-0.5 flex items-center gap-1">
                        <Image
                          src="/images/primary-star.svg"
                          alt="Primary"
                          width={12}
                          height={12}
                        />
                        <span className="text-xs text-[#2970FF]">Primary</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#535862]">{image.size} KB</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 justify-center items-center ml-auto">
                <button
                  onClick={(e) => setPrimaryImage(index, e)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center cursor-pointer mr-0 ${
                    image.isPrimary
                      ? "bg-[#2970FF] shadow-sm"
                      : "border border-[#D5D7DA]"
                  }`}
                  aria-label="Set as primary"
                  type="button"
                >
                  {image.isPrimary && (
                    <span className="bg-white h-[7px] w-[7px] rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={(e) => handleDelete(index, e)}
                  className="text-[#FF5F5F]"
                  aria-label="Delete"
                  type="button"
                >
                  <Image
                    src="/images/trash-icon.svg"
                    alt="Delete"
                    width={20}
                    height={20}
                    objectFit="contain"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
