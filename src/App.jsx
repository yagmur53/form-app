import { useState } from "react";
import Header from "./components/Header";
import EventForm from "./components/EventForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import ExcelRead from "./components/DynamicExcelRead";
import EventApp from "./components/EventApp";
import Login from "./components/Login"; // 🔑 Login bileşenini ekliyoruz
import "./components/styles/routes.css";
import "./components/styles/global.css";
import "./components/styles/utilities.css";
import "./components/styles/animations.css";
import "./components/styles/navigation.css";
import "./components/styles/buttons.css";
import "./components/styles/forms.css";
import "./components/styles/filters.css";
import "./components/styles/events.css";
import "./components/styles/responsive.css";
import "./components/styles/toast.css";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <Router>
      {/* 🔒 Header ve Menü sadece giriş yaptıysa gözüksün */}
      {isAuth && (
        <>
          <Header />
          <nav>
            <Link to="/">Form Veri Girişi</Link>
            <Link to="/excel-reader">Excel Veri Okuma</Link>
            <Link to="/admin">Silme</Link>
          </nav>
        </>
      )}

      <Routes>
        {/* Login sayfası */}
        <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />

        {/* Korunan sayfalar */}
        <Route
          path="/"
          element={isAuth ? <EventForm /> : <Navigate to="/login" />}
        />
        <Route
          path="/excel-reader"
          element={isAuth ? <ExcelRead /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/*"
          element={isAuth ? <EventApp /> : <Navigate to="/login" />}
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
