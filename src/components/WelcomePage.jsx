import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";

const WelcomePage = () => {
  const navigate = useNavigate();

  const BotonSensores = () => {
    navigate("Sensores");
  };
  const BotonTabla = () => {
    navigate("Tabla");
  };
  const BotonInfor = () => {
    navigate("Informacion");
  };
  return (
    <div className="welcome">
      <div className="overlay">
        <h1>Baños de Agua Santa</h1>
        <p>La Aventura Espera</p>
        <div className="bonotes-container">
          <button onClick={BotonSensores}>Sensores</button>
          <button onClick={BotonInfor}>Administracion</button>
          <button onClick={BotonTabla}>Tabla BD</button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
