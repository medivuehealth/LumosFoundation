import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  BarChart3,
  Apple,
  Zap
} from 'lucide-react';

const PredictionsModel = ({ userId }) => {
  const [activeModel, setActiveModel] = useState('flare');
  const [flareModelStatus, setFlareModelStatus] = useState('active');
  const [nutritionModelStatus, setNutritionModelStatus] = useState('inactive');
  const [flareModelMetrics, setFlareModelMetrics] = useState({
    accuracy: 0.85,
    precision: 0.82,
    recall: 0.78,
    f1Score: 0.80,
    lastUpdated: '2025-06-23',
    totalPredictions: 1250,
    successRate: 0.92
  });
  const [nutritionModelMetrics, setNutritionModelMetrics] = useState({
    accuracy: 0.0,
    precision: 0.0,
    recall: 0.0,
    f1Score: 0.0,
    lastUpdated: 'Not trained',
    totalPredictions: 0,
    successRate: 0.0
  });

  const [flareModelConfig, setFlareModelConfig] = useState({
    version: '1.0.0',
    algorithm: 'Random Forest',
    features: 15,
    trainingDataSize: 5000,
    lastTrainingDate: '2025-06-15'
  });

  const [nutritionModelConfig, setNutritionModelConfig] = useState({
    version: '0.1.0',
    algorithm: 'Not configured',
    features: 0,
    trainingDataSize: 0,
    lastTrainingDate: 'Not available'
  });

  useEffect(() => {
    // Fetch model status and metrics
    fetchModelStatus();
  }, []);

  const fetchModelStatus = async () => {
    try {
      // TODO: Implement API calls to fetch actual model status
      console.log('Fetching model status...');
    } catch (error) {
      console.error('Error fetching model status:', error);
    }
  };

  const handleModelSwitch = (modelType) => {
    setActiveModel(modelType);
  };

  const handleModelRetrain = async (modelType) => {
    try {
      console.log(`Retraining ${modelType} model...`);
      // TODO: Implement model retraining logic
    } catch (error) {
      console.error(`Error retraining ${modelType} model:`, error);
    }
  };

  const handleModelDeploy = async (modelType) => {
    try {
      console.log(`Deploying ${modelType} model...`);
      // TODO: Implement model deployment logic
    } catch (error) {
      console.error(`Error deploying ${modelType} model:`, error);
    }
  };

  const renderModelCard = (modelType, title, description, icon, status, metrics, config) => {
    const isActive = activeModel === modelType;
    const isModelActive = status === 'active';

    return (
      <div className={`bg-white rounded-xl border-2 p-6 transition-all duration-200 ${
        isActive ? 'border-purple-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isModelActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isModelActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isModelActive ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={() => handleModelSwitch(modelType)}
              className={`p-1 rounded ${
                isActive ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Model Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Accuracy</span>
              <span className="text-sm font-semibold text-gray-800">
                {(metrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">F1 Score</span>
              <span className="text-sm font-semibold text-gray-800">
                {(metrics.f1Score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Predictions</span>
              <span className="text-sm font-semibold text-gray-800">
                {metrics.totalPredictions.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-semibold text-gray-800">
                {(metrics.successRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Model Configuration */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>Version: {config.version}</div>
            <div>Algorithm: {config.algorithm}</div>
            <div>Features: {config.features}</div>
            <div>Training Data: {config.trainingDataSize.toLocaleString()}</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Last Updated: {config.lastTrainingDate}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleModelRetrain(modelType)}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Retrain Model
          </button>
          <button
            onClick={() => handleModelDeploy(modelType)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              isModelActive
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            disabled={isModelActive}
          >
            {isModelActive ? 'Deployed' : 'Deploy'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Predictions Model</h1>
        <p className="text-gray-600">
          Manage and monitor your machine learning models for health predictions
        </p>
      </div>

      {/* Model Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {renderModelCard(
          'flare',
          'Flare Predictions Model',
          'Predicts IBD flare-ups based on symptoms and lifestyle data',
          <Brain size={20} />,
          flareModelStatus,
          flareModelMetrics,
          flareModelConfig
        )}
        
        {renderModelCard(
          'nutrition',
          'Nutrition Analyzer Model',
          'Analyzes nutritional data and provides dietary recommendations',
          <Apple size={20} />,
          nutritionModelStatus,
          nutritionModelMetrics,
          nutritionModelConfig
        )}
      </div>

      {/* Model Performance Charts */}
      {activeModel === 'flare' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Flare Predictions Model Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
              <div className="text-2xl font-bold text-purple-600">
                {(flareModelMetrics.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Accuracy</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
              <div className="text-2xl font-bold text-green-600">
                {flareModelMetrics.totalPredictions.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Predictions</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="mx-auto mb-2 text-blue-600" size={24} />
              <div className="text-sm font-semibold text-blue-600">
                {flareModelConfig.lastTrainingDate}
              </div>
              <div className="text-sm text-gray-600">Last Training</div>
            </div>
          </div>
        </div>
      )}

      {activeModel === 'nutrition' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Nutrition Analyzer Model Status
          </h3>
          <div className="text-center py-8">
            <Apple className="mx-auto mb-4 text-gray-400" size={48} />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              Model Not Yet Implemented
            </h4>
            <p className="text-gray-500 mb-4">
              The nutrition analyzer model is currently in development. 
              Features will include dietary analysis, nutritional recommendations, 
              and meal planning optimization.
            </p>
            <button className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
              Coming Soon
            </button>
          </div>
        </div>
      )}

      {/* Model Settings Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Model Settings - {activeModel === 'flare' ? 'Flare Predictions' : 'Nutrition Analyzer'}
        </h3>
        
        {activeModel === 'flare' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Version
                </label>
                <input
                  type="text"
                  value={flareModelConfig.version}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Algorithm
                </label>
                <input
                  type="text"
                  value={flareModelConfig.algorithm}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Update Model
              </button>
              <button className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                Export Model
              </button>
              <button className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                Reset Model
              </button>
            </div>
          </div>
        )}

        {activeModel === 'nutrition' && (
          <div className="text-center py-8">
            <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              Settings Not Available
            </h4>
            <p className="text-gray-500">
              Model settings will be available once the nutrition analyzer is implemented.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionsModel; 