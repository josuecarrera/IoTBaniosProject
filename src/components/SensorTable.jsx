import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './SensorTable.css';

const SensorTable = ({ filterEsclavo }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function fetchSensors() {
      let query = supabase
        .from('sensores')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filterEsclavo) {
        query = query.eq('esclavo_id', filterEsclavo);
      }

      const { data: sensores, error } = await query;
      if (error) console.error('Error fetching sensores:', error);
      else setData(sensores);
      setLoading(false);
    }
    fetchSensors();

    // Suscripción real-time para este esclavo
    const channel = supabase
      .channel(`public:sensores:${filterEsclavo}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensores',
        filter: `esclavo_id=eq.${filterEsclavo}`
      }, payload => {
        setData(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterEsclavo]);

  if (loading) return <p className="loading">Cargando datos de {filterEsclavo}...</p>;

  return (
    <div className="table-container">
      <h2>Datos de {filterEsclavo}</h2>
      <table>
        <thead>
          <tr>
            <th>Esclavo</th>
            <th>Temperatura</th>
            <th>Humedad</th>
            <th>CO₂</th>
            <th>Mic</th>
            <th>UV</th>
            <th>GPS</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {data.map(sensor => (
            <tr key={sensor.id}>
              <td>{sensor.esclavo_id}</td>
              <td>{sensor.temperatura}°C</td>
              <td>{sensor.humedad}%</td>
              <td>{sensor.co2 ?? 'N/A'}</td>
              <td>{sensor.mic ?? 'N/A'}</td>
              <td>{sensor.uv ?? 'N/A'}</td>
              <td>
                {sensor.gps_lat && sensor.gps_lon
                  ? `Lat: ${sensor.gps_lat}, Lon: ${sensor.gps_lon}`
                  : sensor.gps_status}
              </td>
              <td>{new Date(sensor.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SensorTable;