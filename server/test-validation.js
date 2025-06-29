const { validateProfileData, sanitizeProfileData } = require('./validation');

// Test valid profile data
const testValidProfile = () => {
    console.log('\nTesting valid profile data:');
    const validData = {
        username: 'testuser123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        display_name: 'Johnny',
        date_of_birth: '1990-01-01',
        gender: 'male',
        phone_number: '+1-555-123-4567',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        country: 'USA',
        postal_code: '12345',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '+1-555-987-6543'
    };

    const result = validateProfileData(validData);
    console.log('Validation result:', result);
    console.log('Sanitized data:', sanitizeProfileData(validData));
};

// Test invalid profile data
const testInvalidProfile = () => {
    console.log('\nTesting invalid profile data:');
    const invalidData = {
        username: 'test user 123!!!', // Invalid username
        first_name: '', // Missing required field
        last_name: '', // Missing required field
        email: 'invalid.email', // Invalid email
        date_of_birth: '2025-01-01', // Future date
        gender: 'invalid', // Invalid gender
        phone_number: '123', // Invalid phone
        emergency_contact_name: '', // Missing required field
        emergency_contact_phone: 'abc' // Invalid phone
    };

    const result = validateProfileData(invalidData);
    console.log('Validation result:', result);
};

// Test missing required fields
const testMissingFields = () => {
    console.log('\nTesting missing required fields:');
    const incompleteData = {
        username: 'testuser',
        email: 'test@example.com'
    };

    const result = validateProfileData(incompleteData);
    console.log('Validation result:', result);
};

// Test data type validation
const testDataTypes = () => {
    console.log('\nTesting data types:');
    const wrongTypes = {
        username: 'validuser',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_birth: '1990-01-01',
        gender: 'male',
        phone_number: '1234567890',
        emergency_contact_name: 'Jane',
        emergency_contact_phone: '0987654321',
        display_name: 123, // Should be string
        address: true, // Should be string
        postal_code: {} // Should be string
    };

    const result = validateProfileData(wrongTypes);
    console.log('Validation result:', result);
};

// Run all tests
console.log('Starting validation tests...');
testValidProfile();
testInvalidProfile();
testMissingFields();
testDataTypes(); 