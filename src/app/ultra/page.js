"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

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
    <div className="h-screen w-screen bg-white flex p-4">
      {/* Sidebar */}
      <aside className="h-full flex-[0.2] p-4 bg-[#eef9e9]">
        <header className="flex items-center gap-2 mb-6">
          <div className="logo" aria-hidden="true"></div>
          <h1 className="text-2xl font-semibold text-black">CodeLane</h1>
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
          </div>
        </section>

        {/* Events/Incidents Section */}
        <section className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-500 text-sm pl-1">
              Events & Incidents
            </h2>
            <button
              onClick={() => setShowEventForm(true)}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
            >
              + Add
            </button>
          </div>

          <div className="h-64 overflow-y-auto pr-2 scrollbar-hide">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-3 mb-2 rounded-lg text-sm ${
                  event.status === "resolved"
                    ? "bg-gray-100 text-gray-500"
                    : event.severity === "high"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{event.title}</span>
                  <span className="text-xs">{event.time}</span>
                </div>
                <div className="text-xs mt-1">{event.location}</div>
                <div className="text-xs mt-1">{event.description}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs capitalize">
                    {event.type} • {event.severity}
                  </span>
                  {event.status !== "resolved" && (
                    <button
                      onClick={() => resolveEvent(event.id)}
                      className="text-xs bg-green-500 text-white px-2 py-0.5 rounded"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-4">
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-gray-500 hover:text-red-500 transition"
              title="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
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

      {/* Full-Screen Intersection Modal with Traffic Videos */}
      {open && selectedIntersection && (
        <div className="fixed inset-0 bg-white z-[10000] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">
              {selectedIntersection.name} - Traffic Control
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Traffic Videos */}
            <div className="w-2/3 flex flex-col p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Traffic Cameras</h3>
                <div className="flex space-x-2">
                  {selectedIntersection.cameras.map((camera, index) => (
                    <button
                      key={camera.id}
                      onClick={() => setActiveCamera(index)}
                      className={`px-3 py-1 rounded text-sm ${
                        activeCamera === index
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {camera.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-black rounded-lg overflow-hidden">
                {selectedIntersection.cameras.length > 0 && (
                  <video
                    key={selectedIntersection.cameras[activeCamera].id}
                    src={`/${selectedIntersection.cameras[activeCamera].url}`}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {selectedIntersection.cameras.map((camera, index) => (
                  <div
                    key={camera.id}
                    className={`h-32 bg-gray-800 rounded overflow-hidden cursor-pointer ${
                      activeCamera === index ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setActiveCamera(index)}
                  >
                    <div className="h-full w-full bg-gray-700 flex items-center justify-center text-white text-sm">
                      {camera.name} Live Feed
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Controls and Information */}
            <div className="w-1/3 border-l p-6 overflow-y-auto scrollbar-hide">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Intersection Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Traffic Light</p>
                    <p
                      className={
                        selectedIntersection.light === "Green"
                          ? "text-green-500 font-semibold text-lg"
                          : selectedIntersection.light === "Red"
                          ? "text-red-500 font-semibold text-lg"
                          : "text-yellow-500 font-semibold text-lg"
                      }
                    >
                      {selectedIntersection.light}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Timer</p>
                    <p className="font-semibold text-lg">
                      {selectedIntersection.lightTimer}s
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Congestion</p>
                    <p
                      className={
                        selectedIntersection.congestion === "Low"
                          ? "text-green-500 font-semibold text-lg"
                          : selectedIntersection.congestion === "Medium"
                          ? "text-yellow-500 font-semibold text-lg"
                          : "text-red-500 font-semibold text-lg"
                      }
                    >
                      {selectedIntersection.congestion}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Vehicles</p>
                    <p className="font-semibold text-lg">
                      {selectedIntersection.vehicles}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded col-span-2">
                    <p className="text-sm text-gray-600">
                      Average Waiting Time
                    </p>
                    <p className="font-semibold text-lg">
                      {selectedIntersection.waitingTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Traffic Light Control
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Set Light Duration (seconds)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={manualTime}
                      onChange={(e) => setManualTime(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-3 font-semibold w-10">
                      {manualTime}s
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={() => changeTrafficLight("Green")}
                    className="py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex flex-col items-center justify-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-white mb-1"></div>
                    <span>Green</span>
                  </button>
                  <button
                    onClick={() => changeTrafficLight("Yellow")}
                    className="py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex flex-col items-center justify-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-white mb-1"></div>
                    <span>Yellow</span>
                  </button>
                  <button
                    onClick={() => changeTrafficLight("Red")}
                    className="py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex flex-col items-center justify-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-white mb-1"></div>
                    <span>Red</span>
                  </button>
                </div>

                <button
                  onClick={handleEmergencyOverride}
                  className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center mb-2"
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Emergency Override
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Sets green light for 60 seconds
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Events</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {events
                    .filter((event) =>
                      event.location.includes(selectedIntersection.name)
                    )
                    .slice(0, 3)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="bg-gray-50 p-2 rounded text-sm"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{event.title}</span>
                          <span className="text-gray-500">{event.time}</span>
                        </div>
                        <p className="text-gray-600 truncate">
                          {event.description}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Form Modal */}
      {showEventForm && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg z-[9999] w-96 shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Add New Event/Incident</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={newEvent.type}
              onChange={(e) =>
                setNewEvent({ ...newEvent, type: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="accident">Accident</option>
              <option value="construction">Construction/Roadwork</option>
              <option value="emergency">Emergency</option>
              <option value="closure">Road Closure</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Brief description"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Where is this happening?"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Severity</label>
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

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {newEvent.type === "construction" ? "Schedule" : "Time"}
            </label>
            <input
              type="text"
              value={newEvent.time}
              onChange={(e) =>
                setNewEvent({ ...newEvent, time: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder={
                newEvent.type === "construction"
                  ? "e.g., 09:00-16:00"
                  : "e.g., 14:30"
              }
            />
          </div>

          <div className="mb-4">
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
              placeholder="Additional details..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowEventForm(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEvent}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Add Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
