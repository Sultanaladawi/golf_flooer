import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Navigation, Check, Loader2, Search } from 'lucide-react';
import { matchCountryFromAddress, matchCityFromAddress, getCountryIso } from '../utils/countryCityData';

export default function MapLocationPicker({ 
  isOpen, 
  onClose, 
  onSelectLocation,
  initialCountry = 'الأردن',
  initialCity = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [isLoadingLeaflet, setIsLoadingLeaflet] = useState(true);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [selectedCoords, setSelectedCoords] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    country: initialCountry || 'الأردن',
    city: initialCity || '',
    area: '',
    address: '',
    displayName: ''
  });

  // Default coordinate centers
  const getDefaultCoords = () => {
    const iso = getCountryIso(initialCountry);
    switch (iso) {
      case 'jo': return [31.9539, 35.9106]; // Amman
      case 'sa': return [24.7136, 46.6753]; // Riyadh
      case 'ae': return [25.2048, 55.2708]; // Dubai
      case 'kw': return [29.3759, 47.9774]; // Kuwait
      case 'qa': return [25.2854, 51.5310]; // Doha
      case 'bh': return [26.2285, 50.5860]; // Manama
      case 'om': return [23.5859, 58.4059]; // Muscat
      case 'eg': return [30.0444, 31.2357]; // Cairo
      case 'ps': return [31.9038, 35.2034]; // Ramallah
      default: return [31.9539, 35.9106];
    }
  };

  // Load Leaflet CSS & JS dynamically
  useEffect(() => {
    if (!isOpen) return;

    // Check if Leaflet is already loaded on window
    if (window.L) {
      setIsLoadingLeaflet(false);
      return;
    }

    // Add Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setIsLoadingLeaflet(false);
      };
      document.body.appendChild(script);
    } else {
      setIsLoadingLeaflet(false);
    }
  }, [isOpen]);

  // Reverse geocode lat, lng to Arabic address details
  const reverseGeocode = async (lat, lon) => {
    setIsGeocoding(true);
    try {
      let country = initialCountry || 'الأردن';
      let city = initialCity || '';
      let area = '';
      let cleanAddress = '';
      let displayName = '';

      // Primary: Fast CORS-friendly reverse geocoding in Arabic
      try {
        const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ar`);
        if (bdcRes.ok) {
          const bdcData = await bdcRes.json();
          if (bdcData && bdcData.countryName) {
            const cleanAr = (t) => (t || '').replace(/[\u064B-\u065F\u0670]/g, '').trim();
            country = matchCountryFromAddress(cleanAr(bdcData.countryName)) || country || 'الأردن';
            const iso = getCountryIso(country);
            const adminList = bdcData.localityInfo?.administrative || [];
            let district = '';
            for (let i = adminList.length - 1; i >= 0; i--) {
              const item = adminList[i];
              if (item.adminLevel >= 5 && item.name && !item.name.includes('الأردن')) {
                district = cleanAr(item.name).replace(/^(لواء|قضاء|محافظة|ناحية)\s+/, '');
                break;
              }
            }

            const mockData = {
              address: {
                country: cleanAr(bdcData.countryName),
                state: cleanAr(bdcData.principalSubdivision),
                city: cleanAr(bdcData.city),
                town: cleanAr(bdcData.locality),
                suburb: district || bdcData.localityInfo?.administrative?.[3]?.name
              },
              display_name: [district, cleanAr(bdcData.locality), cleanAr(bdcData.principalSubdivision), cleanAr(bdcData.countryName)].filter(Boolean).join(', ')
            };
            city = matchCityFromAddress(mockData, iso) || cleanAr(bdcData.city || bdcData.locality) || 'عمان';
            area = district || (cleanAr(bdcData.locality) !== city ? cleanAr(bdcData.locality) : '') || '';
            const state = cleanAr(bdcData.principalSubdivision) || '';
            cleanAddress = [area && area !== city ? area : null, city, state].filter(Boolean).join('، ');
            displayName = cleanAddress;
          }
        }
      } catch (e) {
        console.warn('Primary geocoding error:', e);
      }

      // Fallback
      if (!city || !cleanAddress) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              country = matchCountryFromAddress(data.address.country || data.display_name || country);
              const iso = getCountryIso(country);
              city = city || matchCityFromAddress(data, iso);
              area = area || data.address.suburb || data.address.neighbourhood || data.address.quarter || '';
              const road = data.address.road || '';
              const houseNumber = data.address.house_number || '';
              const building = data.address.building || '';
              const nominatimAddress = [road, houseNumber, building].filter(Boolean).join(' ') || data.display_name;
              cleanAddress = cleanAddress || nominatimAddress;
              displayName = data.display_name || cleanAddress;
            }
          }
        } catch (err) {
          console.warn('Fallback geocoding error:', err);
        }
      }

      const finalCountry = country || 'الأردن';
      const finalCity = city || initialCity || 'عمان';
      const finalArea = area || (finalCity ? `حي ${finalCity}` : 'وسط المدينة');
      const finalAddress = cleanAddress || displayName || `${finalArea}، ${finalCity}، ${finalCountry}`;

      setLocationDetails({
        country: finalCountry,
        city: finalCity,
        area: finalArea,
        address: finalAddress,
        displayName: finalAddress
      });
    } catch (e) {
      console.warn('Geocoding error:', e);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!isOpen || isLoadingLeaflet || !mapContainerRef.current || !window.L) return;

    const L = window.L;
    const initialPos = getDefaultCoords();

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: initialPos,
        zoom: 13,
        zoomControl: false
      });

      // Add Zoom Control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      // Custom Gold Pin Marker
      const goldIcon = L.divIcon({
        className: 'custom-gold-marker',
        html: `
          <div style="
            position: relative;
            width: 36px;
            height: 36px;
            background: #111;
            border: 2.5px solid #c5a880;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 12px;
              height: 12px;
              background: #c5a880;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      const marker = L.marker(initialPos, {
        draggable: true,
        icon: goldIcon
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;
      setSelectedCoords({ lat: initialPos[0], lng: initialPos[1] });

      // On Marker Drag End
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setSelectedCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // On Map Click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setSelectedCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // Try fetching initial address
      reverseGeocode(initialPos[0], initialPos[1]);

      // Auto-locate GPS on open if available
      if (navigator.geolocation) {
        setIsLocatingUser(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            map.setView([userLat, userLng], 16);
            marker.setLatLng([userLat, userLng]);
            setSelectedCoords({ lat: userLat, lng: userLng });
            reverseGeocode(userLat, userLng);
            setIsLocatingUser(false);
          },
          () => {
            setIsLocatingUser(false);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    } else {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }

    return () => {
      // Map cleanup on close
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, isLoadingLeaflet]);

  // Handle GPS button click inside modal
  const handleGpsClick = () => {
    if (!navigator.geolocation) return;
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([userLat, userLng], 17);
          markerRef.current.setLatLng([userLat, userLng]);
          setSelectedCoords({ lat: userLat, lng: userLng });
          reverseGeocode(userLat, userLng);
        }
        setIsLocatingUser(false);
      },
      (err) => {
        alert('تعذر الوصول إلى موقع GPS الحالي. يرجى تفعيل خدمة الموقع في جهازك.');
        setIsLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle Address Search
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' ' + (initialCountry || ''))}&accept-language=ar&limit=1`);
      const results = await res.json();
      if (results && results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lon], 16);
          markerRef.current.setLatLng([lat, lon]);
          setSelectedCoords({ lat, lng: lon });
          reverseGeocode(lat, lon);
        }
      } else {
        alert('لم يتم العثور على نتائج، يمكنك النقر مباشرة على الخريطة لتحديد موقعك');
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (!selectedCoords) return;
    const googleMapsUrl = `https://maps.google.com/?q=${selectedCoords.lat},${selectedCoords.lng}`;
    onSelectLocation({
      country: locationDetails.country || initialCountry,
      city: locationDetails.city || initialCity,
      area: locationDetails.area,
      address: locationDetails.address,
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
      mapUrl: googleMapsUrl
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      overflowY: 'auto',
      direction: 'rtl'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        border: '1px solid rgba(197, 168, 128, 0.3)',
        margin: 'auto'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#faf8f5',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'rgba(197, 168, 128, 0.2)',
              color: 'var(--gold-dim, #a67c48)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--espresso, #1a1a1a)' }}>
                تحديد موقع التوصيل على الخريطة
              </h3>
              <p style={{ margin: '1px 0 0', fontSize: '0.78rem', color: '#777' }}>
                انقري على الخريطة أو اسحبي الدبوس لتحديد عنوانك بدقة متناهية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & GPS Bar */}
        <div style={{ padding: '10px 18px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '8px', flexShrink: 0 }}>
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحثي عن حي، شارع، أو معلم..."
                style={{
                  width: '100%',
                  padding: '8px 36px 8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #ddd',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Search size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              style={{
                padding: '0 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--espresso, #1a1a1a)',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isSearching ? <Loader2 size={15} className="spin" /> : 'بحث'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleGpsClick}
            disabled={isLocatingUser}
            style={{
              padding: '0 12px',
              borderRadius: '10px',
              border: '1px solid var(--gold-dim, #c5a880)',
              backgroundColor: 'rgba(197, 168, 128, 0.1)',
              color: 'var(--gold-dim, #9b723e)',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            {isLocatingUser ? <Loader2 size={15} className="spin" /> : <Navigation size={15} />}
            موقعي الحالي
          </button>
        </div>

        {/* Map Viewport */}
        <div style={{ flex: '1 1 auto', position: 'relative', height: '260px', minHeight: '180px', backgroundColor: '#e5e3df' }}>
          {isLoadingLeaflet && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#faf8f5',
              zIndex: 10
            }}>
              <Loader2 size={28} className="spin" style={{ color: 'var(--gold-dim, #c5a880)', marginBottom: '8px' }} />
              <div style={{ color: '#666', fontSize: '0.85rem', fontWeight: 'bold' }}>جاري تحميل الخريطة التفاعلية...</div>
            </div>
          )}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Selected Location Summary & Confirm Button */}
        <div style={{
          padding: '12px 18px',
          backgroundColor: '#faf8f5',
          borderTop: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid #e8e8e8',
            fontSize: '0.84rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: 'var(--gold-dim, #9b723e)', fontWeight: 'bold' }}>
              <MapPin size={15} />
              <span>الموقع المحدد للتوصيل:</span>
              {isGeocoding && <span style={{ fontSize: '0.72rem', color: '#999' }}>(جاري استخراج تفاصيل العنوان...)</span>}
            </div>
            <div style={{ color: '#333', fontSize: '0.82rem', lineHeight: '1.35', wordBreak: 'break-word', maxHeight: '45px', overflowY: 'auto' }}>
              {locationDetails.displayName || locationDetails.address || 'انقري على الخريطة لتحديد عنوانك بالتفصيل'}
            </div>
            {(locationDetails.city || locationDetails.country) && (
              <div style={{ marginTop: '5px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {locationDetails.country && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '5px', color: '#555' }}>
                    🇯🇴 {locationDetails.country}
                  </span>
                )}
                {locationDetails.city && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(197, 168, 128, 0.15)', color: 'var(--gold-dim, #9b723e)', padding: '2px 6px', borderRadius: '5px', fontWeight: 'bold' }}>
                    📍 المدينة: {locationDetails.city}
                  </span>
                )}
                {locationDetails.area && (
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '5px', color: '#555' }}>
                    🏘️ الحي: {locationDetails.area}
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                color: '#555',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedCoords}
              style={{
                flex: 2,
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--gold-dim, #c5a880)',
                color: '#fff',
                fontWeight: '800',
                fontSize: '0.92rem',
                cursor: selectedCoords ? 'pointer' : 'not-allowed',
                boxShadow: '0 4px 15px rgba(197, 168, 128, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Check size={16} />
              تأكيد هذا الموقع واعتماده
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
