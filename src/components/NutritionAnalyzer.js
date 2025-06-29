import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Utensils
} from 'lucide-react';
import config from '../config';

const NutritionAnalyzer = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30'); // days

  // IBD Nutrition Guidelines
  const ibdGuidelines = {
    recommended: {
      protein: { min: 1.2, max: 1.5, unit: 'g/kg body weight' },
      fiber: { min: 10, max: 15, unit: 'g/day' },
      omega3: { min: 1.1, max: 1.6, unit: 'g/day' },
      vitaminD: { min: 600, max: 800, unit: 'IU/day' },
      calcium: { min: 1000, max: 1300, unit: 'mg/day' },
      iron: { min: 8, max: 18, unit: 'mg/day' },
      zinc: { min: 8, max: 11, unit: 'mg/day' }
    },
    avoid: [
      'high-fat foods', 'spicy foods', 'caffeine', 'alcohol', 
      'dairy (if lactose intolerant)', 'raw vegetables', 'nuts and seeds',
      'carbonated beverages', 'artificial sweeteners'
    ],
    beneficial: [
      'lean proteins', 'cooked vegetables', 'bananas', 'applesauce',
      'white rice', 'oatmeal', 'yogurt', 'salmon', 'eggs'
    ]
  };

  const fetchNutritionData = async () => {
    setLoading(true);
    try {
      // Fetch journal entries (which include meal data and nutrition info)
      const journalResponse = await fetch(`${config.API_URL}/api/journal/entries?days=${timeRange}`);
      const journalData = await journalResponse.json();
      
      // Fetch prediction results
      const predictionsResponse = await fetch(`${config.API_URL}/api/predictions?days=${timeRange}`);
      const predictionsData = await predictionsResponse.json();
      
      // Fetch meal logs for additional meal data
      const mealLogsResponse = await fetch(`${config.API_URL}/api/meal_logs?days=${timeRange}`);
      const mealLogsData = await mealLogsResponse.json();
      
      if (journalData.success) {
        analyzeNutritionData(journalData.entries || [], predictionsData.predictions || [], mealLogsData.meal_logs || []);
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      // Create mock data for demonstration if API fails
      createMockAnalysisData();
    } finally {
      setLoading(false);
    }
  };

  const createMockAnalysisData = () => {
    // Mock data for demonstration purposes
    const mockAnalysis = {
      totalEntries: 15,
      flareEntries: 3,
      averageNutrition: {
        calories: 1850,
        protein: 75,
        carbs: 220,
        fiber: 8,
        fat: 65
      },
      deficiencies: [
        {
          nutrient: 'Fiber',
          current: 8,
          recommended: '10-15g',
          impact: 'Low fiber can worsen constipation and inflammation'
        }
      ],
      flareCorrelations: [
        {
          factor: 'High Fat Intake',
          correlation: 'Strong',
          description: 'Flare days show 25% higher fat consumption'
        }
      ],
      recommendations: [
        {
          type: 'deficiency',
          priority: 'High',
          title: 'Address Nutritional Deficiencies',
          description: 'Focus on increasing fiber intake',
          actions: ['Increase fiber intake to 10-15g daily', 'Add more fruits and vegetables']
        },
        {
          type: 'correlation',
          priority: 'Medium',
          title: 'Adjust Diet Based on Flare Patterns',
          description: 'Monitor fat intake on flare days',
          actions: ['Reduce fat intake on flare days', 'Choose lean proteins']
        },
        {
          type: 'general',
          priority: 'Low',
          title: 'Follow IBD Nutrition Guidelines',
          description: 'Maintain a balanced diet following IBD recommendations',
          actions: [
            'Include lean proteins daily',
            'Choose cooked vegetables over raw',
            'Stay hydrated with water',
            'Consider probiotic foods'
          ]
        }
      ]
    };
    setAnalysisData(mockAnalysis);
  };

  const analyzeNutritionData = (journalEntries, predictions, mealLogs) => {
    const analysis = {
      totalEntries: journalEntries.length,
      flareEntries: 0,
      averageNutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fiber: 0,
        fat: 0
      },
      deficiencies: [],
      flareCorrelations: [],
      recommendations: []
    };

    // Count flare entries based on prediction results
    if (predictions && predictions.length > 0) {
      analysis.flareEntries = predictions.filter(p => p.flare_probability > 0.5).length;
    }

    // Calculate average nutrition from journal entries
    if (journalEntries.length > 0) {
      const totals = journalEntries.reduce((acc, entry) => {
        acc.calories += entry.calories || 0;
        acc.protein += entry.protein || 0;
        acc.carbs += entry.carbs || 0;
        acc.fiber += entry.fiber || 0;
        acc.fat += entry.fat || 0;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0 });

      analysis.averageNutrition = {
        calories: Math.round(totals.calories / journalEntries.length),
        protein: Math.round(totals.protein / journalEntries.length),
        carbs: Math.round(totals.carbs / journalEntries.length),
        fiber: Math.round(totals.fiber / journalEntries.length),
        fat: Math.round(totals.fat / journalEntries.length)
      };
    }

    // Identify deficiencies based on IBD guidelines
    if (analysis.averageNutrition.fiber < 10) {
      analysis.deficiencies.push({
        nutrient: 'Fiber',
        current: analysis.averageNutrition.fiber,
        recommended: '10-15g',
        impact: 'Low fiber can worsen constipation and inflammation'
      });
    }

    if (analysis.averageNutrition.protein < 60) {
      analysis.deficiencies.push({
        nutrient: 'Protein',
        current: analysis.averageNutrition.protein,
        recommended: '60-90g',
        impact: 'Protein is crucial for healing and maintaining muscle mass'
      });
    }

    // Analyze flare correlations by matching journal entries with predictions
    if (predictions && predictions.length > 0 && journalEntries.length > 0) {
      const flareDays = predictions.filter(p => p.flare_probability > 0.5);
      const nonFlareDays = predictions.filter(p => p.flare_probability <= 0.5);

      if (flareDays.length > 0 && nonFlareDays.length > 0) {
        // Get nutrition data for flare vs non-flare days
        const flareNutrition = getAverageNutritionForDays(flareDays, journalEntries);
        const nonFlareNutrition = getAverageNutritionForDays(nonFlareDays, journalEntries);

        if (flareNutrition.fat > nonFlareNutrition.fat * 1.2) {
          analysis.flareCorrelations.push({
            factor: 'High Fat Intake',
            correlation: 'Strong',
            description: `Flare days show ${Math.round((flareNutrition.fat / nonFlareNutrition.fat - 1) * 100)}% higher fat consumption`
          });
        }

        if (flareNutrition.fiber < nonFlareNutrition.fiber * 0.8) {
          analysis.flareCorrelations.push({
            factor: 'Low Fiber Intake',
            correlation: 'Moderate',
            description: 'Flare days show lower fiber consumption'
          });
        }

        if (flareNutrition.calories > nonFlareNutrition.calories * 1.15) {
          analysis.flareCorrelations.push({
            factor: 'High Calorie Intake',
            correlation: 'Moderate',
            description: 'Flare days show higher calorie consumption'
          });
        }
      }
    }

    // Generate recommendations
    if (analysis.deficiencies.length > 0) {
      analysis.recommendations.push({
        type: 'deficiency',
        priority: 'High',
        title: 'Address Nutritional Deficiencies',
        description: 'Focus on increasing intake of identified deficient nutrients',
        actions: analysis.deficiencies.map(d => `Increase ${d.nutrient} intake to ${d.recommended}`)
      });
    }

    if (analysis.flareCorrelations.length > 0) {
      analysis.recommendations.push({
        type: 'correlation',
        priority: 'Medium',
        title: 'Adjust Diet Based on Flare Patterns',
        description: 'Modify intake of foods that correlate with flare episodes',
        actions: analysis.flareCorrelations.map(c => `Monitor ${c.factor} intake`)
      });
    }

    // Add IBD-specific recommendations based on meal logs
    if (mealLogs && mealLogs.length > 0) {
      const foodItems = mealLogs.flatMap(meal => 
        (meal.food_items || '').split(',').map(item => item.trim().toLowerCase())
      );
      
      const highFatFoods = foodItems.filter(item => 
        ['fried', 'cheese', 'butter', 'cream', 'bacon', 'sausage'].some(fat => item.includes(fat))
      );
      
      if (highFatFoods.length > 0) {
        analysis.recommendations.push({
          type: 'meal_analysis',
          priority: 'Medium',
          title: 'Reduce High-Fat Foods',
          description: 'Consider reducing high-fat foods that may trigger flares',
          actions: ['Limit fried foods', 'Choose lean proteins', 'Use cooking methods like baking or grilling']
        });
      }
    }

    analysis.recommendations.push({
      type: 'general',
      priority: 'Low',
      title: 'Follow IBD Nutrition Guidelines',
      description: 'Maintain a balanced diet following IBD recommendations',
      actions: [
        'Include lean proteins daily',
        'Choose cooked vegetables over raw',
        'Stay hydrated with water',
        'Consider probiotic foods',
        'Eat smaller, more frequent meals'
      ]
    });

    setAnalysisData(analysis);
  };

  const getAverageNutritionForDays = (predictionDays, journalEntries) => {
    const dayDates = predictionDays.map(p => new Date(p.created_at).toDateString());
    const relevantEntries = journalEntries.filter(entry => 
      dayDates.includes(new Date(entry.created_at).toDateString())
    );

    if (relevantEntries.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0 };
    }

    const totals = relevantEntries.reduce((acc, entry) => {
      acc.calories += entry.calories || 0;
      acc.protein += entry.protein || 0;
      acc.carbs += entry.carbs || 0;
      acc.fiber += entry.fiber || 0;
      acc.fat += entry.fat || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0 });

    return {
      calories: totals.calories / relevantEntries.length,
      protein: totals.protein / relevantEntries.length,
      carbs: totals.carbs / relevantEntries.length,
      fiber: totals.fiber / relevantEntries.length,
      fat: totals.fat / relevantEntries.length
    };
  };

  useEffect(() => {
    fetchNutritionData();
  }, [timeRange]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return <AlertTriangle className="w-4 h-4" />;
      case 'Medium': return <Clock className="w-4 h-4" />;
      case 'Low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Utensils className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nutrition Analyzer</h2>
            <p className="text-gray-600">AI-powered nutrition insights for IBD management</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {analysisData && (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'deficiencies', label: 'Deficiencies', icon: AlertTriangle },
                { id: 'correlations', label: 'Flare Correlations', icon: TrendingUp },
                { id: 'recommendations', label: 'Recommendations', icon: CheckCircle }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Entries</p>
                        <p className="text-2xl font-bold text-blue-900">{analysisData.totalEntries}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-600">Flare Episodes</p>
                        <p className="text-2xl font-bold text-red-900">{analysisData.flareEntries}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-600">Flare Rate</p>
                        <p className="text-2xl font-bold text-green-900">
                          {analysisData.totalEntries > 0 
                            ? Math.round((analysisData.flareEntries / analysisData.totalEntries) * 100)
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Daily Nutrition</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(analysisData.averageNutrition).map(([nutrient, value]) => (
                      <div key={nutrient} className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-sm text-gray-600 capitalize">{nutrient}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">IBD Guidelines</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-yellow-700">
                        <strong>Recommended:</strong> Lean proteins, cooked vegetables, bananas
                      </p>
                      <p className="text-sm text-yellow-700">
                        <strong>Avoid:</strong> High-fat foods, spicy foods, raw vegetables
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Key Insights</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-purple-700">
                        • {analysisData.deficiencies.length} nutritional deficiencies identified
                      </p>
                      <p className="text-sm text-purple-700">
                        • {analysisData.flareCorrelations.length} flare correlations found
                      </p>
                      <p className="text-sm text-purple-700">
                        • {analysisData.recommendations.length} personalized recommendations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deficiencies' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Nutritional Deficiencies</h3>
                {analysisData.deficiencies.length > 0 ? (
                  analysisData.deficiencies.map((deficiency, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-800">{deficiency.nutrient}</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Current: {deficiency.current}g | Recommended: {deficiency.recommended}
                          </p>
                          <p className="text-sm text-red-600 mt-2">{deficiency.impact}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-800">No Major Deficiencies</h4>
                        <p className="text-sm text-green-700">Your nutrition appears to be well-balanced!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'correlations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Flare Correlations</h3>
                {analysisData.flareCorrelations.length > 0 ? (
                  analysisData.flareCorrelations.map((correlation, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-yellow-800">{correlation.factor}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              correlation.correlation === 'Strong' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {correlation.correlation}
                            </span>
                          </div>
                          <p className="text-sm text-yellow-700 mt-1">{correlation.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-800">No Clear Correlations</h4>
                        <p className="text-sm text-blue-700">More data needed to identify flare patterns</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
                {analysisData.recommendations.map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {getPriorityIcon(rec.priority)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                            {rec.priority} Priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                        <div className="space-y-1">
                          {rec.actions.map((action, actionIndex) => (
                            <div key={actionIndex} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!analysisData && !loading && (
        <div className="text-center py-12">
          <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Nutrition Data Available</h3>
          <p className="text-gray-600">Start logging your meals and symptoms to get personalized nutrition insights.</p>
        </div>
      )}
    </div>
  );
};

export default NutritionAnalyzer; 