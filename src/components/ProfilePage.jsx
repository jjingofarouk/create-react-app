// src/components/ProfilePage.jsx
import React, { useState } from "react";
import { auth } from "../firebase";
import { User } from "lucide-react";

function ProfilePage({ user }) {
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      setError("Failed to sign out. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-neutral-200">
      <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-primary" />
        Profile
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-neutral-600">Email</p>
          <p className="text-neutral-800 font-medium">{user.email}</p>
        </div>
        {error && (
          <p className="text-error-600 text-sm text-center bg-error-50 p-2 rounded-lg">{error}</p>
        )}
        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-danger text-white rounded-lg font-medium hover:bg-red-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
