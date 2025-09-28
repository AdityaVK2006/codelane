'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

// Fix for default markers in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Bhubaneswar road network data
const bhubaneswarRoads = [
  {
    id: 1,
    name: "Janpath Road",
    coordinates: [
      [20.2961, 85.8245], // Master Canteen Square
      [20.2915, 85.8342], // Sachivalaya Marg
      [20.2889, 85.8206]  // Vani Vihar Square
    ],
    congestion: "Medium"
  },
  {
    id: 2,
    name: "Jaydev Vihar Road",
    coordinates: [
      [20.3015, 85.8068], // Jaydev Vihar
      [20.2889, 85.8206], // Vani Vihar Square
      [20.2778, 85.8143]  // Kalpana Square
    ],
    congestion: "High"
  },
  {
    id: 3,
    name: "Rasulgarh Road",
    coordinates: [
      [20.2813, 85.8317], // Rasulgarh Square
      [20.2736, 85.8239], // Biju Patnaik Chhak
      [20.2778, 85.8143]  // Kalpana Square
    ],
    congestion: "Low"
  },
  {
    id: 4,
    name: "Patia Road",
    coordinates: [
      [20.3124, 85.8173], // Patia Square
      [20.3015, 85.8068], // Jaydev Vihar
      [20.2961, 85.8245]  // Master Canteen Square
    ],
    congestion: "Medium"
  },
  {
    id: 5,
    name: "Kalpana Road",
    coordinates: [
      [20.2778, 85.8143], // Kalpana Square
      [20.2736, 85.8239], // Biju Patnaik Chhak
      [20.2813, 85.8317]  // Rasulgarh Square
    ],
    congestion: "Low"
  },
  {
    id: 6,
    name: "Sachivalaya Marg",
    coordinates: [
      [20.2915, 85.8342], // Sachivalaya Marg
      [20.2961, 85.8245], // Master Canteen Square
      [20.3015, 85.8068]  // Jaydev Vihar
    ],
    congestion: "Medium"
  }
];

// Function to get road color based on congestion
const getRoadColor = (congestion) => {
  switch(congestion) {
    case "High": return "#ef4444";    // Red
    case "Medium": return "#eab308";  // Yellow
    case "Low": return "#22c55e";     // Green
    default: return "#6b7280";        // Gray
  }
};

// Function to get road weight based on congestion
const getRoadWeight = (congestion) => {
  switch(congestion) {
    case "High": return 8;
    case "Medium": return 6;
    case "Low": return 4;
    default: return 3;
  }
};

// Function to get dash array for traffic flow animation
const getDashArray = (congestion) => {
  switch(congestion) {
    case "High": return "10, 5";      // Slow moving
    case "Medium": return "20, 10";   // Medium flow
    case "Low": return "30, 15";      // Smooth flow
    default: return "0";
  }
};

// Custom icons for different traffic light statuses
const createTrafficLightIcon = (status, isSelected = false, timeLeft = 0) => {
  let html = '';
  let size = 28;
  let borderWidth = 3;
  
  if (isSelected) {
    size = 34;
    borderWidth = 4;
  }
  
  // Add pulsing animation for lights that will change soon
  const isAboutToChange = timeLeft < 10 && timeLeft > 0;
  const pulseClass = isAboutToChange ? 'traffic-light-pulse' : '';
  
  switch(status) {
    case 'Green':
      html = `<div class="${pulseClass}" style="
        background-color: #22c55e; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: ${borderWidth}px solid white;
        box-shadow: 0 0 15px rgba(0,0,0,0.7), 0 0 20px #22c55e;
        cursor: pointer;
        position: relative;
      ">
        ${timeLeft > 0 ? `<span style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          font-size: ${size/3}px;
          text-shadow: 1px 1px 2px black;
        ">${timeLeft}</span>` : ''}
      </div>`;
      break;
    case 'Yellow':
      html = `<div class="${pulseClass}" style="
        background-color: #eab308; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: ${borderWidth}px solid white;
        box-shadow: 0 0 15px rgba(0,0,0,0.7), 0 0 20px #eab308;
        cursor: pointer;
        position: relative;
      ">
        ${timeLeft > 0 ? `<span style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          font-size: ${size/3}px;
          text-shadow: 1px 1px 2px black;
        ">${timeLeft}</span>` : ''}
      </div>`;
      break;
    case 'Red':
      html = `<div class="${pulseClass}" style="
        background-color: #ef4444; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: ${borderWidth}px solid white;
        box-shadow: 0 0 15px rgba(0,0,0,0.7), 0 0 20px #ef4444;
        cursor: pointer;
        position: relative;
      ">
        ${timeLeft > 0 ? `<span style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          font-size: ${size/3}px;
          text-shadow: 1px 1px 2px black;
        ">${timeLeft}</span>` : ''}
      </div>`;
      break;
    default:
      html = `<div style="
        background-color: gray; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: ${borderWidth}px solid white;
        box-shadow: 0 0 15px rgba(0,0,0,0.7);
        cursor: pointer;
        position: relative;
      ">
        ${timeLeft > 0 ? `<span style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          font-size: ${size/3}px;
          text-shadow: 1px 1px 2px black;
        ">${timeLeft}</span>` : ''}
      </div>`;
  }
  
  return L.divIcon({
    html,
    className: 'traffic-light-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

// Custom icon for pedestrian detection
const createPedestrianIcon = (isSelected = false) => {
  const size = isSelected ? 26 : 22;
  const borderWidth = isSelected ? 3 : 2;
  
  const html = `<div style="
    background-color: #3b82f6; 
    width: ${size}px; 
    height: ${size}px; 
    border-radius: 50%; 
    border: ${borderWidth}px solid white;
    box-shadow: 0 0 10px rgba(0,0,0,0.5), 0 0 15px #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: ${isSelected ? '14px' : '12px'};
    cursor: pointer;
  ">P</div>`;
  
  return L.divIcon({
    html,
    className: 'pedestrian-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

// Custom icon for congestion indicator
const createCongestionIcon = (level, isSelected = false) => {
  const size = isSelected ? 20 : 16;
  
  let color;
  switch(level) {
    case "High": color = "#ef4444"; break;
    case "Medium": color = "#eab308"; break;
    default: color = "#22c55e";
  }
  
  const html = `<div style="
    background-color: ${color};
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 8px rgba(0,0,0,0.5);
    cursor: pointer;
  "></div>`;
  
  return L.divIcon({
    html,
    className: 'congestion-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

// Map controller component to handle focus changes
function MapController({ selectedId, intersections, onInteraction }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedId) {
      const intersection = intersections.find(i => i.id === selectedId);
      if (intersection && intersection.position) {
        map.setView(intersection.position, 16, {
          animate: true,
          duration: 1
        });
      }
    }
  }, [selectedId, intersections, map]);
  
  return null;
}

// Traffic simulation component
function TrafficSimulation({ intersections, onRoadsUpdate }) {
  const map = useMap();

  useEffect(() => {
    const simulateTrafficFlow = () => {
      // Simulate traffic flow by slightly adjusting road congestion
      const updatedRoads = bhubaneswarRoads.map(road => {
        // Find intersections along this road
        const roadIntersections = intersections.filter(intersection => 
          road.coordinates.some(coord => 
            Math.abs(coord[0] - intersection.position[0]) < 0.01 &&
            Math.abs(coord[1] - intersection.position[1]) < 0.01
          )
        );
        
        // Calculate average congestion from intersections
        if (roadIntersections.length > 0) {
          const congestionWeights = roadIntersections.map(intersection => {
            switch(intersection.congestion) {
              case "High": return 3;
              case "Medium": return 2;
              default: return 1;
            }
          });
          
          const avgCongestion = congestionWeights.reduce((a, b) => a + b, 0) / congestionWeights.length;
          
          let newCongestion = "Low";
          if (avgCongestion > 2.3) newCongestion = "High";
          else if (avgCongestion > 1.5) newCongestion = "Medium";
          
          // Add some random variation to simulate real traffic
          const randomVariation = Math.random();
          if (randomVariation > 0.7 && newCongestion !== "High") newCongestion = "Medium";
          if (randomVariation > 0.9) newCongestion = "High";
          
          return { ...road, congestion: newCongestion };
        }
        
        return road;
      });

      if (onRoadsUpdate) {
        onRoadsUpdate(updatedRoads);
      }
    };

    const trafficInterval = setInterval(simulateTrafficFlow, 3000);
    return () => clearInterval(trafficInterval);
  }, [intersections, onRoadsUpdate, map]);

  return null;
}

// MapView component with road highlighting and traffic simulation
const MapView = forwardRef(({ 
  events = [], 
  intersections = [], 
  onInteraction, 
  selectedId, 
  hoverId,
  isPublic = false,
  greenCorridor = null
}, ref) => {
  // Bhubaneswar coordinates - Center at Master Canteen Square
  const mapCenter = [20.2961, 85.8245];
  
  // State for roads with dynamic congestion
  const [roads, setRoads] = useState(bhubaneswarRoads);

  // Expose focusOnIntersection method to parent component
  useImperativeHandle(ref, () => ({
    focusOnIntersection: (intersection) => {
      if (intersection && intersection.position) {
        const map = window.map;
        if (map) {
          map.setView(intersection.position, 16, {
            animate: true,
            duration: 1
          });
        }
      }
    }
  }));

  // Function to handle road updates from traffic simulation
  const handleRoadsUpdate = (updatedRoads) => {
    setRoads(updatedRoads);
  };

  return (
    <>
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        whenCreated={(mapInstance) => {
          window.map = mapInstance;
        }}
      >
        <MapController 
          selectedId={selectedId} 
          intersections={intersections} 
          onInteraction={onInteraction} 
        />
        
        <TrafficSimulation 
          intersections={intersections} 
          onRoadsUpdate={handleRoadsUpdate} 
        />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw roads with congestion-based coloring and animation */}
        {roads.map(road => (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            color={getRoadColor(road.congestion)}
            weight={getRoadWeight(road.congestion)}
            opacity={0.8}
            smoothFactor={1}
            dashArray={getDashArray(road.congestion)}
            className="traffic-flow-line"
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg">{road.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold">Traffic Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    road.congestion === "High" ? "bg-red-100 text-red-800" :
                    road.congestion === "Medium" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-green-100 text-green-800"
                  }`}>
                    {road.congestion} Congestion
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Flow Speed:</span>
                    <span className="font-semibold">
                      {road.congestion === "High" ? "Slow" : 
                       road.congestion === "Medium" ? "Moderate" : "Fast"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span>Estimated Delay:</span>
                    <span className="font-semibold">
                      {road.congestion === "High" ? "10-15 min" : 
                       road.congestion === "Medium" ? "5-10 min" : "< 5 min"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Popup>
          </Polyline>
         ))}

         {/* Green Corridor */}
         {greenCorridor && greenCorridor.isActive && greenCorridor.startIntersection && greenCorridor.endIntersection && (
           <Polyline
             positions={[
               greenCorridor.startIntersection.position,
               greenCorridor.endIntersection.position
             ]}
             color="#10b981"
             weight={8}
             opacity={0.8}
             dashArray="15, 10"
             className="green-corridor"
           >
             <Popup>
               <div className="p-3 min-w-[250px]">
                 <div className="flex items-center justify-between mb-3">
                   <h3 className="font-bold text-lg text-green-800">🚦 Green Corridor</h3>
                   <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                     ACTIVE
                   </span>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-semibold">Route:</span>
                     <span className="text-sm font-bold text-green-700">
                       {greenCorridor.startIntersection.name} → {greenCorridor.endIntersection.name}
                     </span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 text-xs">
                     <div className="bg-green-50 p-2 rounded">
                       <div className="font-semibold text-green-600">Status</div>
                       <div className="font-bold text-green-800">Synchronized</div>
                     </div>
                     <div className="bg-green-50 p-2 rounded">
                       <div className="font-semibold text-green-600">Duration</div>
                       <div className="font-bold text-green-800">3-5 min</div>
                     </div>
                     <div className="bg-green-50 p-2 rounded">
                       <div className="font-semibold text-green-600">Priority</div>
                       <div className="font-bold text-green-800">High</div>
                     </div>
                     <div className="bg-green-50 p-2 rounded">
                       <div className="font-semibold text-green-600">Lights</div>
                       <div className="font-bold text-green-800">Optimized</div>
                     </div>
                   </div>
                 </div>
                 
                 <div className="mt-3 pt-2 border-t border-green-200">
                   <p className="text-xs text-green-600">
                     Traffic lights synchronized for optimal flow
                   </p>
                 </div>
               </div>
             </Popup>
           </Polyline>
         )}
         
         {/* Intersection markers */}
        {intersections.map((intersection) => {
          const isSelected = selectedId === intersection.id;
          const isHovered = hoverId === intersection.id;
          
          return (
            <div key={intersection.id}>
              <Marker 
                position={intersection.position}
                icon={createTrafficLightIcon(
                  intersection.light, 
                  isSelected || isHovered, 
                  intersection.lightTimer
                )}
                eventHandlers={{
                  click: (e) => {
                    if (onInteraction) {
                      onInteraction(intersection.id, 'click');
                    }
                  },
                  mouseover: () => {
                    if (onInteraction) {
                      onInteraction(intersection.id, 'hover');
                    }
                  },
                  mouseout: () => {
                    if (onInteraction) {
                      onInteraction(null, 'hover');
                    }
                  }
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg">{intersection.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className={`flex items-center ${intersection.light === 'Green' ? 'text-green-600' : 
                                              intersection.light === 'Yellow' ? 'text-yellow-600' : 'text-red-600'}`}>
                        <span className="w-3 h-3 rounded-full mr-2 bg-current"></span>
                        Light: {intersection.light}
                      </p>
                      <p className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2 bg-blue-500"></span>
                        Time until change: {intersection.lightTimer}s
                      </p>
                      <p className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2 bg-blue-500"></span>
                        Pedestrian: {intersection.pose ? 'Detected' : 'None'}
                      </p>
                      <p className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                          intersection.congestion === 'High' ? 'bg-red-500' : 
                          intersection.congestion === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></span>
                        Congestion: {intersection.congestion}
                      </p>
                      {intersection.vehicles && (
                        <p className="flex items-center">
                          <span className="w-3 h-3 rounded-full mr-2 bg-gray-500"></span>
                          Vehicles: {intersection.vehicles}
                        </p>
                      )}
                      {intersection.waitingTime && (
                        <p className="flex items-center">
                          <span className="w-3 h-3 rounded-full mr-2 bg-orange-500"></span>
                          Wait: {intersection.waitingTime}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <button 
                        className="w-full bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600 transition"
                        onClick={() => onInteraction && onInteraction(intersection.id, 'click')}
                      >
                        View Controls
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {intersection.pose && (
                <Marker 
                  position={[
                    intersection.position[0] + 0.0005, 
                    intersection.position[1] + 0.0005
                  ]}
                  icon={createPedestrianIcon(isSelected || isHovered)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">Pedestrian Detected</h3>
                      <p className="text-sm">Near {intersection.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Crosswalk signal activated
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Congestion indicator marker */}
              <Marker 
                position={[
                  intersection.position[0] - 0.0005, 
                  intersection.position[1] - 0.0005
                ]}
                icon={createCongestionIcon(intersection.congestion, isSelected || isHovered)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">Congestion Level</h3>
                    <p className="text-sm">{intersection.congestion} traffic at {intersection.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {intersection.vehicles} vehicles detected
                    </p>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}

        {/* Event markers */}
        {events.filter(event => event.status !== 'resolved').map((event) => {
          // Find the intersection that matches the event location
          const relatedIntersection = intersections.find(intersection => 
            event.location.includes(intersection.name)
          );
          
          if (!relatedIntersection) return null;
          
          let eventColor;
          switch(event.severity) {
            case 'high': eventColor = '#ef4444'; break;
            case 'medium': eventColor = '#eab308'; break;
            default: eventColor = '#3b82f6';
          }
          
          return (
            <Marker
              key={event.id}
              position={[
                relatedIntersection.position[0] + 0.001,
                relatedIntersection.position[1] - 0.001
              ]}
              icon={L.divIcon({
                html: `<div style="
                  background-color: ${eventColor};
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 0 10px rgba(0,0,0,0.5), 0 0 15px ${eventColor};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 12px;
                  cursor: pointer;
                ">!</div>`,
                className: 'event-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                  <p className="text-sm mt-2">{event.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-500">{event.time}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.severity === 'high' ? 'bg-red-100 text-red-800' :
                      event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {event.severity}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .traffic-light-pulse {
          animation: pulse 1s infinite;
        }
        
        @keyframes trafficFlow {
          0% { stroke-dashoffset: 10; }
          100% { stroke-dashoffset: 0; }
        }
        
        .traffic-flow-line {
          animation: trafficFlow 2s linear infinite;
        }
        
        .green-corridor {
          animation: greenCorridorPulse 2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
        }
        
        @keyframes greenCorridorPulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        .leaflet-popup-content {
          margin: 12px 15px !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .leaflet-popup-tip {
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        /* Custom styles for different congestion levels */
        .congestion-high {
          stroke-dasharray: 5, 5;
          animation-duration: 3s;
        }
        
        .congestion-medium {
          stroke-dasharray: 10, 10;
          animation-duration: 1.5s;
        }
        
        .congestion-low {
          stroke-dasharray: 20, 20;
          animation-duration: 1s;
        }
      `}</style>
    </>
  );
});

// Add useState import
MapView.displayName = 'MapView';

export default MapView;