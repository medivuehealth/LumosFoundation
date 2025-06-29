import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

function AuthPage({ onAuthSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);

  const handleLogin = (userData) => {
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    onAuthSuccess(userData);
  };

  const handleSignup = (userData) => {
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    onAuthSuccess(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo192.png"
          alt="MediVue"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          MediVue Health
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your personal health companion
        </p>
      </div>

      <div className="mt-8">
        {isLoginView ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToSignup={() => setIsLoginView(false)}
          />
        ) : (
          <SignupForm
            onSignup={handleSignup}
            onSwitchToLogin={() => setIsLoginView(true)}
          />
        )}
      </div>
    </div>
  );
}

export default AuthPage; 