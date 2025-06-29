import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Search, 
  Filter,
  ExternalLink,
  Play,
  Calendar,
  Users,
  TrendingUp,
  Heart,
  Apple,
  Microscope,
  GraduationCap,
  Globe,
  Clock,
  Star,
  Download,
  Share2
} from 'lucide-react';

const ResourcesTab = ({ currentUser }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = () => {
    // Mock data for IBD resources - in real app, this would come from an API
    const allResources = [
      // Medical Journals
      {
        id: 1,
        title: "Inflammatory Bowel Diseases Journal",
        description: "Peer-reviewed journal covering the latest research in IBD, Crohn's disease, and ulcerative colitis.",
        category: "journals",
        type: "journal",
        url: "https://academic.oup.com/ibdjournal",
        publisher: "Oxford University Press",
        impactFactor: "4.5",
        lastUpdated: "2025-06-23",
        tags: ["research", "peer-reviewed", "clinical"],
        featured: true,
        access: "subscription"
      },
      {
        id: 2,
        title: "Journal of Crohn's and Colitis",
        description: "Official journal of the European Crohn's and Colitis Organisation (ECCO).",
        category: "journals",
        type: "journal",
        url: "https://academic.oup.com/ecco-jcc",
        publisher: "Oxford University Press",
        impactFactor: "8.0",
        lastUpdated: "2025-06-22",
        tags: ["ecco", "european", "clinical-trials"],
        featured: true,
        access: "subscription"
      },
      {
        id: 3,
        title: "Gastroenterology",
        description: "Leading journal in gastrointestinal research, including IBD studies.",
        category: "journals",
        type: "journal",
        url: "https://www.gastrojournal.org",
        publisher: "American Gastroenterological Association",
        impactFactor: "33.9",
        lastUpdated: "2025-06-21",
        tags: ["gastroenterology", "high-impact", "research"],
        featured: true,
        access: "subscription"
      },

      // Research Articles
      {
        id: 4,
        title: "Microbiome and IBD: Current Understanding",
        description: "Comprehensive review of the gut microbiome's role in IBD pathogenesis and treatment.",
        category: "articles",
        type: "research-article",
        url: "https://www.nature.com/articles/s41575-023-00800-4",
        publisher: "Nature Reviews Gastroenterology & Hepatology",
        authors: "Dr. Sarah Johnson, Dr. Michael Chen",
        publishDate: "2025-06-15",
        tags: ["microbiome", "pathogenesis", "review"],
        featured: true,
        access: "free"
      },
      {
        id: 5,
        title: "Novel Therapies for Pediatric IBD",
        description: "Latest developments in treatment options for children with inflammatory bowel disease.",
        category: "articles",
        type: "research-article",
        url: "https://www.sciencedirect.com/science/article/pii/S0016508523001234",
        publisher: "Gastroenterology",
        authors: "Dr. Emily Rodriguez, Dr. David Kim",
        publishDate: "2025-06-10",
        tags: ["pediatric", "treatment", "novel-therapies"],
        featured: true,
        access: "subscription"
      },
      {
        id: 6,
        title: "Diet and IBD: Evidence-Based Recommendations",
        description: "Systematic review of dietary interventions for IBD management.",
        category: "articles",
        type: "review-article",
        url: "https://www.cghjournal.org/article/S1542-3565(23)00789-2/fulltext",
        publisher: "Clinical Gastroenterology and Hepatology",
        authors: "Dr. Lisa Wang, Dr. Robert Thompson",
        publishDate: "2025-06-08",
        tags: ["diet", "nutrition", "evidence-based"],
        featured: false,
        access: "subscription"
      },

      // Nutrition Plans
      {
        id: 7,
        title: "IBD-Friendly Meal Planning Guide",
        description: "Comprehensive meal planning guide with recipes and nutritional guidelines for IBD patients.",
        category: "nutrition",
        type: "meal-plan",
        url: "https://www.crohnscolitisfoundation.org/nutrition",
        publisher: "Crohn's & Colitis Foundation",
        fileType: "PDF",
        pages: 45,
        lastUpdated: "2025-06-20",
        tags: ["meal-planning", "recipes", "guidelines"],
        featured: true,
        access: "free"
      },
      {
        id: 8,
        title: "Low-FODMAP Diet for IBD",
        description: "Complete guide to implementing a low-FODMAP diet for symptom management.",
        category: "nutrition",
        type: "diet-guide",
        url: "https://www.ibdnutrition.org/low-fodmap",
        publisher: "IBD Nutrition Alliance",
        fileType: "PDF",
        pages: 32,
        lastUpdated: "2025-06-18",
        tags: ["low-fodmap", "symptom-management", "diet"],
        featured: false,
        access: "free"
      },
      {
        id: 9,
        title: "Anti-Inflammatory Diet for IBD",
        description: "Evidence-based anti-inflammatory diet plan with food lists and recipes.",
        category: "nutrition",
        type: "diet-plan",
        url: "https://www.ibdhealth.org/anti-inflammatory-diet",
        publisher: "IBD Health Network",
        fileType: "PDF",
        pages: 28,
        lastUpdated: "2025-06-16",
        tags: ["anti-inflammatory", "diet", "recipes"],
        featured: false,
        access: "free"
      },

      // Educational Videos
      {
        id: 10,
        title: "Understanding IBD: A Patient's Guide",
        description: "Comprehensive video series explaining IBD, symptoms, and treatment options.",
        category: "videos",
        type: "educational",
        url: "https://www.youtube.com/watch?v=ibd-patient-guide",
        publisher: "Crohn's & Colitis Foundation",
        duration: "45:30",
        views: "125,000",
        uploadDate: "2025-06-15",
        tags: ["patient-education", "symptoms", "treatment"],
        featured: true,
        access: "free"
      },
      {
        id: 11,
        title: "IBD-Friendly Cooking: Quick Meals",
        description: "Video series showing how to prepare quick, nutritious meals for IBD patients.",
        category: "videos",
        type: "cooking",
        url: "https://www.youtube.com/watch?v=ibd-cooking-quick",
        publisher: "IBD Nutrition Channel",
        duration: "12:45",
        views: "89,000",
        uploadDate: "2025-06-12",
        tags: ["cooking", "quick-meals", "nutrition"],
        featured: true,
        access: "free"
      },
      {
        id: 12,
        title: "Exercise and IBD: Safe Workouts",
        description: "Exercise routines specifically designed for IBD patients.",
        category: "videos",
        type: "exercise",
        url: "https://www.youtube.com/watch?v=ibd-exercise-safe",
        publisher: "IBD Fitness",
        duration: "25:20",
        views: "67,000",
        uploadDate: "2025-06-10",
        tags: ["exercise", "fitness", "wellness"],
        featured: false,
        access: "free"
      },

      // Current Research
      {
        id: 13,
        title: "Stem Cell Therapy for IBD",
        description: "Latest research on stem cell therapy as a potential cure for IBD.",
        category: "research",
        type: "clinical-trial",
        url: "https://clinicaltrials.gov/ct2/show/NCT04519684",
        publisher: "National Institutes of Health",
        status: "Recruiting",
        location: "Multiple Centers",
        startDate: "2025-01-15",
        tags: ["stem-cells", "clinical-trial", "cure"],
        featured: true,
        access: "free"
      },
      {
        id: 14,
        title: "Microbiome Transplantation Study",
        description: "Research on fecal microbiota transplantation for IBD treatment.",
        category: "research",
        type: "clinical-trial",
        url: "https://clinicaltrials.gov/ct2/show/NCT04519685",
        publisher: "Mayo Clinic",
        status: "Active",
        location: "Rochester, MN",
        startDate: "2025-03-01",
        tags: ["microbiome", "fmt", "treatment"],
        featured: false,
        access: "free"
      },
      {
        id: 15,
        title: "AI-Powered IBD Diagnosis",
        description: "Artificial intelligence applications for early IBD detection and diagnosis.",
        category: "research",
        type: "technology",
        url: "https://www.nature.com/articles/s41598-023-45678-1",
        publisher: "Nature Scientific Reports",
        authors: "Dr. Alex Chen, Dr. Maria Garcia",
        publishDate: "2025-06-05",
        tags: ["ai", "diagnosis", "technology"],
        featured: true,
        access: "free"
      },

      // Patient Support
      {
        id: 16,
        title: "IBD Support Group Directory",
        description: "Comprehensive directory of IBD support groups by location and type.",
        category: "support",
        type: "directory",
        url: "https://www.ibdsupport.org/groups",
        publisher: "IBD Support Network",
        lastUpdated: "2025-06-22",
        tags: ["support-groups", "community", "local"],
        featured: false,
        access: "free"
      },
      {
        id: 17,
        title: "Mental Health Resources for IBD",
        description: "Mental health support and counseling resources specifically for IBD patients.",
        category: "support",
        type: "mental-health",
        url: "https://www.ibdmentalhealth.org/resources",
        publisher: "IBD Mental Health Alliance",
        lastUpdated: "2025-06-20",
        tags: ["mental-health", "counseling", "support"],
        featured: false,
        access: "free"
      }
    ];

    setResources(allResources);
    setLoading(false);
  };

  const categories = [
    { id: 'all', label: 'All Resources', icon: Globe, count: resources.length },
    { id: 'journals', label: 'Medical Journals', icon: BookOpen, count: resources.filter(r => r.category === 'journals').length },
    { id: 'articles', label: 'Research Articles', icon: FileText, count: resources.filter(r => r.category === 'articles').length },
    { id: 'nutrition', label: 'Nutrition Plans', icon: Apple, count: resources.filter(r => r.category === 'nutrition').length },
    { id: 'videos', label: 'Educational Videos', icon: Video, count: resources.filter(r => r.category === 'videos').length },
    { id: 'research', label: 'Current Research', icon: Microscope, count: resources.filter(r => r.category === 'research').length },
    { id: 'support', label: 'Patient Support', icon: Heart, count: resources.filter(r => r.category === 'support').length }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData ? categoryData.icon : Globe;
  };

  const getAccessColor = (access) => {
    return access === 'free' ? 'text-green-600' : 'text-blue-600';
  };

  const formatDuration = (duration) => {
    const [minutes, seconds] = duration.split(':');
    return `${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <BookOpen className="h-8 w-8 text-purple-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">IBD Resources</h1>
        </div>
        <p className="text-gray-600">
          Comprehensive collection of resources for IBD, Crohn's disease, colitis, and related conditions. 
          Find medical journals, research articles, nutrition plans, educational videos, and current research.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredResources.map((resource) => {
          const CategoryIcon = getCategoryIcon(resource.category);
          return (
            <div key={resource.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {resource.category}
                    </span>
                    {resource.featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getAccessColor(resource.access)}`}>
                    {resource.access === 'free' ? 'Free' : 'Subscription'}
                  </span>
                  {resource.type === 'video' && (
                    <Play className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-3">{resource.description}</p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{resource.publisher}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{resource.lastUpdated || resource.publishDate || resource.uploadDate}</span>
                </div>
              </div>

              {/* Additional Info */}
              {resource.impactFactor && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Impact Factor:</span>
                    <span className="text-sm text-blue-700 ml-2">{resource.impactFactor}</span>
                  </div>
                </div>
              )}

              {resource.duration && (
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{formatDuration(resource.duration)}</span>
                  <span className="mx-2">•</span>
                  <span>{resource.views} views</span>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {resource.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {resource.authors && `By ${resource.authors}`}
                  {resource.fileType && ` • ${resource.fileType}`}
                  {resource.pages && ` • ${resource.pages} pages`}
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </button>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {resource.type === 'video' ? 'Watch' : 'View'}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search terms or selecting a different category.</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">About These Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-800 mb-1">Peer-Reviewed</h4>
            <p className="text-sm text-gray-600">All journals and articles are peer-reviewed</p>
          </div>
          <div className="text-center">
            <Video className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-800 mb-1">Educational Videos</h4>
            <p className="text-sm text-gray-600">Short, informative videos for patients</p>
          </div>
          <div className="text-center">
            <Microscope className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-800 mb-1">Current Research</h4>
            <p className="text-sm text-gray-600">Latest developments in IBD treatment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesTab; 