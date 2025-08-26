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
import "./styles/product-select.css";
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

  // Son yüklenen batchId
  const [lastBatchId, setLastBatchId] = useState(null);

  // Dinamik başlıklar için yeni state
  const [dynamicFields, setDynamicFields] = useState({});

  const grafikRef = useRef(null);

  // Görünürlük kontrolü
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
    faaliyetKulturu: "Faaliyet Kültürü",
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

  // Backend'den mevcut başlıkları çek
  useEffect(() => {
    const fetchDynamicFields = async () => {
      try {
        const response = await axios.get(
          "https://backend-mg22.onrender.com/api/etkinlikler/headers"
        );

        if (response.data.success && response.data.headers) {
          // Sabit alanlarla başla
          const combinedFields = { ...staticFields };

          // Backend'den gelen başlıkları ekle (sabit olanlarda yoksa)
          response.data.headers.forEach((header) => {
            if (!staticFields[header]) {
              // Dinamik başlıklar için güzel görünecek etiketler oluştur
              const label = header
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
                .replace(/_/g, " ");
              combinedFields[header] = label;
            }
          });

          setDynamicFields(combinedFields);
        } else {
          // Backend'den veri gelmezse sadece sabit fields kullan
          setDynamicFields(staticFields);
        }
      } catch (error) {
        console.error("Dinamik başlıklar yüklenirken hata:", error);
        // Hata durumunda sadece sabit fields kullan
        setDynamicFields(staticFields);
      }
    };

    fetchDynamicFields();
  }, []);

  // === useEffect: Etkinlikleri ve son batchId'yi çek ===
  useEffect(() => {
    // Etkinlikleri çek
    axios
      .get("https://backend-mg22.onrender.com/api/etkinlikler")
      .then((res) => {
        const etkinlikVerisi = res.data.etkinlikler || res.data;
        setEtkinlikler(etkinlikVerisi);

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

    // Son batchId'yi çek
    axios
      .get("https://backend-mg22.onrender.com/api/last-batch")
      .then((res) => setLastBatchId(res.data.lastBatchId))
      .catch((err) => console.error("BatchID alınamadı", err));
  }, []);

  // === Son yüklenen batch'i silme ===
  const handleDeleteLastBatch = () => {
    if (!lastBatchId) return;

    if (
      window.confirm(
        "Son yüklenen veriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      )
    ) {
      axios
        .delete(
          `https://backend-mg22.onrender.com/api/etkinlikler/batch/${lastBatchId}`
        )
        .then((res) => {
          alert(res.data.message);
          // State'i güncelle
          setEtkinlikler((prev) =>
            prev.filter((e) => e.batchId !== lastBatchId)
          );
          setLastBatchId(null);
        })
        .catch((err) => {
          console.error(err);
          alert("Silme işlemi başarısız oldu.");
        });
    }
  };

  const handleDeleteProduct = (productId, productName) => {
    const confirmDelete = window.confirm(
      `Bu etkinliği silmek istediğinize emin misiniz?\nEtkinlik: ${productName}`
    );

    if (confirmDelete) {
      axios
        .delete(
          `https://backend-mg22.onrender.com/api/etkinlikler/${productId}`
        )
        .then((res) => {
          alert(res.data.message || `${productName} etkinliği silindi.`);
          // State'i güncelle
          setEtkinlikler((prev) => prev.filter((e) => e.id !== productId));
        })
        .catch((err) => {
          console.error(err);
          alert("Silme işlemi başarısız oldu.");
        });
    }
  };

  // Tüm alanları birleştir (artık dinamik alanlar dahil)
  const allFields = useMemo(() => {
    return { ...dynamicFields, ...customFieldMapping };
  }, [dynamicFields, customFieldMapping]);

  const fieldOptions = useMemo(
    () =>
      Object.entries(allFields).map(([key, label]) => ({
        value: key,
        label: `${label}`,
        group: staticFields[key]
          ? "Sabit Alanlar"
          : key.startsWith("custom_")
          ? "Özel Alanlar"
          : "Dinamik Alanlar",
      })),
    [allFields]
  );

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

  const openModal = (url) => setActiveModalUrl(url);
  const closeModal = () => setActiveModalUrl(null);
  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleVisibilityChange = (selectedOptions) => {
    setVisibleFields(
      selectedOptions ? selectedOptions.map((opt) => opt.value) : []
    );
  };

  return (
    <>
      <section id="event" ref={grafikRef}>
        {/* Filtre ve arama */}
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
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
            </div>
          )}

          {lastBatchId && (
            <div className="delete-batch-div">
              <button
                className="toggle-filter-button"
                onClick={handleDeleteLastBatch}
              >
                Son Yüklenen Veriyi Sil
              </button>
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
                dynamicFieldMapping={dynamicFields} // Yeni prop eklendi
                customFields={product.customFields}
                onDelete={() => handleDeleteProduct(product.id)}
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
