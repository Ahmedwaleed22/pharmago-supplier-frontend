"use client";

import PrescriptionCard from "@/components/prescription-card";
import DashboardWithBreadcrumbsLayout from "@/layouts/dashboard-with-breadcrumbs-layout";
import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPendingPrescriptions } from "@/services/prescriptions";
import Loading from "@/components/loading";
import PrescriptionCardSkeleton from "@/components/ui/dashboard/prescription-card-skeleton";
import { usePusherEvent } from "@/hooks/usePusherEvent";
import { PUSHER_EVENTS } from "@/config/pusher";
import CustomButton from "@/components/custom-button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslation } from "@/contexts/i18n-context";

interface PusherNotificationEvent {
  type: string;
  notification?: Dashboard.Notification;
  // For prescription events
  prescription?: Prescription.Prescription;
  consumer_name?: string;
  prescription_id?: string;
}

function PrescriptionRequestsPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  const [newPrescriptionIds, setNewPrescriptionIds] = useState<string[]>([]);
  const newPrescriptionNotification = useRef<HTMLAudioElement | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [forceRefresh, setForceRefresh] = useState(0);

  // Load the audio file
  useEffect(() => {
    newPrescriptionNotification.current = new Audio('/sounds/notification.mp3');
    
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const showNotification = (prescription: Prescription.Prescription) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('New Prescription Received', {
        body: `New prescription from ${prescription.patient.name}`,
        icon: '/images/favicon.ico',
        badge: '/images/favicon.ico'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  };

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ["pending-prescriptions"],
    queryFn: () => fetchPendingPrescriptions(),
    staleTime: Infinity,
    structuralSharing: false
  });

  // Handle notification events from Pusher (including new prescriptions)
  usePusherEvent<PusherNotificationEvent>(PUSHER_EVENTS.NOTIFICATION, (data) => {
    console.log("Received notification event:", data);
    
    // Handle new prescription notifications
    if (data.type === "new_prescription") {
      console.log("Processing new prescription notification:", data);
      
      // Play notification sound
      if (newPrescriptionNotification.current) {
        newPrescriptionNotification.current.play().catch(console.error);
      }

      // Show browser notification if we have prescription data
      if (data.prescription) {
        showNotification(data.prescription);
      }
      
      // Add to new prescriptions list for animation
      const prescriptionId = data.prescription?.id || data.prescription_id;
      if (prescriptionId) {
        setNewPrescriptionIds(prev => {
          const newIds = [...prev, prescriptionId];
          console.log("Added prescription ID for animation:", prescriptionId, "All IDs:", newIds);
          return newIds;
        });
        
        // Remove from new prescriptions list after animation completes
        setTimeout(() => {
          setNewPrescriptionIds(prev => prev.filter(id => id !== prescriptionId));
        }, 3000);
      }
      
      // Update the query cache if we have prescription data
      if (data.prescription) {
        const currentData = queryClient.getQueryData<Prescription.Prescription[]>(["pending-prescriptions"]);
        console.log("Current query data before update:", currentData);
        
        if (currentData) {
          // Check if prescription already exists to avoid duplicates
          const exists = currentData.some(p => p.id === data.prescription!.id);
          if (!exists) {
            const newData = [data.prescription!, ...currentData];
            console.log("Setting new data with prescription added:", newData);
            queryClient.setQueryData(["pending-prescriptions"], newData);
          } else {
            console.log("Prescription already exists, skipping");
          }
        } else {
          console.log("No current data, setting with new prescription");
          queryClient.setQueryData(["pending-prescriptions"], [data.prescription!]);
        }
      } else {
        // If no prescription data, just refetch
        console.log("No prescription data in event, refetching prescriptions");
        queryClient.invalidateQueries({ queryKey: ["pending-prescriptions"] });
      }
      
      // Force component re-render
      setForceRefresh(prev => prev + 1);
    }
  });



  const breadcrumbs = [
    { label: t('breadcrumbs.dashboard'), href: "/dashboard" },
    { label: t('breadcrumbs.prescription'), href: null },
    { label: t('breadcrumbs.requests'), href: "/dashboard/prescriptions/requests" },
  ];

  return (
    <DashboardWithBreadcrumbsLayout
      breadcrumbs={breadcrumbs}
      title={t('prescriptions.title')}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-blue-gray">{t('prescriptions.prescriptionRx')}</h1>
          {prescriptions && prescriptions.length > 0 && (
            <span className={`bg-[#FF6363] font-bold h-[calc(var(--spacing)_*_5.5)] w-[calc(var(--spacing)_*_5.5)] rounded-full flex items-center justify-center text-white ${prescriptions.length > 99 ? 'text-[0.5rem]' : 'text-sm'}`}>
              {prescriptions.length > 99 ? '99+' : prescriptions.length}
            </span>
          )}
        </div>
        {/* Notification permissions button - only show if not granted */}
        {notificationPermission !== "granted" && (
          <div className="flex items-center gap-2">
            <CustomButton 
              onClick={requestNotificationPermission}
            >
              <Icon icon="mingcute:notification-line" width="24" height="24" />
              {t('prescriptions.enableNotifications')}
            </CustomButton>
          </div>
        )}
      </div>
      {!isLoading && prescriptions ? (
        prescriptions.length > 0 ? (
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
          <div className="flex flex-col items-center justify-center min-h-[300px] w-full py-12">
            <div className="mb-6">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="80" height="80" rx="16" fill="#F4F6FB"/>
                <path d="M24 56V28C24 25.7909 25.7909 24 28 24H52C54.2091 24 56 25.7909 56 28V52C56 54.2091 54.2091 56 52 56H28C25.7909 56 24 54.2091 24 52Z" fill="#E0E7FF"/>
                <rect x="32" y="36" width="16" height="2.5" rx="1.25" fill="#A5B4FC"/>
                <rect x="32" y="42" width="16" height="2.5" rx="1.25" fill="#A5B4FC"/>
                <rect x="32" y="48" width="10" height="2.5" rx="1.25" fill="#A5B4FC"/>
                <rect x="36" y="28" width="8" height="4" rx="2" fill="#6366F1"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-blue-gray mb-2">No Prescription Requests</h2>
            <p className="text-gray-500 text-center max-w-xs">You're all caught up! New prescription requests will appear here as soon as patients submit them.</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mt-5">
          {[...Array(8)].map((_, index) => (
            <PrescriptionCardSkeleton key={index} />
          ))}
        </div>
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
