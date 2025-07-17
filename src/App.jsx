import { useState } from "react";
import { Routes, Route, Navigate, Router } from "react-router-dom";
import WelcomePage from "./components/WelcomePage";
import NavBar from "./components/NavBar";
import SensorPage from "./pages/SensorPage";
import SensorCards from "./components/SensorCards";
import HomeSections from "./components/HomeSections";
import TablaDeDatos from "./components/TablaDeDatos";
import SensorCharts from "./components/SensorCharts";

function App() {
  const [started, setStarted] = useState(false);

  return (
    <Routes>
      <Route
        path="/"
        element={
          started ? (
            <Navigate to={"/inicio"} />
          ) : (
            <WelcomePage onStart={() => setStarted(true)} />
          )
        }
      />
      {/* <Route path="/inicio" element={<SensorCards />} /> */}
      <Route path="/sensores" element={<HomeSections />} />
      <Route path="/tabla" element={<TablaDeDatos />} />
      <Route path="/informacion" element={<SensorCharts />} />
    </Routes>
  );
}

export default App;
