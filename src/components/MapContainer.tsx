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

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already done
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        maxBounds: [
          [-90, -180],
          [90, 180],
        ],
        maxBoundsViscosity: 1.0,
        minZoom: 2,
      }).setView([41.9028, 12.4964], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        noWrap: true,
        bounds: [
          [-90, -180],
          [90, 180],
        ],
        attribution: '© OpenStreetMap',
      }).addTo(mapInstance.current);

      markersGroup.current = L.layerGroup().addTo(mapInstance.current);

      // Try geolocating user
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            
            if (mapInstance.current) {
              mapInstance.current.setView([lat, lng], 13);

              const userIcon = L.divIcon({
                html: '<div style="background:#3498db; width:16px; height:16px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>',
                className: 'user-loc-icon',
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              });

              L.marker([lat, lng], { icon: userIcon })
                .addTo(mapInstance.current)
                .bindPopup("<b style='font-family:inherit;'>Sei qui!</b>");
            }
          },
          (err) => console.log("Geolocation error:", err)
        );
      }
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersGroup.current = null;
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
