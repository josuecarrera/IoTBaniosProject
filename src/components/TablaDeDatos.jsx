import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { saveAs } from "file-saver";
import "./TablaDeDatos.css";

function getDayRange(date) {
  const d = new Date(date);
  // Crear fecha de inicio del día en zona local
  const inicio = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    0,
    0,
    0,
    0
  );
  // Crear fecha de fin del día en zona local
  const fin = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    23,
    59,
    59,
    999
  );
  return [inicio, fin];
}

function getColumnasParaSensor(sensorId) {
  const columnasBase = [
    { key: "timestamp", label: "Fecha / Hora" },
    { key: "temp", label: "Temperatura (°C)" },
    { key: "hum", label: "Humedad (%)" },
  ];

  // Para SL1 y SL2: quitar latitud y longitud
  if (sensorId === "SL1" || sensorId === "SL2") {
    return [
      ...columnasBase,
      { key: "co2", label: "CO2 (ppm)" },
      { key: "mic", label: "Ruido (dB)" },
      { key: "uv", label: "UV" },
    ];
  }

  // Para SL3 y SL4: quitar UV, CO2, y ruido
  if (sensorId === "SL3" || sensorId === "SL4") {
    return [
      ...columnasBase,
      { key: "lat", label: "Latitud" },
      { key: "lng", label: "Longitud" },
    ];
  }

  // Para otros sensores, mostrar todas las columnas
  return [
    ...columnasBase,
    { key: "co2", label: "CO2 (ppm)" },
    { key: "mic", label: "Ruido (dB)" },
    { key: "uv", label: "UV" },
    { key: "lat", label: "Latitud" },
    { key: "lng", label: "Longitud" },
  ];
}

export default function TablaDeDatos() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sensorId, setSensorId] = useState("");
  const [dispositivos, setDispositivos] = useState([]);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columnas, setColumnas] = useState([]);

  // Cargar sensores únicos
  useEffect(() => {
    async function cargarSensores() {
      const { data, error } = await supabase.rpc("get_unique_sensor_ids");

      if (error) {
        console.error("Error cargando sensores:", error);
      } else {
        if (data) {
          // El resultado de la función ya es una lista de objetos, solo necesitamos extraer el valor.
          const sensoresUnicos = data.map((d) => d.sensor_id);
          setDispositivos(sensoresUnicos);
        }
      }
    }

    cargarSensores();
  }, []);

  // Actualizar columnas cuando cambia el sensor
  useEffect(() => {
    if (sensorId) {
      setColumnas(getColumnasParaSensor(sensorId));
    }
  }, [sensorId]);

  useEffect(() => {
    if (sensorId) cargarDatos();
    // eslint-disable-next-line
  }, [sensorId, selectedDate]);

  async function cargarDatos() {
    setLoading(true);
    const [inicio, fin] = getDayRange(selectedDate);

    const { data, error } = await supabase
      .from("publicdatos_sensores")
      .select("*")
      .eq("sensor_id", sensorId)
      .gte("timestamp", inicio.toISOString())
      .lte("timestamp", fin.toISOString())
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Error al cargar datos:", error);
      setDatos([]);
    } else {
      setDatos(data || []);
    }

    setLoading(false);
  }

  function handleDateChange(e) {
    setSelectedDate(new Date(e.target.value + "T00:00:00"));
  }

  function handleSensorChange(e) {
    setSensorId(e.target.value);
  }

  function exportarCSV() {
    if (!datos.length) return;

    const header = columnas.map((col) => col.label).join(",");
    const filas = datos.map((fila) =>
      columnas
        .map((col) => {
          let valor = fila[col.key];
          if (col.key === "timestamp" && valor) {
            valor = new Date(valor).toLocaleString();
          }
          if (typeof valor === "string" && valor.includes('"')) {
            valor = valor.replace(/"/g, '""');
          }
          return `"${valor !== null && valor !== undefined ? valor : ""}"`;
        })
        .join(",")
    );
    const csv = [header, ...filas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const fechaFormateada = selectedDate.toISOString().slice(0, 10);
    saveAs(blob, `datos_${sensorId}_${fechaFormateada}.csv`);
  }

  return (
    <div className="tabla-datos-container">
      <h3>Datos por sensor</h3>

      <div className="tabla-datos-controls">
        <label>
          Esclavo:
          <select
            value={sensorId}
            onChange={handleSensorChange}
            className="tabla-datos-date"
          >
            <option value="">Selecciona un sensor</option>
            {dispositivos.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fecha:
          <input
            type="date"
            value={selectedDate.toISOString().slice(0, 10)}
            onChange={handleDateChange}
            className="tabla-datos-date"
          />
        </label>

        <button onClick={exportarCSV} className="tabla-datos-btn">
          Descargar Excel
        </button>
      </div>

      {loading ? (
        <p>Cargando datos...</p>
      ) : datos.length === 0 ? (
        <p>No hay datos para esta fecha.</p>
      ) : (
        <table className="tabla-datos-table">
          <thead>
            <tr>
              {columnas.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((fila) => (
              <tr key={fila.id}>
                {columnas.map((col) => {
                  let valor = fila[col.key];
                  if (col.key === "timestamp" && valor) {
                    valor = new Date(valor).toLocaleString();
                  }
                  if (valor === null || valor === undefined) valor = "-";
                  if (
                    (col.key === "lat" || col.key === "lng") &&
                    valor !== "-"
                  ) {
                    valor = Number(valor).toFixed(6);
                  }
                  return <td key={col.key}>{valor}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
