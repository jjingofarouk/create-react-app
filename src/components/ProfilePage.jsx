// src/components/ProfilePage.jsx
import React from "react";
import { User, Mail, Lock, LogOut } from "lucide-react";

const ProfilePage = ({ user }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-800">Profile</h2>
      
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-800">{user.email}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 border border-neutral-200 rounded-lg">
            <Mail className="w-5 h-5 text-neutral-500" />
            <div>
              <p className="text-sm text-neutral-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 border border-neutral-200 rounded-lg">
            <Lock className="w-5 h-5 text-neutral-500" />
            <div>
              <p className="text-sm text-neutral-600">Password</p>
              <p className="font-medium">••••••••</p>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 mt-6">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;