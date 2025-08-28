import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import "./styles/events.css";
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
  const [excelFieldMapping, setExcelFieldMapping] = useState({}); // Excel'den gelen eşleşmeyen alanlar
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModalUrl, setActiveModalUrl] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

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

  // 🔥 Verileri yükleme fonksiyonu
  const loadEtkinlikler = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://backend-mg22.onrender.com/api/etkinlikler"
      );
      const etkinlikVerisi = res.data.etkinlikler || res.data;

      setEtkinlikler(etkinlikVerisi);

      // CustomFields'ı dinamik olarak topla
      const dynamicCustomFields = {};
      const dynamicExcelFields = {};

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

        Object.keys(etkinlik).forEach((key) => {
          if (
            !staticFields[key] &&
            key !== "id" &&
            key !== "customFields" &&
            key !== "extraData" &&
            key !== "batchId"
          ) {
            dynamicExcelFields[key] = key;
          }
        });
      });

      setCustomFieldMapping(dynamicCustomFields);
      setExcelFieldMapping(dynamicExcelFields);
      setLoading(false);
    } catch (err) {
      console.error("Veri alınamadı", err);
      setError("Veri alınamadı");
      setLoading(false);
    }
  };

  // 🔥 Tek etkinlik silme fonksiyonu
  const deleteEtkinlik = async (id, e) => {
    e?.stopPropagation(); // Event bubbling'i durdur

    // Kullanıcıdan onay al
    if (!window.confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `https://backend-mg22.onrender.com/api/etkinlikler/${id}`
      );

      if (response.data.success) {
        // State'den silinen etkinliği kaldır (yeniden API çağrısı yapmadan)
        setEtkinlikler((prevEtkinlikler) =>
          prevEtkinlikler.filter((etkinlik) => etkinlik.id !== id)
        );
        console.log("Etkinlik başarıyla silindi");

        // Başarı mesajı göster (opsiyonel)
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error("Etkinlik silinirken hata:", error);
      setError("Etkinlik silinirken bir hata oluştu");

      // Hata mesajını 5 saniye sonra temizle
      setTimeout(() => setError(null), 5000);
    }
  };

  useEffect(() => {
    loadEtkinlikler();
  }, []);

  // Tüm alanları birleştir (statik + custom + excel)
  const allFields = useMemo(() => {
    return { ...staticFields, ...customFieldMapping, ...excelFieldMapping };
  }, [customFieldMapping, excelFieldMapping]);

  // Select için options oluştur
  const fieldOptions = useMemo(() => {
    return Object.entries(allFields).map(([key, label]) => {
      let group = "Sabit Alanlar";

      if (customFieldMapping[key]) {
        group = "Özel Alanlar";
      } else if (excelFieldMapping[key]) {
        group = "Excel Alanları";
      }

      return {
        value: key,
        label: `${label}`,
        group: group,
      };
    });
  }, [allFields, customFieldMapping, excelFieldMapping]);

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
                dynamicFieldMapping={allFields} // 🔥 Bu prop adı Product'ta dynamicFieldMapping
                customFields={product.customFields}
                onDelete={deleteEtkinlik} // 🔥 Silme fonksiyonunu Product'a geç
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
