import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { NavLink } from "react-router-dom";
export default function EventsHeader(props) {
  return (
    <header id="main-header">
      <div className="header-routes">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Etkinlikler
        </NavLink>
        <NavLink
          to="/admin/grafik"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Grafik
        </NavLink>
      </div>
    </header>
  );
}
