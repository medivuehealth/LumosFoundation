// Validation module for user profile data

const validateProfileData = (data) => {
    const errors = [];

    // Required fields validation
    const requiredFields = [
        'username',
        'first_name',
        'last_name',
        'email',
        'date_of_birth',
        'gender',
        'phone_number',
        'emergency_contact_name',
        'emergency_contact_phone'
    ];

    requiredFields.forEach(field => {
        if (!data[field]) {
            errors.push(`${field} is required`);
        }
    });

    // Username validation
    if (data.username) {
        if (!/^[a-zA-Z0-9]{1,12}$/.test(data.username)) {
            errors.push('Username must be 1-12 characters long and contain only letters and numbers');
        }
    }

    // Email validation
    if (data.email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Invalid email format');
        }
    }

    // Date of birth validation
    if (data.date_of_birth) {
        const dob = new Date(data.date_of_birth);
        const today = new Date();
        if (isNaN(dob.getTime())) {
            errors.push('Invalid date of birth format');
        } else if (dob > today) {
            errors.push('Date of birth cannot be in the future');
        }
    }

    // Gender validation
    if (data.gender) {
        const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
        if (!validGenders.includes(data.gender)) {
            errors.push('Invalid gender value');
        }
    }

    // Phone number validation
    if (data.phone_number) {
        // Basic phone number format validation
        if (!/^\+?[\d\s-()]{10,}$/.test(data.phone_number)) {
            errors.push('Invalid phone number format');
        }
    }

    // Emergency contact phone validation
    if (data.emergency_contact_phone) {
        if (!/^\+?[\d\s-()]{10,}$/.test(data.emergency_contact_phone)) {
            errors.push('Invalid emergency contact phone format');
        }
    }

    // Optional fields type validation
    if (data.display_name !== undefined && typeof data.display_name !== 'string') {
        errors.push('Display name must be a string');
    }

    if (data.address !== undefined && typeof data.address !== 'string') {
        errors.push('Address must be a string');
    }

    if (data.city !== undefined && typeof data.city !== 'string') {
        errors.push('City must be a string');
    }

    if (data.state !== undefined && typeof data.state !== 'string') {
        errors.push('State must be a string');
    }

    if (data.country !== undefined && typeof data.country !== 'string') {
        errors.push('Country must be a string');
    }

    if (data.postal_code !== undefined && typeof data.postal_code !== 'string') {
        errors.push('Postal code must be a string');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Function to sanitize profile data before saving
const sanitizeProfileData = (data) => {
    const sanitized = {};
    const allowedFields = [
        'username',
        'first_name',
        'last_name',
        'email',
        'display_name',
        'date_of_birth',
        'gender',
        'phone_number',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'emergency_contact_name',
        'emergency_contact_phone'
    ];

    // Only copy allowed fields
    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            sanitized[field] = data[field].toString().trim();
        }
    });

    return sanitized;
};

function validateJournalEntry(data) {
    console.log('Validating journal entry data:', JSON.stringify(data, null, 2));
    const errors = [];

    // Check required fields
    if (!data.user_id) {
        console.log('Missing required field: user_id');
        errors.push('user_id is required');
    }

    // Validate numeric fields
    const numericFields = {
        'calories': { min: 0 },
        'protein': { min: 0 },
        'carbs': { min: 0 },
        'fiber': { min: 0 },
        'meals_per_day': { min: 0 },
        'hydration_level': { min: 0, max: 10 },
        'bowel_frequency': { min: 0 },
        'bristol_scale': { min: 1, max: 7 },
        'urgency_level': { min: 0, max: 10 },
        'pain_severity': { min: 0, max: 10 },
        'sleep_hours': { min: 0 },
        'stress_level': { min: 0, max: 10 },
        'fatigue_level': { min: 0, max: 10 }
    };

    // Validate dosage level based on medication type
    if (data.medication_taken === true && data.medication_type !== 'None') {
        console.log('Server validating medication dosage:', {
            type: data.medication_type,
            dosage: data.dosage_level,
            typeOfDosage: typeof data.dosage_level,
            rawData: JSON.stringify(data)
        });

        // Define valid numeric ranges and string mappings for each medication type
        const validRanges = {
            'immunosuppressant': [1, 2, 3],
            'biologic': [1, 2, 3],
            'steroid': [1, 2, 3]
        };

        const stringMappings = {
            'immunosuppressant': {
                'daily': 1,
                'twice_daily': 2,
                'weekly': 3
            },
            'biologic': {
                'every_2_weeks': 1,
                'every_4_weeks': 2,
                'every_8_weeks': 3
            },
            'steroid': {
                '5': 1,
                '10': 2,
                '20': 3
            }
        };

        // Check if dosage level is valid for the medication type
        const validRange = validRanges[data.medication_type];
        const stringMapping = stringMappings[data.medication_type];
        console.log('Server validation check:', {
            medicationType: data.medication_type,
            validRange,
            dosageLevel: data.dosage_level,
            isValidType: validRange !== undefined
        });

        if (!validRange || !stringMapping) {
            return {
                isValid: false,
                errors: `Invalid medication type: ${data.medication_type}`
            };
        }

        // Handle both string and numeric values
        let dosageLevel = data.dosage_level;
        if (typeof dosageLevel === 'string') {
            dosageLevel = stringMapping[dosageLevel];
        } else if (typeof dosageLevel === 'number') {
            // If it's already a number, just validate it's in range
            if (!validRange.includes(dosageLevel)) {
                dosageLevel = undefined;
            }
        }

        console.log('Server dosage validation:', {
            original: data.dosage_level,
            converted: dosageLevel,
            isValid: dosageLevel !== undefined && validRange.includes(dosageLevel)
        });

        if (dosageLevel === undefined || !validRange.includes(dosageLevel)) {
            const validStrings = Object.keys(stringMapping);
            return {
                isValid: false,
                errors: `Invalid dosage level for medication type ${data.medication_type}. Must be one of: ${validStrings.join(', ')} or numeric values ${validRange.join(', ')}`
            };
        }

        // Update the dosage level to the numeric value
        data.dosage_level = dosageLevel;
    } else if (data.medication_taken === false || data.medication_type === 'None') {
        // If no medication is taken, dosage level should be null
        if (data.dosage_level !== null) {
            return {
                isValid: false,
                errors: 'Dosage level should be null when no medication is taken'
            };
        }
    }

    // Validate numeric fields
    Object.entries(numericFields).forEach(([field, { min, max }]) => {
        if (data[field] !== undefined) {
            const value = Number(data[field]);
            if (isNaN(value)) {
                console.log(`Invalid numeric value for ${field}:`, data[field]);
                errors.push(`${field} must be a number`);
            } else if (min !== undefined && value < min) {
                console.log(`Value too low for ${field}:`, value);
                errors.push(`${field} must be at least ${min}`);
            } else if (max !== undefined && value > max) {
                console.log(`Value too high for ${field}:`, value);
                errors.push(`${field} must be at most ${max}`);
            }
        }
    });

    // Validate categorical fields
    const categoricalFields = {
        'pain_location': ['None', 'full_abdomen', 'lower_abdomen', 'upper_abdomen'],
        'pain_time': ['None', 'morning', 'afternoon', 'evening', 'night', 'variable'],
        'medication_type': ['None', 'biologic', 'immunosuppressant', 'steroid']
    };

    Object.entries(categoricalFields).forEach(([field, validValues]) => {
        if (data[field] && !validValues.includes(data[field])) {
            console.log(`Invalid categorical value for ${field}:`, {
                value: data[field],
                validOptions: validValues
            });
            errors.push(`${field} must be one of: ${validValues.join(', ')}`);
        }
    });

    // Validate boolean fields
    const booleanFields = ['has_allergens', 'blood_present', 'medication_taken'];
    booleanFields.forEach(field => {
        console.log(`Validating boolean field ${field}:`, {
            value: data[field],
            type: typeof data[field]
        });
        if (data[field] !== undefined && typeof data[field] !== 'boolean' && !['yes', 'no'].includes(data[field])) {
            errors.push(`${field} must be 'yes', 'no', or a boolean`);
        }
    });

    // Validate menstruation field - now stored as string ('yes', 'no', 'not_applicable')
    if (data.menstruation !== undefined && 
        !['yes', 'no', 'not_applicable'].includes(data.menstruation)) {
        console.log('Invalid menstruation value:', data.menstruation);
        errors.push(`menstruation must be one of: yes, no, not_applicable`);
    }

    if (errors.length > 0) {
        console.log('Validation errors:', errors);
    } else {
        console.log('Validation successful');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = {
    validateProfileData,
    sanitizeProfileData,
    validateJournalEntry
}; 