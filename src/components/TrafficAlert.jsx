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
    if (intersection.vehicles > 25) {
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

    // Accident alert (dummy)
    if (Math.random() > 0.1) {
      const accidentTypes = [
        {
          id: 'accident-collision',
          type: 'accident',
          severity: 'critical',
          title: 'Vehicle Collision Detected',
          message: `Two-vehicle accident reported at ${intersection.name}. Emergency services dispatched.`,
          icon: '🚨',
          color: 'red'
        },
        {
          id: 'accident-breakdown',
          type: 'accident',
          severity: 'high',
          title: 'Vehicle Breakdown',
          message: `Disabled vehicle blocking lane at ${intersection.name}. Tow truck requested.`,
          icon: '🚗',
          color: 'orange'
        },
        {
          id: 'accident-roadwork',
          type: 'accident',
          severity: 'medium',
          title: 'Road Work Incident',
          message: `Construction equipment malfunction at ${intersection.name}. Traffic diverted.`,
          icon: '🚧',
          color: 'yellow'
        }
      ];
      
      const randomAccident = accidentTypes[Math.floor(Math.random() * accidentTypes.length)];
      alerts.push({
        ...randomAccident,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Emergency alert (dummy)
    if (Math.random() > 0.3) {
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

    // Weather alert (dummy)
    if (Math.random() > 0.4) {
      const weatherTypes = [
        {
          id: 'weather-rain',
          type: 'weather',
          severity: 'medium',
          title: 'Heavy Rain Detected',
          message: `Rain affecting visibility at ${intersection.name}. Reduce speed limits.`,
          icon: '🌧️',
          color: 'blue'
        },
        {
          id: 'weather-fog',
          type: 'weather',
          severity: 'high',
          title: 'Fog Alert',
          message: `Dense fog reducing visibility at ${intersection.name}. Use caution.`,
          icon: '🌫️',
          color: 'gray'
        },
        {
          id: 'weather-storm',
          type: 'weather',
          severity: 'critical',
          title: 'Severe Weather Warning',
          message: `Storm approaching ${intersection.name}. Consider traffic diversion.`,
          icon: '⛈️',
          color: 'purple'
        }
      ];
      
      const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      alerts.push({
        ...randomWeather,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    return alerts;
  };

  useEffect(() => {
    const intersectionAlerts = generateDummyAlerts(intersection);
    if (intersectionAlerts.length > 0) {
      // Sort alerts by priority (critical first, then high, medium, low)
      const priorityOrder = { 'critical': 1, 'high': 2, 'medium': 3, 'low': 4 };
      const sortedAlerts = intersectionAlerts.sort((a, b) => 
        priorityOrder[a.severity] - priorityOrder[b.severity]
      );
      
      setCurrentAlert(sortedAlerts[0]);
      setIsVisible(true);
      
      // Auto-hide alert after 5 seconds (longer for critical alerts)
      const hideDelay = sortedAlerts[0].severity === 'critical' ? 8000 : 5000;
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [intersection.congestion, intersection.lightTimer, intersection.vehicles]);

  if (!isVisible || !currentAlert) return null;

  const getAlertStyles = (severity, color) => {
    const baseStyles = "absolute top-2 right-2 z-10 px-3 py-2 rounded-lg shadow-lg border-l-4";
    const animationClass = severity === 'critical' ? 'animate-bounce' : 'animate-pulse';
    
    // Handle special colors for weather alerts
    if (color === 'purple') {
      return `${baseStyles} ${animationClass} bg-purple-100 border-purple-600 text-purple-900 shadow-purple-200`;
    }
    if (color === 'gray') {
      return `${baseStyles} ${animationClass} bg-gray-100 border-gray-600 text-gray-900 shadow-gray-200`;
    }
    
    switch (severity) {
      case 'critical':
        return `${baseStyles} ${animationClass} bg-red-100 border-red-600 text-red-900 shadow-red-200`;
      case 'high':
        return `${baseStyles} ${animationClass} bg-red-50 border-red-500 text-red-800`;
      case 'medium':
        return `${baseStyles} ${animationClass} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'low':
        return `${baseStyles} ${animationClass} bg-blue-50 border-blue-500 text-blue-800`;
      default:
        return `${baseStyles} ${animationClass} bg-gray-50 border-gray-500 text-gray-800`;
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
