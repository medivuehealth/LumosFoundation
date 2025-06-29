import React, { useState, useEffect } from 'react';
import { Calendar, Save, Plus, BookOpen, Smile, Activity, MessageCircle, ChartBar, AlertTriangle, Info, AlertCircle, Check } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import config from '../config';
import axios from 'axios';
import { FLARE_PREDICTION_API } from '../config/api';
import Toast from './Toast';
import MealInput from './MealInput';

// Move defaultFormData before component definition
const getDefaultFormData = (shouldShowMenstruation = false) => ({
  calories: '0',
  protein: '0',
  carbs: '0',
  fiber: '0',
  has_allergens: 'no',
  meals_per_day: '3',
  hydration_level: '5',
  bowel_frequency: '0',
  bristol_scale: '4',
  urgency_level: '1',
  blood_present: 'no',
  pain_location: 'None',
  pain_severity: '0',
  pain_time: 'None',
  medication_taken: 'no',
  medication_type: 'None',
  dosage_level: null,
  sleep_hours: '8',
  stress_level: '1',
  // Ensure menstruation is always one of the valid string values: 'yes', 'no', or 'not_applicable'
  menstruation: shouldShowMenstruation ? 'no' : 'not_applicable',
  fatigue_level: '1'
});

// Add pain location options
const painLocationOptions = [
  { value: 'None', label: 'None' },
  { value: 'lower_abdomen', label: 'Lower Abdomen' },
  { value: 'upper_abdomen', label: 'Upper Abdomen' },
  { value: 'full_abdomen', label: 'Full Abdomen' }
];

// Add pain time options
const painTimeOptions = [
  { value: 'None', label: 'None' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
  { value: 'variable', label: 'Variable' }
];

// Add medication type options and their corresponding dosage options
const medicationTypeOptions = [
  { 
    value: 'immunosuppressant', 
    label: 'Immunosuppressant',
    dosageOptions: [
      { value: 'daily', label: 'Daily' },
      { value: 'twice_daily', label: 'Twice Daily' },
      { value: 'weekly', label: 'Weekly' }
    ]
  },
  {
    value: 'biologic',
    label: 'Biologic',
    dosageOptions: [
      { value: 'every_2_weeks', label: 'Every 2 Weeks' },
      { value: 'every_4_weeks', label: 'Every 4 Weeks' },
      { value: 'every_8_weeks', label: 'Every 8 Weeks' }
    ]
  },
  {
    value: 'steroid',
    label: 'Steroid',
    dosageOptions: [
      { value: '5', label: '5mg' },
      { value: '10', label: '10mg' },
      { value: '20', label: '20mg' }
    ]
  }
];

// Bristol Scale description for tooltip
const bristolScaleDescription = {
  title: "Bristol Stool Scale",
  description: "A medical aid designed to classify the form of human feces into seven categories:",
  types: [
    "Type 1: Separate hard lumps (severe constipation)",
    "Type 2: Lumpy and sausage-like (mild constipation)",
    "Type 3: Sausage shape with cracks (normal)",
    "Type 4: Smooth, soft sausage (normal)",
    "Type 5: Soft blobs with clear edges (lacking fiber)",
    "Type 6: Mushy with ragged edges (inflammation)",
    "Type 7: Liquid without solid pieces (inflammation/diarrhea)"
  ]
};

// Valid categories for form validation
const VALID_CATEGORIES = {
  has_allergens: ['yes', 'no'],
  blood_present: ['yes', 'no'],
  pain_location: ['None', 'full_abdomen', 'lower_abdomen', 'upper_abdomen'],
  pain_time: ['None', 'morning', 'afternoon', 'evening', 'night', 'variable'],
  medication_taken: ['yes', 'no'],
  medication_type: ['None', 'biologic', 'immunosuppressant', 'steroid'],
  menstruation: ['yes', 'no', 'not_applicable']
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function JournalTab({ userId, user }) {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    meals: {
      breakfast: '',
      lunch: '',
      dinner: '',
      snacks: ''
    },
    symptoms: {
      pain: {
        level: 0,
        location: ''
      },
      bowelMovements: {
        frequency: 0,
        consistency: 'normal'
      }
    },
    mood: 'good',
    notes: ''
  });

  const [activeSection, setActiveSection] = useState('meals');

  const sections = [
    { id: 'meals', label: 'Meals', icon: BookOpen },
    { id: 'symptoms', label: 'Symptoms', icon: Activity },
    { id: 'mood', label: 'Mood', icon: Smile },
    { id: 'notes', label: 'Notes', icon: MessageCircle }
  ];

  // Add shouldShowMenstruation check
  const shouldShowMenstruation = user?.gender === 'female';

  // Use the function to get defaultFormData
  const [formData, setFormData] = useState(getDefaultFormData(shouldShowMenstruation));
  const [predictions, setPredictions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add state for dosage options
  const [dosageOptions, setDosageOptions] = useState([]);

  // Add state for current dosage options
  const [currentDosageOptions, setCurrentDosageOptions] = useState([]);

  // Update form data when user prop changes to ensure correct menstruation default
  useEffect(() => {
    const newShouldShowMenstruation = user?.gender === 'female';
    setFormData(prev => ({
      ...prev,
      menstruation: newShouldShowMenstruation ? 'no' : 'not_applicable'
    }));
  }, [user?.gender]);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (userId) {
    fetchRecentPredictions();
    fetchStatistics();
    }
  }, [userId]);

  // Update dosage options when medication type changes
  useEffect(() => {
    const selectedMedType = medicationTypeOptions.find(opt => opt.value === formData.medication_type);
    setCurrentDosageOptions(selectedMedType?.dosageOptions || []);
    
    // Only set dosage level if medication is taken and a valid type is selected
    if (formData.medication_taken === 'yes' && selectedMedType?.dosageOptions?.length > 0) {
      // For immunosuppressant, set to 'daily' by default
      if (formData.medication_type === 'immunosuppressant') {
        setFormData(prev => ({
          ...prev,
          dosage_level: 'daily'
        }));
      }
      // For biologic, set to 'every_2_weeks' by default
      else if (formData.medication_type === 'biologic') {
        setFormData(prev => ({
          ...prev,
          dosage_level: 'every_2_weeks'
        }));
      }
      // For steroid, set to '5' by default
      else if (formData.medication_type === 'steroid') {
        setFormData(prev => ({
          ...prev,
          dosage_level: '5'
        }));
      }
    } else {
      // If no medication is taken or no valid type is selected, set to null
      setFormData(prev => ({
        ...prev,
        dosage_level: null
      }));
    }
  }, [formData.medication_type, formData.medication_taken]);

  const fetchRecentPredictions = async () => {
    try {
      if (!userId) {
        console.warn('No userId provided for fetching predictions');
        return;
      }
      const response = await fetch(`${config.API_URL}/api/recent-predictions?user_id=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error('Error fetching recent predictions:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      if (!userId) {
        console.warn('No userId provided for fetching statistics');
        return;
      }
      const response = await fetch(`${config.API_URL}/api/flare-statistics?user_id=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleInputChange = (category, field, value) => {
    if (category === 'meals') {
      setCurrentEntry(prev => ({
        ...prev,
        meals: { ...prev.meals, [field]: value }
      }));
    } else if (category === 'symptoms') {
      if (field === 'pain') {
        setCurrentEntry(prev => ({
          ...prev,
          symptoms: {
            ...prev.symptoms,
            pain: { ...prev.symptoms.pain, ...value }
          }
        }));
        // Sync pain location with formData when it changes
        if (value.location !== undefined) {
          setFormData(prev => ({
            ...prev,
            pain_location: value.location
          }));
        }
      } else if (field === 'bowelMovements') {
        setCurrentEntry(prev => ({
          ...prev,
          symptoms: {
            ...prev.symptoms,
            bowelMovements: { ...prev.symptoms.bowelMovements, ...value }
          }
        }));
      }
    } else {
      setCurrentEntry(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for menstruation field to ensure it's never null
    if (name === 'menstruation') {
      setFormData(prev => ({
        ...prev,
        [name]: value || (shouldShowMenstruation ? 'no' : 'not_applicable')
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? getDefaultFormData(shouldShowMenstruation)[name] : value
      }));
    }
    
    // Sync pain location with currentEntry when it changes via dropdown
    if (name === 'pain_location') {
      handleInputChange('symptoms', 'pain', { location: value });
    }
  };

  const validateForm = (data) => {
    console.log('Raw data before transformation:', {
      medication_taken: data.medication_taken,
      medication_type: data.medication_type,
      dosage_level: data.dosage_level,
      typeOfDosage: typeof data.dosage_level,
      menstruation: data.menstruation,
      userGender: user?.gender,
      shouldShowMenstruation
    });

    // Ensure menstruation has a valid value
    let menstruationValue = data.menstruation;
    if (!menstruationValue || menstruationValue === '') {
      menstruationValue = shouldShowMenstruation ? 'no' : 'not_applicable';
      console.log('Setting default menstruation value:', menstruationValue);
    }

    // Convert string values to appropriate types
    const transformedData = {
      ...data,
      // Convert numeric fields
      calories: Number(data.calories),
      protein: Number(data.protein),
      carbs: Number(data.carbs),
      fiber: Number(data.fiber),
      meals_per_day: Number(data.meals_per_day),
      hydration_level: Number(data.hydration_level),
      bowel_frequency: Number(data.bowel_frequency),
      bristol_scale: Number(data.bristol_scale),
      urgency_level: Number(data.urgency_level),
      pain_severity: Number(data.pain_severity),
      sleep_hours: Number(data.sleep_hours),
      stress_level: Number(data.stress_level),
      fatigue_level: Number(data.fatigue_level),
      // Convert boolean fields
      has_allergens: data.has_allergens === 'yes',
      blood_present: data.blood_present === 'yes',
      medication_taken: data.medication_taken === 'yes',
      // Keep menstruation as string value - do not convert to boolean
      menstruation: menstruationValue // Keep as 'yes', 'no', or 'not_applicable'
    };

    console.log('Transformed data with menstruation:', {
      menstruation: transformedData.menstruation,
      type: typeof transformedData.menstruation
    });

    // Handle medication type and dosage level
    if (transformedData.medication_taken) {
      // If medication is taken, validate and convert dosage level
      if (transformedData.medication_type === 'immunosuppressant') {
        const validDosages = { 'daily': 1, 'twice_daily': 2, 'weekly': 3 };
        const numericDosage = validDosages[data.dosage_level];
        if (numericDosage === undefined) {
          throw new Error(`Invalid dosage level for immunosuppressant. Must be one of: daily, twice_daily, weekly`);
        }
        transformedData.dosage_level = numericDosage;
      } else if (transformedData.medication_type === 'biologic') {
        const validDosages = { 'every_2_weeks': 1, 'every_4_weeks': 2, 'every_8_weeks': 3 };
        const numericDosage = validDosages[data.dosage_level];
        if (numericDosage === undefined) {
          throw new Error(`Invalid dosage level for biologic. Must be one of: every_2_weeks, every_4_weeks, every_8_weeks`);
        }
        transformedData.dosage_level = numericDosage;
      } else if (transformedData.medication_type === 'steroid') {
        const validDosages = { '5': 1, '10': 2, '20': 3 };
        const numericDosage = validDosages[data.dosage_level];
        if (numericDosage === undefined) {
          throw new Error(`Invalid dosage level for steroid. Must be one of: 5, 10, 20`);
        }
        transformedData.dosage_level = numericDosage;
      } else {
        throw new Error('Invalid medication type. Must be one of: immunosuppressant, biologic, steroid');
      }
    } else {
      // If no medication is taken, set type to None and level to null
      transformedData.medication_type = 'None';
      transformedData.dosage_level = null;
    }

    console.log('Final transformed data:', {
      medication_taken: transformedData.medication_taken,
      medication_type: transformedData.medication_type,
      dosage_level: transformedData.dosage_level,
      typeOfDosage: typeof transformedData.dosage_level
    });

    return transformedData;
  };

  // Helper function to convert dosage level to numeric value
  const convertDosageLevel = (medicationType, dosageLevel) => {
    if (!medicationType || !dosageLevel) return 0;

    const dosageMaps = {
      'steroid': {
        '5': 1,
        '10': 2,
        '20': 3
      },
      'biologic': {
        'every_2_weeks': 1,
        'every_4_weeks': 2,
        'every_8_weeks': 3
      },
      'immunosuppressant': {
        'daily': 1,
        'twice_daily': 2,
        'weekly': 3
      }
    };

    return dosageMaps[medicationType]?.[dosageLevel] || 0;
  };

  const saveJournalEntry = async (entryData) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      console.log('Sending journal entry data:', JSON.stringify(entryData, null, 2));
      const response = await axios.post(`${API_BASE_URL}/api/journal/entries`, {
        ...entryData,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Log the raw form data
      console.log('Raw form data before validation:', {
        medication_type: formData.medication_type,
        medication_taken: formData.medication_taken,
        dosage_level: formData.dosage_level,
        typeOfDosage: typeof formData.dosage_level,
        menstruation: formData.menstruation,
        userGender: user?.gender,
        shouldShowMenstruation
      });

      // Validate form data
      const validatedData = validateForm(formData);
      
      // Log the validated data
      console.log('Validated data before submission:', {
        medication_type: validatedData.medication_type,
        medication_taken: validatedData.medication_taken,
        dosage_level: validatedData.dosage_level,
        typeOfDosage: typeof validatedData.dosage_level,
        menstruation: validatedData.menstruation
      });

      // Add user_id and entry_date
      const requestData = {
        ...validatedData,
        user_id: userId,
        entry_date: currentEntry.date
      };

      // Log the final request data
      console.log('Final request data:', {
        medication_type: requestData.medication_type,
        medication_taken: requestData.medication_taken,
        dosage_level: requestData.dosage_level,
        typeOfDosage: typeof requestData.dosage_level,
        menstruation: requestData.menstruation
      });

      // First, save the journal entry
      const journalResponse = await saveJournalEntry(requestData);

      // Set the prediction result from the response
      if (journalResponse.prediction) {
        setPredictionResult(journalResponse.prediction);
      }

      // Show success message
      setToastMessage({
        type: 'success',
        message: 'Journal entry saved successfully!'
      });

      // Refresh predictions and statistics
      await fetchRecentPredictions();
      await fetchStatistics();
      
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        fullError: error.response?.data?.error,
        validationResult: error.response?.data?.validationResult
      });

      // Log detailed request information
      if (error.response?.config) {
        console.log('Request URL:', error.response.config.url);
        console.log('Request method:', error.response.config.method);
        console.log('Request headers:', error.response.config.headers);
        console.log('Request data:', error.response.config.data);
      }

      // Extract and format validation errors
      let errorMessage = 'Error saving journal entry';
      
      // Get the error data from the correct location in the response
      const errorData = error.response?.data?.error;
      
      if (errorData) {
        // If validation passed but we still got a 400, there might be other issues
        if (errorData.isValid === true && (!errorData.errors || errorData.errors.length === 0)) {
          errorMessage = 'Server validation passed but the request was rejected. Please check your input data.';
          // Log the current form state and validated data
          console.log('Current form state:', formData);
          console.log('Validated data that caused error:', validateForm(formData));
        }
        // If we have validation errors
        else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors.join('\n');
        }
        // If we have a direct error message
        else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        // If it's some other type of error object
        else {
          errorMessage = JSON.stringify(errorData);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setToastMessage({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPredictionData = (predictions) => {
    return predictions.map(p => ({
      date: new Date(p.prediction_timestamp).toLocaleDateString(),
      probability: p.probability,  // Keep raw probability (0-1)
      flare: p.prediction === 1 ? 'Yes' : 'No'
    })).reverse();
  };

  const renderRequiredLabel = (text) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {text} <span className="text-red-500">*</span>
    </label>
  );

  const renderSymptoms = () => {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Symptoms</h3>
        
        {/* Pain Information Section */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-700 mb-4">Pain Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pain Level */}
            <div>
              {renderRequiredLabel('Pain Level (0-10)')}
              <input
                type="number"
                min="0"
                max="10"
                value={formData.pain_severity}
                onChange={(e) => {
                  const painLevel = parseInt(e.target.value);
                  // Update both currentEntry and formData
                  handleInputChange('symptoms', 'pain', { level: painLevel });
                  setFormData(prev => ({
                    ...prev,
                    pain_severity: painLevel.toString()
                  }));
                }}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            {/* Pain Location */}
            <div>
              {renderRequiredLabel('Pain Location')}
        <select
          name="pain_location"
          value={formData.pain_location}
          onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          {painLocationOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
            </div>

            {/* Pain Time */}
            <div>
              {renderRequiredLabel('Pain Time')}
              <select
                name="pain_time"
                value={formData.pain_time}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {painTimeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Medication Section */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-700 mb-4">Medication Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medication Taken */}
            <div>
              {renderRequiredLabel('Medication Taken')}
              <select
                name="medication_taken"
                value={formData.medication_taken}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    medication_taken: newValue,
                    medication_type: newValue === 'no' ? 'None' : prev.medication_type,
                    // Remove dosage_level entirely when medication is not taken
                    ...(newValue === 'no' ? {} : { dosage_level: prev.dosage_level })
                  }));
                }}
                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Medication Type */}
            <div>
              {renderRequiredLabel('Medication Type')}
              <select
                value={formData.medication_type}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    medication_type: newValue
                  }));
                  // Reset dosage level when medication type changes
                  const medicationType = medicationTypeOptions.find(opt => opt.value === newValue);
                  const defaultDosage = medicationType?.dosageOptions[0]?.value || '0';
                  setFormData(prev => ({
                    ...prev,
                    dosage_level: defaultDosage
                  }));
                }}
                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={formData.medication_taken === 'no'}
              >
                {medicationTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dosage Level */}
            <div>
              {renderRequiredLabel('Dosage Level')}
              <select
                value={formData.dosage_level}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dosage_level: e.target.value
                }))}
                className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={formData.medication_taken === 'no' || currentDosageOptions.length === 0}
              >
                {currentDosageOptions.length === 0 ? (
                  <option value="0">No dosage available</option>
                ) : (
                  currentDosageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Other Symptoms Section */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-4">Other Symptoms</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bowel Movement Frequency */}
            <div>
              {renderRequiredLabel('Bowel Movement Frequency')}
              <input
                type="number"
                name="bowel_frequency"
                min="0"
                value={formData.bowel_frequency}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Bristol Scale with Tooltip */}
            <div className="relative">
              {renderRequiredLabel(
                <div className="flex items-center">
                  Bristol Scale (1-7)
                  <div className="group relative ml-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <Info size={16} />
                    </button>
                    <div className="hidden group-hover:block absolute z-50 w-96 p-4 bg-white border border-gray-200 rounded-lg shadow-lg -left-1/2 mt-2">
                      <h4 className="font-semibold mb-2">{bristolScaleDescription.title}</h4>
                      <p className="text-sm mb-2">{bristolScaleDescription.description}</p>
                      <ul className="text-sm space-y-1">
                        {bristolScaleDescription.types.map((type, index) => (
                          <li key={index}>{type}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <input
                type="number"
                name="bristol_scale"
                min="1"
                max="7"
                value={formData.bristol_scale}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Blood Present */}
            <div>
              {renderRequiredLabel('Blood Present')}
              <select
                name="blood_present"
                value={formData.blood_present}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {/* Has Allergens */}
            <div>
              {renderRequiredLabel('Food Allergens Consumed')}
              <select
                name="has_allergens"
                value={formData.has_allergens}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {/* Menstruation Field - Only show for female users */}
            {shouldShowMenstruation && (
              <div>
                {renderRequiredLabel('Menstruation')}
                <select
                  name="menstruation"
                  value={formData.menstruation}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            )}

            {/* Urgency Level */}
            <div className="relative">
              {renderRequiredLabel(
                <div className="flex items-center">
                  Urgency Level (0-10)
                  <div className="group relative ml-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <Info size={16} />
                    </button>
                    <div className="hidden group-hover:block absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg -left-1/2 mt-2">
                      <h4 className="font-semibold mb-2">Urgency Level</h4>
                      <p className="text-sm mb-2">
                        How strong was your urge to have a bowel movement? <br />
                        <b>0</b> = No urgency (can wait easily), <b>10</b> = Extreme urgency (cannot wait, risk of accident).
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <input
                type="number"
                name="urgency_level"
                min="0"
                max="10"
                value={formData.urgency_level}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Stress Level */}
            <div className="relative">
              {renderRequiredLabel(
                <div className="flex items-center">
                  Stress Level (0-10)
                  <div className="group relative ml-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <Info size={16} />
                    </button>
                    <div className="hidden group-hover:block absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg -left-1/2 mt-2">
                      <h4 className="font-semibold mb-2">Stress Level</h4>
                      <p className="text-sm mb-2">
                        How stressed or anxious did you feel today? <br />
                        <b>0</b> = No stress (completely relaxed), <b>10</b> = Extreme stress (overwhelming anxiety).
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <input
                type="number"
                name="stress_level"
                min="0"
                max="10"
                value={formData.stress_level}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Fatigue Level */}
            <div className="relative">
              {renderRequiredLabel(
                <div className="flex items-center">
                  Fatigue Level (0-10)
                  <div className="group relative ml-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <Info size={16} />
                    </button>
                    <div className="hidden group-hover:block absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg -left-1/2 mt-2">
                      <h4 className="font-semibold mb-2">Fatigue Level</h4>
                      <p className="text-sm mb-2">
                        How tired or fatigued did you feel today? <br />
                        <b>0</b> = No fatigue (full of energy), <b>10</b> = Extreme fatigue (completely exhausted).
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <input
                type="number"
                name="fatigue_level"
                min="0"
                max="10"
                value={formData.fatigue_level}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Sleep Hours */}
            <div className="relative">
              {renderRequiredLabel(
                <div className="flex items-center">
                  Sleep Hours (0-24)
                  <div className="group relative ml-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <Info size={16} />
                    </button>
                    <div className="hidden group-hover:block absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg -left-1/2 mt-2">
                      <h4 className="font-semibold mb-2">Sleep Hours</h4>
                      <p className="text-sm mb-2">
                        How many hours did you sleep last night? <br />
                        <b>0</b> = No sleep, <b>24</b> = 24 hours of sleep.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <input
                type="number"
                name="sleep_hours"
                min="0"
                max="24"
                step="0.5"
                value={formData.sleep_hours}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Hydration Level */}
            <div className="relative">
              {renderRequiredLabel(
                <div className="flex items-center">
                  Hydration Level (0-10)
                  <div className="group relative ml-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <Info size={16} />
                    </button>
                    <div className="hidden group-hover:block absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg -left-1/2 mt-2">
                      <h4 className="font-semibold mb-2">Hydration Level</h4>
                      <p className="text-sm mb-2">
                        How well hydrated do you feel today? <br />
                        <b>0</b> = Very dehydrated (dry mouth, dark urine), <b>10</b> = Very well hydrated (clear urine, no thirst).
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <input
                type="number"
                name="hydration_level"
                min="0"
                max="10"
                value={formData.hydration_level}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Initialize currentEntry with proper pain location
  useEffect(() => {
    setCurrentEntry(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        pain: {
          ...prev.symptoms.pain,
          location: formData.pain_location
        }
      }
    }));
  }, []); // Run once on component mount

  // Sync pain level from currentEntry to formData
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      pain_severity: currentEntry.symptoms.pain.level.toString()
    }));
  }, [currentEntry.symptoms.pain.level]);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Calculate total nutrition from all meals
  const calculateTotalNutrition = () => {
    const totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fiber: 0
    };

    // Aggregate nutrition from all meals
    Object.values(currentEntry.meals || {}).forEach(meal => {
      if (meal && meal.nutrition) {
        totalNutrition.calories += meal.nutrition.calories || 0;
        totalNutrition.protein += meal.nutrition.protein || 0;
        totalNutrition.carbs += meal.nutrition.carbs || 0;
        totalNutrition.fiber += meal.nutrition.fiber || 0;
      }
    });

    return totalNutrition;
  };

  // Update formData with calculated nutrition
  useEffect(() => {
    const totalNutrition = calculateTotalNutrition();
    setFormData(prev => ({
      ...prev,
      calories: Math.round(totalNutrition.calories).toString(),
      protein: Math.round(totalNutrition.protein).toString(),
      carbs: Math.round(totalNutrition.carbs).toString(),
      fiber: Math.round(totalNutrition.fiber).toString()
    }));
  }, [currentEntry.meals]);

  const renderMeals = () => {
    const totalNutrition = calculateTotalNutrition();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
        <MealInput
            type="breakfast"
          userId={userId}
            onSave={(meal) => {
              setCurrentEntry(prev => ({
                ...prev,
                meals: {
                  ...prev.meals,
                  breakfast: meal
                }
              }));
            }}
        />
        <MealInput
            type="lunch"
          userId={userId}
            onSave={(meal) => {
              setCurrentEntry(prev => ({
                ...prev,
                meals: {
                  ...prev.meals,
                  lunch: meal
                }
              }));
            }}
        />
        <MealInput
            type="dinner"
          userId={userId}
            onSave={(meal) => {
              setCurrentEntry(prev => ({
                ...prev,
                meals: {
                  ...prev.meals,
                  dinner: meal
                }
              }));
            }}
        />
        <MealInput
            type="snack"
          userId={userId}
            onSave={(meal) => {
              setCurrentEntry(prev => ({
                ...prev,
                meals: {
                  ...prev.meals,
                  snacks: meal
                }
              }));
            }}
          />
        </div>
        
        {/* Nutrition Summary */}
        {totalNutrition.calories > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-3">Daily Nutrition Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{Math.round(totalNutrition.calories)}</div>
                <div className="text-xs text-blue-700">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{Math.round(totalNutrition.protein)}g</div>
                <div className="text-xs text-blue-700">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{Math.round(totalNutrition.carbs)}g</div>
                <div className="text-xs text-blue-700">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{Math.round(totalNutrition.fiber)}g</div>
                <div className="text-xs text-blue-700">Fiber</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-ibd-100 via-ibd-200 to-ibd-300 p-6 rounded-2xl shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Daily Journal</h2>
            <p className="text-gray-600">Track your health journey</p>
          </div>
          <Calendar className="text-ibd-500" size={32} />
        </div>
      </div>

      {/* Section Navigation */}
      <div className="grid grid-cols-4 gap-3">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${
              activeSection === section.id
                ? 'bg-ibd-500 text-white shadow-glow transform scale-105'
                : 'bg-white text-gray-600 hover:bg-ibd-100 border border-ibd-200'
            }`}
          >
            <section.icon size={24} className="mb-2" />
            <span className="text-sm font-medium">{section.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white p-6 rounded-xl border border-ibd-200 shadow-soft">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-display font-semibold text-gray-800">
            {sections.find(s => s.id === activeSection)?.label}
          </h3>
          <button className="bg-ibd-500 text-white px-4 py-2 rounded-lg hover:bg-ibd-600 transition-colors flex items-center">
            <Plus size={18} className="mr-1" />
            Add Entry
          </button>
        </div>

        {/* Placeholder Content */}
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-4 rounded-lg border border-ibd-200 hover:border-ibd-300 transition-colors cursor-pointer bg-gradient-to-r from-white to-ibd-50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ibd-600">Today, 2:30 PM</span>
                <span className="text-xs text-gray-500">Entry #{item}</span>
              </div>
              <p className="text-gray-600">Sample journal entry content...</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-healing-100 p-4 rounded-xl border border-healing-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Weekly Entries</span>
            <span className="text-2xl font-bold text-healing-500">12</span>
          </div>
          <div className="h-2 bg-healing-200 rounded-full">
            <div className="h-full w-3/4 bg-healing-500 rounded-full" />
          </div>
        </div>

        <div className="bg-comfort-100 p-4 rounded-xl border border-comfort-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Streak</span>
            <span className="text-2xl font-bold text-comfort-500">5 days</span>
          </div>
          <div className="h-2 bg-comfort-200 rounded-full">
            <div className="h-full w-5/6 bg-comfort-500 rounded-full" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center mb-4">
            <Calendar size={20} className="text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Date</h3>
          </div>
          <input
            type="date"
            value={currentEntry.date}
            onChange={(e) => handleInputChange(null, 'date', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Meals */}
        {renderMeals()}

        {/* Symptoms */}
        {renderSymptoms()}

        {/* Mood */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood</h3>
          <select
            value={currentEntry.mood}
            onChange={(e) => handleInputChange(null, 'mood', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="great">Great</option>
            <option value="good">Good</option>
            <option value="okay">Okay</option>
            <option value="poor">Poor</option>
            <option value="terrible">Terrible</option>
          </select>
        </div>

        {/* Notes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes</h3>
          <textarea
            value={currentEntry.notes}
            onChange={(e) => handleInputChange(null, 'notes', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            rows="4"
            placeholder="Any other symptoms, concerns, or notes..."
          />
        </div>

        <div className="col-span-full">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {loading ? 'Processing...' : 'Analyze Health Data'}
          </button>
        </div>
      </form>

      {/* Prediction Result */}
      {predictionResult && (
        <div className={`mb-8 p-4 rounded-lg ${
          predictionResult.prediction === 0 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        } border`}>
          <div className="flex items-center">
            <AlertTriangle className={`mr-2 ${
              predictionResult.prediction === 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`} />
            <h3 className="text-lg font-semibold">
              {predictionResult.interpretation}
            </h3>
          </div>
          <div className="mt-2">
            <p className="text-gray-700">Confidence: {(predictionResult.confidence * 100).toFixed(1)}%</p>
            <p className="text-gray-700">Probability: {(predictionResult.probability * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Predictions</h3>
            <p className="text-3xl font-bold text-purple-600">{statistics.total_predictions}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Flares</h3>
            <p className="text-3xl font-bold text-purple-600">{statistics.total_flares}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Avg Flare Probability</h3>
            <p className="text-3xl font-bold text-purple-600">
              {statistics.avg_flare_probability 
                ? statistics.avg_flare_probability.toFixed(3)  // Keep raw probability (0-1)
                : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Visualization */}
      {predictions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Flare Risk Trend</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatPredictionData(predictions)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />  {/* Raw probability range (0-1) */}
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="probability" 
                  stroke="#7e22ce" 
                  name="Flare Risk (0-1)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Previous Entries */}
      {entries.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Entries</h3>
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">{entry.date}</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    entry.mood === 'great' ? 'bg-green-100 text-green-800' :
                    entry.mood === 'good' ? 'bg-blue-100 text-blue-800' :
                    entry.mood === 'okay' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {entry.mood}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Pain:</strong> Level {entry.symptoms.pain.level} ({entry.symptoms.pain.location})</p>
                  <p><strong>Bowel Movements:</strong> {entry.symptoms.bowelMovements.frequency}x ({entry.symptoms.bowelMovements.consistency})</p>
                  {entry.notes && <p className="mt-2">{entry.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAnalysis && (
        <AnalysisResults 
          results={analysisResults} 
          onClose={() => setShowAnalysis(false)} 
        />
      )}
      
      {toastMessage && (
        <Toast 
          message={toastMessage.message} 
          type={toastMessage.type} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </div>
  );
}

// Add Analysis Results Component
const AnalysisResults = ({ results, onClose }) => {
    if (!results) return null;
    
    return (
        <div className="analysis-results">
            <div className="analysis-header">
                <h3>Health Analysis Results</h3>
                <button onClick={onClose}>&times;</button>
            </div>
            
            <div className="prediction-summary">
                <div className={`risk-level ${results.prediction ? 'high' : 'low'}`}>
                    {results.interpretation}
                    <div className="confidence">Confidence: {results.confidence}</div>
                </div>
            </div>
            
            {results.recommendations.length > 0 && (
                <div className="recommendations">
                    <h4>Recommendations:</h4>
                    <ul>
                        {results.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default JournalTab;