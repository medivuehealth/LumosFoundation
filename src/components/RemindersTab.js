import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Plus, Check, Trash2, AlertCircle } from 'lucide-react';

function RemindersTab() {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    title: '',
    type: 'medication',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    repeat: 'none',
    notes: ''
  });

  // Load reminders from localStorage on component mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Save reminders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const reminder = {
      ...newReminder,
      id: Date.now(),
      completed: false
    };
    setReminders(prev => [reminder, ...prev]);
    setNewReminder({
      title: '',
      type: 'medication',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      repeat: 'none',
      notes: ''
    });
  };

  const toggleComplete = (id) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id
          ? { ...reminder, completed: !reminder.completed }
          : reminder
      )
    );
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reminders & Alerts</h2>
        <p className="text-gray-600">Never miss your medications or appointments</p>
      </div>

      {/* Add New Reminder Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center mb-4">
          <Plus className="text-purple-600 mr-2" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Add New Reminder</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newReminder.title}
              onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Take medication"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={newReminder.type}
                onChange={(e) => setNewReminder(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="medication">Medication</option>
                <option value="appointment">Appointment</option>
                <option value="test">Medical Test</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repeat
              </label>
              <select
                value={newReminder.repeat}
                onChange={(e) => setNewReminder(prev => ({ ...prev, repeat: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="none">Don't repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newReminder.date}
                onChange={(e) => setNewReminder(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={newReminder.notes}
              onChange={(e) => setNewReminder(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows="2"
              placeholder="Add any additional notes..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <Bell size={20} className="mr-2" />
            Set Reminder
          </button>
        </form>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {reminders.map(reminder => (
          <div
            key={reminder.id}
            className={`bg-white p-4 rounded-xl border ${
              reminder.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleComplete(reminder.id)}
                  className={`mt-1 p-1 rounded-full ${
                    reminder.completed ? 'bg-green-500 text-white' : 'border-2 border-gray-300'
                  }`}
                >
                  {reminder.completed && <Check size={16} />}
                </button>
                <div>
                  <h4 className="font-semibold text-gray-800">{reminder.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {reminder.date}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {reminder.time}
                    </div>
                  </div>
                  {reminder.notes && (
                    <p className="text-sm text-gray-600 mt-2">{reminder.notes}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteReminder(reminder.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {reminders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle size={40} className="mx-auto mb-2" />
            <p>No reminders set. Add one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RemindersTab; 