'use client';

import { useState, useEffect } from 'react';

const UltraTrafficAlert = ({ intersection }) => {
  const [alerts, setAlerts] = useState([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate more sophisticated dummy alerts for ultra page
  const generateUltraAlerts = (intersection) => {
    const alerts = [];
    
    // Traffic flow prediction alert
    if (intersection.congestion === 'High') {
      alerts.push({
        id: 'flow-prediction',
        type: 'prediction',
        severity: 'critical',
        title: 'Traffic Flow Prediction',
        message: `Predicted delay increase of 15-20 minutes in next 30 mins`,
        icon: '📊',
        color: 'red',
        timestamp: new Date().toLocaleTimeString(),
        confidence: '85%',
        recommendation: 'Consider alternate routes'
      });
    }

    // Smart signal optimization alert
    if (intersection.lightTimer <= 10 && intersection.vehicles > 30) {
      alerts.push({
        id: 'signal-optimization',
        type: 'optimization',
        severity: 'high',
        title: 'Signal Optimization Available',
        message: `AI suggests extending green light by 15s to reduce queue`,
        icon: '🤖',
        color: 'blue',
        timestamp: new Date().toLocaleTimeString(),
        confidence: '92%',
        recommendation: 'Apply AI recommendation'
      });
    }

    // Weather impact alert (dummy)
    if (Math.random() > 0.7) {
      alerts.push({
        id: 'weather-impact',
        type: 'weather',
        severity: 'medium',
        title: 'Weather Impact Detected',
        message: `Rain expected in 20 mins - traffic may slow by 25%`,
        icon: '🌧️',
        color: 'cyan',
        timestamp: new Date().toLocaleTimeString(),
        confidence: '78%',
        recommendation: 'Prepare for wet conditions'
      });
    }

    // Pedestrian safety alert
    if (intersection.pose && intersection.light === 'Green') {
      alerts.push({
        id: 'pedestrian-safety',
        type: 'safety',
        severity: 'high',
        title: 'Pedestrian Safety Alert',
        message: `Pedestrian detected during green light - extend crossing time`,
        icon: '🚶',
        color: 'orange',
        timestamp: new Date().toLocaleTimeString(),
        confidence: '95%',
        recommendation: 'Activate pedestrian priority'
      });
    }

    // Emergency response alert
    if (Math.random() > 0.85) {
      alerts.push({
        id: 'emergency-response',
        type: 'emergency',
        severity: 'critical',
        title: 'Emergency Response Required',
        message: `Fire department en route - clear path immediately`,
        icon: '🚒',
        color: 'red',
        timestamp: new Date().toLocaleTimeString(),
        confidence: '100%',
        recommendation: 'Activate emergency protocol'
      });
    }

    return alerts;
  };

  useEffect(() => {
    const ultraAlerts = generateUltraAlerts(intersection);
    setAlerts(ultraAlerts);
    
    if (ultraAlerts.length > 0) {
      // Cycle through alerts every 8 seconds
      const interval = setInterval(() => {
        setCurrentAlertIndex((prev) => (prev + 1) % ultraAlerts.length);
      }, 8000);
      
      return () => clearInterval(interval);
    }
  }, [intersection.congestion, intersection.lightTimer, intersection.vehicles, intersection.pose]);

  if (alerts.length === 0) return null;

  const currentAlert = alerts[currentAlertIndex];

  const getAlertStyles = (severity) => {
    const baseStyles = "absolute top-2 left-2 right-2 z-10 rounded-xl shadow-2xl border-2 backdrop-blur-sm transition-all duration-300";
    
    switch (severity) {
      case 'critical':
        return `${baseStyles} bg-gradient-to-r from-red-500/90 to-red-600/90 border-red-400 text-white`;
      case 'high':
        return `${baseStyles} bg-gradient-to-r from-orange-500/90 to-orange-600/90 border-orange-400 text-white`;
      case 'medium':
        return `${baseStyles} bg-gradient-to-r from-blue-500/90 to-blue-600/90 border-blue-400 text-white`;
      default:
        return `${baseStyles} bg-gradient-to-r from-gray-500/90 to-gray-600/90 border-gray-400 text-white`;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <div className={getAlertStyles(currentAlert.severity)}>
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentAlert.icon}</span>
            <span className="text-sm font-bold">{getSeverityIcon(currentAlert.severity)}</span>
            <span className="text-sm font-semibold uppercase tracking-wide">
              {currentAlert.type}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {currentAlert.confidence}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-2">
          <div className="font-bold text-sm mb-1">
            {currentAlert.title}
          </div>
          <div className="text-xs opacity-90 leading-relaxed">
            {currentAlert.message}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-white/20 pt-2 mt-2">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="opacity-80">Recommendation:</span>
                <span className="font-semibold">{currentAlert.recommendation}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Generated:</span>
                <span>{currentAlert.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Alert ID:</span>
                <span className="font-mono text-xs">{currentAlert.id}</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mt-2 flex space-x-1">
          {alerts.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                index === currentAlertIndex 
                  ? 'bg-white' 
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-3">
          <button className="flex-1 bg-white/20 hover:bg-white/30 text-xs py-1 px-2 rounded-lg transition-colors">
            Acknowledge
          </button>
          <button className="flex-1 bg-white/20 hover:bg-white/30 text-xs py-1 px-2 rounded-lg transition-colors">
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default UltraTrafficAlert;
