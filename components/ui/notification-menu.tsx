import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Notification = {
  id: string;
  avatar: string;
  name: string;
  message: string;
  time: string;
  isRead: boolean;
  attachment?: {
    type: string;
    name: string;
    size: string;
  };
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    avatar: "/images/demo/el-ezaby.png",
    name: "Ben Berman",
    message: "Received your RFQs Request",
    time: "7 hours ago",
    isRead: false,
    attachment: {
      type: "PDF",
      name: "RFQs Request.pdf",
      size: "3.4 MB",
    },
  },
  {
    id: "2",
    avatar: "/images/demo/el-ezaby.png",
    name: "Jane Doe",
    message: "Send you a QR Image Prescription",
    time: "Yesterday",
    isRead: false,
  },
  {
    id: "3",
    avatar: "/images/demo/el-ezaby.png",
    name: "Cap. John Smith",
    message: "started Delivery the order",
    time: "Yesterday",
    isRead: true,
  },
  {
    id: "4",
    avatar: "/images/demo/el-ezaby.png",
    name: "Jacob Jones",
    message: "send yor a RFQs from Supplies company 01",
    time: "2 days ago",
    isRead: true,
  },
];

interface NotificationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle clicking outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute top-12 right-0 z-50 w-[420px] bg-white rounded-2xl shadow-lg overflow-hidden"
      style={{
        boxShadow: "0px 2px 30px 0px rgba(0, 0, 0, 0.22), 0px 0px 15px 0px rgba(0, 0, 0, 0.06)"
      }}
    >
      <div className="p-3">
        <div className="flex justify-between items-center px-5 py-2">
          <div className="inline-flex items-center">
            <h4 className="text-lg font-medium text-gray-800">Notifications</h4>
            {unreadCount > 0 && (
              <span className="flex justify-center items-center bg-red-500 text-white text-xs rounded-full w-5 h-5 ml-1">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={handleMarkAllAsRead}
            className="text-blue-600 text-sm px-2 py-2 rounded-full hover:bg-blue-50"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex gap-3 px-6 py-4 border-b border-gray-100 ${!notification.isRead ? "bg-blue-50" : ""}`}
          >
            <div className="relative">
              <Image
                src={notification.avatar}
                alt={notification.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-sm">
                <strong className="text-gray-800">{notification.name}</strong> {notification.message}
              </p>
              <span className="text-xs text-gray-500">{notification.time}</span>
              
              {notification.attachment && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 bg-red-600 flex items-center justify-center rounded text-white text-[9px] font-bold">
                    {notification.attachment.type}
                  </div>
                  <div className="flex flex-col">
                    <strong className="text-sm text-gray-800">{notification.attachment.name}</strong>
                    <p className="text-xs text-gray-500">{notification.attachment.size}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-4 text-blue-600 text-sm hover:bg-blue-50">
        View More
      </button>
    </div>
  );
};

export default NotificationMenu; 