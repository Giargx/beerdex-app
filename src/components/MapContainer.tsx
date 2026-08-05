import React, { useEffect, useRef, useState } from 'react';
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

  const [locationStatus, setLocationStatus] = useState<string>('');
  const [isManualPin, setIsManualPin] = useState<boolean>(false);

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

      // Check if user has a previously set manual location
      const savedLat = localStorage.getItem('beerdex_manual_lat');
      const savedLng = localStorage.getItem('beerdex_manual_lng');

      const placeUserMarker = (lat: number, lng: number, manual: boolean) => {
        if (!mapInstance.current) return;

        setIsManualPin(manual);
        mapInstance.current.setView([lat, lng], 16);

        // Custom Google Maps Draggable Location Pin
        const userIcon = L.divIcon({
          html: `<div style="background:${manual ? '#EF4444' : '#4285F4'}; width:20px; height:20px; border-radius:50%; border:3px solid #FFFFFF; box-shadow:0 0 10px rgba(0,0,0,0.5); cursor:move;"></div>`,
          className: 'user-loc-icon',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([lat, lng]);
          userMarkerRef.current.setIcon(userIcon);
        } else {
          userMarkerRef.current = L.marker([lat, lng], {
            icon: userIcon,
            draggable: true,
          }).addTo(mapInstance.current);

          // Handle pin drag end
          userMarkerRef.current.on('dragend', (e: any) => {
            const newPos = e.target.getLatLng();
            localStorage.setItem('beerdex_manual_lat', newPos.lat.toString());
            localStorage.setItem('beerdex_manual_lng', newPos.lng.toString());
            setIsManualPin(true);
            setLocationStatus('📍 Posizione corretta manualmente!');
          });
        }

        userMarkerRef.current.bindPopup(
          `<div style="text-align:center; font-family:inherit; padding:4px;">
            <b>${manual ? '📌 Posizione Personalizzata' : '📍 La tua Posizione Google Maps'}</b><br>
            <small style="color:#64748B;">Puoi trascinare questo pin o cliccare sulla mappa per posizionarti esattamente sul tuo pub!</small>
          </div>`
        );
      };

      if (savedLat && savedLng) {
        placeUserMarker(parseFloat(savedLat), parseFloat(savedLng), true);
        setLocationStatus('📌 Posizione personalizzata caricata');
      } else if (navigator.geolocation) {
        // High-Precision Geolocation via GPS / WiFi
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy || 0;

            if (mapInstance.current) {
              placeUserMarker(lat, lng, false);

              if (accuracy > 0 && !accuracyCircleRef.current) {
                accuracyCircleRef.current = L.circle([lat, lng], {
                  radius: Math.min(accuracy, 500),
                  color: '#4285F4',
                  fillColor: '#4285F4',
                  fillOpacity: 0.12,
                  weight: 1,
                }).addTo(mapInstance.current);
              }

              if (accuracy > 300) {
                setLocationStatus('💡 Suggerimento: Connessione Wi-Fi/PC rilevata. Clicca sulla mappa o trascina il pallino per correggere il tuo pub!');
              } else {
                setLocationStatus('⚡ Rilevamento GPS completato');
              }
            }
          },
          (err) => console.log('Geolocation error:', err),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      }

      // Allow clicking ANYWHERE on the map to instantly relocate/fine-tune the user's pin
      mapInstance.current.on('click', (e: L.LeafletMouseEvent) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        localStorage.setItem('beerdex_manual_lat', lat.toString());
        localStorage.setItem('beerdex_manual_lng', lng.toString());
        placeUserMarker(lat, lng, true);
        setLocationStatus('📍 Posizione spostata nel punto cliccato!');
      });
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstance.current) {
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

  const handleResetToAutoGps = () => {
    localStorage.removeItem('beerdex_manual_lat');
    localStorage.removeItem('beerdex_manual_lng');
    setIsManualPin(false);
    setLocationStatus('Rilevamento GPS in corso...');

    if (navigator.geolocation && mapInstance.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          mapInstance.current?.setView([lat, lng], 16);
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
            const userIcon = L.divIcon({
              html: '<div style="background:#4285F4; width:20px; height:20px; border-radius:50%; border:3px solid #FFFFFF; box-shadow:0 0 10px rgba(0,0,0,0.5); cursor:move;"></div>',
              className: 'user-loc-icon',
              iconSize: [26, 26],
              iconAnchor: [13, 13],
            });
            userMarkerRef.current.setIcon(userIcon);
          }
          setLocationStatus('📍 Posizione GPS ripristinata!');
        },
        (_err) => setLocationStatus('Impossibile rilevare posizione GPS automaticamente'),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Help Banner Overlay for manual pin adjustment */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '500px',
          zIndex: 999,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          color: '#FFFFFF',
          padding: '10px 14px',
          borderRadius: '16px',
          fontSize: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '20px' }}>
            touch_app
          </span>
          <span style={{ lineHeight: '1.3' }}>
            {locationStatus || 'Clicca sulla mappa o trascina il pallino per posizionarti sul tuo pub!'}
          </span>
        </div>

        {isManualPin && (
          <button
            onClick={handleResetToAutoGps}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#FDE68A',
              padding: '4px 10px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Reset GPS
          </button>
        )}
      </div>

      {/* Map View */}
      <div ref={mapRef} id="mapContainer" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};
