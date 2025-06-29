import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  Search, 
  Filter,
  ExternalLink,
  Star,
  Globe,
  GraduationCap,
  Building,
  Home,
  DollarSign,
  Coffee,
  Award,
  Phone,
  Mail,
  Share2,
  Bookmark,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const EventsTab = ({ currentUser }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocale, setUserLocale] = useState('en-US');
  const [userTimezone, setUserTimezone] = useState('America/New_York');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Get user's locale and timezone
    const locale = navigator.language || 'en-US';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserLocale(locale);
    setUserTimezone(timezone);
    
    loadEvents();
    
    // Set up daily refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimer = setTimeout(() => {
      loadEvents();
    }, timeUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, []);

  const loadEvents = () => {
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];
    
    // Mock data for local events - in real app, this would come from an API
    const allEvents = [
      // Health Service Provider Events
      {
        id: 1,
        title: "Pediatric IBD Clinic Open House",
        description: "Meet our pediatric gastroenterology team and learn about our comprehensive IBD care program for children.",
        category: "healthcare",
        type: "clinic",
        organization: "Children's Hospital Gastroenterology Department",
        startDate: "2025-06-25",
        endDate: "2025-06-25",
        startTime: "14:00",
        endTime: "16:00",
        location: "Children's Hospital, Main Campus",
        address: "123 Medical Center Dr, City, State 12345",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        maxAttendees: 50,
        currentAttendees: 23,
        price: 0,
        registrationRequired: true,
        registrationUrl: "https://childrenshospital.org/ibd-clinic-open-house",
        contactPhone: "(555) 123-4567",
        contactEmail: "ibdclinic@childrenshospital.org",
        tags: ["pediatric", "clinic", "healthcare", "free"],
        featured: true,
        lastUpdated: currentDateString
      },
      {
        id: 2,
        title: "IBD Treatment Options Seminar",
        description: "Educational seminar on the latest treatment options for pediatric IBD patients.",
        category: "healthcare",
        type: "seminar",
        organization: "University Medical Center",
        startDate: "2025-06-28",
        endDate: "2025-06-28",
        startTime: "10:00",
        endTime: "12:00",
        location: "University Medical Center, Conference Room A",
        address: "456 University Ave, City, State 12345",
        coordinates: { lat: 40.7589, lng: -73.9851 },
        maxAttendees: 100,
        currentAttendees: 67,
        price: 25,
        registrationRequired: true,
        registrationUrl: "https://umc.edu/ibd-seminar",
        contactPhone: "(555) 987-6543",
        contactEmail: "events@umc.edu",
        tags: ["treatment", "education", "seminar"],
        featured: true,
        lastUpdated: currentDateString
      },

      // University Events
      {
        id: 3,
        title: "IBD Research Symposium",
        description: "Annual symposium showcasing the latest research in inflammatory bowel disease treatment and management.",
        category: "university",
        type: "symposium",
        organization: "State University Medical School",
        startDate: "2025-07-05",
        endDate: "2025-07-07",
        startTime: "09:00",
        endTime: "17:00",
        location: "University Conference Center",
        address: "789 College Blvd, City, State 12345",
        coordinates: { lat: 40.7505, lng: -73.9934 },
        maxAttendees: 200,
        currentAttendees: 145,
        price: 150,
        registrationRequired: true,
        registrationUrl: "https://stateuniversity.edu/ibd-symposium",
        contactPhone: "(555) 456-7890",
        contactEmail: "research@stateuniversity.edu",
        tags: ["research", "symposium", "academic"],
        featured: true,
        lastUpdated: currentDateString
      },
      {
        id: 4,
        title: "Pediatric Nutrition Workshop",
        description: "Hands-on workshop teaching parents how to prepare nutritious meals for children with IBD.",
        category: "university",
        type: "workshop",
        organization: "Nutrition Department, State University",
        startDate: "2025-07-12",
        endDate: "2025-07-12",
        startTime: "13:00",
        endTime: "16:00",
        location: "University Teaching Kitchen",
        address: "321 Campus Way, City, State 12345",
        coordinates: { lat: 40.7484, lng: -73.9857 },
        maxAttendees: 30,
        currentAttendees: 18,
        price: 45,
        registrationRequired: true,
        registrationUrl: "https://stateuniversity.edu/nutrition-workshop",
        contactPhone: "(555) 234-5678",
        contactEmail: "nutrition@stateuniversity.edu",
        tags: ["nutrition", "workshop", "cooking"],
        featured: false,
        lastUpdated: currentDateString
      },

      // Camps
      {
        id: 5,
        title: "Camp Oasis - Summer Session",
        description: "Week-long summer camp for children with IBD, providing fun activities while teaching self-management skills.",
        category: "camps",
        type: "summer-camp",
        organization: "Crohn's & Colitis Foundation",
        startDate: "2025-07-15",
        endDate: "2025-07-21",
        startTime: "09:00",
        endTime: "17:00",
        location: "Camp Sunshine",
        address: "1000 Lake View Rd, Mountain City, State 12345",
        coordinates: { lat: 41.8781, lng: -87.6298 },
        maxAttendees: 80,
        currentAttendees: 72,
        price: 500,
        registrationRequired: true,
        registrationUrl: "https://www.crohnscolitisfoundation.org/camp-oasis",
        contactPhone: "(555) 345-6789",
        contactEmail: "camp@crohnscolitisfoundation.org",
        tags: ["summer-camp", "children", "outdoor"],
        featured: true,
        lastUpdated: currentDateString
      },
      {
        id: 6,
        title: "Weekend Family Camp",
        description: "Weekend retreat for families affected by IBD to connect, learn, and have fun together.",
        category: "camps",
        type: "family-camp",
        organization: "IBD Family Support Network",
        startDate: "2025-07-26",
        endDate: "2025-07-27",
        startTime: "10:00",
        endTime: "16:00",
        location: "Family Retreat Center",
        address: "500 Forest Lane, Countryside, State 12345",
        coordinates: { lat: 42.3601, lng: -71.0589 },
        maxAttendees: 40,
        currentAttendees: 28,
        price: 200,
        registrationRequired: true,
        registrationUrl: "https://ibdfamilysupport.org/weekend-camp",
        contactPhone: "(555) 567-8901",
        contactEmail: "family@ibdfamilysupport.org",
        tags: ["family", "weekend", "retreat"],
        featured: false,
        lastUpdated: currentDateString
      },

      // Fundraisers
      {
        id: 7,
        title: "Take Steps Walk for IBD",
        description: "Annual fundraising walk to support IBD research and patient programs. Join thousands of walkers!",
        category: "fundraisers",
        type: "walk",
        organization: "Crohn's & Colitis Foundation",
        startDate: "2025-08-02",
        endDate: "2025-08-02",
        startTime: "08:00",
        endTime: "12:00",
        location: "Central Park",
        address: "Central Park, New York, NY 10024",
        coordinates: { lat: 40.7829, lng: -73.9654 },
        maxAttendees: 5000,
        currentAttendees: 3200,
        price: 0,
        registrationRequired: true,
        registrationUrl: "https://www.crohnscolitisfoundation.org/take-steps",
        contactPhone: "(555) 678-9012",
        contactEmail: "takesteps@crohnscolitisfoundation.org",
        tags: ["walk", "fundraising", "community"],
        featured: true,
        lastUpdated: currentDateString
      },
      {
        id: 8,
        title: "IBD Research Gala",
        description: "Elegant evening gala to raise funds for pediatric IBD research and treatment programs.",
        category: "fundraisers",
        type: "gala",
        organization: "Pediatric IBD Research Foundation",
        startDate: "2025-08-15",
        endDate: "2025-08-15",
        startTime: "18:00",
        endTime: "22:00",
        location: "Grand Hotel Ballroom",
        address: "200 Luxury Ave, City, State 12345",
        coordinates: { lat: 40.7589, lng: -73.9851 },
        maxAttendees: 300,
        currentAttendees: 245,
        price: 150,
        registrationRequired: true,
        registrationUrl: "https://pibdrf.org/gala",
        contactPhone: "(555) 789-0123",
        contactEmail: "gala@pibdrf.org",
        tags: ["gala", "fundraising", "research"],
        featured: true,
        lastUpdated: currentDateString
      },

      // Social Meetups
      {
        id: 9,
        title: "Caregiver Coffee & Chat",
        description: "Monthly meetup for parents and caregivers of children with IBD to share experiences and support.",
        category: "social",
        type: "meetup",
        organization: "IBD Caregiver Support Group",
        startDate: "2025-06-30",
        endDate: "2025-06-30",
        startTime: "10:00",
        endTime: "12:00",
        location: "Local Coffee Shop",
        address: "150 Main St, City, State 12345",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        maxAttendees: 25,
        currentAttendees: 12,
        price: 0,
        registrationRequired: false,
        contactPhone: "(555) 890-1234",
        contactEmail: "caregivers@ibdsupport.org",
        tags: ["caregivers", "support", "coffee"],
        featured: false,
        lastUpdated: currentDateString
      },
      {
        id: 10,
        title: "Teen IBD Support Group",
        description: "Monthly support group for teenagers with IBD to connect, share experiences, and build friendships.",
        category: "social",
        type: "support-group",
        organization: "Teen IBD Network",
        startDate: "2025-07-08",
        endDate: "2025-07-08",
        startTime: "16:00",
        endTime: "18:00",
        location: "Community Center",
        address: "300 Community Dr, City, State 12345",
        coordinates: { lat: 40.7505, lng: -73.9934 },
        maxAttendees: 20,
        currentAttendees: 8,
        price: 0,
        registrationRequired: false,
        contactPhone: "(555) 901-2345",
        contactEmail: "teens@ibdsupport.org",
        tags: ["teens", "support", "peer-group"],
        featured: false,
        lastUpdated: currentDateString
      },

      // Fairs
      {
        id: 11,
        title: "Health & Wellness Fair",
        description: "Annual health fair featuring local healthcare providers, nutritionists, and wellness experts.",
        category: "fairs",
        type: "health-fair",
        organization: "City Health Department",
        startDate: "2025-08-10",
        endDate: "2025-08-10",
        startTime: "09:00",
        endTime: "17:00",
        location: "City Convention Center",
        address: "400 Convention Blvd, City, State 12345",
        coordinates: { lat: 40.7484, lng: -73.9857 },
        maxAttendees: 1000,
        currentAttendees: 650,
        price: 0,
        registrationRequired: false,
        contactPhone: "(555) 012-3456",
        contactEmail: "healthfair@city.gov",
        tags: ["health-fair", "wellness", "free"],
        featured: true,
        lastUpdated: currentDateString
      },
      {
        id: 12,
        title: "Pediatric Health Expo",
        description: "Expo showcasing pediatric healthcare services, treatments, and resources for families.",
        category: "fairs",
        type: "expo",
        organization: "Pediatric Healthcare Alliance",
        startDate: "2025-08-22",
        endDate: "2025-08-22",
        startTime: "10:00",
        endTime: "16:00",
        location: "Exhibition Hall",
        address: "600 Expo Way, City, State 12345",
        coordinates: { lat: 42.3601, lng: -71.0589 },
        maxAttendees: 500,
        currentAttendees: 320,
        price: 10,
        registrationRequired: false,
        contactPhone: "(555) 123-4567",
        contactEmail: "expo@pediatrichc.org",
        tags: ["expo", "pediatric", "healthcare"],
        featured: false,
        lastUpdated: currentDateString
      }
    ];

    // Filter out past events and sort by relevance
    const currentEvents = allEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= currentDate;
    });

    // Sort by date, then by featured status, then by attendees
    const sortedEvents = currentEvents.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      
      if (a.featured !== b.featured) {
        return b.featured ? 1 : -1;
      }
      
      return b.currentAttendees - a.currentAttendees;
    });

    setEvents(sortedEvents);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const categories = [
    { id: 'all', label: 'All Events', icon: Calendar, count: events.length },
    { id: 'healthcare', label: 'Healthcare', icon: Building, count: events.filter(e => e.category === 'healthcare').length },
    { id: 'university', label: 'University', icon: GraduationCap, count: events.filter(e => e.category === 'university').length },
    { id: 'camps', label: 'Camps', icon: Home, count: events.filter(e => e.category === 'camps').length },
    { id: 'fundraisers', label: 'Fundraisers', icon: DollarSign, count: events.filter(e => e.category === 'fundraisers').length },
    { id: 'social', label: 'Social Meetups', icon: Coffee, count: events.filter(e => e.category === 'social').length },
    { id: 'fairs', label: 'Fairs & Expos', icon: Award, count: events.filter(e => e.category === 'fairs').length }
  ];

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(c => c.id === category);
    return categoryData ? categoryData.icon : Calendar;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(userLocale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(userLocale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriceDisplay = (price) => {
    return price === 0 ? 'Free' : `$${price}`;
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Local Events</h1>
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
          Discover local events for pediatric IBD patients and caregivers. Find healthcare seminars, camps, fundraisers, social meetups, and more in your area.
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
                placeholder="Search events..."
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const CategoryIcon = getCategoryIcon(event.category);
          const daysUntil = getDaysUntil(event.startDate);
          
          return (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {event.category}
                    </span>
                    {event.featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${event.price === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                    {getPriceDisplay(event.price)}
                  </span>
                  {daysUntil === 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      Today
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

              {/* Event Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.currentAttendees}/{event.maxAttendees} attending</span>
                </div>
              </div>

              {/* Organization */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-800">{event.organization}</span>
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
                <div className="flex items-center gap-2">
                  <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save
                  </button>
                  <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {event.registrationRequired ? (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Register
                    </a>
                  ) : (
                    <div className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Drop-in Welcome
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    <span>{event.contactPhone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>{event.contactEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your search terms or selecting a different category.</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">About These Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-800 mb-1">Local Focus</h4>
            <p className="text-sm text-gray-600">Events in your area based on your location</p>
          </div>
          <div className="text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-800 mb-1">Daily Updates</h4>
            <p className="text-sm text-gray-600">Updated daily with current events</p>
          </div>
          <div className="text-center">
            <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-800 mb-1">Pediatric Focus</h4>
            <p className="text-sm text-gray-600">Specialized for children and caregivers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsTab; 