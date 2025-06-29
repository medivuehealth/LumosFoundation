import React, { useState } from 'react';
import { User, Lock, Mail, AlertCircle, Calendar, Phone, Heart } from 'lucide-react';
import config from '../../config';
import { validateField, validateForm } from '../../utils/validation';
import Toast from '../Toast';

function SignupForm({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'error',
    details: []
  });

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  const showValidationError = (message, details = []) => {
    setToast({
      open: true,
      message,
      severity: 'error',
      details
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field on change
    const validation = validateField(name, value);
    if (!validation.isValid) {
      if (name === 'password') {
        showValidationError(validation.message, validation.details);
      } else {
        showValidationError(validation.message);
      }
    }
    setErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? '' : validation.message
    }));

    // Special validation for confirm password
    if (name === 'confirm_password') {
      if (value !== formData.password) {
        showValidationError('Passwords do not match');
        setErrors(prev => ({
          ...prev,
          confirm_password: 'Passwords do not match'
        }));
      }
    }

    // Clear any previous error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const validation = validateForm(formData);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors);
      showValidationError(errorMessages[0]); // Show first error in toast
      setErrors(validation.errors);
      return;
    }

    // Additional password validation
    if (formData.password !== formData.confirm_password) {
      showValidationError('Passwords do not match');
      setErrors(prev => ({
        ...prev,
        confirm_password: 'Passwords do not match'
      }));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${config.API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'User already exists') {
          const errorMessages = [];
          if (data.details?.email) {
            errorMessages.push('This email address is already registered');
          }
          if (data.details?.username) {
            errorMessages.push('This username is already taken');
          }
          if (errorMessages.length > 0) {
            showValidationError(errorMessages.join(' and ') + '. Please choose different credentials or try logging in.');
            return;
          }
          showValidationError('A user with these credentials already exists.');
          return;
        }
        throw new Error(data.error || 'Signup failed');
      }

      // Call the onSignup callback with the user data
      onSignup(data.user);
    } catch (err) {
      showValidationError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white py-8 px-6 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Create Your Account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0 h-5 w-5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className={`pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.username ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    className={`pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.confirm_password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.first_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.last_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    className={`pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.date_of_birth ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.gender ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className={`pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.phone_number ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                    }`}
                    placeholder="XXX-XXX-XXXX"
                  />
                </div>
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Emergency Contact Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Heart className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    required
                    className={`pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.emergency_contact_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                </div>
                {errors.emergency_contact_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Emergency Contact Phone <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    required
                    className={`pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                      errors.emergency_contact_phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-purple-500 focus:border-purple-500'
                    }`}
                    placeholder="XXX-XXX-XXXX"
                  />
                </div>
                {errors.emergency_contact_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_phone}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onSwitchToLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purple-600 bg-white border-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Sign In Instead
            </button>
          </div>
        </div>
      </div>
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        details={toast.details}
        onClose={handleCloseToast}
      />
    </div>
  );
}

export default SignupForm; 