'use client';

import { useState, useEffect } from 'react';

const TrafficAlert = ({ intersection, alerts = [] }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

  // Dummy alert data based on intersection conditions
  const generateDummyAlerts = (intersection) => {
    const alerts = [];
    
    // High congestion alert
    if (intersection.congestion === 'High') {
      alerts.push({
        id: 'congestion-high',
        type: 'congestion',
        severity: 'high',
        title: 'Heavy Traffic Detected',
        message: `Traffic congestion is high at ${intersection.name}. Expected delay: ${intersection.waitingTime}`,
        icon: '🚗',
        color: 'red',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Light timer alert
    if (intersection.lightTimer <= 5 && intersection.lightTimer > 0) {
      alerts.push({
        id: 'light-change',
        type: 'light',
        severity: 'medium',
        title: 'Light Change Imminent',
        message: `Traffic light will change in ${intersection.lightTimer} seconds`,
        icon: '🚦',
        color: 'yellow',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Vehicle count alert
    if (intersection.vehicles > 40) {
      alerts.push({
        id: 'vehicle-overload',
        type: 'vehicles',
        severity: 'medium',
        title: 'High Vehicle Density',
        message: `${intersection.vehicles} vehicles detected. Consider traffic management`,
        icon: '🚙',
        color: 'orange',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Emergency alert (dummy)
    if (Math.random() > 0.8) {
      alerts.push({
        id: 'emergency',
        type: 'emergency',
        severity: 'high',
        title: 'Emergency Vehicle Approaching',
        message: 'Ambulance en route - prioritize signal control',
        icon: '🚑',
        color: 'red',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    return alerts;
  };

  useEffect(() => {
    const intersectionAlerts = generateDummyAlerts(intersection);
    if (intersectionAlerts.length > 0) {
      setCurrentAlert(intersectionAlerts[0]);
      setIsVisible(true);
      
      // Auto-hide alert after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [intersection.congestion, intersection.lightTimer, intersection.vehicles]);

  if (!isVisible || !currentAlert) return null;

  const getAlertStyles = (severity, color) => {
    const baseStyles = "absolute top-2 right-2 z-10 px-3 py-2 rounded-lg shadow-lg border-l-4 animate-pulse";
    
    switch (severity) {
      case 'high':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case 'medium':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'low':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-500 text-gray-800`;
    }
  };

  return (
    <div className={getAlertStyles(currentAlert.severity, currentAlert.color)}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{currentAlert.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">
            {currentAlert.title}
          </div>
          <div className="text-xs opacity-90 truncate">
            {currentAlert.message}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {currentAlert.timestamp}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default TrafficAlert;
