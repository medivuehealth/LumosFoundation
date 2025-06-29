import React from 'react';

const FOUNDATION_DOMAIN = process.env.REACT_APP_FOUNDATION_DOMAIN || 'lumosfoundation.org';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ibd-100 via-healing-100 to-comfort-100 font-sans">
      {/* Header */}
      <header className="bg-white/80 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Lumos Foundation Logo" className="h-10 w-10 drop-shadow-glow" />
            <span className="text-3xl font-display font-bold text-ibd-700 tracking-tight">Lumos Foundation</span>
          </div>
          <nav className="hidden md:flex space-x-8 text-lg font-medium">
            <a href="#mission" className="hover:text-ibd-500 transition">Mission</a>
            <a href="#blog" className="hover:text-healing-500 transition">Blog</a>
            <a href="#events" className="hover:text-comfort-500 transition">Events</a>
            <a href="#volunteer" className="hover:text-accent-blue transition">Volunteer</a>
            <a href="#donate" className="hover:text-accent-yellow transition">Donate</a>
            <a href="#contact" className="hover:text-accent-pink transition">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-br from-ibd-100 via-healing-100 to-comfort-100">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-ibd-700 mb-4 drop-shadow-glow">Lighting the Path for Pediatric IBD & Oncology</h1>
        <p className="max-w-2xl text-lg md:text-2xl text-gray-700 mb-8">Empowering children and families facing Inflammatory Bowel Disease and cancer with hope, resources, and community support.</p>
        <a href="#donate" className="inline-block px-8 py-3 bg-ibd-500 text-white font-semibold rounded-2xl shadow-glow hover:bg-ibd-600 transition text-lg">Donate Now</a>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <svg width="120" height="40" fill="none" viewBox="0 0 120 40"><ellipse cx="60" cy="20" rx="60" ry="10" fill="#E4D0FF" /></svg>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-healing-700 mb-4 font-display">Our Mission</h2>
        <p className="text-lg text-gray-700 mb-6">Lumos Foundation, part of the officially registered Medivue NPO (North Carolina), is dedicated to improving the lives of children with IBD and cancer. We provide financial assistance, educational resources, and emotional support to families, while raising awareness and advocating for better care and research.</p>
        <ul className="grid md:grid-cols-3 gap-8 mt-8">
          <li className="bg-white rounded-2xl shadow-soft p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">💡</span>
            <span className="font-semibold text-xl mb-1 text-ibd-600">Awareness</span>
            <span className="text-gray-600 text-center">Spreading knowledge about pediatric IBD and oncology through events, campaigns, and partnerships.</span>
          </li>
          <li className="bg-white rounded-2xl shadow-soft p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">🤝</span>
            <span className="font-semibold text-xl mb-1 text-healing-600">Support</span>
            <span className="text-gray-600 text-center">Providing direct support to families, including grants, counseling, and peer connections.</span>
          </li>
          <li className="bg-white rounded-2xl shadow-soft p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">🎗️</span>
            <span className="font-semibold text-xl mb-1 text-comfort-600">Hope</span>
            <span className="text-gray-600 text-center">Funding research and innovative programs to improve outcomes and quality of life.</span>
          </li>
        </ul>
      </section>

      {/* Blog Section */}
      <section id="blog" className="bg-ibd-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-ibd-700 mb-4 font-display">Latest from Our Blog</h2>
          <p className="text-lg text-gray-700 mb-8">Stories of hope, educational content, and updates from our community.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-glow transition">
              <div className="h-48 bg-gradient-to-br from-ibd-200 to-healing-200 flex items-center justify-center">
                <span className="text-6xl">📚</span>
              </div>
              <div className="p-6">
                <span className="text-sm text-ibd-500 font-medium">Education</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Understanding Pediatric IBD: A Parent's Guide</h3>
                <p className="text-gray-600 mb-4">Essential information for parents navigating their child's IBD diagnosis, including symptoms, treatments, and lifestyle adjustments.</p>
                <span className="text-sm text-gray-500">June 15, 2025 • 5 min read</span>
              </div>
            </article>
            <article className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-glow transition">
              <div className="h-48 bg-gradient-to-br from-healing-200 to-comfort-200 flex items-center justify-center">
                <span className="text-6xl">🌟</span>
              </div>
              <div className="p-6">
                <span className="text-sm text-healing-500 font-medium">Success Story</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Meet Sarah: A Journey of Resilience</h3>
                <p className="text-gray-600 mb-4">Sarah's inspiring story of overcoming pediatric cancer and how Lumos Foundation supported her family throughout treatment.</p>
                <span className="text-sm text-gray-500">June 10, 2025 • 8 min read</span>
              </div>
            </article>
            <article className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-glow transition">
              <div className="h-48 bg-gradient-to-br from-comfort-200 to-ibd-200 flex items-center justify-center">
                <span className="text-6xl">🔬</span>
              </div>
              <div className="p-6">
                <span className="text-sm text-comfort-500 font-medium">Research</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Latest Advances in Pediatric Oncology</h3>
                <p className="text-gray-600 mb-4">An overview of recent breakthroughs in pediatric cancer treatment and what they mean for families.</p>
                <span className="text-sm text-gray-500">June 5, 2025 • 6 min read</span>
              </div>
            </article>
          </div>
          <div className="text-center mt-8">
            <a href="#blog" className="inline-block px-6 py-3 bg-ibd-500 text-white font-semibold rounded-xl hover:bg-ibd-600 transition">Read More Articles</a>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="bg-healing-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-healing-700 mb-4 font-display">Upcoming Events</h2>
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-xl font-semibold text-ibd-600 mb-2">Lumos Family Day</h3>
              <p className="text-gray-700 mb-2">A day of fun, learning, and connection for families affected by IBD and cancer. Activities, expert talks, and support circles.</p>
              <span className="block text-sm text-gray-500">August 24, 2025 • Raleigh, NC</span>
            </div>
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-xl font-semibold text-ibd-600 mb-2">Hope Gala</h3>
              <p className="text-gray-700 mb-2">Annual fundraising gala supporting research and family grants. Dinner, speakers, and silent auction.</p>
              <span className="block text-sm text-gray-500">November 15, 2025 • Durham, NC</span>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section id="volunteer" className="py-16 px-4 bg-gradient-to-br from-accent-blue/10 via-accent-yellow/10 to-accent-pink/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-accent-blue mb-4 font-display text-center">Join Our Volunteer Team</h2>
          <p className="text-lg text-gray-700 mb-8 text-center">Make a difference in the lives of children and families. We have various opportunities to get involved.</p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-xl font-semibold text-accent-blue mb-4">Volunteer Opportunities</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-accent-yellow mr-2">🎪</span>
                  <span className="text-gray-700">Event coordination and support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-pink mr-2">📞</span>
                  <span className="text-gray-700">Family support hotline</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-blue mr-2">📚</span>
                  <span className="text-gray-700">Educational content creation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-healing-500 mr-2">🤝</span>
                  <span className="text-gray-700">Peer mentoring for families</span>
                </li>
                <li className="flex items-start">
                  <span className="text-comfort-500 mr-2">💻</span>
                  <span className="text-gray-700">Social media and outreach</span>
                </li>
                <li className="flex items-start">
                  <span className="text-ibd-500 mr-2">🏥</span>
                  <span className="text-gray-700">Hospital visit coordination</span>
                </li>
              </ul>
            </div>
            
            <form className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-xl font-semibold text-accent-blue mb-4">Volunteer Sign Up</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-blue text-lg" required />
                <input type="email" placeholder="Email Address" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-yellow text-lg" required />
                <input type="tel" placeholder="Phone Number" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-pink text-lg" />
                <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-healing-300 text-lg" required>
                  <option value="">Select Area of Interest</option>
                  <option value="events">Event Coordination</option>
                  <option value="support">Family Support</option>
                  <option value="content">Content Creation</option>
                  <option value="mentoring">Peer Mentoring</option>
                  <option value="social">Social Media</option>
                  <option value="hospital">Hospital Visits</option>
                  <option value="other">Other</option>
                </select>
                <textarea placeholder="Tell us about your experience and why you'd like to volunteer" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-comfort-300 text-lg" rows={3}></textarea>
                <button type="submit" className="w-full px-4 py-3 bg-accent-blue text-white font-semibold rounded-xl shadow-glow hover:bg-accent-yellow transition text-lg">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section id="donate" className="py-16 px-4 bg-gradient-to-br from-comfort-100 via-healing-100 to-ibd-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-comfort-700 mb-4 font-display">Support Our Mission</h2>
          <p className="text-lg text-gray-700 mb-8">Your donation brings hope, care, and resources to children and families facing IBD and cancer. Every gift makes a difference.</p>
          <form className="bg-white rounded-2xl shadow-soft p-8 flex flex-col items-center space-y-4 max-w-md mx-auto">
            <input type="number" min="1" placeholder="Donation Amount (USD)" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ibd-300 text-lg" />
            <input type="text" placeholder="Your Name (optional)" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-healing-300 text-lg" />
            <input type="email" placeholder="Email Address" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-comfort-300 text-lg" required />
            <button type="submit" className="w-full px-4 py-3 bg-ibd-500 text-white font-semibold rounded-xl shadow-glow hover:bg-ibd-600 transition text-lg">Donate</button>
          </form>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="max-w-3xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-accent-blue mb-4 font-display">Contact Us</h2>
        <p className="text-lg text-gray-700 mb-6">Have questions, want to get involved, or need support? Reach out to our team.</p>
        <form className="bg-white rounded-2xl shadow-soft p-8 flex flex-col space-y-4">
          <input type="text" placeholder="Your Name" className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ibd-300 text-lg" required />
          <input type="email" placeholder="Email Address" className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-healing-300 text-lg" required />
          <textarea placeholder="Your Message" className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-comfort-300 text-lg" rows={4} required />
          <button type="submit" className="px-4 py-3 bg-accent-blue text-white font-semibold rounded-xl shadow-glow hover:bg-accent-yellow transition text-lg">Send Message</button>
        </form>
        <div className="mt-8 text-center text-gray-500 text-sm">
          <span>© {new Date().getFullYear()} Lumos Foundation • A Medivue NPO | Registered in North Carolina | <span className="underline">{FOUNDATION_DOMAIN}</span></span>
        </div>
      </section>
    </div>
  );
}

export default App;









