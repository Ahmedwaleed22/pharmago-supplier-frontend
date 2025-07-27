import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { niceBytes } from "@/helpers/upload";
import { useTranslation } from "@/contexts/i18n-context";

// Helper function to format filename for display
const formatDisplayName = (filename: string): string => {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // If the name is already short, return as is
  if (nameWithoutExt.length <= 20) {
    return filename;
  }
  
  // For longer names, truncate and add ellipsis
  const truncated = nameWithoutExt.substring(0, 20);
  const extension = filename.split('.').pop();
  
  return `${truncated}...${extension ? `.${extension}` : ''}`;
};

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
  name: string;
  size: number;
  type?: string;
}

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  onDeleteImage?: (index: number) => void;
  onSetPrimaryImage?: (index: number) => void;
  existingImages?: ExistingImage[];
  className?: string;
  isOnlyOneImage?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  onDeleteImage,
  onSetPrimaryImage,
  existingImages = [],
  className,
  isOnlyOneImage = false,
}) => {
  const { t } = useTranslation();

  // Track uploaded images locally
  const [images, setImages] = useState<ImageFile[]>([]);
  // Flag to track if files are already processed to prevent double processing
  const processingRef = useRef<boolean>(false);

  // Initialize or update images when existingImages changes
  useEffect(() => {
    // Processing existing images from props
    if (existingImages.length === 0) {
      // If there are no existing images, clear the local state
      if (images.length > 0) {
        images.forEach((img) => {
          // Revoke any local blob URLs
          if (img.url.startsWith("blob:")) {
            URL.revokeObjectURL(img.url);
          }
        });
        setImages([]);
      }
      return;
    }

    // Map existingImages to the ImageFile format
    const potentialImages = existingImages.map((img) => ({
      url: img.url,
      name: img.name,
      size: img.size, // Assumed bytes
      isPrimary: img.isPrimary || false,
      id: img.id || img.url,
      file: new File([], img.name || img.url.split("/").pop() || "image.jpg", {
        type: img.type || "image/jpeg",
      }),
    }));

    // Deduplicate based on the derived 'id'
    const uniqueByIdImages = potentialImages.filter(
      (image, index, self) => index === self.findIndex((t) => t.id === image.id)
    );

    // Ensure only one image is primary
    let primarySelected = false;
    const finalImagesToSet = uniqueByIdImages.map((img) => {
      if (img.isPrimary) {
        if (primarySelected) {
          return { ...img, isPrimary: false };
        }
        primarySelected = true;
        return img;
      }
      return img;
    });

    if (!primarySelected && finalImagesToSet.length > 0) {
      finalImagesToSet[0].isPrimary = true;
    }

    const newImagesKey = finalImagesToSet
      .map((img) => `${img.id}:${img.isPrimary}:${img.url}`)
      .sort()
      .join(",");
    const currentImagesKeyForCompare = images
      .map((img) => `${img.id}:${img.isPrimary}:${img.url}`)
      .sort()
      .join(",");

    if (newImagesKey !== currentImagesKeyForCompare) {
      images.forEach((currentImg) => {
        if (currentImg.url.startsWith("blob:")) {
          const stillExistsInNew = finalImagesToSet.some(
            (newImg) => newImg.url === currentImg.url
          );
          if (!stillExistsInNew) {
            URL.revokeObjectURL(currentImg.url);
          }
        }
      });
      setImages(finalImagesToSet);
    }
  }, [existingImages]); // Depend only on existingImages

  // Upload progress simulation
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadingFileSize, setUploadingFileSize] = useState<number | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload from input
  const handleFileUpload = (files: FileList | File[]) => {
    if (!files.length) return;

    const filesArray = Array.from(files);

    // Reset processing flag
    processingRef.current = false;

    // Start upload simulation
    setUploadProgress(0);
    setUploadingFile(filesArray[0].name);
    setUploadingFileSize(filesArray[0].size);

    // Store the timeout reference to clean it up later
    const intervalRef = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev !== null && prev < 100) {
          return prev + 10;
        } else if (prev !== null && prev >= 100 && !processingRef.current) {
          // Clear the interval
          clearInterval(intervalRef);

          // Set flag to prevent double processing
          processingRef.current = true;

          // Process files immediately rather than in setTimeout
          processUploadedFiles(filesArray);

          // Reset upload state
          setUploadingFile(null);
          setUploadingFileSize(null);

          return null;
        } else {
          // If we've already processed or progress is null, just return current value
          return prev;
        }
      });
    }, 100);
  };

  // Process files after upload
  const processUploadedFiles = (files: File[]) => {
    // Create new image objects
    const newImageObjects: ImageFile[] = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size, // Store raw size in bytes
      isPrimary: false,
      id: `${Date.now()}-${file.name}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    }));

    setImages((prevImages) => {
      // Make all existing images not primary if new images are being added.
      const updatedOldImages = prevImages.map((img) => ({
        ...img,
        isPrimary: newImageObjects.length > 0 ? false : img.isPrimary,
      }));

      // If new images were added, set the first new one as primary.
      if (newImageObjects.length > 0) {
        newImageObjects[0].isPrimary = true;
      }

      // Revoke blob URLs from previous images that are blobs and are not part of newImageObjects (though newImageObjects are all new blobs)
      // This step is more about cleaning up any previous blob state that might not be covered by the useEffect if existingImages prop itself changes.
      updatedOldImages.forEach((img) => {
        if (
          img.url.startsWith("blob:") &&
          !newImageObjects.find((n) => n.id === img.id)
        ) {
          // Check if this old blob is truly gone or just had its primariness changed
          // If we are just appending, old blobs from existing images should remain untouched unless they are replaced by an ID.
          // The current logic is to append, so existing non-blob URLs are fine. Existing blob URLs are from previous uploads.
          // If an existing image was a blob URL (from a previous upload in this session not yet saved to backend), it should be preserved.
          // The main revocation of old blobs from `prevImages` happens if they are being fully replaced or removed.
          // Here, we are concatenating.
        }
      });

      const allImages = [...updatedOldImages, ...newImageObjects];

      // Ensure at least one image is primary if there are any images
      if (allImages.length > 0 && !allImages.some((img) => img.isPrimary)) {
        allImages[0].isPrimary = true;
      }

      // Deduplicate, preferring newer items in case of ID collision (though IDs for new uploads should be unique)
      const uniqueImages = allImages
        .reverse()
        .filter(
          (image, index, self) =>
            index === self.findIndex((t) => t.id === image.id)
        )
        .reverse();

      return uniqueImages;
    });

    // Notify parent of new files
    onImagesChange(files); // Pass only the new File objects

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

    const imageToDelete = images[index];
    if (!imageToDelete) return;

    // Call parent's delete handler if provided
    if (onDeleteImage) {
      // Find the index in the parent's data by matching the image URL or ID
      const parentIndex = existingImages.findIndex(img => 
        img.url === imageToDelete.url || img.id === imageToDelete.id
      );
      if (parentIndex !== -1) {
        onDeleteImage(parentIndex);
      } else {
        // Fallback to local index if parent index not found
        onDeleteImage(index);
      }
    }

    // Update local state
    const newImages = images.filter((_, i) => i !== index);

    // Revoke the blob URL to prevent memory leaks if it was a blob
    if (imageToDelete.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToDelete.url);
    }

    // Update primary image if the deleted one was primary
    if (newImages.length > 0 && imageToDelete.isPrimary) {
      newImages[0].isPrimary = true;
    } else if (newImages.length === 0) {
      // All images deleted, nothing to be primary
    }

    setImages(newImages);

    // Update parent if no onDeleteImage was provided (by sending the remaining files)
    if (!onDeleteImage) {
      const remainingFiles = newImages.map((img) => img.file);
      onImagesChange(remainingFiles);
    }
  };

  // Set an image as primary
  const setPrimaryImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const imageToSetPrimary = images[index];
    if (!imageToSetPrimary) return;

    // Update local state
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(newImages);

    // Call parent handler if provided
    if (onSetPrimaryImage) {
      // Find the index in the parent's data by matching the image URL or ID
      const parentIndex = existingImages.findIndex(img => 
        img.url === imageToSetPrimary.url || img.id === imageToSetPrimary.id
      );
      if (parentIndex !== -1) {
        onSetPrimaryImage(parentIndex);
      } else {
        // Fallback to local index if parent index not found
        onSetPrimaryImage(index);
      }
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {(isOnlyOneImage && !existingImages.length) || !isOnlyOneImage ? (
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
            <span className="text-[#2970ff] font-semibold">
              {t("ui.clickToUpload")}
            </span>
            <span className="text-[#535862]"> {t("ui.orDragAndDrop")}</span>
          </div>
          <p className="text-xs text-[#535862] mt-1">
            {t("ui.uploadFileFormat")}
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
      ) : (
        isOnlyOneImage &&
        existingImages.length && (
          <div className="flex items-center p-4 bg-white border border-[#E9EAEB] rounded-xl shadow-sm w-full relative">
            <Image
              src={existingImages[0].url}
              alt="Upload"
              width={350}
              height={150}
              objectFit="contain"
            />
            <div
              className="absolute bottom-5 right-5 bg-white hover:bg-gray-100 transition-colors duration-300 rounded-md p-2 cursor-pointer"
              onClick={(e) => handleDelete(0, e)}
            >
              <Image
                src="/images/trash-icon.svg"
                alt="Delete"
                width={15}
                height={15}
                objectFit="contain"
              />
            </div>
          </div>
        )
      )}

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
                <p className="text-sm font-medium text-[#414651]" title={uploadingFile}>
                  {formatDisplayName(uploadingFile)}
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
      {images.length > 0 && !isOnlyOneImage && (
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
                    <p className="text-sm font-medium text-[#414651]" title={image.name}>
                      {formatDisplayName(image.name)}
                    </p>
                    {image.isPrimary && (
                      <div className="bg-[#E9F1FF] rounded px-2 py-0.5 flex items-center gap-1">
                        <Image
                          src="/images/primary-star.svg"
                          alt="Primary"
                          width={12}
                          height={12}
                        />
                        <span className="text-xs text-[#2970FF]">
                          {t("ui.primary")}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#535862]">
                    {niceBytes(image.size)}
                  </p>
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
