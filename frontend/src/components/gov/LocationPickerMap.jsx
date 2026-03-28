"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./CreateProjectForm.module.css";

const INDIA_CENTER = [20.5937, 78.9629];
const SEARCH_DEBOUNCE_MS = 400;

const selectedPinIcon = L.divIcon({
  className: styles.mapPinIcon,
  html: '<div class="map-pin-shell"><div class="map-pin-core"></div></div>',
  iconSize: [26, 38],
  iconAnchor: [13, 38]
});

function SelectionEvents({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng
      });
    }
  });

  return null;
}

function RecenterMap({ point }) {
  const map = useMap();

  useEffect(() => {
    if (point) {
      map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 15), {
        duration: 0.8
      });
    }
  }, [map, point]);

  return null;
}

export default function LocationPickerMap({ disabled, onConfirm, onClear }) {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [pendingPlace, setPendingPlace] = useState(null);
  const [loadingPlaceDetails, setLoadingPlaceDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const searchAbortRef = useRef(null);
  const detailsAbortRef = useRef(null);

  const markerPosition = useMemo(() => {
    if (!selectedPoint) return null;
    return [selectedPoint.lat, selectedPoint.lng];
  }, [selectedPoint]);

  useEffect(() => {
    const query = searchText.trim();

    if (query.length < 3) {
      setSearchResults([]);
      setSearching(false);
      setSearchError("");
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
        searchAbortRef.current = null;
      }
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }

      const controller = new AbortController();
      searchAbortRef.current = controller;
      setSearching(true);
      setSearchError("");

      try {
        const params = new URLSearchParams({
          q: query,
          format: "jsonv2",
          addressdetails: "1",
          limit: "5"
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Search failed (${response.status})`);
        }

        const data = await response.json();
        setSearchResults(
          Array.isArray(data)
            ? data.map((item) => ({
                label: item.display_name,
                lat: Number(item.lat),
                lng: Number(item.lon)
              }))
            : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setSearchResults([]);
          setSearchError("Could not search OpenStreetMap right now. You can still click directly on the map.");
        }
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    return () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      if (detailsAbortRef.current) {
        detailsAbortRef.current.abort();
      }
    };
  }, []);

  async function loadPlaceDetails({ lat, lng, label }) {
    if (detailsAbortRef.current) {
      detailsAbortRef.current.abort();
    }

    const controller = new AbortController();
    detailsAbortRef.current = controller;
    setSelectedPoint({ lat, lng });
    setPendingPlace(null);
    setLoadingPlaceDetails(true);
    setDetailsError("");

    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: "jsonv2",
        zoom: "18",
        addressdetails: "1"
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed (${response.status})`);
      }

      const data = await response.json();
      const resolvedLabel =
        data.display_name ||
        label ||
        `Pinned location (${lat.toFixed(6)}, ${lng.toFixed(6)})`;

      setPendingPlace({
        address: resolvedLabel,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6))
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        const fallbackLabel = label || `Pinned location (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
        setPendingPlace({
          address: fallbackLabel,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6))
        });
        setDetailsError("We pinned the coordinates, but the full address could not be fetched from OpenStreetMap.");
      }
    } finally {
      setLoadingPlaceDetails(false);
    }
  }

  function handleConfirm() {
    if (!pendingPlace) return;
    onConfirm(pendingPlace);
  }

  function handleResetSelection() {
    setPendingPlace(null);
    setSelectedPoint(null);
    setDetailsError("");
    setSearchText("");
    onClear?.();
  }

  return (
    <div className={styles.mapPickerWrap}>
      <div className={styles.mapPickerHeader}>
        <p className={styles.hint}>
          Search a place in OpenStreetMap or click directly on the map. Zoom and pan as needed, then confirm the red pin to fill the fields below.
        </p>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="cf-location-search">
          Find place on map
        </label>
        <input
          id="cf-location-search"
          className={styles.input}
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search landmark, area, or address"
          disabled={disabled}
        />
        {searching ? <span className={styles.hint}>Searching OpenStreetMap…</span> : null}
        {searchError ? <span className={styles.fieldError}>{searchError}</span> : null}
        {searchResults.length ? (
          <div className={styles.searchResults}>
            {searchResults.map((result) => (
              <button
                key={`${result.lat}-${result.lng}-${result.label}`}
                type="button"
                className={styles.searchResultButton}
                onClick={() => loadPlaceDetails(result)}
                disabled={disabled}
              >
                {result.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.mapViewport}>
        <MapContainer
          center={INDIA_CENTER}
          zoom={5}
          minZoom={3}
          scrollWheelZoom
          className={styles.mapCanvas}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <SelectionEvents onSelect={loadPlaceDetails} />
          <RecenterMap point={selectedPoint} />
          {markerPosition ? <Marker position={markerPosition} icon={selectedPinIcon} /> : null}
        </MapContainer>
      </div>

      {loadingPlaceDetails ? <p className={styles.hint}>Fetching selected place details…</p> : null}
      {detailsError ? <span className={styles.fieldError}>{detailsError}</span> : null}

      {pendingPlace ? (
        <div className={styles.mapConfirmCard}>
          <div className={styles.mapConfirmTitle}>Confirm selected place</div>
          <p className={styles.mapConfirmText}>
            Address / area label: <strong>{pendingPlace.address}</strong>
          </p>
          <p className={styles.mapConfirmText}>
            Latitude: <strong>{pendingPlace.lat}</strong>
          </p>
          <p className={styles.mapConfirmText}>
            Longitude: <strong>{pendingPlace.lng}</strong>
          </p>
          <p className={styles.mapConfirmPrompt} style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Is this correct, and can we proceed to fill the location fields automatically?
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.submit}
              onClick={handleConfirm}
              disabled={disabled}
            >
              Confirm & Proceed
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={handleResetSelection}
              disabled={disabled}
            >
              Clear Selection
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
