import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Post {
  user: string;
  brand: string;
  variant: string;
  photo: string;
  time: number;
  isShiny: boolean;
  isShared: boolean;
  taggedFriend: string | null;
  lat?: number;
  lng?: number;
}

interface MapContainerProps {
  currentUserNick: string;
  posts: Post[];
  isActive: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  currentUserNick,
  posts,
  isActive,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up any legacy manual overrides
    localStorage.removeItem('beerdex_manual_lat');
    localStorage.removeItem('beerdex_manual_lng');

    // Initialize Google Maps view if not already done
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        maxBounds: [
          [-90, -180],
          [90, 180],
        ],
        maxBoundsViscosity: 1.0,
        minZoom: 2,
      }).setView([41.9028, 12.4964], 5);

      L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
        noWrap: true,
        bounds: [
          [-90, -180],
          [90, 180],
        ],
        attribution: '© Google Maps',
      }).addTo(mapInstance.current);

      markersGroup.current = L.layerGroup().addTo(mapInstance.current);

      // Automatic High-Precision GPS Lock with Real-Time Accuracy Refinement
      if (navigator.geolocation) {
        let bestAccuracy = Infinity;

        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy || 0;

            if (mapInstance.current) {
              // Always refine view when better accuracy is acquired
              if (accuracy < bestAccuracy || bestAccuracy === Infinity) {
                bestAccuracy = accuracy;

                mapInstance.current.setView([lat, lng], 16);

                // Update Accuracy Circle
                if (accuracyCircleRef.current) {
                  accuracyCircleRef.current.setLatLng([lat, lng]);
                  accuracyCircleRef.current.setRadius(Math.min(accuracy, 250));
                } else {
                  accuracyCircleRef.current = L.circle([lat, lng], {
                    radius: Math.min(accuracy, 250),
                    color: '#4285F4',
                    fillColor: '#4285F4',
                    fillOpacity: 0.12,
                    weight: 1,
                  }).addTo(mapInstance.current);
                }

                // Google Maps Blue Location Pin
                const userIcon = L.divIcon({
                  html: '<div style="background:#4285F4; width:18px; height:18px; border-radius:50%; border:3px solid #FFFFFF; box-shadow:0 0 10px rgba(66,133,244,0.8);"></div>',
                  className: 'user-loc-icon',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                });

                if (userMarkerRef.current) {
                  userMarkerRef.current.setLatLng([lat, lng]);
                } else {
                  userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
                    .addTo(mapInstance.current)
                    .bindPopup("<b style='font-family:inherit;'>📍 La tua Posizione (Google Maps)</b>");
                }
              }
            }
          },
          (err) => console.log('Geolocation watch error:', err),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );

        // Save watchId for cleanup
        (mapInstance.current as any)._geoWatchId = watchId;
      }
    }

    return () => {
      // Clean up map and geolocation listener when component unmounts
      if (mapInstance.current) {
        const wId = (mapInstance.current as any)._geoWatchId;
        if (wId !== undefined && navigator.geolocation) {
          navigator.geolocation.clearWatch(wId);
        }
        mapInstance.current.remove();
        mapInstance.current = null;
        markersGroup.current = null;
        userMarkerRef.current = null;
        accuracyCircleRef.current = null;
      }
    };
  }, []);

  // Update markers and handle invalidation of map container sizes when tab becomes active
  useEffect(() => {
    if (isActive && mapInstance.current) {
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
        }
      }, 400);
    }

    if (markersGroup.current && mapInstance.current) {
      markersGroup.current.clearLayers();

      const beerIcon = L.divIcon({
        html: '<span class="material-symbols-outlined" style="font-size:36px; color:var(--primary-dark); text-shadow: 2px 2px 4px rgba(0,0,0,0.4);">sports_bar</span>',
        className: 'custom-beer-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const myPosts = (posts || []).filter(
        (p) => p && p.user === currentUserNick && p.lat !== undefined && p.lng !== undefined
      );

      myPosts.forEach((p) => {
        if (p.lat !== undefined && p.lng !== undefined) {
          const shinyBadge = p.isShiny
            ? '<span class="material-symbols-outlined" style="font-size:12px; color:var(--primary-dark); vertical-align:middle;">auto_awesome</span> Sblocco Shiny'
            : '';

          L.marker([p.lat, p.lng], { icon: beerIcon })
            .addTo(markersGroup.current!)
            .bindPopup(
              `<div style="text-align:center; font-family:inherit;">
                <b>${p.brand}</b><br>${p.variant}<br>
                <small style="font-weight:bold;">${shinyBadge}</small><br>
                <img src="${p.photo}" style="width:100px; height:100px; object-fit:cover; border-radius:8px; margin-top:8px; border:2px solid var(--primary);" />
              </div>`
            );
        }
      });
    }
  }, [isActive, posts, currentUserNick]);

  return <div ref={mapRef} id="mapContainer" style={{ width: '100%', height: '100%' }}></div>;
};
