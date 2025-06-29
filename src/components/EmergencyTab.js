import React from 'react';
import { Phone, MapPin, AlertTriangle, Clock, Info, Hospital } from 'lucide-react';

function EmergencyTab() {
  const emergencyContacts = [
    {
      name: "Charlotte Levine Children's Hospital",
      phone: "(704) 381-2000",
      address: "1000 Blythe Blvd, Charlotte, NC 28203",
      distance: "2.5 miles",
      waitTime: "15 mins"
    },
    {
      name: "Atrium Health Emergency",
      phone: "(704) 355-2000",
      address: "1200 Blythe Blvd, Charlotte, NC 28203",
      distance: "3.2 miles",
      waitTime: "25 mins"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-ibd-100 via-ibd-200 to-ibd-300 p-6 rounded-2xl shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Emergency</h2>
            <p className="text-gray-600">Quick access to emergency services</p>
          </div>
          <AlertTriangle className="text-ibd-500" size={32} />
        </div>
      </div>

      {/* Emergency Call Button */}
      <button className="w-full bg-red-500 text-white p-6 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg animate-pulse-slow">
        <Phone className="mr-3" size={24} />
        <span className="text-xl font-display font-bold">Call 911</span>
      </button>

      {/* Emergency Facilities */}
      <div className="space-y-4">
        {emergencyContacts.map((contact, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-ibd-200 hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-800 mb-1">{contact.name}</h3>
                <div className="flex items-center text-gray-500 mb-2">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{contact.address}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-healing-500 flex items-center">
                    <Hospital size={14} className="mr-1" />
                    {contact.distance}
                  </span>
                  <span className="text-comfort-500 flex items-center">
                    <Clock size={14} className="mr-1" />
                    Wait: {contact.waitTime}
                  </span>
                </div>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="bg-ibd-500 text-white px-4 py-2 rounded-lg hover:bg-ibd-600 transition-colors flex items-center"
              >
                <Phone size={16} className="mr-1" />
                Call
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Important Info */}
      <div className="bg-healing-100 p-6 rounded-xl border border-healing-200">
        <div className="flex items-start">
          <Info className="text-healing-500 mr-3 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-lg font-display font-semibold text-gray-800 mb-2">Important Information</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Have your medical ID and insurance card ready</li>
              <li>• Keep a list of current medications</li>
              <li>• Note any allergies or medical conditions</li>
              <li>• Bring a family member or friend if possible</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-comfort-100 p-4 rounded-xl border border-comfort-200 hover:bg-comfort-200 transition-colors text-center">
          <span className="block text-comfort-500 font-display font-semibold">View Map</span>
          <span className="text-sm text-gray-600">Find nearest facility</span>
        </button>
        <button className="bg-ibd-100 p-4 rounded-xl border border-ibd-200 hover:bg-ibd-200 transition-colors text-center">
          <span className="block text-ibd-500 font-display font-semibold">Medical ID</span>
          <span className="text-sm text-gray-600">View/Update info</span>
        </button>
      </div>
    </div>
  );
}

export default EmergencyTab; 