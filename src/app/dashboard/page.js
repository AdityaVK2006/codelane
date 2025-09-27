"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TrafficAlert from "@/components/TrafficAlert";

const MapView = dynamic(() => import("@/components/mapview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="animate-pulse text-gray-500">Loading map...</div>
    </div>
  ),
});

const Page = () => {
  const [location, setLocation] = useState("Pune");
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedIntersection, setSelectedIntersection] = useState(null);
  const [showMapControls, setShowMapControls] = useState(false);
  const [controlPosition, setControlPosition] = useState({ x: 0, y: 0 });
  const [intersections, setIntersections] = useState([
    { 
      id: 1, 
      name: "MG Road", 
      light: "Green", 
      pose: true, 
      congestion: "Low",
      vehicles: 12,
      waitingTime: "30s",
      position: [18.5204, 73.8567],
      lightTimer: 30
    },
    { 
      id: 2, 
      name: "FC Road", 
      light: "Red", 
      pose: false, 
      congestion: "High",
      vehicles: 42,
      waitingTime: "2m 15s",
      position: [18.5230, 73.8500],
      lightTimer: 15
    },
    { 
      id: 3, 
      name: "JM Road", 
      light: "Yellow", 
      pose: true, 
      congestion: "Medium",
      vehicles: 28,
      waitingTime: "1m 10s",
      position: [18.5170, 73.8600],
      lightTimer: 5
    },
    { 
      id: 4, 
      name: "SB Road", 
      light: "Green", 
      pose: false, 
      congestion: "Low",
      vehicles: 18,
      waitingTime: "45s",
      position: [18.5250, 73.8650],
      lightTimer: 25
    },
    { 
      id: 5, 
      name: "Karve Road", 
      light: "Red", 
      pose: true, 
      congestion: "Medium",
      vehicles: 35,
      waitingTime: "1m 30s",
      position: [18.5150, 73.8400],
      lightTimer: 20
    },
    { 
      id: 6, 
      name: "DP Road", 
      light: "Green", 
      pose: false, 
      congestion: "Low",
      vehicles: 22,
      waitingTime: "40s",
      position: [18.5100, 73.8550],
      lightTimer: 35
    },
    { 
      id: 7, 
      name: "University Circle", 
      light: "Yellow", 
      pose: true, 
      congestion: "High",
      vehicles: 48,
      waitingTime: "2m 45s",
      position: [18.5270, 73.8450],
      lightTimer: 10
    },
    { 
      id: 8, 
      name: "Station Road", 
      light: "Red", 
      pose: false, 
      congestion: "Medium",
      vehicles: 30,
      waitingTime: "1m 15s",
      position: [18.5190, 73.8750],
      lightTimer: 18
    },
  ]);

  // Change light for a specific intersection
  const changeLight = (intersectionId, newLight) => {
    setIntersections(prev => 
      prev.map(int => 
        int.id === intersectionId 
          ? {...int, light: newLight, lightTimer: getTimerForLight(newLight)} 
          : int
      )
    );
    
    const intersection = intersections.find(int => int.id === intersectionId);
    toast.info(`🚦 Light changed to ${newLight} at ${intersection.name}`);
  };

  // Get appropriate timer duration based on light type
  const getTimerForLight = (light) => {
    switch(light) {
      case "Green": return 30;
      case "Yellow": return 5;
      case "Red": return 25;
      default: return 30;
    }
  };

  // Get next light in sequence
  const getNextLight = (currentLight) => {
    switch(currentLight) {
      case "Green": return "Yellow";
      case "Yellow": return "Red";
      case "Red": return "Green";
      default: return "Green";
    }
  };

  // Handle intersection click on the map
  const handleIntersectionClick = (intersection, event) => {
    setSelectedIntersection(intersection);
    setShowMapControls(true);
    
    // Position the controls near the click but ensure it stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    setControlPosition({
      x: Math.min(event.clientX, viewportWidth - 300), // Ensure controls don't go off screen
      y: Math.min(event.clientY, viewportHeight - 250)
    });
  };

  // Close map controls when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMapControls) {
        const controlsElement = document.querySelector('.map-controls-popup');
        if (controlsElement && !controlsElement.contains(event.target)) {
          setShowMapControls(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMapControls]);

  // Simulate live updates and light timers
  useEffect(() => {
    const interval = setInterval(() => {
      setIntersections((prev) =>
        prev.map((int) => {
          const newPose = Math.random() > 0.5;
          const newCongestion = ["Low", "Medium", "High"][Math.floor(Math.random() * 3)];
          const vehicleChange = Math.floor(Math.random() * 5) - 2;
          const newVehicles = Math.max(0, int.vehicles + vehicleChange);
          
          // Decrement light timer and change light if needed
          const newLightTimer = int.lightTimer - 1;
          let newLight = int.light;
          
          if (newLightTimer <= 0) {
            newLight = getNextLight(int.light);
          }
          
          return {
            ...int,
            light: newLight,
            lightTimer: newLightTimer <= 0 ? getTimerForLight(newLight) : newLightTimer,
            pose: newPose,
            congestion: newCongestion,
            vehicles: newVehicles,
            waitingTime: `${Math.floor(Math.random() * 3)}m ${Math.floor(Math.random() * 60)}s`
          };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLightChange = (intersectionId, state) => {
    if (isEmergency && state !== "Red") {
      toast.error("Emergency override active. Only Red light can be maintained.");
      return;
    }
    
    changeLight(intersectionId, state);
    setShowMapControls(false);
  };

  const handleEmergencyOverride = () => {
    const newEmergencyState = !isEmergency;
    setIsEmergency(newEmergencyState);
    
    if (newEmergencyState) {
      // Set all intersections to red
      intersections.forEach(int => {
        changeLight(int.id, "Red");
      });
      
      toast.error("🚨 EMERGENCY OVERRIDE ACTIVATED - All lights set to Red");
    } else {
      toast.success("Emergency mode deactivated");
    }
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  const getCongestionColor = (level) => {
    switch(level) {
      case "High": return "text-red-500";
      case "Medium": return "text-yellow-500";
      default: return "text-green-500";
    }
  };

  const getLightColor = (light) => {
    switch(light) {
      case "Red": return "text-red-500";
      case "Yellow": return "text-yellow-500";
      default: return "text-green-500";
    }
  };

  const selectIntersection = (intersection) => {
    setSelectedIntersection(intersection);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-gray-100">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Fixed height, no scrolling */}
          <div className="h-full w-80 bg-gradient-to-b from-blue-600 to-blue-800 text-black p-6 shadow-xl flex flex-col">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">TC</span>
                </div>
                <h2 className="text-2xl font-bold">Traffic Control</h2>
              </div>
              
              <div className="bg-white bg-opacity-15 p-4 rounded-xl mb-6">
                <h3 className="font-semibold mb-3 text-lg">Current Status</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center p-2 rounded-md bg-white bg-opacity-10">
                    <span>📍 Location</span>
                    <span>{location}</span>
                  </li>
                  <li className="flex justify-between items-center p-2 rounded-md bg-white bg-opacity-10">
                    <span>🚨 Emergency Mode</span>
                    <span>{isEmergency ? "ACTIVE" : "Inactive"}</span>
                  </li>
                  <li className="flex justify-between items-center p-2 rounded-md bg-white bg-opacity-10">
                    <span>🚦 Active Intersections</span>
                    <span>{intersections.length}</span>
                  </li>
                  <li className="flex justify-between items-center p-2 rounded-md bg-white bg-opacity-10">
                    <span>⚠️ High Congestion</span>
                    <span className="text-red-300">
                      {intersections.filter(i => i.congestion === "High").length}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Location Selector */}
              <div className="bg-white bg-opacity-15 p-4 rounded-xl mb-6">
                <h3 className="font-semibold mb-3 text-lg">Location</h3>
                <select
                  className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border-none focus:ring-2 focus:ring-white"
                  onChange={(e) => handleLocationChange(e.target.value)}
                  value={location}
                >
                  <option value="Pune">📍 Pune</option>
                  <option value="Mumbai">📍 Mumbai</option>
                  <option value="Delhi">📍 Delhi</option>
                  <option value="Bangalore">📍 Bangalore</option>
                </select>
              </div>

              {/* Admin Controls */}
              <div className="bg-white bg-opacity-15 p-4 rounded-xl">
                <h3 className="font-semibold mb-3 text-lg">Admin Controls</h3>
                <button 
                  onClick={handleEmergencyOverride}
                  className={`w-full py-2 px-3 rounded-lg flex items-center justify-center font-medium mb-3 ${
                    isEmergency 
                      ? "bg-red-500 text-white" 
                      : "bg-blue-700 text-white hover:bg-blue-800"
                  }`}
                >
                  {isEmergency ? "🔄 Deactivate Emergency" : "🚨 Emergency Override"}
                </button>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
                    Export Data
                  </button>
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
                    Settings
                  </button>
                </div>
                <div className="mt-4 text-xs opacity-70">
                  <p>System: Online</p>
                  <p>Last update: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
            
            <footer className="text-sm opacity-70 pt-4 border-t border-white border-opacity-20 mt-4">
              <p>© 2025 Traffic CodeLane System</p>
              <p className="text-xs mt-1">v2.1.0 | {new Date().toLocaleDateString()}</p>
            </footer>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Map View */}
            <div className="flex-1 relative">
              <div className="h-full w-full relative">
                <div className="absolute inset-0 z-0">
                  <MapView 
                    intersections={intersections} 
                    selectedIntersection={selectedIntersection}
                    onIntersectionClick={handleIntersectionClick}
                  />
                </div>

                {/* Map Overlays */}
                <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Live Map View - {location}
                  </span>
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white bg-opacity-90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Real-time data updates
                  </span>
                </div>

                <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-lg w-72 z-10">
                  <h4 className="font-semibold mb-3 text-gray-700 border-b pb-2">System Status</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Intersections</span>
                    <span className="font-semibold">{intersections.length}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Active Alerts</span>
                    <span className="font-semibold text-red-500">
                      {intersections.filter(i => i.congestion === "High").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pedestrians</span>
                    <span className="font-semibold">
                      {intersections.filter(i => i.pose).length}
                    </span>
                  </div>
                </div>

                {/* Map Controls Popup - Larger size */}
                {showMapControls && selectedIntersection && (
                  <div 
                    className="absolute z-20 bg-white p-5 rounded-xl shadow-xl border border-gray-200 map-controls-popup"
                    style={{
                      left: `${controlPosition.x}px`,
                      top: `${controlPosition.y}px`,
                      transform: 'translate(-50%, 20px)',
                      minWidth: '280px',
                      maxWidth: '320px'
                    }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg text-gray-800">📍 {selectedIntersection.name}</h3>
                      <button 
                        onClick={() => setShowMapControls(false)}
                        className="text-gray-400 hover:text-gray-600 text-lg"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">🚦</span>
                        <span className={getLightColor(selectedIntersection.light) + " font-medium"}>
                          {selectedIntersection.light}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">⏱️</span>
                        <span className="font-medium">{formatTime(selectedIntersection.lightTimer)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">🧍</span>
                        <span>{selectedIntersection.pose ? "Detected" : "None"}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">🚗</span>
                        <span>{selectedIntersection.vehicles} vehicles</span>
                      </div>
                      <div className="flex items-center col-span-2">
                        <span className="mr-2 text-lg">
                          {selectedIntersection.congestion === "High" ? "🔴" : 
                           selectedIntersection.congestion === "Medium" ? "🟡" : "🟢"}
                        </span>
                        <span className={getCongestionColor(selectedIntersection.congestion) + " font-medium"}>
                          {selectedIntersection.congestion} Congestion
                        </span>
                      </div>
                    </div>
                    
                    {/* Light Control Buttons - Larger */}
                    <div className="grid grid-cols-3 gap-3">
                      {["Green", "Yellow", "Red"].map((state) => (
                        <button
                          key={state}
                          onClick={() => {
                            handleLightChange(selectedIntersection.id, state);
                          }}
                          disabled={isEmergency && state !== "Red"}
                          className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                            selectedIntersection.light === state
                              ? "bg-white text-blue-600 shadow-md border-2 border-blue-300 font-bold"
                              : "bg-blue-600 text-white opacity-90 hover:opacity-100"
                          } ${isEmergency && state !== "Red" ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Intersection Controls Section */}
            <div className="h-60 border-t border-gray-200 bg-white flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">Intersection Controls</h3>
                <span className="text-xs text-gray-500">{intersections.length} intersections</span>
              </div>
              <div className="flex-1 overflow-x-scroll p-4">
                <div className="flex space-x-4 pb-2">
                  {intersections.map((intersection) => (
                    <div key={intersection.id} className="min-w-[220px] bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm relative">
                      {/* Traffic Alert Notification */}
                      <TrafficAlert intersection={intersection} />
                      
                      <div className="flex justify-between overflow-x-auto items-start mb-2">
                        <h4 className="font-medium text-gray-800">📍 {intersection.name}</h4>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getCongestionColor(intersection.congestion)}`}>
                          {intersection.congestion}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div className="flex items-center">
                          <span className="mr-1">🚦</span>
                          <span className={getLightColor(intersection.light)}>{intersection.light}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">⏱️</span>
                          <span>{formatTime(intersection.lightTimer)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">🧍</span>
                          <span>{intersection.pose ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">🚗</span>
                          <span>{intersection.vehicles}</span>
                        </div>
                      </div>
                      
                      {/* Individual Light Control Buttons */}
                      <div className="grid grid-cols-3 gap-1">
                        {["Green", "Yellow", "Red"].map((state) => (
                          <button
                            key={state}
                            onClick={() => handleLightChange(intersection.id, state)}
                            disabled={isEmergency && state !== "Red"}
                            className={`p-1 rounded text-xs font-medium transition-all ${
                              intersection.light === state
                                ? "bg-white text-blue-600 shadow-md border border-blue-200"
                                : "bg-blue-600 text-white opacity-90 hover:opacity-100"
                            } ${isEmergency && state !== "Red" ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {state}
                          </button>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => selectIntersection(intersection)}
                        className="w-full mt-2 p-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs"
                      >
                        Focus on Map
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;