import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import ChartComponent from "./ChartComponent";
import EtkinlikListesi from "./EtkinlikListesi";
import "./graphics.css";
import ScrollToTop from "./scrollToTop";

const options = [
  { value: "ulusal", label: "Ulusal / Uluslararası" },
  { value: "tur", label: "Faaliyet Türü" },
  { value: "kalkinmaAraci", label: "Sürdürülebilir Kalkınma Amacı" },
  { value: "tema", label: "Etkinlik Teması" },
  { value: "katilimci", label: "Yurt Dışından Katılımcı Sayısı" },

  { value: "katilimTur", label: "Katılım Türü" },
  {
    value: "kaliteKulturu",
    label: "Kalite Kültürünü Yaygınlaştırma Amacı Var mı",
  },
  { value: "duzenleyenBirim", label: "Düzenleyen Birim" },
  { value: "faaliyetYurutucusu", label: "Faaliyet Yürütücüsü" },
  { value: "kariyerMerkezi", label: "Kariyer Merkezi Faaliyeti mi" },

  { value: "bagimlilik", label: "Kariyer Bağımlılıkla Mücadele Faaliyeti mi" },
  { value: "dezavantajli", label: "Dezavantajlı Gruplara Yönelik Faaliyet mi" },
  { value: "sektorIsbirligi", label: "Sektör İş Birliği Var mı" },
  { value: "yarisma", label: "Etkinlik Yarışma İçeriyor mu" },
];

export default function EtkinlikGrafik() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [eventData, setEventData] = useState([]);
  const [chartType, setChartType] = useState("pie");
  const [selectedLegend, setSelectedLegend] = useState(null);
  const etkinlikListesiRef = useRef(null);
  const grafikRef = useRef(null);
  useEffect(() => {
    axios
      .get("https://backend-mg22.onrender.com/api/etkinlikler")
      .then((res) => setEventData(res.data))
      .catch((err) => console.error("Veri alınamadı:", err));
  }, []);

  const handleLegendClick = (kategori) => {
    const clicked = kategori?.name;
    setSelectedLegend((prev) => (prev === clicked ? null : clicked));
  };

  const handleClearFilter = () => {
    setSelectedLegend(null);
    window.scrollTo({
      top: etkinlikListesiRef.current.offsetTop - 100,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (selectedLegend && etkinlikListesiRef.current) {
      setTimeout(() => {
        etkinlikListesiRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [selectedLegend]);

  const getGroupedData = () => {
    if (!selectedCategory || !Array.isArray(eventData.etkinlikler)) return [];

    const grouped = {};
    eventData.etkinlikler.forEach((item) => {
      const field = item[selectedCategory.value];
      if (Array.isArray(field)) {
        field.forEach((val) => {
          if (val) grouped[val] = (grouped[val] || 0) + 1;
        });
      } else if (field) {
        grouped[field] = (grouped[field] || 0) + 1;
      }
    });

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))
      .slice(0, 10);
  };

  const groupedData = getGroupedData();

  return (
    <>
      <div className="chart-container-modern" ref={grafikRef}>
        <h2 className="chart-title">Etkinlik Veri Görselleştirmesi</h2>
        <div className="chart-controls">
          <Select
            options={options}
            onChange={(option) => {
              setSelectedCategory(option);
              setSelectedLegend(null);
            }}
            value={selectedCategory}
            placeholder="Görselleştirmek için bir kategori seçin..."
            isClearable
            className="category-select"
            classNamePrefix="select"
          />

          <div className="chart-toggle-buttons">
            <button
              className={`toggle-btn ${chartType === "pie" ? "active" : ""}`}
              onClick={() => setChartType("pie")}
            >
              Dairesel Grafik
            </button>
            <button
              className={`toggle-btn ${chartType === "bar" ? "active" : ""}`}
              onClick={() => setChartType("bar")}
            >
              Sütün Grafik
            </button>
          </div>
        </div>

        <div className="chart-wrapper">
          {!selectedCategory ? (
            <div className="placeholder-message">
              <h3>Başlamak için lütfen bir kategori seçin.</h3>
              <p>Seçim yaptıktan sonra verileriniz burada görünecektir.</p>
            </div>
          ) : (
            <ChartComponent
              chartType={chartType}
              data={groupedData}
              handleLegendClick={handleLegendClick}
              selectedLegend={selectedLegend}
            />
          )}
        </div>
      </div>

      {selectedLegend && (
        <div
          ref={etkinlikListesiRef}
          className="etkinlik-listesi-wrapper highlight-on-load"
          key={selectedLegend}
        >
          <EtkinlikListesi
            eventData={eventData}
            selectedCategory={selectedCategory?.value}
            selectedLegend={selectedLegend}
            onClearFilter={handleClearFilter}
          />
        </div>
      )}
      <ScrollToTop scrollTargetRef={grafikRef} />
    </>
  );
}
