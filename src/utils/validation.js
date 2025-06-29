// Validation rules for all form fields
const validationRules = {
  // Username validation: 1-12 characters, letters and numbers only
  username: {
    pattern: /^[a-zA-Z0-9]{1,12}$/,
    message: 'Username must be 1-12 characters long and contain only letters and numbers'
  },

  // Password validation
  password: {
    validate: (value) => {
      const errors = [];
      
      if (value.length < 12) {
        errors.push('Password must be at least 12 characters long');
      }
      if (!/[A-Z]/.test(value)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        errors.push('Password must contain at least one special character');
      }
      if (!/[0-9]/.test(value)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[a-z]/.test(value)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  },

  // Email validation
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: 'Please enter a valid email address'
  },

  // Phone number validation: +1-XXX-XXX-XXXX or XXX-XXX-XXXX
  phone: {
    pattern: /^(\+\d{1,3}[-\s]?)?\d{3}[-\s]?\d{3}[-\s]?\d{4}$/,
    message: 'Please enter a valid phone number (e.g., XXX-XXX-XXXX or +1-XXX-XXX-XXXX)'
  },

  // Name validation: letters, spaces, hyphens, and apostrophes
  name: {
    pattern: /^[a-zA-Z\s'-]{1,50}$/,
    message: 'Name should contain only letters, spaces, hyphens, and apostrophes (max 50 characters)'
  },

  // Date validation: must be a valid date and not in the future
  date: {
    validate: (value) => {
      const date = new Date(value);
      const today = new Date();
      return date instanceof Date && !isNaN(date) && date <= today;
    },
    message: 'Please enter a valid date (not in the future)'
  },

  // Gender validation: must be one of the allowed values
  gender: {
    validate: (value) => ['male', 'female', 'other', 'prefer_not_to_say'].includes(value),
    message: 'Please select a valid gender option'
  },

  // Required field validation
  required: {
    validate: (value) => value !== undefined && value !== null && value.trim() !== '',
    message: 'This field is required'
  }
};

// Validate a single field
export const validateField = (fieldName, value, isRequired = true) => {
  // Check if field is required and empty
  if (isRequired && (!value || value.trim() === '')) {
    return { isValid: false, message: 'This field is required' };
  }

  // If field is not required and empty, it's valid
  if (!isRequired && (!value || value.trim() === '')) {
    return { isValid: true };
  }

  // Special validation for different field types
  switch (fieldName) {
    case 'password':
      const passwordValidation = validationRules.password.validate(value);
      return {
        isValid: passwordValidation.isValid,
        message: passwordValidation.isValid ? '' : 'Password validation failed',
        details: passwordValidation.errors
      };

    case 'username':
      return {
        isValid: validationRules.username.pattern.test(value),
        message: validationRules.username.pattern.test(value) ? '' : validationRules.username.message
      };

    case 'email':
      return {
        isValid: validationRules.email.pattern.test(value),
        message: validationRules.email.pattern.test(value) ? '' : validationRules.email.message
      };

    case 'phone_number':
    case 'emergency_contact_phone':
      return {
        isValid: validationRules.phone.pattern.test(value),
        message: validationRules.phone.pattern.test(value) ? '' : validationRules.phone.message
      };

    case 'first_name':
    case 'last_name':
    case 'display_name':
    case 'emergency_contact_name':
      return {
        isValid: validationRules.name.pattern.test(value),
        message: validationRules.name.pattern.test(value) ? '' : validationRules.name.message
      };

    case 'date_of_birth':
      return {
        isValid: validationRules.date.validate(value),
        message: validationRules.date.validate(value) ? '' : validationRules.date.message
      };

    case 'gender':
      return {
        isValid: validationRules.gender.validate(value),
        message: validationRules.gender.validate(value) ? '' : validationRules.gender.message
      };

    // Optional fields
    case 'address':
    case 'city':
    case 'state':
    case 'country':
    case 'postal_code':
      return { isValid: true };

    default:
      return { isValid: true };
  }
};

// Validate entire form
export const validateForm = (formData) => {
  const errors = {};
  let isValid = true;

  // Required fields
  const requiredFields = [
    'username',
    'email',
    'first_name',
    'last_name',
    'date_of_birth',
    'gender',
    'phone_number',
    'emergency_contact_name',
    'emergency_contact_phone'
  ];

  // Optional fields
  const optionalFields = [
    'display_name',
    'address',
    'city',
    'state',
    'country',
    'postal_code'
  ];

  // Validate required fields
  requiredFields.forEach(field => {
    const validation = validateField(field, formData[field], true);
    if (!validation.isValid) {
      errors[field] = validation.message;
      isValid = false;
    }
  });

  // Validate optional fields
  optionalFields.forEach(field => {
    if (formData[field]) {
      const validation = validateField(field, formData[field], false);
      if (!validation.isValid) {
        errors[field] = validation.message;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
}; 