import React, { useState, useEffect, useRef, useMemo, Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bike, Navigation, Zap, Compass, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

// Error Boundary to prevent Leaflet map crashes from breaking the entire page
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.error('MovingDeliveryMap error:', err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto font-bold">
            <Bike className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Live GPS Tracking Active</h4>
          <p className="text-xs text-slate-500">Rider is on the way to your doorstep across Tamil Nadu.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Custom Leaflet Icons ───────────────────────────────────────────────────────
const createBadgeIcon = (emoji, bgColor, borderColor = '#ffffff') =>
  L.divIcon({
    className: 'custom-leaflet-badge',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 19px;
        border: 3px solid ${borderColor};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      ">
        ${emoji}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });

const createMovingRiderIcon = (headingDeg = 0) =>
  L.divIcon({
    className: 'custom-moving-rider-icon',
    html: `
      <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.35);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          position: relative;
          background: linear-gradient(135deg, #10b981, #059669);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 3px solid #ffffff;
          box-shadow: 0 6px 14px rgba(16, 185, 129, 0.4);
          transform: rotate(${headingDeg}deg);
          transition: transform 0.3s ease-out;
        ">
          🛵
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });

const restaurantIcon = createBadgeIcon('🏪', '#ea580c');
const destinationIcon = createBadgeIcon('📍', '#6366f1');

// ── Haversine Distance in Kilometers ──────────────────────────────────────────
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// ── Generate Realistic Road-Like Waypoints between two coordinates ─────────────
function generateCurvedWaypoints(start, end, numPoints = 25) {
  const points = [];
  const startLat = start[0];
  const startLng = start[1];
  const endLat = end[0];
  const endLng = end[1];

  const midLat = (startLat + endLat) / 2 + (endLng - startLng) * 0.12;
  const midLng = (startLng + endLng) / 2 - (endLat - startLat) * 0.12;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const streetJitter = Math.sin(t * Math.PI * 4) * 0.0006;
    const lat = (1 - t) * (1 - t) * startLat + 2 * (1 - t) * t * midLat + t * t * endLat + streetJitter;
    const lng = (1 - t) * (1 - t) * startLng + 2 * (1 - t) * t * midLng + streetJitter;
    points.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
  }
  return points;
}

// ── Map View Controller Hook Component ─────────────────────────────────────────
function MapViewController({ center, initialBounds, shouldFollow }) {
  const map = useMap();
  const hasFitInitialBounds = useRef(false);

  useEffect(() => {
    if (initialBounds && initialBounds.length >= 2 && !hasFitInitialBounds.current) {
      try {
        map.fitBounds(initialBounds, { padding: [50, 50], maxZoom: 15 });
        hasFitInitialBounds.current = true;
      } catch (e) {}
    }
  }, [initialBounds, map]);

  useEffect(() => {
    if (center && shouldFollow) {
      try {
        map.panTo(center, { animate: true, duration: 0.8 });
      } catch (e) {}
    }
  }, [center, shouldFollow, map]);

  return null;
}

// ── Moving Delivery Map Inner Implementation ──────────────────────────────────
function MovingDeliveryMapInner({
  restaurantCoords = [11.6643, 78.1460],
  customerCoords = [11.6780, 78.1415],
  restaurantName = 'Restaurant',
  localityName = 'Tamil Nadu',
  deliveryAddress = 'Doorstep Address',
  orderStatus = 'out_for_delivery',
  riderName = 'Karthik S (FoodSwift Fleet)',
  riderVehicle = 'TN 30 BD 5521 (Hero Splendor)',
}) {
  const safeStart = useMemo(() => {
    const lat = Number(restaurantCoords[0]) || 11.6643;
    const lng = Number(restaurantCoords[1]) || 78.1460;
    return [lat, lng];
  }, [restaurantCoords]);

  const safeEnd = useMemo(() => {
    let lat = Number(customerCoords[0]) || 11.6780;
    let lng = Number(customerCoords[1]) || 78.1415;
    if (Math.abs(lat - safeStart[0]) < 0.001 && Math.abs(lng - safeStart[1]) < 0.001) {
      lat += 0.014;
      lng += 0.012;
    }
    return [lat, lng];
  }, [customerCoords, safeStart]);

  const waypoints = useMemo(() => {
    return generateCurvedWaypoints(safeStart, safeEnd, 30);
  }, [safeStart, safeEnd]);

  const totalDistanceKm = useMemo(() => {
    return calculateDistanceKm(safeStart[0], safeStart[1], safeEnd[0], safeEnd[1]) || 2.4;
  }, [safeStart, safeEnd]);

  const isDelivered = orderStatus === 'delivered';
  const isOutForDelivery = orderStatus === 'out_for_delivery';

  const initialProgress = isDelivered ? 1 : isOutForDelivery ? 0.25 : 0;
  const [progress, setProgress] = useState(initialProgress);
  const [liveSpeed, setLiveSpeed] = useState(32);
  const [followRider, setFollowRider] = useState(false);
  const [isDemoMoving, setIsDemoMoving] = useState(false);

  useEffect(() => {
    if (isDelivered) {
      setProgress(1);
    }
  }, [isDelivered]);

  useEffect(() => {
    if (isDelivered) return;

    const interval = setInterval(() => {
      const speed = Math.floor(26 + Math.random() * 12);
      setLiveSpeed(speed);

      if (isOutForDelivery || isDemoMoving) {
        setProgress((prev) => {
          const step = isDemoMoving ? 0.025 : 0.006;
          const next = prev + step;
          if (next >= 1) {
            setIsDemoMoving(false);
            return 1;
          }
          return Number(next.toFixed(4));
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOutForDelivery, isDemoMoving, isDelivered]);

  const currentWaypointIndex = Math.min(
    waypoints.length - 1,
    Math.floor(progress * (waypoints.length - 1))
  );

  const riderPos = waypoints[currentWaypointIndex] || safeStart;

  const headingDeg = useMemo(() => {
    if (currentWaypointIndex < waypoints.length - 1) {
      const p1 = waypoints[currentWaypointIndex];
      const p2 = waypoints[currentWaypointIndex + 1];
      const dLng = p2[1] - p1[1];
      const dLat = p2[0] - p1[0];
      return Math.floor((Math.atan2(dLng, dLat) * 180) / Math.PI);
    }
    return 0;
  }, [currentWaypointIndex, waypoints]);

  const riderIcon = useMemo(() => {
    return createMovingRiderIcon(headingDeg);
  }, [Math.round(headingDeg / 15)]);

  const traveledPath = useMemo(() => {
    return waypoints.slice(0, currentWaypointIndex + 1);
  }, [waypoints, currentWaypointIndex]);

  const remainingPath = useMemo(() => {
    return [riderPos, ...waypoints.slice(currentWaypointIndex + 1)];
  }, [waypoints, currentWaypointIndex, riderPos]);

  const remainingDistanceKm = Number((totalDistanceKm * (1 - progress)).toFixed(2));
  const remainingDistanceMeters = Math.round(remainingDistanceKm * 1000);
  const etaMinutes = Math.max(1, Math.ceil((remainingDistanceKm / (liveSpeed || 30)) * 60));

  const initialBounds = useMemo(() => {
    return [safeStart, safeEnd];
  }, [safeStart, safeEnd]);

  const handleToggleDemoRide = () => {
    if (progress >= 0.98) {
      setProgress(0.05);
    }
    setIsDemoMoving((prev) => !prev);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs space-y-3 p-4">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
            <Bike className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
              <span>Live Delivery Rider GPS Tracking</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded uppercase">
                Active 4G GPS
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Live moving route across {localityName}, Tamil Nadu
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-600 self-start sm:self-auto">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            <span>Kitchen</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Live Rider</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Doorstep</span>
          </span>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <div className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden relative border border-slate-200 shadow-inner">
        <MapContainer
          center={safeStart}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewController
            center={riderPos}
            initialBounds={initialBounds}
            shouldFollow={followRider}
          />

          {/* Restaurant Marker */}
          <Marker position={safeStart} icon={restaurantIcon}>
            <Popup>
              <div className="p-1 space-y-0.5 text-xs">
                <strong className="text-slate-900 block">{restaurantName}</strong>
                <span className="text-slate-500 block">{localityName}, Tamil Nadu</span>
                <span className="text-[10px] text-orange-600 font-bold">Kitchen Pickup Location</span>
              </div>
            </Popup>
          </Marker>

          {/* Customer Destination Marker */}
          <Marker position={safeEnd} icon={destinationIcon}>
            <Popup>
              <div className="p-1 space-y-0.5 text-xs">
                <strong className="text-slate-900 block">Delivery Destination</strong>
                <span className="text-slate-500 block">{deliveryAddress}</span>
                <span className="text-[10px] text-indigo-600 font-bold">Customer Doorstep</span>
              </div>
            </Popup>
          </Marker>

          {/* Live Moving Rider Marker */}
          <Marker position={riderPos} icon={riderIcon}>
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <div className="font-extrabold text-slate-900 flex items-center space-x-1">
                  <span>🛵 {riderName}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{riderVehicle}</div>
                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded-lg space-y-0.5">
                  <div>⚡ Speed: {liveSpeed} km/h</div>
                  <div>
                    📍 Distance Remaining:{' '}
                    {remainingDistanceMeters < 1000
                      ? `${remainingDistanceMeters} meters`
                      : `${remainingDistanceKm} km`}
                  </div>
                  <div>⏱️ Estimated Arrival: ~{etaMinutes} min(s)</div>
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Traveled Path (Solid Green Trail) */}
          {traveledPath.length >= 2 && (
            <Polyline
              positions={traveledPath}
              color="#10b981"
              weight={5}
              opacity={0.9}
            />
          )}

          {/* Remaining Path to Destination (Animated Dashed Orange Line) */}
          {remainingPath.length >= 2 && (
            <Polyline
              positions={remainingPath}
              color="#ea580c"
              weight={4}
              opacity={0.85}
              dashArray="8, 10"
            />
          )}
        </MapContainer>

        {/* Live HUD Overlay (Top-Left): Rider Status & Speed */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col space-y-1.5">
          <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-slate-200/80 pointer-events-auto flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-xs animate-pulse">
              🛵
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                <span>
                  {isDelivered
                    ? 'Delivered at Doorstep'
                    : progress > 0.85
                    ? 'Arriving on Your Street!'
                    : isOutForDelivery
                    ? 'Rider in Motion'
                    : 'Rider Assigned at Kitchen'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Speed: <strong>{isDelivered ? '0' : liveSpeed} km/h</strong> • {riderName.split(' ')[0]}
              </div>
            </div>
          </div>
        </div>

        {/* Live HUD Overlay (Top-Right): Distance & Live ETA */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-lg border border-slate-800 pointer-events-auto text-right">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
              Remaining Distance
            </span>
            <div className="text-sm font-black tracking-tight">
              {isDelivered
                ? '0 m (Delivered)'
                : remainingDistanceMeters < 1000
                ? `${remainingDistanceMeters} m`
                : `${remainingDistanceKm} km`}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold">
              {isDelivered ? 'Order Completed' : `ETA: ~${etaMinutes} mins`}
            </div>
          </div>
        </div>

        {/* Live HUD Overlay (Bottom-Right): Interactive Map Controls */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center space-x-2">
          {/* Center on Rider Button */}
          <button
            type="button"
            onClick={() => setFollowRider((prev) => !prev)}
            className={`p-2.5 rounded-xl shadow-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              followRider
                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                : 'bg-white/95 text-slate-800 hover:bg-slate-100 border border-slate-200'
            }`}
            title="Auto-center camera on moving delivery rider"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">{followRider ? 'Following' : 'Center Rider'}</span>
          </button>

          {/* Test Live Moving Rider Demo Button */}
          <button
            type="button"
            onClick={handleToggleDemoRide}
            className={`px-3 py-2 rounded-xl shadow-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              isDemoMoving
                ? 'bg-brand-600 text-white animate-pulse shadow-brand-500/30'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
            title="Accelerate rider movement to demonstrate real-time GPS tracking"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isDemoMoving ? 'Moving... 🚀' : '⚡ Simulate Live Ride'}</span>
          </button>
        </div>

        {/* Bottom-Left: Live Route Progress Bar */}
        <div className="absolute bottom-3 left-3 right-48 sm:right-64 z-20 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-200/80 pointer-events-auto space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
              <span className="truncate">Kitchen: {restaurantName.slice(0, 16)}</span>
              <span>{Math.round(progress * 100)}% Traveled</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Exported with ErrorBoundary protection ─────────────────────────────────────
export default function MovingDeliveryMap(props) {
  return (
    <MapErrorBoundary>
      <MovingDeliveryMapInner {...props} />
    </MapErrorBoundary>
  );
}
