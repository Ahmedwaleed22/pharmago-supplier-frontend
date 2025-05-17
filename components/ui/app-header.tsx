import React from "react";
import { Search, Menu } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import SearchBar from "./search-bar";
import NotificationMenu from "./notification-menu";

function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);

  return (
    <>
      <header className="w-full flex justify-between items-center">
        {/* Mobile menu button - only visible on small screens */}
        <button 
          className="lg:hidden mr-2" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search bar - width changes based on screen size */}
        <SearchBar className="w-full" value={""} setValue={() => {}} />

        {/* Right side content */}
        <div className="flex justify-between items-center gap-2 sm:gap-5 ml-auto">
          <div className="relative">
            <div className="relative cursor-pointer">
              <Image
                src="/images/notification.svg"
                alt="notification"
                width={22}
                height={22}
                onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                2
              </div>
            </div>
            <NotificationMenu
              isOpen={isNotificationMenuOpen} 
              onClose={() => setIsNotificationMenuOpen(false)} 
            />
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/images/demo/el-ezaby.png"
              alt="el-ezaby"
              width={40}
              height={40}
              className="sm:w-[48px] sm:h-[48px] w-[40px] h-[40px]"
            />
            <div className="flex flex-col sm:flex">
              <h2 className="text-sm font-medium">Ezabawy Pharmacy</h2>
              <h3 className="text-xs font-medium">Customer Support</h3>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu and search - shown when menu is open on small screens */}
      {isMobileMenuOpen && (
        <div className="lg:hidden px-4 pb-4 pt-4">
          <div className="bg-white w-full h-[40px] rounded-md flex items-center gap-2 px-3 mb-4">
            <Search className="w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-full outline-none"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default AppHeader;
