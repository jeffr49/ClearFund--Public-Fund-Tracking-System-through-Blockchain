"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function statusColor(status) {
  if (status === "ongoing") return "var(--status-ongoing)";
  if (status === "bidding") return "var(--status-bidding)";
  if (status === "completed") return "var(--status-completed)";
  return "var(--status-notstarted)";
}

function pinIcon(color) {
  const html = `
    <div class="gps-pin-container">
      <div class="gps-pin" style="background-color:${color}"></div>
      <div class="gps-pin-dot"></div>
    </div>`;
  return L.divIcon({
    className: "custom-gps-pin",
    html,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -40]
  });
}

export default function ProjectsMap({ projects }) {
  const markers = (projects || []).filter(
    (p) =>
      p.location_lat != null &&
      p.location_lng != null &&
      !Number.isNaN(Number(p.location_lat)) &&
      !Number.isNaN(Number(p.location_lng))
  );

  const center =
    markers.length > 0
      ? [Number(markers[0].location_lat), Number(markers[0].location_lng)]
      : [20.5937, 78.9629];

  return (
    <MapContainer
      center={center}
      zoom={markers.length ? 5 : 5}
      className="map-container"
      style={{ height: 420, width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      {markers.map((p) => (
        <Marker
          key={p.id}
          position={[Number(p.location_lat), Number(p.location_lng)]}
          icon={pinIcon(statusColor(p.display_status))}
        >
          <Popup>
            <strong>{p.title}</strong>
            <br />
            {p.location_address || "—"}
            <br />
            <span style={{ fontSize: "0.65rem", fontWeight: 800 }}>
              {String(p.display_status).toUpperCase()}
            </span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
