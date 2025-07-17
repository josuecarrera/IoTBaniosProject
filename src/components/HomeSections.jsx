import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ciudad from "../assets/Spectacularview.jpg";
import sl1Img from "../assets/iglesia.jpeg";
import sl2Img from "../assets/parque-central.jpg";
import sl3Img from "../assets/senderoCruz.jpg";
import sl4Img from "../assets/senderoVirgen.jpg";
import "./HomeSections.css";

// Configuración del ícono del marcador
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const images = {
  SL1: sl1Img,
  SL2: sl2Img,
  SL3: sl3Img,
  SL4: sl4Img,
};

const titles = {
  SL1: "Iglesia",
  SL2: "Parque Central",
  SL3: "Mirador Cruz",
  SL4: "Mirador Virgen",
};

function SetMapCenter({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center[0] && center[1]) {
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
}

export default function HomeSections() {
  const slaves = useMemo(() => ["SL1", "SL2", "SL3", "SL4"], []);
  const [latest, setLatest] = useState({});

  useEffect(() => {
    async function fetchLatest() {
      const results = await Promise.all(
        slaves.map(async (id) => {
          if (id === "SL3" || id === "SL4") {
            const { data, error } = await supabase
              .from("publicdatos_sensores")
              .select("*")
              .eq("sensor_id", id)
              .order("timestamp", { ascending: false })
              .limit(20);
            return { id, record: error ? [] : data };
          } else {
            const { data, error } = await supabase
              .from("publicdatos_sensores")
              .select("*")
              .eq("sensor_id", id)
              .order("timestamp", { ascending: false })
              .limit(1)
              .single();
            return { id, record: error ? null : data };
          }
        })
      );
      setLatest(Object.fromEntries(results.map((r) => [r.id, r.record])));
    }

    fetchLatest();

    const channel = supabase
      .channel("realtime-sensores")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "publicdatos_sensores",
        },
        (payload) => {
          const newRec = payload.new;
          setLatest((prev) => {
            if (newRec.sensor_id === "SL3" || newRec.sensor_id === "SL4") {
              const prevData = prev[newRec.sensor_id] || [];
              const updatedData = [newRec, ...prevData].slice(0, 20);
              return { ...prev, [newRec.sensor_id]: updatedData };
            } else {
              return { ...prev, [newRec.sensor_id]: newRec };
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slaves]);

  return (
    <div className="main-container">
      <section className="hero-section">
        <div className="hero-image-container">
          <img src={ciudad} alt="Ciudad" className="hero-image" />
          <div className="hero-text">
            <h1>Monitoreo Ambiental Urbano</h1>
            <p>
              Temperatura, Humedad, rayos UV, Nivel de CO2, Nivel ruido en
              tiempo real y ubicaciones
            </p>
          </div>
        </div>
      </section>

      <div className="cards-container">
        {slaves.map((id) => {
          const data = latest[id];
          const image = images[id];
          const title = titles[id];

          const getNoiseLevel = (mic) => {
            if (mic <= 65) return "Bajo";
            if (mic <= 75) return "Moderado";
            if (mic <= 95) return "Alto";
            return "Peligroso";
          };

          const getUVLevel = (uv) => {
            if (uv <= 2) return "Bajo";
            if (uv <= 5) return "Moderado";
            if (uv <= 7) return "Alto";
            if (uv <= 10) return "Muy alto";
            return "Extremo";
          };

          if (id === "SL1" || id === "SL2") {
            return (
              <div key={id} className="sensor-card">
                <div className="sensor-image-container">
                  <img src={image} alt={title} className="sensor-image" />
                  <div className="sensor-overlay">
                    <h2>{title}</h2>
                    {data ? (
                      <div>
                        {/* <h3>{title}</h3> */}
                        <p>
                          <strong>Temp:</strong> {data.temp}°C
                        </p>
                        <p>
                          <strong>Humedad:</strong> {data.hum}%
                        </p>
                        <p>
                          <strong>Nivel de Ruido:</strong> {data.mic} dB (
                          {getNoiseLevel(data.mic)})
                        </p>
                        <p>
                          <strong>UV:</strong> {data.uv} ({getUVLevel(data.uv)})
                        </p>
                        <p>
                          <small>
                            {new Date(data.timestamp).toLocaleString()}
                          </small>
                        </p>
                      </div>
                    ) : (
                      <p>Cargando datos...</p>
                    )}
                  </div>
                </div>
              </div>
            );
          } else if (id === "SL3" || id === "SL4") {
            const points = Array.isArray(data) ? data : [];
            const latest = points.length > 0 ? points[points.length - 1] : null;
            const center =
              points.length > 0 && points[0].lat && points[0].lng
                ? [points[0].lat, points[0].lng]
                : [-0.25, -79.17]; // Coordenadas predeterminadas

            return (
              <div key={id} className="sensor-card">
                <div className="sensor-image-container">
                  <img src={image} alt={title} className="sensor-image" />
                  <div className="sensor-overlay">
                    <h2>{title}</h2>
                    {latest ? (
                      <div>
                        {/* <h3>{title}</h3> */}
                        <p>
                          <strong>Temp:</strong> {latest.temp}°C
                        </p>
                        <p>
                          <strong>Humedad:</strong> {latest.hum}%
                        </p>
                        <p>
                          <small>
                            {new Date(latest.timestamp).toLocaleString()}
                          </small>
                        </p>
                      </div>
                    ) : (
                      <p>Cargando datos...</p>
                    )}
                  </div>
                </div>
                <div className="map-container">
                  <MapContainer
                    center={center}
                    zoom={16}
                    scrollWheelZoom={false}
                    style={{ height: "300px", width: "100%" }}
                  >
                    <SetMapCenter center={center} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {points
                      .filter(
                        (point) =>
                          point &&
                          typeof point.lat === "number" &&
                          typeof point.lng === "number"
                      )
                      .map((point, idx) => (
                        <Marker
                          key={idx}
                          position={[point.lat, point.lng]}
                          icon={markerIcon}
                          eventHandlers={{
                            click: () => {
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`,
                                "_blank"
                              );
                            },
                          }}
                        >
                          <Popup>
                            {title}
                            <br />
                            Temp: {point.temp}°C
                            <br />
                            Hum: {point.hum}%
                            <br />
                            {new Date(point.timestamp).toLocaleString()}
                            <br />
                            <em>Ruta</em>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
