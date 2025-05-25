"use client";

import { useCallback } from "react";

interface ToastOptions {
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export function useToast() {
  const showToast = useCallback((options: ToastOptions) => {
    // Create toast element
    const toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-4 right-4 z-[100] max-w-sm w-full transform translate-x-full opacity-0 transition-all duration-300 ease-in-out';
    
    const getIcon = (type: ToastOptions["type"]) => {
      switch (type) {
        case "success":
          return "✅";
        case "error":
          return "❌";
        case "warning":
          return "⚠️";
        case "info":
          return "ℹ️";
        default:
          return "ℹ️";
      }
    };

    const getToastStyles = (type: ToastOptions["type"]) => {
      switch (type) {
        case "success":
          return "border-green-200 bg-green-50";
        case "error":
          return "border-red-200 bg-red-50";
        case "warning":
          return "border-yellow-200 bg-yellow-50";
        case "info":
          return "border-blue-200 bg-blue-50";
        default:
          return "border-gray-200 bg-white";
      }
    };

    const removeToast = () => {
      // Exit animation
      toastContainer.className = 'fixed top-4 right-4 z-[100] max-w-sm w-full transform translate-x-full opacity-0 transition-all duration-300 ease-in-out';
      
      // Remove after animation completes
      setTimeout(() => {
        if (toastContainer.parentNode) {
          toastContainer.remove();
        }
      }, 300);
    };

    toastContainer.innerHTML = `
      <div class="border rounded-lg p-4 shadow-lg ${getToastStyles(options.type)} backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <span class="text-lg animate-pulse">${getIcon(options.type)}</span>
          <div class="flex-1 min-w-0">
            ${options.title ? `<div class="font-medium text-gray-900 text-sm">${options.title}</div>` : ''}
            ${options.description ? `<div class="text-gray-600 text-sm mt-1">${options.description}</div>` : ''}
          </div>
          <button class="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110 transform duration-150">
            ✕
          </button>
        </div>
      </div>
    `;

    // Add click handler for close button
    const closeButton = toastContainer.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', removeToast);
    }

    document.body.appendChild(toastContainer);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toastContainer.className = 'fixed top-4 right-4 z-[100] max-w-sm w-full transform translate-x-0 opacity-100 transition-all duration-300 ease-in-out';
    });

    // Auto remove after duration
    const duration = options.duration || 5000;
    setTimeout(() => {
      if (toastContainer.parentNode) {
        removeToast();
      }
    }, duration);
  }, []);

  return { showToast };
} 