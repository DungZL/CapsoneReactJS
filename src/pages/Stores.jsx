import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { http } from '../services/config';
import { resolveImage, handleImageError } from '../utils/productImages';

const DEFAULT_CENTER = [10.7769, 106.7009]; // TP.HCM

// The API has records with invalid coordinates (e.g. 120.56, 1235.46) -> skip them
const toLatLng = (store) => {
  const lat = parseFloat(store.latitude);
  const lng = parseFloat(store.longtitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return [lat, lng];
};

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16, { duration: 0.8 });
  }, [position, map]);
  return null;
}

// Hidden feature: show store locations on the map (GET /api/Product/getAllStore)
export default function Stores() {
  const [stores, setStores] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    http
      .get('/Product/getAllStore')
      .then((res) => setStores(res.data.content || []))
      .catch(() => setError('Could not load the store list.'))
      .finally(() => setLoading(false));
  }, []);

  const validStores = useMemo(
    () =>
      stores
        .map((s) => ({ ...s, position: toLatLng(s) }))
        .filter((s) => s.position && !s.deleted),
    [stores]
  );

  const filtered = validStores.filter((s) =>
    `${s.name} ${s.description}`.toLowerCase().includes(keyword.trim().toLowerCase())
  );

  const selected = validStores.find((s) => s.id === selectedId);

  return (
    <div className="stores-page">
      <div className="section-heading-banner">
        <h2>Our stores</h2>
      </div>

      <div className="container stores-layout">
        <aside className="stores-sidebar">
          <input
            type="text"
            className="stores-search"
            placeholder="Search stores, addresses..."
            aria-label="Search stores"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          {loading && <p className="loading-state">Loading stores...</p>}
          {error && <p className="empty-text">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="empty-text">No stores found.</p>
          )}
          <ul className="stores-list">
            {filtered.map((store) => (
              <li key={store.id}>
                <button
                  type="button"
                  className={`store-item ${store.id === selectedId ? 'active' : ''}`}
                  onClick={() => setSelectedId(store.id)}
                >
                  <img
                    src={resolveImage(store, store.id)}
                    alt={store.name || 'Store'}
                    onError={handleImageError}
                  />
                  <span>
                    <strong>{store.name}</strong>
                    <small>
                      <i className="fa-solid fa-location-dot"></i> {store.description}
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="stores-map">
          <MapContainer center={DEFAULT_CENTER} zoom={13} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map((store) => (
              <CircleMarker
                key={store.id}
                center={store.position}
                radius={store.id === selectedId ? 12 : 9}
                pathOptions={{
                  color: '#6200ee',
                  fillColor: store.id === selectedId ? '#f5a623' : '#9b51e0',
                  fillOpacity: 0.85,
                }}
                eventHandlers={{ click: () => setSelectedId(store.id) }}
              >
                <Popup>
                  <strong>{store.name}</strong>
                  <br />
                  {store.description}
                </Popup>
              </CircleMarker>
            ))}
            <FlyTo position={selected?.position} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
