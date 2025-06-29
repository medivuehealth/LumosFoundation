import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Users, 
  Brain, 
  Calendar, 
  Heart, 
  Settings, 
  BarChart3,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Play,
  Shield,
  Database,
  Zap,
  Globe,
  Smartphone,
  Video,
  FileVideo,
  GraduationCap,
  Award,
  MessageSquare,
  MapPin,
  Star
} from 'lucide-react';

const Documentation = () => {
  const [expandedSections, setExpandedSections] = useState(new Set(['overview']));

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const features = [
    {
      id: 'symptom-tracking',
      title: 'Symptom Journaling & Tracking',
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      purpose: 'Comprehensive daily health monitoring for pediatric IBD patients',
      description: 'Track 20+ health indicators including bowel frequency, pain levels, medication adherence, nutrition, and lifestyle factors.',
      howItWorks: [
        'Daily symptom logging through an intuitive form interface',
        'Bristol Stool Scale for bowel consistency assessment',
        'Pain location mapping and severity tracking',
        'Medication adherence monitoring with dosage validation',
        'Nutrition tracking with allergen detection',
        'Sleep, stress, and fatigue level monitoring',
        'Data visualization with trend analysis and charts'
      ],
      benefits: [
        'Comprehensive health record for healthcare providers',
        'Early detection of symptom patterns',
        'Improved medication adherence tracking',
        'Better communication with medical team',
        'Personalized health insights'
      ],
      technicalDetails: {
        'Data Storage': 'PostgreSQL database with HIPAA-compliant encryption',
        'Validation': 'Real-time input validation and data integrity checks',
        'Export': 'PDF and CSV export capabilities for healthcare providers',
        'Integration': 'API endpoints for EHR system integration'
      }
    },
    {
      id: 'flare-prediction',
      title: 'AI-Powered Flare Prediction',
      icon: <Brain className="h-6 w-6 text-purple-600" />,
      purpose: 'Predict IBD flares with 85% accuracy using machine learning',
      description: 'Advanced ML model analyzes health data to predict flare risk and provide early warnings.',
      howItWorks: [
        'Gradient Boosting Classifier analyzes 20+ health indicators',
        'Real-time data processing and feature engineering',
        'Risk assessment with confidence scoring',
        'Personalized recommendations based on prediction results',
        'Historical pattern analysis for trend identification',
        'Continuous model improvement through feedback loops'
      ],
      benefits: [
        'Early warning system for potential flares',
        'Reduced emergency hospital visits',
        'Proactive treatment planning',
        'Improved quality of life through better management',
        'Data-driven healthcare decisions'
      ],
      technicalDetails: {
        'Model Type': 'Gradient Boosting Classifier (XGBoost)',
        'Accuracy': '85% prediction accuracy',
        'Features': '20+ health indicators analyzed',
        'Processing': 'Real-time prediction with <2 second response time',
        'Deployment': 'Docker containerized Flask service'
      }
    },
    {
      id: 'community-support',
      title: 'Community & Peer Support',
      icon: <Users className="h-6 w-6 text-green-600" />,
      purpose: 'Connect pediatric IBD patients and families for mutual support',
      description: 'Safe, moderated community platform for sharing experiences, asking questions, and building connections.',
      howItWorks: [
        'Categorized discussion forums (Recovery Stories, Questions, Hobbies)',
        'Inspiring recovery stories from pediatric patients',
        'Peer-to-peer advice and support system',
        'Age-appropriate content filtering',
        'Moderated discussions for safety',
        'Like and comment system for engagement',
        'Featured stories highlighting achievements'
      ],
      benefits: [
        'Emotional support from peers who understand',
        'Practical advice from experienced patients',
        'Reduced feelings of isolation',
        'Motivation through success stories',
        'Safe space for questions and concerns'
      ],
      technicalDetails: {
        'Moderation': 'Automated and manual content filtering',
        'Privacy': 'User-controlled privacy settings',
        'Categories': 'Story, Question, Hobby, Friendship filters',
        'Engagement': 'Like, comment, and share functionality',
        'Safety': 'Age-appropriate content guidelines'
      }
    },
    {
      id: 'advocacy-events',
      title: 'IBD Advocacy & Events',
      icon: <Award className="h-6 w-6 text-orange-600" />,
      purpose: 'Empower patients and families to participate in IBD advocacy',
      description: 'Information and tools for participating in IBD advocacy programs, voting on important issues, and staying informed about legislative changes.',
      howItWorks: [
        'Daily updated advocacy opportunities',
        'Community voting system on important issues',
        'Information about law change programs',
        'Local and national advocacy events',
        'Educational resources about patient rights',
        'Direct links to advocacy organizations',
        'Progress tracking for advocacy initiatives'
      ],
      benefits: [
        'Voice in healthcare policy decisions',
        'Increased awareness of patient rights',
        'Community-driven advocacy efforts',
        'Connection to larger IBD community',
        'Empowerment through collective action'
      ],
      technicalDetails: {
        'Updates': 'Daily content refresh from advocacy sources',
        'Voting': 'Secure voting system with user authentication',
        'Content': 'Curated advocacy opportunities and resources',
        'Integration': 'Links to external advocacy platforms',
        'Tracking': 'User participation and impact metrics'
      }
    },
    {
      id: 'local-events',
      title: 'Local Events Discovery',
      icon: <MapPin className="h-6 w-6 text-red-600" />,
      purpose: 'Find and connect with local IBD events and activities',
      description: 'Location-based event discovery for healthcare events, camps, fundraisers, and social meetups.',
      howItWorks: [
        'Location-based event filtering',
        'Multiple event categories (healthcare, camps, fundraisers)',
        'Registration links and contact information',
        'Date-based filtering and sorting',
        'Event details and descriptions',
        'Daily updates with new events',
        'User-friendly search and filtering'
      ],
      benefits: [
        'Easy discovery of local IBD resources',
        'Opportunities for in-person connections',
        'Access to specialized healthcare events',
        'Participation in community activities',
        'Reduced isolation through local engagement'
      ],
      technicalDetails: {
        'Categories': 'Healthcare, University, Camps, Fundraisers, Social, Fairs',
        'Filtering': 'Location, date, category, and search filters',
        'Updates': 'Daily event refresh and new additions',
        'Integration': 'Direct links to event registration',
        'Location': 'GPS-based location services (optional)'
      }
    },
    {
      id: 'educational-resources',
      title: 'Educational Resource Library',
      icon: <GraduationCap className="h-6 w-6 text-indigo-600" />,
      purpose: 'Comprehensive educational materials for IBD understanding and management',
      description: 'Extensive library of medical journals, research articles, nutrition plans, treatment guidelines, and educational videos.',
      howItWorks: [
        'Categorized resource organization',
        'Medical journals and research papers',
        'Educational videos and patient stories',
        'Nutrition plans and dietary guidelines',
        'Treatment protocols and best practices',
        'Age-appropriate learning materials',
        'Searchable content with filters'
      ],
      benefits: [
        'Evidence-based educational content',
        'Improved understanding of IBD',
        'Better treatment compliance',
        'Informed healthcare decisions',
        'Family education and support'
      ],
      technicalDetails: {
        'Categories': 'Journals, Research, Nutrition, Treatment, Videos, Guides',
        'Content': 'Curated medical and educational resources',
        'Search': 'Advanced search with category filtering',
        'Media': 'Video streaming and document viewing',
        'Updates': 'Regular content additions and updates'
      }
    },
    {
      id: 'health-analytics',
      title: 'Health Analytics & Insights',
      icon: <BarChart3 className="h-6 w-6 text-teal-600" />,
      purpose: 'Visualize health trends and gain insights from collected data',
      description: 'Advanced analytics dashboard providing trend analysis, correlation insights, and personalized health recommendations.',
      howItWorks: [
        'Interactive charts and visualizations',
        'Trend analysis over time periods',
        'Correlation analysis between symptoms and factors',
        'Personalized health insights and recommendations',
        'Progress tracking and goal setting',
        'Export capabilities for healthcare providers',
        'Customizable date ranges and metrics'
      ],
      benefits: [
        'Clear visualization of health patterns',
        'Data-driven treatment decisions',
        'Progress tracking and motivation',
        'Better communication with healthcare team',
        'Personalized health insights'
      ],
      technicalDetails: {
        'Charts': 'Interactive charts using Recharts library',
        'Analysis': 'Statistical correlation and trend analysis',
        'Export': 'PDF and CSV export functionality',
        'Customization': 'User-defined date ranges and metrics',
        'Integration': 'Real-time data from journal entries'
      }
    },
    {
      id: 'security-compliance',
      title: 'Security & HIPAA Compliance',
      icon: <Shield className="h-6 w-6 text-gray-600" />,
      purpose: 'Ensure patient data security and regulatory compliance',
      description: 'Comprehensive security measures and HIPAA compliance features to protect sensitive health information.',
      howItWorks: [
        'End-to-end data encryption',
        'JWT-based authentication system',
        'Role-based access control',
        'Comprehensive audit logging',
        'HIPAA-compliant data handling',
        'Secure data transmission (HTTPS)',
        'Regular security assessments'
      ],
      benefits: [
        'Complete protection of sensitive health data',
        'Regulatory compliance for healthcare applications',
        'Trust and confidence for users and providers',
        'Audit trail for compliance verification',
        'Secure access control and authentication'
      ],
      technicalDetails: {
        'Encryption': '256-bit AES encryption at rest and in transit',
        'Authentication': 'JWT tokens with secure session management',
        'Compliance': 'HIPAA-compliant data handling and storage',
        'Audit': 'Comprehensive access and activity logging',
        'Security': 'Regular vulnerability assessments and updates'
      }
    },
    {
      id: 'mobile-accessibility',
      title: 'Mobile & Accessibility',
      icon: <Smartphone className="h-6 w-6 text-pink-600" />,
      purpose: 'Ensure platform accessibility across all devices and users',
      description: 'Responsive design and accessibility features for users with diverse needs and abilities.',
      howItWorks: [
        'Responsive design for all screen sizes',
        'Screen reader compatibility',
        'Keyboard navigation support',
        'High contrast mode options',
        'Font scaling and text size adjustment',
        'Touch-friendly interface design',
        'Cross-browser compatibility'
      ],
      benefits: [
        'Accessible to users with disabilities',
        'Consistent experience across devices',
        'Improved usability for all users',
        'Compliance with accessibility standards',
        'Better user experience on mobile devices'
      ],
      technicalDetails: {
        'Standards': 'WCAG 2.1 AA compliance',
        'Responsive': 'Mobile-first responsive design',
        'Accessibility': 'Screen reader and keyboard navigation support',
        'Browser': 'Cross-browser compatibility testing',
        'Performance': 'Optimized for mobile devices'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Medivue Documentation</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive guide to understanding the features, functionality, and benefits of the Medivue Pediatric IBD Care Platform
          </p>
        </div>

        {/* Overview Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('overview')}
          >
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
            </div>
            {expandedSections.has('overview') ? (
              <ChevronDown className="h-6 w-6 text-gray-500" />
            ) : (
              <ChevronRight className="h-6 w-6 text-gray-500" />
            )}
          </div>
          
          {expandedSections.has('overview') && (
            <div className="mt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What is Medivue?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Medivue is a comprehensive digital health platform specifically designed for pediatric Inflammatory Bowel Disease (IBD) patients, 
                    caregivers, and healthcare providers. It combines advanced machine learning, community support, and educational resources to 
                    provide holistic care for pediatric IBD patients.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Benefits</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                      AI-powered flare prediction with 85% accuracy
                    </li>
                    <li className="flex items-center">
                      <Users className="h-4 w-4 text-green-500 mr-2" />
                      Community support and peer connections
                    </li>
                    <li className="flex items-center">
                      <Shield className="h-4 w-4 text-blue-500 mr-2" />
                      HIPAA-compliant security and privacy
                    </li>
                    <li className="flex items-center">
                      <GraduationCap className="h-4 w-4 text-purple-500 mr-2" />
                      Comprehensive educational resources
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Target Users</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-900">Pediatric Patients</h4>
                    <p className="text-sm text-blue-700">Ages 5-18 with IBD diagnosis</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Heart className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-900">Caregivers</h4>
                    <p className="text-sm text-green-700">Parents and family members</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <Star className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-purple-900">Healthcare Providers</h4>
                    <p className="text-sm text-purple-700">Doctors, nurses, and specialists</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Documentation */}
        <div className="space-y-8">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div 
                className="p-8 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(feature.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {feature.icon}
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold text-gray-900">{feature.title}</h2>
                      <p className="text-gray-600 mt-1">{feature.purpose}</p>
                    </div>
                  </div>
                  {expandedSections.has(feature.id) ? (
                    <ChevronDown className="h-6 w-6 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-6 w-6 text-gray-500" />
                  )}
                </div>
              </div>

              {expandedSections.has(feature.id) && (
                <div className="px-8 pb-8 space-y-6">
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Play className="h-5 w-5 text-green-600 mr-2" />
                        How It Works
                      </h3>
                      <ul className="space-y-2">
                        {feature.howItWorks.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Award className="h-5 w-5 text-blue-600 mr-2" />
                        Benefits
                      </h3>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="text-gray-600">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Database className="h-5 w-5 text-purple-600 mr-2" />
                      Technical Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(feature.technicalDetails).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium text-gray-700">{key}:</span>
                            <span className="text-gray-600">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Getting Started Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mt-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of pediatric IBD patients and families using Medivue to improve their health outcomes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                <ExternalLink className="h-5 w-5 mr-2" />
                Try Demo
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>For technical documentation and API references, visit our developer portal</p>
          <div className="flex justify-center mt-4 space-x-6">
            <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              API Documentation
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
              <Video className="h-4 w-4 mr-1" />
              Video Tutorials
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
              <GraduationCap className="h-4 w-4 mr-1" />
              Training Materials
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation; 