import EtkinlikListesi from "./EtkinlikListesi";
import Header from "./Header";
import EtkinlikGrafik from "./EtkinlikGrafik";
import EventsHeader from "./EventsHeader.jsx";

import { HashRouter as Router, Routes, Route } from "react-router-dom";

export default function EventApp() {
  return (
    <>
      <EventsHeader />
      <Routes>
        <Route path="/" element={<EtkinlikListesi />} />
        <Route path="/grafik" element={<EtkinlikGrafik />} />
      </Routes>
    </>
  );
}
