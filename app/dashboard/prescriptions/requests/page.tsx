"use client";

import PrescriptionCard from "@/components/prescription-card";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPendingPrescriptions } from "@/services/prescriptions";
import Loading from "@/components/loading";
import { usePusherEvent } from "@/hooks/usePusherEvent";
import { PUSHER_EVENTS } from "@/config/pusher";

interface PusherNewPrescriptionEvent {
  type: "new_prescription";
  prescription_id: string;
  consumer_name: string;
  created_at: string;
  prescription: Prescription.Prescription;
}

function PrescriptionRequestsPage() {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [newPrescriptionIds, setNewPrescriptionIds] = useState<string[]>([]);
  const [soundInitialized, setSoundInitialized] = useState(false);
  
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["pending-prescriptions"],
    queryFn: () => fetchPendingPrescriptions(),
    staleTime: Infinity,
    structuralSharing: false
  });

  // Check notification permission status
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Clear animation class after it plays
  useEffect(() => {
    if (newPrescriptionIds.length > 0) {
      const timer = setTimeout(() => {
        setNewPrescriptionIds([]);
      }, 3000); // Increased animation duration to 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [newPrescriptionIds]);

  // Initialize audio context and element immediately and on page load
  useEffect(() => {
    // Try to initialize audio immediately
    initializeAudio();
    
    // Create a dummy Audio element and play it silently to unlock audio
    const unlockAudio = () => {
      const silentSound = new Audio("/sounds/notification.mp3");
      silentSound.volume = 0.01;
      silentSound.muted = true;
      silentSound.play().then(() => {
        silentSound.pause();
        silentSound.currentTime = 0;
        setSoundInitialized(true);
        console.log("Audio initialized successfully");
      }).catch(err => {
        console.log("Silent audio initialization failed, will try on user interaction", err);
      });
    };
    
    // Try to unlock audio on page load
    unlockAudio();
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  // Initialize audio context and element on user interaction
  const initializeAudio = () => {
    if (soundInitialized) return true;
    
    console.log("Initializing audio...");
    
    // Create a new AudioContext to unblock audio
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      try {
        const audioContext = new AudioContext();
        // Create a silent oscillator to unblock audio
        const oscillator = audioContext.createOscillator();
        oscillator.frequency.value = 0;
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.001);
      } catch (err) {
        console.error("Error initializing AudioContext:", err);
      }
    }
    
    // Create and preload the audio
    try {
      audioRef.current = new Audio("/sounds/notification.mp3");
      audioRef.current.preload = "auto";
      
      // Load the audio file
      audioRef.current.load();
      
      setSoundInitialized(true);
      return true;
    } catch (err) {
      console.error("Error creating audio element:", err);
      return false;
    }
  };

  // Add click event listener to document to initialize audio
  useEffect(() => {
    const handleUserInteraction = () => {
      if (initializeAudio()) {
        console.log("Audio initialized via user interaction");
        // Play a short silent sound to unlock audio
        const silentSound = new Audio("/sounds/notification.mp3");
        silentSound.volume = 0.01;
        silentSound.play().then(() => {
          silentSound.pause();
          console.log("Silent sound played successfully");
        }).catch(err => {
          console.error("Silent sound playback failed:", err);
        });
      }
    };
    
    // Add listeners for various user interactions
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Function to request notification permissions
  const requestNotificationPermission = () => {
    initializeAudio(); // Initialize audio on user interaction
    
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
        setNotificationPermission(permission);
      });
    }
  };

  // Play test sound
  const playTestSound = () => {
    initializeAudio(); // Make sure audio is initialized
    
    // Create a brand new audio element for this sound
    const sound = new Audio("/sounds/notification.mp3");
    sound.volume = 1.0;
    
    // Play the sound with promise handling
    const playPromise = sound.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Test sound playing successfully");
        })
        .catch(err => {
          console.error("Error playing test sound:", err);
        });
    }
  };

  // Play notification sound function
  const playNotificationSound = () => {
    console.log("Attempting to play notification sound, sound initialized:", soundInitialized);
    
    // Create a brand new audio element for each notification
    try {
      const sound = new Audio("/sounds/notification.mp3");
      sound.volume = 1.0;
      sound.muted = false;
      
      // Force initialization if not already done
      if (!soundInitialized) {
        initializeAudio();
      }
      
      // Play the sound with promise handling
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Notification sound playing successfully");
          })
          .catch(err => {
            console.error("Error playing notification sound:", err);
            // Fallback attempt with a different approach
            setTimeout(() => {
              const backupSound = new Audio("/sounds/notification.mp3");
              backupSound.play().catch(e => console.error("Backup sound also failed:", e));
            }, 100);
          });
      }
    } catch (err) {
      console.error("Error creating notification sound:", err);
    }
  };

  // Handle new prescription events from Pusher
  usePusherEvent<PusherNewPrescriptionEvent>(PUSHER_EVENTS.NOTIFICATION, (data) => {
    console.log("Notification received:", data);
    if (data.type === "new_prescription" && data.prescription) {
      console.log("Processing new prescription notification:", data.prescription);
      
      // Play notification sound
      playNotificationSound();
      
      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        console.log("Showing browser notification");
        new Notification("New Prescription", {
          body: `New prescription from ${data.consumer_name}`,
          icon: "/icons/favicon-32x32.png"
        });
      }
      
      // Update prescription list
      console.log("Updating prescription list with new data");
      queryClient.setQueryData<Prescription.Prescription[]>(
        ["pending-prescriptions"],
        (oldData = []) => {
          // Check if prescription already exists in the list
          const existingIndex = oldData.findIndex(
            (p) => p.id === data.prescription.id
          );
          
          // If it doesn't exist, add it to the list
          if (existingIndex === -1) {
            console.log("Adding new prescription to list");
            // Add the id to newPrescriptionIds for animation
            setNewPrescriptionIds(prev => [...prev, data.prescription.id]);
            return [data.prescription, ...oldData];
          }
          
          return oldData;
        }
      );
    }
  });

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Prescription", href: null },
        { label: "Requests", href: "/dashboard/prescriptions/requests" },
      ]}
      title="Prescription"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-blue-gray">Prescription / Rx</h1>
          {prescriptions && prescriptions.length > 0 && (
            <span className="text-sm bg-[#FF6363] font-bold h-[calc(var(--spacing)_*_5.5)] w-[calc(var(--spacing)_*_5.5)] rounded-full flex items-center justify-center text-white">
              {prescriptions.length}
            </span>
          )}
        </div>
        {/* Notification permissions button - only show if not granted */}
        {notificationPermission !== "granted" && (
          <div className="flex items-center gap-2">
            <button 
              onClick={requestNotificationPermission}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Enable Notifications
            </button>
            <button 
              onClick={playTestSound}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Test Sound
            </button>
          </div>
        )}
      </div>
      {!isLoading && prescriptions ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-5">
          {prescriptions?.map((prescription, index) => (
            <div 
              key={prescription.id || index}
              className={`${newPrescriptionIds.includes(prescription.id) ? 'animate-new-prescription border-beam' : ''}`}
            >
              <PrescriptionCard
                prescription={prescription}
              />
            </div>
          ))}
        </div>
      ) : (
        <Loading />
      )}

      {/* Add the animation CSS */}
      <style jsx global>{`
        @keyframes newPrescriptionAnimation {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes borderBeam {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
            border: 2px solid rgba(0, 123, 255, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
            border: 2px solid rgba(0, 123, 255, 1);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
            border: 2px solid rgba(0, 123, 255, 0.7);
          }
        }
        
        .animate-new-prescription {
          animation: newPrescriptionAnimation 0.8s ease-out forwards;
        }
        
        .border-beam {
          position: relative;
          border-radius: 0.5rem;
          overflow: visible;
          animation: borderBeam 1s ease-in-out 3;
        }
      `}</style>
    </DashboardWithBreadcrumbsLayout>
  );
}

export default PrescriptionRequestsPage;
