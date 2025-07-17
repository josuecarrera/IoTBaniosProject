import React from 'react';
import SensorTable from '../components/SensorTable';
import { useParams } from 'react-router-dom';

const SensorPage = () => {
  const { id } = useParams();
  const esclavoId = id.toUpperCase();
  return <SensorTable filterEsclavo={esclavoId} />;
};

export default SensorPage;