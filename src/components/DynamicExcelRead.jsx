import React, { useState, useRef } from "react";

import {
  Upload,
  Download,
  Check,
  X,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import "./styles/excel-reader.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DynamicExcelReader() {
  const [jsonData, setJsonData] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [showMapping, setShowMapping] = useState(false);
  const [headerMapping, setHeaderMapping] = useState({});
  const [mappedData, setMappedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [showMappedOnly, setShowMappedOnly] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasSelectedFile, setHasSelectedFile] = useState(false);

  // Sabit veri tabanı alanları
  const dbFields = {
    id: "Toplantı / Faaliyet ID",
    ad: "Toplantının / Faaliyetin Adı",
    ulusal: "Ulusal / Uluslararası",
    tur: "Faaliyet Türü",
    tema: "Etkinlik Teması",
    baslama: "Başlama Tarihi",
    katilimci: "Yurt Dışından Katılımcı Sayısı",
    katilimTur: "Katılım Türü",
    kaliteKulturu: "Kalite Kültürünü Yaygınlaştırma Amacı Var Mı",
    duzenleyenBirim: "Düzenleyen Birim",
    faaliyetYurutucusu: "Faaliyet Yürütücüsü",
    kariyerMerkezi: "Kariyer Merkezi Faaliyeti Mi",
    bagimlilik: "Bağımlılıkla Mücadele Kapsamında Bir Faaliyet Mi",
    dezavantajli: "Dezavantajlı Gruplara Yönelik Faaliyet Mi",
    sektorIsbirligi: "Sektör İş Birliği Var Mı",
    yarisma: "Etkinlik Yarışma İçeriyor Mu",
    kalkinmaAraci: "Sürdürülebilir Kalkınma Amacı",
    url: "URL",
  };

  // Otomatik eşleme fonksiyonu
  const autoMapHeaders = (headers) => {
    const autoMapping = {};

    headers.forEach((excelHeader) => {
      const normalizedExcelHeader = excelHeader.toLowerCase().trim();

      // Exact match kontrolü
      Object.entries(dbFields).forEach(([dbKey, dbLabel]) => {
        const normalizedDbKey = dbKey.toLowerCase();
        const normalizedDbLabel = dbLabel.toLowerCase();

        if (
          normalizedExcelHeader === normalizedDbKey ||
          normalizedExcelHeader === normalizedDbLabel ||
          normalizedExcelHeader.includes(normalizedDbKey) ||
          normalizedDbLabel.includes(normalizedExcelHeader)
        ) {
          autoMapping[excelHeader] = dbKey;
        }
      });

      // Benzer kelimeler için fuzzy matching
      if (!autoMapping[excelHeader]) {
        const similarities = {
          name: "ad",
          title: "ad",
          başlık: "ad",
          isim: "ad",
          date: "baslama",
          tarih: "baslama",
          type: "tur",
          tür: "tur",
          participant: "katilimci",
          katılımcı: "katilimci",
          budget: "butce",
          butçe: "butce",
          cost: "butce",
          maliyet: "butce",
        };

        Object.entries(similarities).forEach(([keyword, dbKey]) => {
          if (normalizedExcelHeader.includes(keyword)) {
            if (dbFields[dbKey]) {
              autoMapping[excelHeader] = dbKey;
            }
          }
        });
      }
    });

    return autoMapping;
  };

  const saveToBackend = async () => {
    setIsLoading(true);
    if (!isMappingApplied) {
      toast.error("Lütfen önce eşlemeyi uygulayın!");
      return;
    }

    try {
      const rawData = mappedData.length > 0 ? mappedData : jsonData;

      // Sheet'leri düzleştir
      const dataToSave = rawData.flatMap((sheet) => sheet.data);

      const response = await fetch(
        "https://backend-mg22.onrender.com/api/etkinlikler",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: "veriler.json",
            data: dataToSave,
            overwrite: false,
            mapping: headerMapping,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(
          `✅ Veri başarıyla kaydedildi! Kayıt sayısı: ${result.recordCount}`
        );
      } else {
        toast.error(`❌ Hata: ${result.message}`);
      }

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Hata:", error);
      toast.error(`❌ Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();

    function excelDateToJSDate(serial) {
      const utc_days = Math.floor(serial - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);

      const fractional_day = serial - Math.floor(serial) + 0.0000001;

      let total_seconds = Math.floor(86400 * fractional_day);

      const seconds = total_seconds % 60;
      total_seconds -= seconds;

      const hours = Math.floor(total_seconds / (60 * 60));
      const minutes = Math.floor(total_seconds / 60) % 60;

      return new Date(
        date_info.getFullYear(),
        date_info.getMonth(),
        date_info.getDate(),
        hours,
        minutes,
        seconds
      );
    }

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const allData = [];
        let discoveredHeaders = new Set();

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: false,
            dateNF: "yyyy-mm-dd",
          });

          if (jsonData.length === 0) return;

          const headers = jsonData[0]
            .map((h) => (h ? h.toString().trim() : ""))
            .filter((h) => h);

          headers.forEach((h) => discoveredHeaders.add(h));

          const dataRows = jsonData
            .slice(1)
            .map((row) => {
              const rowObject = {};
              headers.forEach((header, index) => {
                if (
                  header &&
                  row[index] !== undefined &&
                  row[index] !== null &&
                  row[index] !== ""
                ) {
                  let value = row[index];

                  if (typeof value === "string" && value.includes("/")) {
                    const dateMatch = value.match(
                      /(\d{1,2})\/(\d{1,2})\/(\d{4})/
                    );
                    if (dateMatch) {
                      const [, month, day, year] = dateMatch;
                      value = `${year}-${month.padStart(2, "0")}-${day.padStart(
                        2,
                        "0"
                      )}`;
                    }
                  }

                  if (header.toLowerCase() === "kalkınma aracı") {
                    if (typeof value === "string") {
                      value = value
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0);
                    } else {
                      value = [value];
                    }
                  }

                  rowObject[header] = value;
                }
              });

              return Object.keys(rowObject).length > 0 ? rowObject : null;
            })
            .filter((row) => row !== null);

          if (dataRows.length > 0) {
            allData.push({
              sheetName: sheetName,
              data: dataRows,
            });
          }
        });

        console.log("Excel verisi okundu:", allData);
        console.log("Bulunan başlıklar:", Array.from(discoveredHeaders));

        setJsonData(allData);
        setExcelHeaders(Array.from(discoveredHeaders));

        const autoMapping = autoMapHeaders(Array.from(discoveredHeaders));
        setHeaderMapping(autoMapping);

        setShowMapping(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Excel okuma hatası:", error);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const updateMapping = (excelHeader, dbField) => {
    setHeaderMapping((prev) => ({
      ...prev,
      [excelHeader]: dbField,
    }));
  };

  const applyMapping = () => {
    setIsLoading(true);

    setTimeout(() => {
      const mapped = jsonData.map((sheet) => {
        return {
          ...sheet,
          data: sheet.data.map((row) => {
            const mappedRow = { id: Date.now() + Math.random() };

            // Önce eşleşen alanları ekle
            Object.keys(headerMapping).forEach((excelHeader) => {
              const dbField = headerMapping[excelHeader];
              const value = row[excelHeader];

              if (dbField && value !== undefined) {
                mappedRow[dbField] = value;
              }
            });

            // Sonra eşleşmeyen alanları Excel başlığı ile ekle
            excelHeaders.forEach((header) => {
              if (!headerMapping[header] && row[header] !== undefined) {
                mappedRow[header] = row[header]; // Excel başlığını aynen kullan
              }
            });

            return mappedRow;
          }),
        };
      });

      setMappedData(mapped);
      setIsLoading(false);
    }, 500);
  };

  const getFilteredHeaders = () => {
    if (!showMappedOnly) return excelHeaders;
    return excelHeaders.filter((header) => !headerMapping[header]);
  };

  const renderTableView = () => {
    const dataToShow = mappedData.length > 0 ? mappedData : jsonData;
    if (!dataToShow.length) return null;

    const firstSheet = dataToShow[0];
    const sampleData = firstSheet.data.slice(0, 10);

    if (!sampleData.length) return <p>Gösterilecek veri yok</p>;

    const allColumns = Object.keys(sampleData[0] || {});

    return (
      <div className="preview-wrapper">
        <div className="table-info-header">
          <span>
            📋 <strong>{firstSheet.sheetName}</strong> | Toplam:{" "}
            <strong>{firstSheet.data.length}</strong> satır | Gösterilen:{" "}
            <strong>{sampleData.length}</strong> satır
          </span>
        </div>

        <div className="table-wrapper">
          <table className="preview-table">
            <thead>
              <tr>
                {allColumns.map((column, index) => (
                  <th key={index}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {allColumns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {row[column] !== null && row[column] !== undefined
                        ? typeof row[column] === "object"
                          ? JSON.stringify(row[column])
                          : String(row[column])
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {firstSheet.data.length > 10 && (
          <div className="table-footer">
            ... ve {firstSheet.data.length - 10} satır daha
          </div>
        )}
      </div>
    );
  };

  const isMappingApplied = mappedData.length > 0;

  return (
    <div className="dynamic-excel-container">
      <div className="notification-container">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification notification-${notification.type}`}
          >
            <div className="notification-content">
              {notification.type === "error" && <AlertCircle size={18} />}
              {notification.type === "success" && <Check size={18} />}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="notification-close"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="content-wrapper">
        <div className="card upload-section">
          <div className="card-content">
            <h2>
              <Upload size={24} />
              Excel Dosyası Yükle
            </h2>

            <div className="upload-zone">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".xlsx,.xls"
                disabled={isLoading}
                className="upload-input"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className={`upload-button ${isLoading ? "disabled" : ""}`}
              >
                {isLoading ? "Yükleniyor..." : "Dosya Seç"}
              </label>
            </div>
          </div>
        </div>

        {showMapping && (
          <div className="card mapping-section fade-in">
            <div className="card-content">
              <h3>
                <div className="title-part">
                  <Check size={24} />
                  Başlık Eşleme
                </div>

                <button
                  onClick={() => setShowMappedOnly(!showMappedOnly)}
                  className={`filter-button ${showMappedOnly ? "active" : ""}`}
                >
                  {showMappedOnly ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showMappedOnly ? "Tümünü Göster" : "Eşlenmeyenleri Göster"}
                </button>
              </h3>

              <div className="auto-mapping-info">
                <p>
                  <strong>{Object.keys(headerMapping).length}</strong> adet
                  otomatik eşleme yapıldı! Eşlenmeyen alanlar Excel başlığı ile
                  aynen kaydedilecek.
                </p>
              </div>

              <div className="mapping-grid">
                {getFilteredHeaders().map((header) => {
                  const isMapped = !!headerMapping[header];
                  const mappedField = headerMapping[header];

                  return (
                    <div
                      key={header}
                      className={`mapping-item ${isMapped ? "mapped" : ""}`}
                    >
                      <div className="mapping-item-header">
                        <span className="excel-header-name">📋 {header}</span>
                        {isMapped && <Check size={16} />}
                      </div>

                      <select
                        value={mappedField || ""}
                        onChange={(e) => updateMapping(header, e.target.value)}
                        disabled={isLoading}
                        className={`mapping-select ${isMapped ? "mapped" : ""}`}
                      >
                        <option value="">-- Excel başlığı ile kaydet --</option>
                        {Object.entries(dbFields).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label} ({key})
                          </option>
                        ))}
                      </select>

                      {!isMapped && (
                        <div className="unmapped-info">
                          📝 Bu alan "<strong>{header}</strong>" başlığı ile
                          kaydedilecek
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="apply-mapping-container">
                <button
                  onClick={applyMapping}
                  disabled={isLoading}
                  className="apply-mapping-button"
                >
                  {isLoading ? "Uygulanıyor..." : "🔄 Eşlemeyi Uygula"}
                </button>
              </div>
            </div>
          </div>
        )}

        {(jsonData.length > 0 || mappedData.length > 0) && (
          <div className="card preview-section fade-in">
            <div className="card-content">
              <h4>
                Veri Önizleme
                <div className="view-mode-buttons">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`view-mode-button ${
                      viewMode === "table" ? "active" : ""
                    }`}
                  >
                    🗂️ Tablo
                  </button>
                  <button
                    onClick={() => setViewMode("json")}
                    className={`view-mode-button ${
                      viewMode === "json" ? "active" : ""
                    }`}
                  >
                    📝 JSON
                  </button>
                </div>
              </h4>

              {viewMode === "table" ? (
                renderTableView()
              ) : (
                <pre className="json-preview">
                  {JSON.stringify(
                    mappedData.length > 0 ? mappedData : jsonData,
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          </div>
        )}

        {mappedData.length > 0 && (
          <div className="card summary-section fade-in">
            <div className="card-content">
              <h5>✅ Eşleme Özeti</h5>
              <div className="summary-grid">
                {Object.entries(headerMapping).map(([excel, db]) => (
                  <div key={excel} className="summary-item">
                    <span className="excel-name">{excel}</span>
                    <span className="arrow">→</span>
                    <span className="db-name">
                      {dbFields[db]} ({db})
                    </span>
                  </div>
                ))}

                {/* Eşleşmeyen alanları göster */}
                {excelHeaders
                  .filter((header) => !headerMapping[header])
                  .map((header) => (
                    <div key={header} className="summary-item unmapped">
                      <span className="excel-name">{header}</span>
                      <span className="arrow">→</span>
                      <span className="db-name">
                        Excel başlığı ile kaydedilecek
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {(jsonData.length > 0 || mappedData.length > 0) && (
          <div className="save-section">
            <button
              onClick={saveToBackend}
              disabled={isLoading || !isMappingApplied}
              className={`save-button ${!isMappingApplied ? "disabled" : ""}`}
            >
              <Download size={20} />
              {isLoading ? "Kaydediliyor..." : "Veri Tabanına Kaydet"}
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <span className="loading-text">İşlem devam ediyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}
