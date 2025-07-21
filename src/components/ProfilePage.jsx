import React from "react";
import { User, Mail, Lock, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";

const ProfilePage = ({ user }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully signed out");
    } catch (error) {
      toast.error("Failed to sign out: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Profile</h2>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800">{user.email}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg bg-neutral-50/50">
            <Mail className="w-5 h-5 text-neutral-500" />
            <div>
              <p className="text-sm text-neutral-600">Email</p>
              <p className="font-medium text-neutral-800">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg bg-neutral-50/50">
            <Lock className="w-5 h-5 text-neutral-500" />
            <div>
              <p className="text-sm text-neutral-600">Password</p>
              <p className="font-medium text-neutral-800">••••••••</p>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;