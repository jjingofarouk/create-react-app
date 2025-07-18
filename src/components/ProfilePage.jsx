import React, { useState } from "react";
import { User } from "lucide-react";
import { db, doc, setDoc } from "../firebase";

function ProfilePage({ user }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a valid name.");
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, `users/${user.uid}/profile`), { name }, { merge: true });
      alert("Name saved successfully!");
    } catch (error) {
      console.error("Error saving name:", error);
      alert("Error saving name. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-6 h-6 text-primary" />
        <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">
          Profile
        </h2>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-neutral-500">Email</h3>
          <p className="text-neutral-800">{user.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500">Name</h3>
          <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800 placeholder-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              <User className="w-5 h-5" />
              {loading ? "Saving..." : "Save Name"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
