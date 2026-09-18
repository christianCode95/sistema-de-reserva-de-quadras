import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import ReservaList from "./components/ReservaList";
import ReservaForm from "./components/ReservaForm";
import "./App.css";

function App() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservas = async () => {
    setLoading(true);

    try {
      const response = await fetch('/reservas');

      if (!response.ok) {
        throw new Error("Não foi possível carregar as reservas.");
      }

      const data = await response.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return (
    <Router>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">⚽</span>
            <div>
              <span className="eyebrow">Quadra Club</span>
              <h1>Reservas de quadras</h1>
            </div>
          </div>

          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Agenda
            </NavLink>
            <NavLink to="/nova-reserva" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Nova reserva
            </NavLink>
          </nav>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<ReservaList reservas={reservas} loading={loading} onRefresh={fetchReservas} />} />
            <Route path="/nova-reserva" element={<ReservaForm onSuccess={fetchReservas} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;