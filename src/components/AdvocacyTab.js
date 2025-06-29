import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ExternalLink, 
  Vote, 
  Calendar, 
  MapPin, 
  Users, 
  TrendingUp,
  Award,
  FileText,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

const AdvocacyTab = ({ currentUser }) => {
  const [advocacyEvents, setAdvocacyEvents] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocale, setUserLocale] = useState('en-US');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Get user's locale
    const locale = navigator.language || 'en-US';
    setUserLocale(locale);
    
    // Load advocacy events
    loadAdvocacyEvents();
    
    // Load user's previous votes
    loadUserVotes();

    // Set up daily refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const dailyRefreshTimer = setTimeout(() => {
      loadAdvocacyEvents();
      // Set up recurring daily refresh
      setInterval(loadAdvocacyEvents, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => {
      clearTimeout(dailyRefreshTimer);
    };
  }, []);

  const loadAdvocacyEvents = () => {
    // Get current date for filtering
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];
    
    // Mock data for advocacy events - in real app, this would come from an API
    const allEvents = [
      {
        id: 1,
        title: "IBD Insurance Coverage Reform Act",
        description: "Legislation to expand insurance coverage for IBD medications and treatments, reducing out-of-pocket costs for patients.",
        category: "legislation",
        status: "active",
        priority: "high",
        website: "https://www.crohnscolitisfoundation.org/advocacy",
        startDate: "2025-01-15",
        endDate: "2025-12-31",
        location: "National",
        organizer: "Crohn's & Colitis Foundation",
        votes: 1247,
        goal: 5000,
        impact: "Could reduce medication costs by 60% for IBD patients",
        tags: ["insurance", "medication-costs", "federal"],
        lastUpdated: "2025-06-23"
      },
      {
        id: 2,
        title: "Pediatric IBD Research Funding Initiative",
        description: "Campaign to increase federal funding for pediatric IBD research and clinical trials.",
        category: "research",
        status: "active",
        priority: "high",
        website: "https://www.ibdadvocacy.org/pediatric-research",
        startDate: "2025-02-01",
        endDate: "2025-11-30",
        location: "National",
        organizer: "IBD Advocacy Network",
        votes: 892,
        goal: 3000,
        impact: "Aims to secure $50M in additional research funding",
        tags: ["research", "pediatric", "funding"],
        lastUpdated: "2025-06-22"
      },
      {
        id: 3,
        title: "State-Level Medication Access Program",
        description: "State initiative to improve access to IBD medications through pharmacy benefit reforms.",
        category: "legislation",
        status: "active",
        priority: "medium",
        website: "https://www.stateibd.org/medication-access",
        startDate: "2025-03-01",
        endDate: "2025-10-31",
        location: "California",
        organizer: "California IBD Coalition",
        votes: 567,
        goal: 2000,
        impact: "Could improve medication access for 50,000+ patients",
        tags: ["state", "medication-access", "pharmacy"],
        lastUpdated: "2025-06-21"
      },
      {
        id: 4,
        title: "Workplace Accommodations for IBD",
        description: "Advocacy for better workplace accommodations and disability protections for IBD patients.",
        category: "rights",
        status: "active",
        priority: "medium",
        website: "https://www.ibdworkplace.org",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        location: "National",
        organizer: "IBD Workplace Rights",
        votes: 445,
        goal: 1500,
        impact: "Could establish new workplace protection standards",
        tags: ["workplace", "disability", "accommodations"],
        lastUpdated: "2025-06-20"
      },
      {
        id: 5,
        title: "Mental Health Support for IBD Patients",
        description: "Campaign to include mental health services in IBD treatment plans and insurance coverage.",
        category: "healthcare",
        status: "active",
        priority: "medium",
        website: "https://www.ibdmentalhealth.org",
        startDate: "2025-02-15",
        endDate: "2025-11-15",
        location: "National",
        organizer: "IBD Mental Health Alliance",
        votes: 378,
        goal: 1200,
        impact: "Could provide mental health coverage for 100,000+ patients",
        tags: ["mental-health", "insurance", "treatment"],
        lastUpdated: "2025-06-19"
      },
      {
        id: 6,
        title: "Emergency Room IBD Protocols",
        description: "Advocacy for standardized emergency room protocols for IBD patients to improve care quality.",
        category: "healthcare",
        status: "active",
        priority: "medium",
        website: "https://www.ibder.org/protocols",
        startDate: "2025-03-15",
        endDate: "2025-09-30",
        location: "National",
        organizer: "IBD Emergency Response",
        votes: 234,
        goal: 800,
        impact: "Could improve emergency care for 200,000+ patients annually",
        tags: ["emergency-care", "protocols", "healthcare"],
        lastUpdated: "2025-06-18"
      },
      {
        id: 7,
        title: "School Accommodations for IBD Students",
        description: "Campaign to improve school accommodations and support for students with IBD.",
        category: "education",
        status: "active",
        priority: "medium",
        website: "https://www.ibdschools.org",
        startDate: "2025-04-01",
        endDate: "2025-08-31",
        location: "National",
        organizer: "IBD Education Support",
        votes: 189,
        goal: 600,
        impact: "Could benefit 25,000+ students with IBD",
        tags: ["education", "schools", "accommodations"],
        lastUpdated: "2025-06-17"
      },
      {
        id: 8,
        title: "Clinical Trial Access Expansion",
        description: "Advocacy to expand access to clinical trials for IBD patients, especially in underserved areas.",
        category: "research",
        status: "active",
        priority: "medium",
        website: "https://www.ibdtrials.org/access",
        startDate: "2025-05-01",
        endDate: "2025-12-31",
        location: "National",
        organizer: "IBD Clinical Trials Network",
        votes: 156,
        goal: 500,
        impact: "Could increase trial participation by 40%",
        tags: ["clinical-trials", "research", "access"],
        lastUpdated: "2025-06-16"
      },
      {
        id: 9,
        title: "Nutritional Support Programs",
        description: "Campaign to include nutritional counseling and supplements in IBD treatment coverage.",
        category: "healthcare",
        status: "active",
        priority: "low",
        website: "https://www.ibdnutrition.org",
        startDate: "2025-06-01",
        endDate: "2025-10-31",
        location: "National",
        organizer: "IBD Nutrition Alliance",
        votes: 98,
        goal: 400,
        impact: "Could provide nutritional support for 75,000+ patients",
        tags: ["nutrition", "supplements", "counseling"],
        lastUpdated: "2025-06-15"
      },
      {
        id: 10,
        title: "Telemedicine Coverage for IBD",
        description: "Advocacy to expand telemedicine coverage and access for IBD patients.",
        category: "healthcare",
        status: "active",
        priority: "low",
        website: "https://www.ibdtelehealth.org",
        startDate: "2025-07-01",
        endDate: "2025-11-30",
        location: "National",
        organizer: "IBD Telehealth Coalition",
        votes: 67,
        goal: 300,
        impact: "Could improve access for 150,000+ patients",
        tags: ["telemedicine", "access", "healthcare"],
        lastUpdated: "2025-06-14"
      },
      // New events that start today or in the future
      {
        id: 11,
        title: "IBD Medication Price Transparency Act",
        description: "New legislation requiring pharmaceutical companies to disclose pricing information for IBD medications.",
        category: "legislation",
        status: "active",
        priority: "high",
        website: "https://www.ibdtransparency.org",
        startDate: currentDateString,
        endDate: "2025-12-31",
        location: "National",
        organizer: "IBD Transparency Coalition",
        votes: 23,
        goal: 2000,
        impact: "Could reduce medication costs by 30% through transparency",
        tags: ["transparency", "pricing", "legislation"],
        lastUpdated: currentDateString
      },
      {
        id: 12,
        title: "Pediatric IBD Awareness Month Campaign",
        description: "Annual campaign to raise awareness about pediatric IBD and advocate for better care.",
        category: "awareness",
        status: "active",
        priority: "medium",
        website: "https://www.pediatricibd.org/awareness",
        startDate: currentDateString,
        endDate: "2025-07-31",
        location: "National",
        organizer: "Pediatric IBD Foundation",
        votes: 45,
        goal: 1000,
        impact: "Could reach 500,000+ families with IBD information",
        tags: ["awareness", "pediatric", "education"],
        lastUpdated: currentDateString
      },
      // Crohn's and Colitis Foundation Programs
      {
        id: 13,
        title: "CCF Take Steps Walk",
        description: "Annual fundraising walk to support IBD research, patient programs, and advocacy efforts.",
        category: "fundraising",
        status: "active",
        priority: "high",
        website: "https://www.crohnscolitisfoundation.org/take-steps",
        startDate: "2025-03-01",
        endDate: "2025-11-30",
        location: "National",
        organizer: "Crohn's & Colitis Foundation",
        votes: 2156,
        goal: 10000,
        impact: "Raises millions annually for IBD research and patient support",
        tags: ["fundraising", "research", "community"],
        lastUpdated: "2025-06-20"
      },
      {
        id: 14,
        title: "CCF Camp Oasis",
        description: "Summer camp program for children and teens with IBD to build confidence and community.",
        category: "support",
        status: "active",
        priority: "medium",
        website: "https://www.crohnscolitisfoundation.org/camp-oasis",
        startDate: "2025-06-01",
        endDate: "2025-08-31",
        location: "Multiple States",
        organizer: "Crohn's & Colitis Foundation",
        votes: 342,
        goal: 500,
        impact: "Provides summer camp experience for 1,000+ children annually",
        tags: ["pediatric", "support", "community"],
        lastUpdated: "2025-06-19"
      },
      {
        id: 15,
        title: "CCF IBD Help Center",
        description: "Free support program providing personalized guidance for IBD patients and families.",
        category: "support",
        status: "active",
        priority: "high",
        website: "https://www.crohnscolitisfoundation.org/help-center",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        location: "National",
        organizer: "Crohn's & Colitis Foundation",
        votes: 892,
        goal: 2000,
        impact: "Helps 50,000+ patients annually with personalized support",
        tags: ["support", "guidance", "patient-care"],
        lastUpdated: "2025-06-18"
      },
      {
        id: 16,
        title: "CCF Research Awards Program",
        description: "Funding program for innovative IBD research projects and clinical trials.",
        category: "research",
        status: "active",
        priority: "high",
        website: "https://www.crohnscolitisfoundation.org/research",
        startDate: "2025-02-01",
        endDate: "2025-12-31",
        location: "National",
        organizer: "Crohn's & Colitis Foundation",
        votes: 567,
        goal: 1500,
        impact: "Funds $50M+ in research annually",
        tags: ["research", "funding", "clinical-trials"],
        lastUpdated: "2025-06-17"
      },
      {
        id: 17,
        title: "CCF Patient Education Series",
        description: "Comprehensive educational programs covering IBD management, treatment options, and lifestyle.",
        category: "education",
        status: "active",
        priority: "medium",
        website: "https://www.crohnscolitisfoundation.org/education",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        location: "National",
        organizer: "Crohn's & Colitis Foundation",
        votes: 445,
        goal: 1000,
        impact: "Educates 100,000+ patients annually",
        tags: ["education", "patient-care", "lifestyle"],
        lastUpdated: "2025-06-16"
      },
      {
        id: 18,
        title: "CCF Advocacy Network",
        description: "Grassroots advocacy program to influence policy and legislation affecting IBD patients.",
        category: "legislation",
        status: "active",
        priority: "high",
        website: "https://www.crohnscolitisfoundation.org/advocacy",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        location: "National",
        organizer: "Crohn's & Colitis Foundation",
        votes: 1234,
        goal: 5000,
        impact: "Influences policy affecting 3+ million IBD patients",
        tags: ["advocacy", "policy", "legislation"],
        lastUpdated: "2025-06-15"
      },
      {
        id: 19,
        title: "CCF IBD Qorus",
        description: "Quality improvement program to enhance IBD care delivery and patient outcomes.",
        category: "healthcare",
        status: "active",
        priority: "medium",
        website: "https://www.crohnscolitisfoundation.org/ibdqorus",
        startDate: "2025-03-01",
        endDate: "2025-12-31",
        location: "National",
        organizer: "Crohn's & Colitis Foundation",
        votes: 234,
        goal: 800,
        impact: "Improves care for 200,000+ patients at 100+ centers",
        tags: ["healthcare", "quality", "patient-outcomes"],
        lastUpdated: "2025-06-14"
      },
      {
        id: 20,
        title: "CCF Mental Health Initiative",
        description: "Program addressing the mental health needs of IBD patients through support groups and counseling.",
        category: "healthcare",
        status: "active",
        priority: "medium",
        website: "https://www.crohnscolitisfoundation.org/mental-health",
        startDate: "2025-04-01",
        endDate: "2025-12-31",
        location: "National",
        organizer: "Crohn's & Colitis Foundation",
        votes: 189,
        goal: 600,
        impact: "Provides mental health support to 25,000+ patients",
        tags: ["mental-health", "support", "counseling"],
        lastUpdated: "2025-06-13"
      }
    ];

    // Filter events based on current date and relevance
    const currentEvents = allEvents.filter(event => {
      const endDate = new Date(event.endDate);
      const startDate = new Date(event.startDate);
      
      // Show events that:
      // 1. Haven't ended yet (endDate >= currentDate)
      // 2. Are currently active or starting soon
      // 3. Were updated within the last 30 days
      const daysSinceUpdate = Math.floor((currentDate - new Date(event.lastUpdated)) / (1000 * 60 * 60 * 24));
      
      return endDate >= currentDate && daysSinceUpdate <= 30;
    });

    // Sort by priority (high first), then by votes, then by recency
    const sortedEvents = currentEvents.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      const voteDiff = b.votes - a.votes;
      if (voteDiff !== 0) return voteDiff;
      
      return new Date(b.lastUpdated) - new Date(a.lastUpdated);
    });

    // Take top 10 most relevant events
    const topEvents = sortedEvents.slice(0, 10);

    setAdvocacyEvents(topEvents);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const loadUserVotes = () => {
    // Load user's previous votes from localStorage or API
    const savedVotes = localStorage.getItem(`ibd_advocacy_votes_${currentUser?.user_id}`);
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }
  };

  const handleVote = async (eventId) => {
    try {
      // In a real app, this would be an API call
      const updatedVotes = { ...userVotes };
      
      if (updatedVotes[eventId]) {
        // Remove vote
        delete updatedVotes[eventId];
        setAdvocacyEvents(prev => prev.map(event => 
          event.id === eventId ? { ...event, votes: event.votes - 1 } : event
        ));
      } else {
        // Add vote
        updatedVotes[eventId] = true;
        setAdvocacyEvents(prev => prev.map(event => 
          event.id === eventId ? { ...event, votes: event.votes + 1 } : event
        ));
      }
      
      setUserVotes(updatedVotes);
      localStorage.setItem(`ibd_advocacy_votes_${currentUser?.user_id}`, JSON.stringify(updatedVotes));
      
      // Show success message
      // In a real app, you might want to show a toast notification
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(userLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressPercentage = (votes, goal) => {
    return Math.min((votes / goal) * 100, 100);
  };

  const filteredEvents = advocacyEvents.filter(event => {
    if (selectedCategory === 'all') return true;
    return event.category === selectedCategory;
  });

  const categories = [
    { id: 'all', label: 'All Programs', icon: Globe },
    { id: 'legislation', label: 'Legislation', icon: FileText },
    { id: 'research', label: 'Research', icon: TrendingUp },
    { id: 'healthcare', label: 'Healthcare', icon: Heart },
    { id: 'rights', label: 'Rights', icon: Award },
    { id: 'education', label: 'Education', icon: Users }
  ];

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">IBD Advocacy Programs</h1>
          </div>
          {lastUpdated && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last updated: {lastUpdated.toLocaleDateString(userLocale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          )}
        </div>
        <p className="text-gray-600">
          Support initiatives that improve the lives of IBD patients. Vote for programs that matter to you and help drive positive change.
          <span className="block mt-2 text-sm text-purple-600">
            💡 This list updates daily to show the most current and relevant advocacy programs.
          </span>
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Advocacy Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                    {event.priority} priority
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleVote(event.id)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  userVotes[event.id]
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Vote className="h-4 w-4 mr-1" />
                {userVotes[event.id] ? 'Voted' : 'Vote'}
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

            {/* Impact */}
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Impact:</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">{event.impact}</p>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{event.votes.toLocaleString()} votes</span>
                <span>Goal: {event.goal.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(event.votes, event.goal)}%` }}
                ></div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{event.location}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {event.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Organized by {event.organizer}
              </div>
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Visit Site
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No programs found</h3>
          <p className="text-gray-500">Try selecting a different category or check back later for new advocacy programs.</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Get Involved</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Vote className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-800 mb-1">Vote for Programs</h4>
            <p className="text-sm text-gray-600">Support initiatives that matter to you</p>
          </div>
          <div className="text-center">
            <ExternalLink className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-800 mb-1">Visit Advocacy Sites</h4>
            <p className="text-sm text-gray-600">Learn more about each program</p>
          </div>
          <div className="text-center">
            <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-800 mb-1">Make a Difference</h4>
            <p className="text-sm text-gray-600">Your voice can drive positive change</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvocacyTab; 