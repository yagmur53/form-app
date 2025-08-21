import EtkinlikListesi from "./EtkinlikListesi";
import EtkinlikGrafik from "./EtkinlikGrafik";
import EventsHeader from "./EventsHeader.jsx";
import { Routes, Route } from "react-router-dom";

export default function EventApp() {
  return (
    <>
      <EventsHeader />
      <Routes>
        {/* admin/events-app → Etkinlik listesi */}
        <Route path="/" element={<EtkinlikListesi />} />
        {/* admin/events-app/grafik → Etkinlik grafik */}
        <Route path="/grafik" element={<EtkinlikGrafik />} />
      </Routes>
    </>
  );
}
