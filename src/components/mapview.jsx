'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
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
function MapController({ selectedIntersection }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedIntersection && selectedIntersection.position) {
      map.setView(selectedIntersection.position, 16, {
        animate: true,
        duration: 1
      });
    }
  }, [selectedIntersection, map]);
  
  return null;
}

export default function MapView({ intersections = [], selectedIntersection, onIntersectionClick }) {
  // Coordinates for different cities
  const cityCoordinates = {
    Pune: [18.5204, 73.8567],
    Mumbai: [19.0760, 72.8777],
    Delhi: [28.7041, 77.1025],
    Bangalore: [12.9716, 77.5946],
  };
  
  // Default to Pune if no city is provided
  const city = 'Pune';
  const mapCenter = cityCoordinates[city];

  return (
    <>
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapController selectedIntersection={selectedIntersection} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {intersections.map((intersection) => {
          const isSelected = selectedIntersection && selectedIntersection.id === intersection.id;
          
          return (
            <div key={intersection.id}>
              <Marker 
                position={intersection.position}
                icon={createTrafficLightIcon(intersection.light, isSelected, intersection.lightTimer)}
                eventHandlers={{
                  click: (e) => {
                    if (onIntersectionClick) {
                      // Get the mouse event from the original event
                      const originalEvent = e.originalEvent;
                      onIntersectionClick(intersection, originalEvent);
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
                        Time until change: {Math.floor(intersection.lightTimer / 60)}:{(intersection.lightTimer % 60).toString().padStart(2, '0')}
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
                  </div>
                </Popup>
              </Marker>
              
              {intersection.pose && (
                <Marker 
                  position={[
                    intersection.position[0] + 0.0005, 
                    intersection.position[1] + 0.0005
                  ]}
                  icon={createPedestrianIcon(isSelected)}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">Pedestrian Detected</h3>
                      <p className="text-sm">Near {intersection.name}</p>
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
                icon={createCongestionIcon(intersection.congestion, isSelected)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">Congestion Level</h3>
                    <p className="text-sm">{intersection.congestion} traffic at {intersection.name}</p>
                  </div>
                </Popup>
              </Marker>
            </div>
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
        
        .leaflet-popup-content {
          margin: 12px 15px !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
        }
      `}</style>
    </>
  );
}