// File: src/components/auth/AuthContainer.jsx
import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {isLogin ? "Welcome" : "Create Account"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin
                ? "Sign in to access your account"
                : "Join us and start your journey"}
            </p>
          </div>

          {isLogin ? (
            <Login switchToSignup={() => setIsLogin(false)} />
          ) : (
            <Signup switchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
