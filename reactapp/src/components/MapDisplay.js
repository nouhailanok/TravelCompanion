import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Import L to fix default icon issue

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Helper component to adjust map bounds
const AutoFitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};

const MapDisplay = ({ 
  centerLatitude, 
  centerLongitude, 
  markers = [], // Array of marker objects: { latitude, longitude, popupText }
  popupText, // For single marker mode (backward compatibility)
  mapHeight = '300px', 
  zoom = 13 
}) => {

  let displayMarkers = [];
  let effectiveCenter = null;
  let bounds = null;

  if (markers && markers.length > 0) {
    displayMarkers = markers.filter(m => m.latitude != null && m.longitude != null);
    if (displayMarkers.length > 0) {
        const latLngs = displayMarkers.map(m => [m.latitude, m.longitude]);
        bounds = L.latLngBounds(latLngs);
        if (centerLatitude != null && centerLongitude != null) {
            effectiveCenter = [centerLatitude, centerLongitude];
        } else {
            effectiveCenter = bounds.getCenter();
        }
    }
  } else if (centerLatitude != null && centerLongitude != null) {
    // Single marker mode (using centerLatitude/Longitude as the marker)
    displayMarkers = [{
      latitude: centerLatitude,
      longitude: centerLongitude,
      popupText: popupText || 'Location'
    }];
    effectiveCenter = [centerLatitude, centerLongitude];
    bounds = L.latLngBounds([effectiveCenter, effectiveCenter]); // Bounds for a single point
  }

  if (displayMarkers.length === 0) {
    return <div style={{ height: mapHeight, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}><p className="text-gray-500">Map data not available or no valid locations.</p></div>;
  }
  
  // If only one marker, ensure zoom is not too far out by default from fitBounds
  const initialZoom = displayMarkers.length === 1 ? zoom : undefined;

  return (
    <MapContainer 
        center={effectiveCenter} 
        zoom={initialZoom} // Use specific zoom for single marker, let fitBounds handle multi
        style={{ height: mapHeight, width: '100%', borderRadius: '8px', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {displayMarkers.map((marker, index) => (
        <Marker key={index} position={[marker.latitude, marker.longitude]}>
          {marker.popupText && (
            <Popup>{marker.popupText}</Popup>
          )}
        </Marker>
      ))}
      {bounds && displayMarkers.length > 1 && <AutoFitBounds bounds={bounds} />}
    </MapContainer>
  );
};

export default MapDisplay; 