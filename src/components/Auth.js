import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, auth } from "../firebase";
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut", delay: 0.1 }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: 0.2 + index * 0.1 }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Image - Top Right */}
      <div className="absolute top-0 right-0 w-2/3 h-3/4 md:w-1/2 md:h-2/3 lg:w-2/5 lg:h-3/5">
        <div className="relative w-full h-full">
          <img 
            src="./auth.jpeg" 
            alt="Auth background"
            className="w-full h-full object-cover object-right"
            style={{
              clipPath: "polygon(30% 0%, 100% 0%, 100% 85%, 0% 100%)"
            }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/20"
            style={{
              clipPath: "polygon(30% 0%, 100% 0%, 100% 85%, 0% 100%)"
            }}
          />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-32 right-20 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"></div>
      <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-indigo-200/20 rounded-full blur-lg"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div 
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/30 rounded-3xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isSignUp ? 'signup' : 'signin'}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isSignUp ? (
                        <UserPlus className="w-8 h-8 text-white" />
                      ) : (
                        <LogIn className="w-8 h-8 text-white" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.h1 
                    key={isSignUp ? 'signup-title' : 'signin-title'}
                    className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </motion.h1>
                </AnimatePresence>
                
                <p className="text-slate-600 text-sm">
                  {isSignUp ? "Join us and start your journey" : "Sign in to continue your journey"}
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-6">
                <motion.div 
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                >
                  {/* Email Input */}
                  <motion.div 
                    className="relative group"
                    variants={inputVariants}
                    custom={0}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-slate-200/50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 backdrop-blur-sm"
                    />
                  </motion.div>

                  {/* Password Input */}
                  <motion.div 
                    className="relative group"
                    variants={inputVariants}
                    custom={1}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full pl-12 pr-12 py-4 bg-white/50 border-2 border-slate-200/50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </motion.div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isSignUp ? (
                        <UserPlus className="w-5 h-5" />
                      ) : (
                        <LogIn className="w-5 h-5" />
                      )}
                      {isSignUp ? "Create Account" : "Sign In"}
                    </>
                  )}
                </motion.button>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <p className="text-red-600 text-sm text-center font-medium">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Toggle Sign Up/In */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <p className="text-slate-600 text-sm">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:underline"
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Auth;