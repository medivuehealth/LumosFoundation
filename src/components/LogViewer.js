import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, Download, AlertTriangle, Info, AlertCircle, Bell, BellOff } from 'lucide-react';
import { backgroundMonitor } from '../utils/BackgroundMonitor';
import config from '../config';

const LOG_LEVELS = {
  error: { color: 'text-red-600 bg-red-50', icon: AlertTriangle },
  warn: { color: 'text-yellow-600 bg-yellow-50', icon: AlertCircle },
  info: { color: 'text-blue-600 bg-blue-50', icon: Info },
  debug: { color: 'text-gray-600 bg-gray-50', icon: Info }
};

// Increase polling interval to reduce resource usage
const POLL_INTERVAL = 60000; // Poll every 1 minute instead of 30 seconds

function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    level: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [monitorStats, setMonitorStats] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Check if component is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );

    const element = document.getElementById('log-viewer');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Start background monitor on mount
  useEffect(() => {
    backgroundMonitor.start();
    
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Add monitor listener
    const removeListener = backgroundMonitor.addListener((notification) => {
      if (notification.type === 'errors') {
        // Auto-refresh logs when new errors are detected
        fetchLogs();
        setMonitorStats(backgroundMonitor.getStats());
      }
    });

    // Update initial stats
    setMonitorStats(backgroundMonitor.getStats());
    setNotificationsEnabled(backgroundMonitor.isRunning);

    return () => {
      removeListener();
    };
  }, []);

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      backgroundMonitor.stop();
    } else {
      backgroundMonitor.start();
    }
    setNotificationsEnabled(!notificationsEnabled);
  };

  const fetchLogs = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        level: filters.level || '',
        search: filters.search || '',
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        limit: 100
      }).toString();

      const response = await fetch(`${config.API_URL}/api/logs?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const data = await response.json();
      setLogs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Only poll when component is visible
  useEffect(() => {
    if (!isVisible) return;

    fetchLogs();
    const interval = setInterval(fetchLogs, POLL_INTERVAL);
    
    return () => clearInterval(interval);
  }, [fetchLogs, isVisible]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Level', 'Message', 'Details', 'User Agent', 'URL'].join(','),
      ...logs.map(log => [
        log.timestamp,
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        `"${JSON.stringify(log.details).replace(/"/g, '""')}"`,
        `"${log.user_agent || ''}"`,
        `"${log.url || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div id="log-viewer" className="space-y-6">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">System Logs</h2>
            <button
              onClick={toggleNotifications}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                notificationsEnabled 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {notificationsEnabled ? (
                <>
                  <Bell size={16} className="mr-2" />
                  Monitoring Active
                </>
              ) : (
                <>
                  <BellOff size={16} className="mr-2" />
                  Monitoring Inactive
                </>
              )}
            </button>
          </div>

          {monitorStats && (
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Monitor Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Error Count</div>
                  <div className="text-2xl font-bold text-gray-900">{monitorStats.errorCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Recent Errors</div>
                  <div className="text-2xl font-bold text-gray-900">{monitorStats.recentErrors.length}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Last Check</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(monitorStats.lastCheckTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Levels</option>
                {Object.keys(LOG_LEVELS).map(level => (
                  <option key={level} value={level}>{level.toUpperCase()}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search logs..."
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={fetchLogs}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
            
            <button
              onClick={exportLogs}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      Loading logs...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-red-500">
                      Error: {error}
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => {
                    const levelConfig = LOG_LEVELS[log.level] || LOG_LEVELS.info;
                    const Icon = levelConfig.icon;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelConfig.color}`}>
                            <Icon size={12} className="mr-1" />
                            {log.level.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.message}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogViewer; 