"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import UltraTrafficAlert from "@/components/UltraTrafficAlert";
import Image from "next/image";

// Dynamically import the MapView component with no SSR
const MapView = dynamic(() => import("@/components/mapview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="animate-pulse text-gray-500">Loading map...</div>
    </div>
  ),
});

const Page = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIntersection, setSelectedIntersection] = useState(null);
  const [manualTime, setManualTime] = useState(30);
  
  // Green Corridor states
  const [showGreenCorridorModal, setShowGreenCorridorModal] = useState(false);
  const [greenCorridorStart, setGreenCorridorStart] = useState("");
  const [greenCorridorEnd, setGreenCorridorEnd] = useState("");
  const [showCorridorConfirmation, setShowCorridorConfirmation] = useState(false);
  const [activeGreenCorridor, setActiveGreenCorridor] = useState(null);

  // Bhubaneswar specific events
  const [events, setEvents] = useState([
    {
      id: 1,
      type: "accident",
      title: "Vehicle Collision",
      location: "Janpath Road & Master Canteen Square",
      severity: "high",
      time: "14:30",
      status: "active",
      description: "Two-car collision blocking right lane",
    },
    {
      id: 2,
      type: "construction",
      title: "Scheduled Road Work",
      location: "Jaydev Vihar (between Rasulgarh and Vani Vihar)",
      severity: "medium",
      time: "09:00-16:00",
      status: "scheduled",
      description: "Water pipe replacement, one lane closed",
    },
    {
      id: 3,
      type: "emergency",
      title: "Ambulance Route",
      location: "From AMRI Hospital to Capital Hospital",
      severity: "high",
      time: "15:15",
      status: "active",
      description: "Emergency vehicle en route - prioritize signals",
    },
  ]);

  // Bhubaneswar intersections with realistic coordinates
  const [intersections, setIntersections] = useState([
    {
      id: 1,
      name: "Master Canteen Square",
      light: "Green",
      pose: true,
      congestion: "Medium",
      vehicles: 25,
      waitingTime: "45s",
      position: [20.2961, 85.8245],
      lightTimer: 30,
      cameras: [
        { id: 1, name: "North View", url: "1192116-hd_1920_1080_30fps.mp4" },
        { id: 2, name: "South View", url: "3727445-hd_1920_1080_30fps.mp4" },
      ]
    },
    {
      id: 2,
      name: "Vani Vihar Square",
      light: "Red",
      pose: false,
      congestion: "High",
      vehicles: 48,
      waitingTime: "2m 30s",
      position: [20.2889, 85.8206],
      lightTimer: 15,
      cameras: [
        { id: 1, name: "East View", url: "3727445-hd_1920_1080_30fps.mp4" },
        { id: 2, name: "West View", url: "1192116-hd_1920_1080_30fps.mp4" },
      ],
    },
    {
      id: 3,
      name: "Jaydev Vihar",
      light: "Yellow",
      pose: true,
      congestion: "Medium",
      vehicles: 32,
      waitingTime: "1m 15s",
      position: [20.3015, 85.8068],
      lightTimer: 5,
      cameras: [
        { id: 1, name: "North View", url: "1192116-hd_1920_1080_30fps.mp4" },
        { id: 2, name: "South View", url: "3727445-hd_1920_1080_30fps.mp4" },
      ],
    },
    {
      id: 4,
      name: "Rasulgarh Square",
      light: "Green",
      pose: false,
      congestion: "Low",
      vehicles: 15,
      waitingTime: "35s",
      position: [20.2813, 85.8317],
      lightTimer: 25,
      cameras: [
        { id: 1, name: "East View", url: "3727445-hd_1920_1080_30fps.mp4" },
        { id: 2, name: "West View", url: "1192116-hd_1920_1080_30fps.mp4" },
      ],
    },
    {
      id: 5,
      name: "Sachivalaya Marg",
      light: "Red",
      pose: true,
      congestion: "Medium",
      vehicles: 28,
      waitingTime: "1m 20s",
      position: [20.2915, 85.8342],
      lightTimer: 20,
      cameras: [
        { id: 1, name: "North View", url: "1192116-hd_1920_1080_30fps.mp4" },
        { id: 2, name: "South View", url: "3727445-hd_1920_1080_30fps.mp4" },
      ],
    },
    {
      id: 6,
      name: "Kalpana Square",
      light: "Green",
      pose: false,
      congestion: "Low",
      vehicles: 18,
      waitingTime: "30s",
      position: [20.2778, 85.8143],
      lightTimer: 35,
      cameras: [
        { id: 1, name: "East View", url: "3727445-hd_1920_1080_30fps.mp4" },
        { id: 2, name: "West View", url: "1192116-hd_1920_1080_30fps.mp4" },
      ],
    },
    {
      id: 7,
      name: "Biju Patnaik Chhak",
      light: "Yellow",
      pose: true,
      congestion: "High",
      vehicles: 52,
      waitingTime: "3m 10s",
      position: [20.2736, 85.8239],
      lightTimer: 10,
      cameras: [
        { id: 1, name: "North View", url: "1192116-hd_1920_1080_30fps.mp4" },
        { id: 2, name: "South View", url: "3727445-hd_1920_1080_30fps.mp4" },
      ],
    },
    {
      id: 8,
      name: "Patia Square",
      light: "Red",
      pose: false,
      congestion: "Medium",
      vehicles: 35,
      waitingTime: "1m 45s",
      position: [20.3124, 85.8173],
      lightTimer: 18,
      cameras: [
        { id: 1, name: "East View", url: "1192116-hd_1920_1080_30fps.mp4" },
        { id: 2, name: "West View", url: "1192116-hd_1920_1080_30fps.mp4" },
      ],
    },
  ]);

  // Add traffic simulation effect
  useEffect(() => {
    const simulateTraffic = () => {
      setIntersections(prev => prev.map(intersection => {
        // Random traffic fluctuations
        const congestionChange = Math.random() * 10 - 5; // -5 to +5
        let newVehicles = Math.max(5, Math.min(60, intersection.vehicles + congestionChange));
        
        // Update congestion level based on vehicle count
        let newCongestion = "Low";
        if (newVehicles > 40) newCongestion = "High";
        else if (newVehicles > 20) newCongestion = "Medium";
        
        // Update waiting time based on congestion
        let newWaitingTime = "30s";
        if (newCongestion === "High") newWaitingTime = `${Math.floor(Math.random() * 3) + 2}m ${Math.floor(Math.random() * 60)}s`;
        else if (newCongestion === "Medium") newWaitingTime = `${Math.floor(Math.random() * 2) + 1}m ${Math.floor(Math.random() * 60)}s`;
        
        return {
          ...intersection,
          vehicles: Math.round(newVehicles),
          congestion: newCongestion,
          waitingTime: newWaitingTime,
          lightTimer: Math.max(5, intersection.lightTimer - 1) // Countdown timer
        };
      }));
    };

    const trafficInterval = setInterval(simulateTraffic, 5000); // Update every 5 seconds
    return () => clearInterval(trafficInterval);
  }, []);

  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: "construction",
    title: "",
    location: "",
    severity: "medium",
    time: "",
    description: "",
  });

  // State for map interaction
  const [mapDetails, setMapDetails] = useState({
    selectedId: null,
    hoverId: null,
    showPopup: false,
  });

  // State for active camera view
  const [activeCamera, setActiveCamera] = useState(0);

  // Function to handle Green Corridor creation
  const handleCreateGreenCorridor = () => {
    if (greenCorridorStart && greenCorridorEnd && greenCorridorStart !== greenCorridorEnd) {
      const startIntersection = intersections.find(i => i.id === parseInt(greenCorridorStart));
      const endIntersection = intersections.find(i => i.id === parseInt(greenCorridorEnd));
      
      if (startIntersection && endIntersection) {
        // Create a green corridor object
        const corridor = {
          id: Date.now(),
          start: startIntersection.name,
          end: endIntersection.name,
          startId: startIntersection.id,
          endId: endIntersection.id,
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setActiveGreenCorridor(corridor);
        
        // Add an event for the green corridor
        const event = {
          id: events.length + 1,
          type: "emergency",
          title: "Green Corridor Activated",
          location: `${startIntersection.name} to ${endIntersection.name}`,
          severity: "high",
          time: corridor.timestamp,
          status: "active",
          description: "Emergency green corridor established for priority vehicle",
        };

        setEvents([event, ...events]);
        
        // Show confirmation
        setShowCorridorConfirmation(true);
        setShowGreenCorridorModal(false);
        
        // Reset form
        setGreenCorridorStart("");
        setGreenCorridorEnd("");
        
        // Auto-hide confirmation after 5 seconds
        setTimeout(() => {
          setShowCorridorConfirmation(false);
        }, 5000);
      }
    }
  };

  // Function to deactivate Green Corridor
  const handleDeactivateGreenCorridor = () => {
    if (activeGreenCorridor) {
      // Add closure event
      const event = {
        id: events.length + 1,
        type: "control",
        title: "Green Corridor Deactivated",
        location: `${activeGreenCorridor.start} to ${activeGreenCorridor.end}`,
        severity: "low",
        time: new Date().toLocaleTimeString(),
        status: "resolved",
        description: "Green corridor has been deactivated",
      };

      setEvents([event, ...events]);
      setActiveGreenCorridor(null);
    }
  };

  // Function to change traffic light
  const changeTrafficLight = (lightColor) => {
    if (selectedIntersection) {
      setIntersections(
        intersections.map((intersection) =>
          intersection.id === selectedIntersection.id
            ? { ...intersection, light: lightColor, lightTimer: manualTime }
            : intersection
        )
      );

      // Add a log event for the change
      const event = {
        id: events.length + 1,
        type: "control",
        title: `Light changed to ${lightColor}`,
        location: selectedIntersection.name,
        severity: "low",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "active",
        description: `Manual override: Traffic light set to ${lightColor} for ${manualTime}s`,
      };

      setEvents([event, ...events]);
    }
  };

  // Function to handle emergency override
  const handleEmergencyOverride = () => {
    if (selectedIntersection) {
      setIntersections(
        intersections.map((intersection) =>
          intersection.id === selectedIntersection.id
            ? { ...intersection, light: "Green", lightTimer: 60 }
            : intersection
        )
      );

      // Add an emergency event
      const event = {
        id: events.length + 1,
        type: "emergery",
        title: "Emergency Vehicle Priority",
        location: selectedIntersection.name,
        severity: "high",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "active",
        description:
          "Emergency override activated - green light extended to 60s",
      };

      setEvents([event, ...events]);
    }
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.location) {
      const event = {
        id: events.length + 1,
        ...newEvent,
        status: newEvent.type === "construction" ? "scheduled" : "active",
        time:
          newEvent.time ||
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      };

      setEvents([event, ...events]);
      setNewEvent({
        type: "construction",
        title: "",
        location: "",
        severity: "medium",
        time: "",
        description: "",
      });
      setShowEventForm(false);
    }
  };

  const resolveEvent = (id) => {
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, status: "resolved" } : event
      )
    );
  };

  // Function to open modal with selected intersection
  const openModal = (intersection) => {
    setSelectedIntersection(intersection);
    setManualTime(intersection.lightTimer);
    setActiveCamera(0);
    setOpen(true);
  };

  // Function to handle map interaction
  const handleMapInteraction = (intersectionId, action) => {
    if (action === "click") {
      const intersection = intersections.find((i) => i.id === intersectionId);
      if (intersection) {
        setMapDetails({
          ...mapDetails,
          selectedId: intersectionId,
          showPopup: true,
        });
        setSelectedIntersection(intersection);
      }
    } else if (action === "hover") {
      setMapDetails({
        ...mapDetails,
        hoverId: intersectionId,
      });
    }
  };

  // Function to close map popup
  const closeMapPopup = () => {
    setMapDetails({
      ...mapDetails,
      showPopup: false,
      selectedId: null,
    });
  };

  const correctPassword = "CodeLane";

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setLoginError(false);
      sessionStorage.setItem("auth", "true");
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    sessionStorage.removeItem("auth");
  };

  useEffect(() => {
    const authStatus = sessionStorage.getItem("auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-green-500 rounded-lg"></div>
            <h1 className="text-3xl font-bold text-gray-800">CodeLane</h1>
          </div>

          <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">
            Traffic Management System
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Please enter the password to continue
          </p>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  loginError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter system password"
              />
              {loginError && (
                <p className="text-red-500 text-sm mt-2">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Access System
            </button>
          </form>

          <p className="text-gray-400 text-xs mt-6 text-center">
            Authorized personnel only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className="h-full flex-[0.2] p-4 bg-[#eef9e9]">
        <header className="flex items-center gap-2 mb-6">
          <div className="logo" aria-hidden="true">
            <Image src="/logo.png" alt="CodeLane" width={150} height={20} />
          </div>
        </header>

        <section className="mt-10">
          <h2 className="font-semibold text-slate-500 mb-4 text-sm pl-1">
            Current Status
          </h2>
          <div className="flex flex-col text-slate-600">
            <h1 className="hover:bg-green-100 py-2 px-1 hover:text-green-500 rounded-lg">
              Location : Bhubaneswar
            </h1>
            <h1 className="hover:bg-green-100 py-2 px-1 hover:text-green-500 rounded-lg">
              Emergency :{" "}
              {events.filter(
                (e) => e.type === "emergency" && e.status === "active"
              ).length > 0
                ? "Yes"
                : "No"}
            </h1>
            <h1 className="hover:bg-green-100 py-2 px-1 hover:text-green-500 rounded-lg">
              Intersections : 8
            </h1>
            <h1 className="hover:bg-green-100 py-2 px-1 hover:text-green-500 rounded-lg">
              Active Incidents :{" "}
              {events.filter((e) => e.status === "active").length}
            </h1>
            <h1 className="hover:bg-green-100 py-2 px-1 hover:text-green-500 rounded-lg">
              Roadworks :{" "}
              {events.filter((e) => e.type === "construction").length}
            </h1>
            
            {/* Green Corridor Status */}
            <h1 className={`py-2 px-1 rounded-lg ${
              activeGreenCorridor 
                ? "bg-green-100 text-green-600 font-semibold" 
                : "hover:bg-green-100 hover:text-green-500"
            }`}>
              Green Corridor : {activeGreenCorridor ? "Active" : "Inactive"}
            </h1>
          </div>
        </section>

        {/* Green Corridor Button */}
        <section className="mt-6">
          <button
            onClick={() => setShowGreenCorridorModal(true)}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Create Green Corridor
          </button>
          
          {activeGreenCorridor && (
            <button
              onClick={handleDeactivateGreenCorridor}
              className="w-full mt-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm"
            >
              Deactivate Corridor
            </button>
          )}
        </section>

        {/* AI Traffic Alerts Section */}
        <section className="mt-10">
          <h2 className="font-semibold text-slate-500 mb-4 text-sm pl-1">
            AI Traffic Alerts
          </h2>
          
          <div className="h-64 overflow-y-auto pr-2 scrollbar-hide">
            {intersections.map(intersection => {
              // Generate alerts for this intersection
              const generateAlerts = (intersection) => {
                const alerts = [];
                
                if (intersection.congestion === 'High') {
                  alerts.push({
                    id: 'flow-prediction',
                    type: 'prediction',
                    severity: 'critical',
                    title: 'Traffic Flow Prediction',
                    message: `Predicted delay increase of 15-20 minutes`,
                    icon: '📊',
                    confidence: '85%',
                    intersection: intersection.name
                  });
                }

                if (intersection.lightTimer <= 10 && intersection.vehicles > 30) {
                  alerts.push({
                    id: 'signal-optimization',
                    type: 'optimization',
                    severity: 'high',
                    title: 'Signal Optimization',
                    message: `AI suggests extending green light by 15s`,
                    icon: '',
                    confidence: '92%',
                    intersection: intersection.name
                  });
                }

                if (intersection.pose && intersection.light === 'Green') {
                  alerts.push({
                    id: 'pedestrian-safety',
                    type: 'safety',
                    severity: 'high',
                    title: 'Pedestrian Safety',
                    message: `Pedestrian detected - extend crossing time`,
                    icon: '🚶',
                    confidence: '95%',
                    intersection: intersection.name
                  });
                }

                if (Math.random() > 0.7) {
                  alerts.push({
                    id: 'weather-impact',
                    type: 'weather',
                    severity: 'medium',
                    title: 'Weather Impact',
                    message: `Rain expected - traffic may slow by 25%`,
                    icon: '🌧️',
                    confidence: '78%',
                    intersection: intersection.name
                  });
                }

                return alerts;
              };

              const alerts = generateAlerts(intersection);
              
              return alerts.map(alert => (
                <div 
                  key={`${intersection.id}-${alert.id}`}
                  className={`p-3 mb-2 rounded-lg text-sm border-l-4 ${
                    alert.severity === 'critical' 
                      ? 'bg-red-50 border-red-500 text-red-800' 
                      : alert.severity === 'high'
                      ? 'bg-orange-50 border-orange-500 text-orange-800'
                      : 'bg-blue-50 border-blue-500 text-blue-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{alert.icon}</span>
                      <span className="font-semibold text-xs uppercase tracking-wide">
                        {alert.type}
                      </span>
                    </div>
                    <span className="text-xs bg-white/50 px-2 py-1 rounded-full">
                      {alert.confidence}
                    </span>
                  </div>
                  
                  <div className="font-bold text-sm mb-1">
                    {alert.title}
                  </div>
                  
                  <div className="text-xs opacity-90 mb-2">
                    {alert.message}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">
                      📍 {alert.intersection}
                    </span>
                    <div className="flex space-x-1">
                      <button className="text-xs bg-white/30 hover:bg-white/50 px-2 py-1 rounded transition-colors">
                        View
                      </button>
                      <button className="text-xs bg-white/30 hover:bg-white/50 px-2 py-1 rounded transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ));
            })}
            
            {/* Summary Stats */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="text-xs font-semibold text-blue-800 mb-2">AI Analysis Summary</div>
              <div className="space-y-1 text-xs text-blue-700">
                <div className="flex justify-between">
                  <span>Active Alerts:</span>
                  <span className="font-semibold">
                    {intersections.reduce((total, intersection) => {
                      const alerts = [];
                      if (intersection.congestion === 'High') alerts.push('prediction');
                      if (intersection.lightTimer <= 10 && intersection.vehicles > 30) alerts.push('optimization');
                      if (intersection.pose && intersection.light === 'Green') alerts.push('safety');
                      return total + alerts.length;
                    }, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Confidence:</span>
                  <span className="font-semibold">87%</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Recommendations:</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </aside>

      {/* Map View */}
      <main className="relative h-full flex-[0.8] rounded-2xl overflow-hidden bg-gray-200">
        <MapView
          events={events}
          intersections={intersections}
          onInteraction={handleMapInteraction}
          selectedId={mapDetails.selectedId}
          hoverId={mapDetails.hoverId}
        />

        {/* Map Popup for selected intersection */}
        {mapDetails.showPopup && selectedIntersection && (
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 w-80">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold">
                {selectedIntersection.name}
              </h3>
              <button
                onClick={closeMapPopup}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-sm text-gray-600">Traffic Light:</p>
                <p
                  className={
                    selectedIntersection.light === "Green"
                      ? "text-green-500 font-semibold"
                      : selectedIntersection.light === "Red"
                      ? "text-red-500 font-semibold"
                      : "text-yellow-500 font-semibold"
                  }
                >
                  {selectedIntersection.light}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Timer:</p>
                <p className="font-semibold">
                  {selectedIntersection.lightTimer}s
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Congestion:</p>
                <p
                  className={
                    selectedIntersection.congestion === "Low"
                      ? "text-green-500 font-semibold"
                      : selectedIntersection.congestion === "Medium"
                      ? "text-yellow-500 font-semibold"
                      : "text-red-500 font-semibold"
                  }
                >
                  {selectedIntersection.congestion}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicles:</p>
                <p className="font-semibold">{selectedIntersection.vehicles}</p>
              </div>
            </div>

            <button
              onClick={() => openModal(selectedIntersection)}
              className={`w-full py-2 rounded text-sm font-semibold ${
                selectedIntersection.pose
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              disabled={!selectedIntersection.pose}
            >
              {selectedIntersection.pose
                ? "Control Traffic Light"
                : "No Control Available"}
            </button>
          </div>
        )}
      </main>

      {/* Overlay Box */}
      <div className="absolute bottom-6 left-1/4 h-[25%] w-[72%] overflow-x-auto rounded shadow z-[9999] flex gap-4 scrollbar-hide ">
        {intersections.map((intersection) => (
          <div
            key={intersection.id}
            className="h-full aspect-video bg-white rounded"
          >
            <div className="p-4 flex flex-col h-full justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  {intersection.name}
                </h2>
                <p className="text-sm text-gray-600 mb-1">
                  Traffic Light:{" "}
                  <span
                    className={
                      intersection.light === "Green"
                        ? "text-green-500 font-semibold"
                        : intersection.light === "Red"
                        ? "text-red-500 font-semibold"
                        : "text-yellow-500 font-semibold"
                    }
                  >
                    {intersection.light}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Congestion Level:{" "}
                  <span
                    className={
                      intersection.congestion === "Low"
                        ? "text-green-500 font-semibold"
                        : intersection.congestion === "Medium"
                        ? "text-yellow-500 font-semibold"
                        : "text-red-500 font-semibold"
                    }
                  >
                    {intersection.congestion}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Vehicles Detected:{" "}
                  <span className="font-semibold">{intersection.vehicles}</span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Average Waiting Time:{" "}
                  <span className="font-semibold">
                    {intersection.waitingTime}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Forcast:{" "}
                  <span className="font-semibold">
                    xyz
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Light Timer:{" "}
                  <span className="font-semibold">
                    {intersection.lightTimer}s
                  </span>
                </p>
                <button
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    intersection.pose
                      ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-600 cursor-not-allowed"
                  }`}
                  disabled={!intersection.pose}
                  onClick={() => openModal(intersection)}
                >
                  {intersection.pose ? "Change Light" : "No Control"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Green Corridor Modal */}
      {showGreenCorridorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001]">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create Green Corridor</h2>
            <p className="text-gray-600 mb-4">Select start and end intersections for emergency vehicle priority route.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Start Intersection</label>
              <select
                value={greenCorridorStart}
                onChange={(e) => setGreenCorridorStart(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select start point</option>
                {intersections.map(intersection => (
                  <option key={intersection.id} value={intersection.id}>
                    {intersection.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">End Intersection</label>
              <select
                value={greenCorridorEnd}
                onChange={(e) => setGreenCorridorEnd(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select end point</option>
                {intersections.map(intersection => (
                  <option key={intersection.id} value={intersection.id}>
                    {intersection.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowGreenCorridorModal(false);
                  setGreenCorridorStart("");
                  setGreenCorridorEnd("");
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGreenCorridor}
                disabled={!greenCorridorStart || !greenCorridorEnd || greenCorridorStart === greenCorridorEnd}
                className={`px-4 py-2 rounded transition ${
                  !greenCorridorStart || !greenCorridorEnd || greenCorridorStart === greenCorridorEnd
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                Create Corridor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Green Corridor Confirmation Notification */}
      {showCorridorConfirmation && activeGreenCorridor && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[10002] max-w-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold">Green Corridor Activated</h3>
              <p className="mt-1">
                Route: <strong>{activeGreenCorridor.start}</strong> to <strong>{activeGreenCorridor.end}</strong>
              </p>
              <p className="text-sm mt-1 opacity-90">
                Emergency vehicle priority route established. Traffic signals will be optimized for this corridor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal for traffic light control */}
      {open && selectedIntersection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Control Traffic Light - {selectedIntersection.name}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Current Light:{" "}
                <span
                  className={
                    selectedIntersection.light === "Green"
                      ? "text-green-500 font-semibold"
                      : selectedIntersection.light === "Red"
                      ? "text-red-500 font-semibold"
                      : "text-yellow-500 font-semibold"
                  }
                >
                  {selectedIntersection.light}
                </span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Set Light Duration (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={manualTime}
                onChange={(e) => setManualTime(parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex justify-between mb-4">
              <button
                onClick={() => changeTrafficLight("Green")}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Set Green
              </button>
              <button
                onClick={() => changeTrafficLight("Yellow")}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                Set Yellow
              </button>
              <button
                onClick={() => changeTrafficLight("Red")}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Set Red
              </button>
            </div>

            <button
              onClick={handleEmergencyOverride}
              className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition font-semibold mb-2"
            >
              Emergency Override (Set Green for 60s)
            </button>

            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add Traffic Event</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, type: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="construction">Road Construction</option>
                  <option value="accident">Accident</option>
                  <option value="emergency">Emergency Route</option>
                  <option value="event">Special Event</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Severity
                </label>
                <select
                  value={newEvent.severity}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, severity: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="text"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="HH:MM or time range"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  rows="3"
                  placeholder="Enter event description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEventForm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;