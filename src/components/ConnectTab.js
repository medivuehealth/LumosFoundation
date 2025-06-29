import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Flag, Send, Image as ImageIcon, Smile, ThumbsUp, Users, MessageCircle, Star, Award, TrendingUp, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './ConnectTab.css';

function ConnectTab() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    content: '',
    image: null,
    category: 'story'
  });
  const [filter, setFilter] = useState('all');
  const [showEmojis, setShowEmojis] = useState(false);

  // Recovery stories data
  const recoveryStories = [
    {
      id: 1,
      name: "Emma, 14",
      age: 14,
      diagnosis: "Crohn's Disease",
      diagnosisDate: "2022",
      recoveryTime: "18 months",
      story: "I was diagnosed with Crohn's when I was 12. It was really scary at first, but with the right treatment and support from my family and doctors, I'm now in remission! I can play soccer again and even made the school team. My advice: never give up hope! 💪",
      achievements: ["Returned to soccer team", "Maintained straight A's", "Started a support group at school"],
      tips: ["Find a hobby you love", "Stay connected with friends", "Listen to your body"],
      image: null,
      featured: true,
      likes: 127,
      comments: 23,
      timestamp: new Date('2025-06-20').toISOString(),
      category: 'story'
    },
    {
      id: 2,
      name: "Jake, 16",
      age: 16,
      diagnosis: "Ulcerative Colitis",
      diagnosisDate: "2021",
      recoveryTime: "12 months",
      story: "My journey with UC started when I was 14. I missed a lot of school and felt really isolated. But I found amazing support online and learned to advocate for myself. Now I'm helping other teens navigate their IBD journey! 🌟",
      achievements: ["Started teen IBD blog", "Public speaking at conferences", "College acceptance"],
      tips: ["Educate yourself about your condition", "Build a support network", "Don't be afraid to ask for help"],
      image: null,
      featured: true,
      likes: 89,
      comments: 15,
      timestamp: new Date('2025-06-18').toISOString(),
      category: 'story'
    },
    {
      id: 3,
      name: "Sophia, 11",
      age: 11,
      diagnosis: "Crohn's Disease",
      diagnosisDate: "2023",
      recoveryTime: "8 months",
      story: "I'm the youngest in my family and was diagnosed last year. My big sister helped me so much! We started a YouTube channel to share our journey and help other kids. It's amazing how many friends we've made! 🎥",
      achievements: ["YouTube channel with 500+ subscribers", "School presentation about IBD", "Art therapy program"],
      tips: ["Express yourself through art", "Stay close to family", "Share your story"],
      image: null,
      featured: false,
      likes: 156,
      comments: 31,
      timestamp: new Date('2025-06-15').toISOString(),
      category: 'story'
    },
    {
      id: 4,
      name: "Marcus, 15",
      age: 15,
      diagnosis: "Ulcerative Colitis",
      diagnosisDate: "2020",
      recoveryTime: "24 months",
      story: "I had a really tough time with my UC - multiple hospital stays and surgery. But I never lost hope. I started weightlifting during recovery and now I'm stronger than ever! My message: your illness doesn't define you. 💪",
      achievements: ["Weightlifting competition winner", "School leadership role", "Mentor for younger patients"],
      tips: ["Find physical activities you enjoy", "Set small, achievable goals", "Celebrate every victory"],
      image: null,
      featured: true,
      likes: 203,
      comments: 42,
      timestamp: new Date('2025-06-12').toISOString(),
      category: 'story'
    },
    {
      id: 5,
      name: "Lily, 13",
      age: 13,
      diagnosis: "Crohn's Disease",
      diagnosisDate: "2022",
      recoveryTime: "14 months",
      story: "I love dancing, but my Crohn's made it really hard. I thought I'd never dance again, but with the right treatment and lots of practice, I'm back on stage! I even choreographed a dance about my journey. 🩰",
      achievements: ["Dance competition winner", "Created IBD awareness dance", "School dance team captain"],
      tips: ["Keep doing what you love", "Be patient with yourself", "Find creative ways to express yourself"],
      image: null,
      featured: false,
      likes: 178,
      comments: 28,
      timestamp: new Date('2025-06-10').toISOString(),
      category: 'story'
    }
  ];

  // Load posts from localStorage on component mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('connectPosts');
    if (savedPosts) {
      const parsedPosts = JSON.parse(savedPosts);
      // Check if recovery stories are already included
      const hasRecoveryStories = parsedPosts.some(post => post.category === 'story' && post.story);
      if (!hasRecoveryStories) {
        // Add recovery stories if they're not already present
        const postsWithStories = [...parsedPosts, ...recoveryStories];
        setPosts(postsWithStories);
        localStorage.setItem('connectPosts', JSON.stringify(postsWithStories));
      } else {
        setPosts(parsedPosts);
      }
    } else {
      // Add some sample posts if none exist
      const samplePosts = [
        {
          id: 1,
          name: "Sarah M.",
          message: "Just had my first appointment with the new pediatric gastroenterologist. Feeling hopeful! Anyone else in the Boston area?",
          likes: 12,
          comments: 5,
          timestamp: new Date('2025-06-23T10:30:00').toISOString(),
          category: 'post'
        },
        {
          id: 2,
          name: "Mike R.",
          message: "My son's flare seems to be getting better with the new medication. Fingers crossed this continues!",
          likes: 8,
          comments: 3,
          timestamp: new Date('2025-06-23T09:15:00').toISOString(),
          category: 'post'
        },
        {
          id: 3,
          name: "Dr. Johnson",
          message: "Important reminder: Make sure to keep track of your symptoms daily. This helps us adjust treatment plans more effectively.",
          likes: 25,
          comments: 12,
          timestamp: new Date('2025-06-23T08:45:00').toISOString(),
          category: 'post'
        },
        {
          id: 4,
          name: "Lisa K.",
          message: "Does anyone have experience with dietary changes helping with Crohn's symptoms? Looking for advice.",
          likes: 15,
          comments: 8,
          timestamp: new Date('2025-06-22T16:20:00').toISOString(),
          category: 'question'
        },
        {
          id: 5,
          name: "David P.",
          message: "Just wanted to share that my daughter's latest blood work came back normal! Small victories matter! 🎉",
          likes: 20,
          comments: 6,
          timestamp: new Date('2025-06-22T14:10:00').toISOString(),
          category: 'post'
        },
        // Include recovery stories in the initial posts
        ...recoveryStories
      ];
      setPosts(samplePosts);
      localStorage.setItem('connectPosts', JSON.stringify(samplePosts));
    }
  }, [recoveryStories]);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('connectPosts', JSON.stringify(posts));
  }, [posts]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    const post = {
      id: Date.now(),
      name: 'You',  // In a real app, this would come from user profile
      message: newPost.content,
      category: newPost.category,
      likes: 0,
      comments: [],
      timestamp: new Date().toISOString(),
      image: newPost.image
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ content: '', image: null, category: 'story' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleComment = (postId, comment) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            comments: Array.isArray(post.comments) 
              ? [...post.comments, { author: 'You', content: comment }]
              : [{ author: 'You', content: comment }]
          }
        : post
    ));
  };

  const categories = [
    { id: 'all', label: 'All Posts' },
    { id: 'story', label: 'Recovery Stories' },
    { id: 'question', label: 'Questions' },
    { id: 'hobby', label: 'Hobbies & Fun' },
    { id: 'friendship', label: 'Make Friends' }
  ];

  const emojis = ['😊', '💪', '🎉', '❤️', '⭐', '🌟', '🎨', '🎮', '🎵', '🌈'];

  const renderMessage = (message) => {
    return (
      <div className={`message ${message.role === 'assistant' ? 'assistant' : 'user'}`}>
        {message.role === 'assistant' ? (
          <div className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={{
                // Custom components for markdown elements
                h1: ({node, ...props}) => <h1 className="markdown-h1" {...props} />,
                h2: ({node, ...props}) => <h2 className="markdown-h2" {...props} />,
                h3: ({node, ...props}) => <h3 className="markdown-h3" {...props} />,
                p: ({node, ...props}) => <p className="markdown-p" {...props} />,
                ul: ({node, ...props}) => <ul className="markdown-ul" {...props} />,
                ol: ({node, ...props}) => <ol className="markdown-ol" {...props} />,
                li: ({node, ...props}) => <li className="markdown-li" {...props} />,
                strong: ({node, ...props}) => <strong className="markdown-strong" {...props} />,
                em: ({node, ...props}) => <em className="markdown-em" {...props} />,
                code: ({node, ...props}) => <code className="markdown-code" {...props} />,
                pre: ({node, ...props}) => <pre className="markdown-pre" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p>{message.content}</p>
        )}
      </div>
    );
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'question') return post.category === 'question';
    if (filter === 'story') return post.category === 'story';
    if (filter === 'hobby') return post.category === 'hobby';
    if (filter === 'friendship') return post.category === 'friendship';
    return post.category === 'post';
  });

  // Debug logging
  console.log('Current filter:', filter);
  console.log('All posts:', posts);
  console.log('Filtered posts:', filteredPosts);
  console.log('Recovery stories count:', posts.filter(post => post.category === 'story').length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-ibd-100 via-ibd-200 to-ibd-300 p-6 rounded-2xl shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Connect</h2>
            <p className="text-gray-600">Share your story, find support</p>
          </div>
          <Users className="text-ibd-500" size={32} />
        </div>
      </div>

      {/* Create Post */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create a Post</h3>
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <div>
            <select
              value={newPost.category}
              onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg mb-3"
            >
              <option value="story">Share Your Story</option>
              <option value="question">Ask a Question</option>
              <option value="hobby">Share a Hobby</option>
              <option value="friendship">Make Friends</option>
            </select>
            <div className="relative">
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px]"
              />
              <div className="absolute bottom-2 right-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <Smile size={20} />
                </button>
              </div>
            </div>
            {showEmojis && (
              <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="flex flex-wrap gap-2">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewPost(prev => ({ ...prev, content: prev.content + emoji }));
                        setShowEmojis(false);
                      }}
                      className="text-xl hover:bg-gray-100 p-1 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-gray-800">
              <ImageIcon size={20} />
              <span>Add Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {newPost.image && (
              <div className="relative">
                <img
                  src={newPost.image}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => setNewPost(prev => ({ ...prev, image: null }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <Send size={20} className="mr-2" />
            Share Post
          </button>
        </form>
      </div>

      {/* Filter Posts */}
      <div className="flex overflow-x-auto pb-2 space-x-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setFilter(category.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              filter === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map(post => (
          <div key={post.id} className={`bg-white p-6 rounded-xl border ${post.featured ? 'border-purple-300 bg-purple-50' : 'border-gray-200'}`}>
            {post.featured && (
              <div className="flex items-center mb-3">
                <Star className="h-5 w-5 text-yellow-500 fill-current mr-2" />
                <span className="text-sm font-medium text-yellow-700">Featured Story</span>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-800 text-lg">{post.name || post.author}</h4>
                {post.age && (
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span>{post.age} years old</span>
                    {post.diagnosis && (
                      <>
                        <span>•</span>
                        <span>{post.diagnosis}</span>
                      </>
                    )}
                    {post.diagnosisDate && (
                      <>
                        <span>•</span>
                        <span>Diagnosed {post.diagnosisDate}</span>
                      </>
                    )}
                  </div>
                )}
                <span className="text-sm text-gray-500">
                  {new Date(post.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div className="text-right">
                {post.recoveryTime && (
                  <>
                    <div className="text-sm text-gray-600">Recovery Time</div>
                    <div className="font-semibold text-green-600">{post.recoveryTime}</div>
                  </>
                )}
                <span className={`px-3 py-1 rounded-full text-sm ${
                  post.category === 'story' ? 'bg-green-100 text-green-800' :
                  post.category === 'question' ? 'bg-blue-100 text-blue-800' :
                  post.category === 'hobby' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {categories.find(c => c.id === post.category)?.label}
                </span>
              </div>
            </div>

            {/* Story content for recovery stories */}
            {post.story && (
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{post.story}</p>
              </div>
            )}

            {/* Regular post content */}
            {post.message && (
              <p className="text-gray-700 mb-4">{post.message}</p>
            )}

            {/* Achievements and Tips for recovery stories */}
            {post.achievements && post.tips && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Achievements
                  </h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    {post.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Tips for Others
                  </h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {post.tips.map((tip, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="mb-4 rounded-lg max-h-96 w-full object-cover"
              />
            )}

            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-500"
              >
                <Heart size={20} />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
                <MessageCircle size={20} />
                <span>{Array.isArray(post.comments) ? post.comments.length : post.comments}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-green-500">
                <Share2 size={20} />
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-orange-500">
                <Flag size={20} />
              </button>
            </div>

            {/* Comments */}
            {Array.isArray(post.comments) && post.comments.length > 0 && (
              <div className="space-y-3">
                {post.comments.map((comment, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{comment.author}</span>
                      <button className="text-gray-500 hover:text-blue-500">
                        <ThumbsUp size={16} />
                      </button>
                    </div>
                    <p className="text-gray-600 mt-1">{comment.content}</p>
                  </div>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const comment = e.target.comment.value;
                    if (comment.trim()) {
                      handleComment(post.id, comment);
                      e.target.comment.value = '';
                    }
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    name="comment"
                    placeholder="Write a comment..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-healing-100 p-4 rounded-xl border border-healing-200 text-center">
          <span className="block text-2xl font-bold text-healing-500">1.2k</span>
          <span className="text-sm text-gray-600">Members</span>
        </div>
        <div className="bg-comfort-100 p-4 rounded-xl border border-comfort-200 text-center">
          <span className="block text-2xl font-bold text-comfort-500">450</span>
          <span className="text-sm text-gray-600">Stories</span>
        </div>
        <div className="bg-ibd-100 p-4 rounded-xl border border-ibd-200 text-center">
          <span className="block text-2xl font-bold text-ibd-500">89</span>
          <span className="text-sm text-gray-600">Online</span>
        </div>
      </div>
    </div>
  );
}

export default ConnectTab; 