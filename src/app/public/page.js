"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import TrafficAlert from "@/components/TrafficAlert";

// Dynamically import the MapView component with no SSR
const MapView = dynamic(() => import("@/components/mapview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="animate-pulse text-gray-500">Loading map...</div>
    </div>
  ),
});

const PublicPage = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      type: "accident",
      title: "Vehicle Collision",
      location: "MG Road & FC Road Intersection",
      severity: "high",
      time: "14:30",
      status: "active",
      description: "Two-car collision blocking right lane"
    },
    {
      id: 2,
      type: "construction",
      title: "Scheduled Road Work",
      location: "JM Road (between SB Road and Karve Road)",
      severity: "medium",
      time: "09:00-16:00",
      status: "scheduled",
      description: "Water pipe replacement, one lane closed"
    },
    {
      id: 3,
      type: "emergency",
      title: "Ambulance Route",
      location: "From Ruby Hospital to City General",
      severity: "high",
      time: "15:15",
      status: "active",
      description: "Emergency vehicle en route - prioritize signals"
    }
  ]);
  const [intersections, setIntersections] = useState([
    { 
      id: 1, 
      name: "MG Road", 
      light: "Green", 
      congestion: "Low",
      vehicles: 12,
      waitingTime: "30s",
      position: [18.5204, 73.8567],
      lightTimer: 30,
    },
    { 
      id: 2, 
      name: "FC Road", 
      light: "Red", 
      congestion: "High",
      vehicles: 42,
      waitingTime: "2m 15s",
      position: [18.5230, 73.8500],
      lightTimer: 15,
    },
    { 
      id: 3, 
      name: "JM Road", 
      light: "Yellow", 
      congestion: "Medium",
      vehicles: 28,
      waitingTime: "1m 10s",
      position: [18.5170, 73.8600],
      lightTimer: 5,
    },
    { 
      id: 4, 
      name: "SB Road", 
      light: "Green", 
      congestion: "Low",
      vehicles: 18,
      waitingTime: "45s",
      position: [18.5250, 73.8650],
      lightTimer: 25,
    },
    { 
      id: 5, 
      name: "Karve Road", 
      light: "Red", 
      congestion: "Medium",
      vehicles: 35,
      waitingTime: "1m 30s",
      position: [18.5150, 73.8400],
      lightTimer: 20,
    },
    { 
      id: 6, 
      name: "DP Road", 
      light: "Green", 
      congestion: "Low",
      vehicles: 22,
      waitingTime: "40s",
      position: [18.5100, 73.8550],
      lightTimer: 35,
    },
    { 
      id: 7, 
      name: "University Circle", 
      light: "Yellow", 
      congestion: "High",
      vehicles: 48,
      waitingTime: "2m 45s",
      position: [18.5270, 73.8450],
      lightTimer: 10,
    },
    { 
      id: 8, 
      name: "Station Road", 
      light: "Red", 
      congestion: "Medium",
      vehicles: 30,
      waitingTime: "1m 15s",
      position: [18.5190, 73.8750],
      lightTimer: 18,
    },
  ]);
  
  const [mapDetails, setMapDetails] = useState({
    selectedId: null,
    hoverId: null,
    showPopup: false
  });

  // Function to handle map interaction
  const handleMapInteraction = (intersectionId, action) => {
    if (action === "click") {
      const intersection = intersections.find(i => i.id === intersectionId);
      if (intersection) {
        setMapDetails({
          ...mapDetails,
          selectedId: intersectionId,
          showPopup: true
        });
      }
    } else if (action === "hover") {
      setMapDetails({
        ...mapDetails,
        hoverId: intersectionId
      });
    }
  };

  // Function to close map popup
  const closeMapPopup = () => {
    setMapDetails({
      ...mapDetails,
      showPopup: false,
      selectedId: null
    });
  };

  // Get selected intersection for popup
  const selectedIntersection = intersections.find(i => i.id === mapDetails.selectedId);

  return (
    <div className="h-screen w-screen bg-white flex p-4">
      {/* Sidebar */}
      <aside className="h-full flex-[0.2] p-4 bg-[#eef9e9]">
        <header className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-green-500 rounded-lg"></div>
          <h1 className="text-2xl font-semibold text-black">CodeLane</h1>
        </header>

        {/* <section className="mt-10">
          <h2 className="font-semibold text-slate-500 mb-4 text-sm pl-1">
            Current Status
          </h2>
          <div className="flex flex-col text-slate-600">
            <h1 className="hover:bg-green-100 py-2 px-1 hover:text-green-500 rounded-lg">
              Location : Pune
            </h1>
            <h1 className="hover:bg-green-100 py-2 px-1 hover:text-green-500 rounded-lg">
              Emergency : {events.filter(e => e.type === "emergency" && e.status === "active").length > 0 ? "Yes" : "No"}
            </h1>
            <h1 className="hover:bg-green-100 py-2 px-1 hover:text-green-500 rounded-lg">
              Intersections : 8
            </h1>
            <h1 className="hover:bg-green-100 py-2 px-1 hover:text-green-500 rounded-lg">
              Active Incidents : {events.filter(e => e.status === "active").length}
            </h1>
            <h1 className="hover:bg-green-100 py-2 px-1 hover:text-green-500 rounded-lg">
              Roadworks : {events.filter(e => e.type === "construction").length}
            </h1>
          </div>
        </section> */}

        {/* Events/Incidents Section */}
        <section className="mt-10">
          <h2 className="font-semibold text-slate-500 mb-4 text-sm pl-1">
            Traffic Events & Incidents
          </h2>
          
          <div className="h-64 overflow-y-auto pr-2 scrollbar-hide">
            {events.map(event => (
              <div 
                key={event.id} 
                className={`p-3 mb-2 rounded-lg text-sm ${event.status === "resolved" 
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
                <div className="mt-2">
                  <span className="text-xs capitalize">{event.type} • {event.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Public Information */}
        <section className="mt-10">
          <h2 className="font-semibold text-slate-500 mb-4 text-sm pl-1">
            Travel Tips
          </h2>
          <div className="text-xs text-slate-600 space-y-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="font-medium">Peak Hours:</span> 8-10 AM & 5-7 PM
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="font-medium">Alternate Routes:</span> Use bypass roads during peak hours
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <span className="font-medium">Public Transport:</span> Consider PMPML buses during congestion
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
          isPublic={true}
        />
        
        {/* Map Popup for selected intersection */}
        {mapDetails.showPopup && selectedIntersection && (
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 w-80">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold">{selectedIntersection.name}</h3>
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
                <p className={
                  selectedIntersection.light === "Green" ? "text-green-500 font-semibold" :
                  selectedIntersection.light === "Red" ? "text-red-500 font-semibold" :
                  "text-yellow-500 font-semibold"
                }>
                  {selectedIntersection.light}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Timer:</p>
                <p className="font-semibold">{selectedIntersection.lightTimer}s</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Congestion:</p>
                <p className={
                  selectedIntersection.congestion === "Low" ? "text-green-500 font-semibold" :
                  selectedIntersection.congestion === "Medium" ? "text-yellow-500 font-semibold" :
                  "text-red-500 font-semibold"
                }>
                  {selectedIntersection.congestion}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicles:</p>
                <p className="font-semibold">{selectedIntersection.vehicles}</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mt-4">
              <p>This is a public information display. Control functions are disabled.</p>
            </div>
          </div>
        )}
      </main>
      
      {/* Overlay Box */}
      <div className="absolute bottom-6 left-1/4 h-[25%] w-[72%] overflow-x-auto rounded shadow z-[9999] flex gap-4 scrollbar-hide ">
        {intersections.map((intersection) => (
          <div
            key={intersection.id}
            className="h-full aspect-video bg-white rounded relative"
          >
            {/* Traffic Alert Notification */}
            <TrafficAlert intersection={intersection} />
            
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
                  <span className="font-semibold">
                    {intersection.vehicles}
                  </span>
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
                <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                  Info Only
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicPage;