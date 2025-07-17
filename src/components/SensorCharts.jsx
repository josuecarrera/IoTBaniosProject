// src/components/SensorCharts.jsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../lib/supabaseClient";
import "./SensorCharts.css"; // Importa el CSS

const campos = [
  { key: "temp", label: "Temperatura (°C)" },
  { key: "hum", label: "Humedad (%)" },
  { key: "co2", label: "CO2 (ppm)" },
  { key: "mic", label: "Ruido (dB)" },
  { key: "uv", label: "UV" },
];

// Colores para cada sensor
const sensorColors = {
  SL1: "#00bcd4",
  SL2: "#ff9800",
};

const formatEcuadorTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("es-EC", {
    timeZone: "America/Guayaquil",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Custom Tooltip para mostrar valores exactos
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div>
          <b>Hora:</b> {formatEcuadorTime(label)}
        </div>
        {payload.map((entry, idx) => (
          <div key={idx} style={{ color: entry.color }}>
            <b>{entry.name}:</b> {entry.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SensorCharts = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSensorData = async () => {
      const { data, error } = await supabase
        .from("publicdatos_sensores")
        .select("timestamp, sensor_id, temp, hum, co2, mic, uv")
        .order("timestamp", { ascending: true })
        .limit(200); // Ajusta según tus necesidades

      if (!error && data) setData(data);
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Agrupa por timestamp para que ambos sensores estén en la misma entrada
  const mergedData = [];
  const grouped = {};

  data.forEach((item) => {
    const key = item.timestamp;
    if (!grouped[key]) grouped[key] = { timestamp: key };
    Object.keys(item).forEach((field) => {
      if (field !== "timestamp" && field !== "sensor_id" && field !== "id") {
        grouped[key][`${field}_${item.sensor_id}`] = item[field];
      }
    });
  });

  Object.values(grouped).forEach((obj) => mergedData.push(obj));

  return (
    <div>
      <h2 style={{ color: "#222" }}>Sensores: SL1 y SL2</h2>
      <div className="sensor-charts-container">
        {campos.map(({ key, label }) => (
          <div className="sensor-chart-card" key={key}>
            <h4>{label}</h4>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={mergedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#ccc"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(tick) => formatEcuadorTime(tick)}
                />
                <YAxis stroke="#ccc" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={`${key}_SL1`}
                  name="SL1"
                  stroke={sensorColors.SL1}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey={`${key}_SL2`}
                  name="SL2"
                  stroke={sensorColors.SL2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorCharts;
