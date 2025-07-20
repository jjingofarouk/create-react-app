import React from 'react';
import { User } from 'lucide-react';
import { auth } from '../firebase';

const Header = ({ user, activeTab, setActiveTab }) => {
  const handleSignOut = () => {
    setActiveTab("sales"); // Reset to default tab
    auth.signOut();
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800">
            Richmond Books
          </h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("profile")}
              className={`p-2 rounded-full transition-all duration-200 ${
                activeTab === "profile" 
                  ? "bg-blue-100 text-blue-600" 
                  : "hover:bg-neutral-100 text-neutral-600"
              }`}
              title="Profile"
              aria-label="Profile"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <button
              className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 hover:shadow-md transition-all duration-200 text-sm sm:text-base"
              onClick={handleSignOut}
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;