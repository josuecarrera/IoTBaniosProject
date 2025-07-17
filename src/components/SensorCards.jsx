import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./SensorCards.css";
import markerIconUrl from "../assets/react.svg";
import { WiDaySunny, WiCloudy, WiRain } from "react-icons/wi";

const markerIcon = new L.Icon({
  iconUrl: markerIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function getWeatherIcon(temp, isRaining) {
  if (isRaining) return <WiRain size={48} color="#4A90E2" />;
  if (temp <= 18) return <WiCloudy size={48} color="#B3D4FC" />;
  if (temp > 18 && temp < 28) return <WiDaySunny size={48} color="#FFD93B" />;
  if (temp >= 28) return <WiDaySunny size={48} color="#FFA500" />;
  return <WiCloudy size={48} color="#B3D4FC" />;
}

export default function SensorCard({ data, image, title, id }) {
  // SL1 y SL2: Card tipo Skyscanner con dato único
  if (id === "SL1" || id === "SL2") {
    return (
      <div className="skyscanner-card">
        <div
          className="skyscanner-image-container"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="skyscanner-overlay">
            <div className="skyscanner-title">{title}</div>
            <div className="skyscanner-info">
              <div className="skyscanner-icon">
                {getWeatherIcon(data?.temp, data?.rain)}
              </div>
              <div>
                <div className="skyscanner-label">Temperatura</div>
                <div className="skyscanner-value">
                  {data?.temp !== undefined ? `${data.temp}°C` : "-"}
                </div>
                <div className="skyscanner-label">Humedad</div>
                <div className="skyscanner-value">
                  {data?.hum !== undefined ? `${data.hum}%` : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SL3 y SL4: Card con mapa y array de puntos
  if ((id === "SL3" || id === "SL4") && Array.isArray(data) && data.length > 0) {
    const center = [data[0].lat, data[0].lng];
    return (
      <div className="skyscanner-card">
        <div
          className="skyscanner-image-container"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="skyscanner-overlay">
            <div className="skyscanner-title">{title}</div>
            <div className="skyscanner-info">
              <div className="skyscanner-icon">
                {getWeatherIcon(data[0]?.temp, data[0]?.rain)}
              </div>
              <div>
                <div className="skyscanner-label">Temperatura</div>
                <div className="skyscanner-value">
                  {data[0]?.temp !== undefined ? `${data[0].temp}°C` : "-"}
                </div>
                <div className="skyscanner-label">Humedad</div>
                <div className="skyscanner-value">
                  {data[0]?.hum !== undefined ? `${data[0].hum}%` : "-"}
                </div>
              </div>
            </div>
            <div className="map-container">
              <MapContainer
                center={center}
                zoom={16}
                scrollWheelZoom={false}
                style={{
                  height: "120px",
                  width: "100%",
                  borderRadius: "12px",
                  marginTop: "12px",
                }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {data.map((point, idx) => (
                  <Marker
                    key={idx}
                    position={[point.lat, point.lng]}
                    icon={markerIcon}
                  >
                    <Popup>
                      {title}
                      <br />
                      Temp: {point.temp}°C
                      <br />
                      Hum: {point.hum}%
                      <br />
                      {new Date(point.timestamp).toLocaleString()}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SL3 y SL4 sin datos
  if (id === "SL3" || id === "SL4") {
    return (
      <div className="skyscanner-card">
        <div
          className="skyscanner-image-container"
          style={{ backgroundImage: `url(${image})` }}
        >
          <div className="skyscanner-overlay">
            <div className="skyscanner-title">{title}</div>
            <div className="skyscanner-info">
              <div className="skyscanner-icon">{getWeatherIcon(undefined, false)}</div>
              <div>
                <div className="skyscanner-label">Temperatura</div>
                <div className="skyscanner-value">-</div>
                <div className="skyscanner-label">Humedad</div>
                <div className="skyscanner-value">-</div>
              </div>
            </div>
            <div className="map-container">
              <p style={{ color: "#fff", textAlign: "center" }}>No hay datos para mostrar</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
