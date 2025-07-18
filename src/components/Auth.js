import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, auth } from "../firebase";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 sm:mt-24 p-6 sm:p-8 bg-white rounded-xl shadow-lg border border-neutral-200">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-primary/10 rounded-full">
          {isSignUp ? (
            <UserPlus className="w-8 h-8 text-primary" />
          ) : (
            <LogIn className="w-8 h-8 text-primary" />
          )}
        </div>
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold text-center text-neutral-800 mb-6">
        {isSignUp ? "Create Account" : "Welcome Back"}
      </h2>
      <form onSubmit={handleAuth} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800 placeholder-neutral-400"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full pl-10 pr-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 text-neutral-800 placeholder-neutral-400"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isSignUp ? (
            <>
              <UserPlus className="w-5 h-5" />
              Sign Up
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Log In
            </>
          )}
        </button>
        {error && (
          <p className="text-error-600 text-sm text-center bg-error-50 p-2 rounded-lg">
            {error}
          </p>
        )}
        <p className="text-center text-neutral-600 text-sm">
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <span
            className="text-primary font-medium cursor-pointer hover:text-blue-700 hover:underline transition-all duration-200"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Auth;