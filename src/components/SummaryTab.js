import React, { useState } from 'react';
import { Activity, Heart, Brain, PlayCircle, ThumbsUp, Clock, User } from 'lucide-react';
import ReactPlayer from 'react-player';

function SummaryTab() {
  const [activeVideo, setActiveVideo] = useState(null);

  const videos = [
    {
      id: 1,
      title: "Mayo Clinic Explains Crohn's Disease",
      duration: "5:32",
      author: "Mayo Clinic",
      views: "1.2M",
      url: "https://www.youtube.com/watch?v=6jJpA-LHZ5I",
      thumbnail: "https://img.youtube.com/vi/6jJpA-LHZ5I/hqdefault.jpg",
      category: "Education"
    },
    {
      id: 2,
      title: "Understanding IBD: Crohn's & Ulcerative Colitis",
      duration: "7:15",
      author: "Cleveland Clinic",
      views: "850K",
      url: "https://www.youtube.com/watch?v=Keqzt83KMVA",
      thumbnail: "https://img.youtube.com/vi/Keqzt83KMVA/hqdefault.jpg",
      category: "Education"
    },
    {
      id: 3,
      title: "Living Well with IBD: Diet & Lifestyle Tips",
      duration: "6:45",
      author: "Mount Sinai Health System",
      views: "500K",
      url: "https://www.youtube.com/watch?v=iefghc2g91M",
      thumbnail: "https://img.youtube.com/vi/iefghc2g91M/hqdefault.jpg",
      category: "Lifestyle"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Health Summary Section */}
      <div className="bg-gradient-to-r from-ibd-100 to-ibd-200 p-6 rounded-2xl">
        <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Health Summary</h2>
        <p className="text-gray-600">Your weekly health overview and metrics</p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-ibd-200 hover:shadow-soft transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Activity className="text-ibd-500 mr-2" size={24} />
              <h3 className="text-lg font-display font-semibold text-gray-800">Flare-up Risk</h3>
            </div>
            <span className="text-2xl font-bold text-ibd-500">Low</span>
          </div>
          <p className="text-gray-600">Based on your recent symptoms and activity</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-ibd-200 hover:shadow-soft transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Heart className="text-ibd-500 mr-2" size={24} />
              <h3 className="text-lg font-display font-semibold text-gray-800">Overall Health</h3>
            </div>
            <span className="text-2xl font-bold text-healing-500">Good</span>
          </div>
          <p className="text-gray-600">Your health score has improved this week</p>
        </div>
      </div>

      {/* Educational Videos Section */}
      <div className="bg-white rounded-xl border border-ibd-200 p-6">
        <h3 className="text-xl font-display font-bold text-gray-800 mb-4">Educational Resources</h3>
        
        {/* Active Video Player */}
        {activeVideo && (
          <div className="mb-6">
            <div className="relative pt-[56.25%] rounded-xl overflow-hidden">
              <ReactPlayer
                url={activeVideo.url}
                width="100%"
                height="100%"
                controls
                playing
                className="absolute top-0 left-0"
              />
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800">{activeVideo.title}</h4>
              <p className="text-gray-600">{activeVideo.author}</p>
            </div>
          </div>
        )}

        {/* Video List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group cursor-pointer"
              onClick={() => setActiveVideo(video)}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="text-white" size={48} />
                </div>
              </div>
              <div className="mt-2">
                <h4 className="font-semibold text-gray-800 group-hover:text-ibd-500 transition-colors">{video.title}</h4>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock size={14} className="mr-1" />
                  <span>{video.duration}</span>
                  <User size={14} className="ml-3 mr-1" />
                  <span>{video.author}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <ThumbsUp size={14} className="mr-1" />
                  <span>{video.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SummaryTab;