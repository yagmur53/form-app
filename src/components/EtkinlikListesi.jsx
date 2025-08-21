import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import "./events.css";
import Product from "./Product.jsx";
import { FaSearch } from "react-icons/fa";
import Modal from "./Modal.jsx";
import DateFilter from "./DateFilter.jsx";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "./product-select.css";
import ScrollToTop from "./scrollToTop.jsx";

export default function EtkinlikListesi({ selectedCategory, selectedLegend }) {
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [customFieldMapping, setCustomFieldMapping] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModalUrl, setActiveModalUrl] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = (etkinlikId, event) => {
    event.stopPropagation(); // Modal açılmasını engeller

    if (window.confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) {
      // Backend'e silme isteği gönder
      axios
        .delete(
          `https://backend-mg22.onrender.com/api/etkinlikler/${etkinlikId}`
        )
        .then((response) => {
          // Başarılı silme sonrası state'i güncelle
          setEtkinlikler((prevEtkinlikler) =>
            prevEtkinlikler.filter((etkinlik) => etkinlik.id !== etkinlikId)
          );
          console.log("Etkinlik başarıyla silindi:", response.data);
        })
        .catch((error) => {
          console.error("Silme işlemi başarısız:", error);
          alert("Silme işlemi başarısız oldu. Lütfen tekrar deneyin.");
        });
    }
  };
  // Görünürlük kontrolü için state
  const [visibleFields, setVisibleFields] = useState([
    "ad",
    "tema",
    "tur",
    "duzenleyenBirim",
    "faaliyetYurutucusu",
    "ulusal",
    "baslama",
    "kalkinmaAraci",
  ]);

  const grafikRef = useRef(null);

  // Sabit alanlar
  const staticFields = {
    ad: "Toplantının / Faaliyetin Adı",
    ulusal: "Ulusal / Uluslararası",
    tur: "Faaliyet Türü",
    tema: "Etkinlik Teması",
    baslama: "Başlama Tarihi",
    katilimci: "Yurt Dışından Katılımcı Sayısı",
    katilimTur: "Katılım Türü",
    kaliteKulturu: "Kalite Kültürünü Yaygınlaştırma Amacı",
    duzenleyenBirim: "Düzenleyen Birim",
    faaliyetYurutucusu: "Faaliyet Yürütücüsü",
    kariyerMerkezi: "Kariyer Merkezi Faaliyeti",
    bagimlilik: "Bağımlılıkla Mücadele Kapsamında Faaliyet",
    dezavantajli: "Dezavantajlı Gruplara Yönelik Faaliyet",
    sektorIsbirligi: "Sektör İş Birliği",
    yarisma: "Etkinlik Yarışma İçeriyor Mu",
    kalkinmaAraci: "Sürdürülebilir Kalkınma Amacı",
    url: "URL",
  };

  useEffect(() => {
    axios
      .get("https://backend-mg22.onrender.com/api/etkinlikler")
      .then((res) => {
        const etkinlikVerisi = res.data.etkinlikler || res.data;

        setEtkinlikler(etkinlikVerisi);

        // 🔥 CustomFields'ı dinamik olarak topla
        const dynamicCustomFields = {};
        etkinlikVerisi.forEach((etkinlik) => {
          if (etkinlik.customFields) {
            Object.entries(etkinlik.customFields).forEach(([key, value]) => {
              if (typeof value === "object" && value.label) {
                dynamicCustomFields[key] = value.label;
              } else {
                dynamicCustomFields[key] =
                  key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
              }
            });
          }
        });

        setCustomFieldMapping(dynamicCustomFields);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Veri alınamadı", err);
        setError("Veri alınamadı");
        setLoading(false);
      });
  }, []);

  // Tüm alanları birleştir (statik + custom)
  const allFields = useMemo(() => {
    return { ...staticFields, ...customFieldMapping };
  }, [customFieldMapping]);

  // Select için options oluştur
  const fieldOptions = useMemo(() => {
    return Object.entries(allFields).map(([key, label]) => ({
      value: key,
      label: `${label}`,
      group: key.startsWith("custom_") ? "Özel Alanlar" : "Sabit Alanlar",
    }));
  }, [allFields]);

  // Grouped options (react-select için)
  const groupedOptions = useMemo(() => {
    const grouped = fieldOptions.reduce((acc, option) => {
      const group = option.group;
      if (!acc[group]) acc[group] = [];
      acc[group].push(option);
      return acc;
    }, {});

    return Object.entries(grouped).map(([label, options]) => ({
      label,
      options,
    }));
  }, [fieldOptions]);

  const filteredProducts = useMemo(() => {
    return etkinlikler.filter((product) => {
      const matchesSearch = Object.values(product).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const etkinlikTarihi = dayjs(product.baslama, "YYYY-MM-DD");

      const startValid = startDate
        ? etkinlikTarihi.isSame(startDate, "day") ||
          etkinlikTarihi.isAfter(startDate, "day")
        : true;

      const endValid = endDate
        ? etkinlikTarihi.isSame(endDate, "day") ||
          etkinlikTarihi.isBefore(endDate, "day")
        : true;

      const matchesLegend =
        selectedCategory && selectedLegend
          ? (() => {
              const field = product[selectedCategory];
              if (Array.isArray(field)) {
                return field.includes(selectedLegend);
              }
              return field === selectedLegend;
            })()
          : true;

      return startValid && endValid && matchesSearch && matchesLegend;
    });
  }, [
    etkinlikler,
    searchTerm,
    startDate,
    endDate,
    selectedLegend,
    selectedCategory,
  ]);

  const today = dayjs();

  const displayedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const aDate = dayjs(a.baslama, "YYYY-MM-DD");
      const bDate = dayjs(b.baslama, "YYYY-MM-DD");

      const aDiff = Math.abs(aDate.diff(today));
      const bDiff = Math.abs(bDate.diff(today));

      return aDiff - bDiff;
    });
  }, [filteredProducts]);

  const openModal = (url) => {
    setActiveModalUrl(url);
  };

  const closeModal = () => {
    setActiveModalUrl(null);
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // Görünürlük seçimi değiştiğinde
  const handleVisibilityChange = (selectedOptions) => {
    setVisibleFields(
      selectedOptions ? selectedOptions.map((opt) => opt.value) : []
    );
  };

  return (
    <>
      <section id="event" ref={grafikRef}>
        <div className="filter-box">
          <div className="top-controls">
            <button
              className="toggle-filter-button"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              {showFilters ? "Filtreyi Gizle" : "Filtrele"}
            </button>

            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                id="search-input"
                type="text"
                placeholder="Arama yapınız..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {showFilters && (
            <div className="date-filter-container">
              <div id="date-filter-hiza">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateFilter
                    dateName="Başlangıç"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                  />
                  <DateFilter
                    dateName="Bitiş"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                  />
                </LocalizationProvider>
                <button className="clear-dates-button" onClick={clearDates}>
                  Temizle
                </button>
              </div>

              {/* Alan Görünürlük Seçimi */}
              <div className="visibility-filter-container">
                <label>Gösterilecek Alanlar:</label>
                <Select
                  className="my-select"
                  classNamePrefix="my-select"
                  isMulti
                  placeholder="Gösterilecek alanları seçiniz"
                  options={groupedOptions}
                  value={fieldOptions.filter((opt) =>
                    visibleFields.includes(opt.value)
                  )}
                  onChange={handleVisibilityChange}
                  isSearchable
                  closeMenuOnSelect={false}
                />
              </div>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="event-count">
            <p>
              {displayedProducts.length === 0
                ? "Eşleşen etkinlik bulunamadı."
                : `${displayedProducts.length} etkinlik bulundu.`}
            </p>
          </div>
        )}

        <ul id="products">
          {displayedProducts.map((product) => (
            <li key={product.id} onClick={() => openModal(product.url)}>
              <Product
                {...product}
                visibleFields={visibleFields}
                customFieldMapping={customFieldMapping}
                customFields={product.customFields}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>

        {activeModalUrl && <Modal url={activeModalUrl} onClose={closeModal} />}
      </section>
      <ScrollToTop scrollTargetRef={grafikRef} />
    </>
  );
}
