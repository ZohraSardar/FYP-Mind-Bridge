import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaBirthdayCake, FaRocket } from "react-icons/fa";
import logoImage from "../assets/mindbridge.png";
import { auth } from "@/lib/firebase"; // Import Firebase auth
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

interface FormData {
  name: string;
  email: string;
  age: number;
  password: string; // Add password field
}

const AuthPage: React.FC = () => {
  const { register, handleSubmit } = useForm<FormData>();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [error, setError] = useState<string | null>(null); // Error state

  const onSubmit = async (data: FormData) => {
    setError(null); // Reset error state
    try {
      if (isLogin) {
        // Login with Firebase
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        // Signup with Firebase
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        // Optionally save additional user data (name, age) to Firestore
      }
      setLocation("/"); // Redirect to home page after successful auth
    } catch (error: any) {
      setError(error.message); // Set error message
      console.error("Authentication error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-500 to-blue-600">
      {/* Left side with full-height image */}
      <div className="w-full md:w-3/5 flex items-center justify-center p-8 relative">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-20 w-24 h-24 bg-pink-300 rounded-full opacity-20"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-16 h-16 bg-yellow-300 rounded-full opacity-20"
          animate={{ y: [20, 0, 20] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <img src={logoImage} alt="Mind Bridge Logo" className="w-full max-w-2xl" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-8"
          >
            <h2 className="text-4xl font-bold text-white">MIND BRIDGE!</h2>
            <p className="text-gray-200 text-center mt-4 max-w-sm">
              This platform is only designed for children with Autism
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side with form */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-4">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative gradient */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-300 rounded-full opacity-20 blur-xl" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-300 rounded-full opacity-20 blur-xl" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white">Welcome To</h2>
              <h2 className="text-3xl font-bold text-white mt-2">MIND BRIDGE!</h2>
              <p className="text-gray-200 text-center mt-4 mb-6">
                {isLogin ? "Login to continue" : "Sign up to start your journey"}
              </p>
            </motion.div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-600 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {!isLogin && (
                <div className="relative">
                  <FaUser className="absolute top-4 left-4 text-gray-400" />
                  <input
                    {...register("name", { required: !isLogin })}
                    placeholder="Your Name"
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-20 text-white placeholder-gray-200 focus:outline-none focus:border-opacity-50 focus:bg-opacity-30 transition-all"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="relative">
                <FaEnvelope className="absolute top-4 left-4 text-gray-400" />
                <input
                  {...register("email", { required: true })}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-20 text-white placeholder-gray-200 focus:outline-none focus:border-opacity-50 focus:bg-opacity-30 transition-all"
                  required
                />
              </div>

              <div className="relative">
                <FaBirthdayCake className="absolute top-4 left-4 text-gray-400" />
                <input
                  {...register("age", { required: !isLogin, valueAsNumber: true })}
                  type="number"
                  placeholder="Age"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-20 text-white placeholder-gray-200 focus:outline-none focus:border-opacity-50 focus:bg-opacity-30 transition-all"
                  required={!isLogin}
                />
              </div>

              <div className="relative">
                <FaRocket className="absolute top-4 left-4 text-gray-400" />
                <input
                  {...register("password", { required: true })}
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-20 text-white placeholder-gray-200 focus:outline-none focus:border-opacity-50 focus:bg-opacity-30 transition-all"
                  required
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 px-6 bg-white bg-opacity-20 hover:bg-opacity-30 border border-white border-opacity-20 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <FaRocket className="inline-block" />
                {isLogin ? "LOGIN" : "SIGN UP"}
              </motion.button>
            </div>

            {/* Toggle between login and signup */}
            <p className="text-center text-gray-200 mt-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-white underline hover:text-purple-200 transition-all"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default AuthPage;