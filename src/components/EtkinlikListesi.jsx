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
import ScrollToTop from "./ScrollToTop.jsx";
import Pagination from "./Pagination.jsx";
import "./styles/batch.css";

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
  const [lastBatchId, setLastBatchId] = useState(null);
  const [dynamicFields, setDynamicFields] = useState({});
  const grafikRef = useRef(null);
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 15;

  // Batch yönetimi için state'ler
  const [availableBatches, setAvailableBatches] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);

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

  // Dinamik alanları backend'den çek
  useEffect(() => {
    const fetchDynamicFields = async () => {
      try {
        const response = await axios.get(
          "https://backend-mg22.onrender.com/api/etkinlikler/headers"
        );

        if (response.data.success && response.data.headers) {
          const combinedFields = { ...staticFields };
          response.data.headers.forEach((header) => {
            if (!staticFields[header]) {
              const label = header
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
                .replace(/_/g, " ");
              combinedFields[header] = label;
            }
          });

          setDynamicFields(combinedFields);
        } else {
          setDynamicFields(staticFields);
        }
      } catch (error) {
        console.error("Dinamik başlıklar yüklenirken hata:", error);
        setDynamicFields(staticFields);
      }
    };

    fetchDynamicFields();
  }, []);

  // Batch'leri getir fonksiyonu
  const fetchBatches = async () => {
    try {
      const response = await axios.get(
        "https://backend-mg22.onrender.com/api/batches"
      );
      if (response.data.success) {
        setAvailableBatches(response.data.batches);
      }
    } catch (error) {
      console.error("Batch'ler yüklenirken hata:", error);
    }
  };

  // Batch'leri ilk yüklemede getir
  useEffect(() => {
    fetchBatches();
  }, []);

  // Etkinlikleri ve son batchId'yi çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Etkinlikleri getir
        const etkinlikResponse = await axios.get(
          "https://backend-mg22.onrender.com/api/etkinlikler"
        );
        const etkinlikVerisi =
          etkinlikResponse.data.etkinlikler || etkinlikResponse.data;
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

        // Son batch ID'yi getir
        const batchResponse = await axios.get(
          "https://backend-mg22.onrender.com/api/last-batch"
        );
        setLastBatchId(batchResponse.data.lastBatchId);

        // Batch'leri yeniden getir
        fetchBatches();

        setLoading(false);
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
        setError("Veri yüklenirken hata oluştu");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // FİX: handleDeleteProduct fonksiyonunu async/await ile güncelle
  const handleDeleteProduct = async (productId, e) => {
    if (e) e.stopPropagation();

    const product = etkinlikler.find((e) => e.id === productId);
    const productName = product ? product.ad : "Bilinmeyen Etkinlik";

    if (
      window.confirm(
        `Bu etkinliği silmek istediğinize emin misiniz?\nEtkinlik: ${productName}`
      )
    ) {
      try {
        // API çağrısını await ile bekle
        await axios.delete(
          `https://backend-mg22.onrender.com/api/etkinlikler/${productId}`
        );

        // Başarılı olursa state'i güncelle
        setEtkinlikler((prev) => prev.filter((e) => e.id !== productId));

        // Batch'leri yeniden getir (eğer son kayıt silinmişse batch bilgisi değişebilir)
        fetchBatches();
      } catch (err) {
        console.error("Silme hatası:", err);

        // Hata mesajını daha detaylı göster
        const errorMessage =
          err.response?.data?.message || "Etkinlik silinirken bir hata oluştu.";
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const handleDeleteLastBatch = async () => {
    if (!lastBatchId) return;

    if (
      window.confirm("Son yüklenen veriyi silmek istediğinizden emin misiniz?")
    ) {
      try {
        const response = await axios.delete(
          `https://backend-mg22.onrender.com/api/etkinlikler/batch/${lastBatchId}`
        );

        alert(response.data.message);

        // State'leri güncelle
        setEtkinlikler((prev) => prev.filter((e) => e.batchId !== lastBatchId));
        setLastBatchId(null);

        // Batch'leri yeniden getir
        fetchBatches();
      } catch (error) {
        console.error("Batch silme hatası:", error);
        alert("Silme işlemi başarısız oldu.");
      }
    }
  };

  // Seçilen batch'i sil
  const handleDeleteBatch = async (batchId, recordCount) => {
    const confirmMessage = `Bu batch'i silmek istediğinize emin misiniz?\n${recordCount} kayıt silinecek.`;

    if (window.confirm(confirmMessage)) {
      try {
        const response = await axios.delete(
          `https://backend-mg22.onrender.com/api/etkinlikler/batch/${batchId}`
        );
        alert(response.data.message);

        // State'leri güncelle
        setEtkinlikler((prev) => prev.filter((e) => e.batchId !== batchId));
        setAvailableBatches((prev) =>
          prev.filter((b) => b.batchId !== batchId)
        );

        // Eğer silinen batch son batch ise lastBatchId'yi güncelle
        if (lastBatchId === batchId) {
          const remainingBatches = availableBatches.filter(
            (b) => b.batchId !== batchId
          );
          setLastBatchId(
            remainingBatches.length > 0 ? remainingBatches[0].batchId : null
          );
        }

        setShowBatchModal(false);
      } catch (error) {
        console.error("Silme hatası:", error);
        const errorMessage =
          error.response?.data?.message || "Silme işlemi başarısız oldu.";
        alert(errorMessage);
      }
    }
  };

  const allFields = useMemo(
    () => ({ ...dynamicFields, ...customFieldMapping }),
    [dynamicFields, customFieldMapping]
  );

  const fieldOptions = useMemo(
    () =>
      Object.entries(allFields).map(([key, label]) => ({
        value: key,
        label: label,
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
              if (Array.isArray(field)) return field.includes(selectedLegend);
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
      return Math.abs(aDate.diff(today)) - Math.abs(bDate.diff(today));
    });
  }, [filteredProducts]);

  // Pagination logic
  const offset = currentPage * itemsPerPage;
  const currentProducts = displayedProducts.slice(
    offset,
    offset + itemsPerPage
  );
  const pageCount = Math.ceil(displayedProducts.length / itemsPerPage);
  const handlePageClick = ({ selected }) => setCurrentPage(selected);

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
                    onChange={setStartDate}
                  />
                  <DateFilter
                    dateName="Bitiş"
                    value={endDate}
                    onChange={setEndDate}
                  />
                </LocalizationProvider>
                <button className="clear-dates-button" onClick={clearDates}>
                  Temizle
                </button>
              </div>
            </div>
          )}

          {availableBatches.length > 0 && (
            <div className="delete-batch-div">
              <button
                className="toggle-filter-button"
                onClick={() => setShowBatchModal(true)}
              >
                Son Yüklenen Veriler
              </button>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <div className="loading-message">Yükleniyor...</div>}

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
          {currentProducts.map((product) => (
            <li key={product.id} onClick={() => openModal(product.url)}>
              <Product
                {...product}
                visibleFields={visibleFields}
                customFieldMapping={customFieldMapping}
                dynamicFieldMapping={dynamicFields}
                customFields={product.customFields}
                onDelete={handleDeleteProduct}
              />
            </li>
          ))}
        </ul>

        {pageCount > 1 && (
          <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
        )}

        {activeModalUrl && <Modal url={activeModalUrl} onClose={closeModal} />}

        {/* Batch Modal */}
        {showBatchModal && (
          <div
            className="batch-modal-overlay"
            onClick={() => setShowBatchModal(false)}
          >
            <div
              className="batch-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Yüklenen Batch'ler</h3>
              <div className="batch-list">
                {availableBatches.map((batch, index) => (
                  <div key={batch.batchId} className="batch-item">
                    <div className="batch-info">
                      <span className="batch-date">
                        {new Date(batch.uploadDate).toLocaleDateString(
                          "tr-TR",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                      <span className="batch-count">
                        {batch.recordCount} kayıt
                      </span>
                      {index === 0 && (
                        <span className="batch-latest">Son Yüklenen</span>
                      )}
                    </div>
                    <button
                      className="batch-delete-btn"
                      onClick={() =>
                        handleDeleteBatch(batch.batchId, batch.recordCount)
                      }
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="batch-modal-close"
                onClick={() => setShowBatchModal(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </section>

      <ScrollToTop scrollTargetRef={grafikRef} />
    </>
  );
}
