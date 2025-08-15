import Header from "./components/Header";
import EventForm from "./components/EventForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ExcelRead from "./components/DynamicExcelRead";
import "../src/components/routes.css";

function App() {
  return (
    <Router>
      <Header />
      <nav>
        <Link to="/">Form Girişi</Link>
        <Link to="/excel-reader">Excel Okuma</Link>
      </nav>

      <Routes>
        <Route path="/" element={<EventForm />} />
        <Route path="/excel-reader" element={<ExcelRead />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
