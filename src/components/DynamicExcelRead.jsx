import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";

import NotificationContainer from "./DynamicExcelReader/NotificationContainer";
import UploadSection from "./DynamicExcelReader/UploadSection";
import MappingSection from "./DynamicExcelReader/MappingSection";
import PreviewSection from "./DynamicExcelReader/PreviewSection";
import SummarySection from "./DynamicExcelReader/SummarySection";
import SaveSection from "./DynamicExcelReader/SaveSection";
import LoadingOverlay from "./DynamicExcelReader/LoadingOverlay";

// CSS
import "./styles/excel-reader.css";
import "react-toastify/dist/ReactToastify.css";
import "./styles/upload-section.css";
import "react-tooltip/dist/react-tooltip.css";

export default function DynamicExcelReader({ onDataSaved }) {
  // State'ler
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
  const [dynamicDbFields, setDynamicDbFields] = useState({});

  // Sabit veriler
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

  const cardInfos = {
    upload:
      "📂 Dosya Seç'e tıklayarak yüklemek istediğiniz Excel dosyasını yükleyiniz.",
    mapping:
      "📑 Excel başlıklarını veritabanındaki alanlarla eşleyiniz. Eşlenmeyenler Excel başlığıyla kaydedilir.",
    preview:
      "🔍 Yüklediğiniz verileri tablo veya JSON formatında önizleyebilirsiniz.",
    summary: "📊 Yapılan tüm eşlemelerin özetini burada görebilirsiniz.",
    save: "💾 Verilerinizi eşlemeyi uyguladıktan sonra veritabanına kaydedebilirsiniz.",
  };

  // Notification fonksiyonları
  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const addNotification = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  // useEffect - dinamik alanları yükle
  useEffect(() => {
    const fetchExistingHeaders = async () => {
      try {
        const response = await fetch(
          "https://backend-mg22.onrender.com/api/etkinlikler/headers"
        );
        const result = await response.json();

        if (result.success && result.headers) {
          const combinedFields = { ...dbFields };

          result.headers.forEach((header) => {
            if (!dbFields[header]) {
              combinedFields[header] = header;
            }
          });

          setDynamicDbFields(combinedFields);
        } else {
          setDynamicDbFields(dbFields);
        }
      } catch (error) {
        console.error("Başlıklar yüklenirken hata:", error);
        setDynamicDbFields(dbFields);
      }
    };

    fetchExistingHeaders();
  }, []);

  // Otomatik eşleme fonksiyonu
  const autoMapHeaders = (headers) => {
    const autoMapping = {};

    headers.forEach((excelHeader) => {
      const normalizedExcelHeader = excelHeader.toLowerCase().trim();

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

  // Backend kaydetme fonksiyonu
  const saveToBackend = async () => {
    setIsLoading(true);
    if (!isMappingApplied) {
      toast.error("Lütfen önce eşlemeyi uygulayın!");
      setIsLoading(false);
      return;
    }

    try {
      const rawData = mappedData.length > 0 ? mappedData : jsonData;
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

        setTimeout(() => {
          // State'leri sıfırla
          setJsonData([]);
          setExcelHeaders([]);
          setShowMapping(false);
          setHeaderMapping({});
          setMappedData([]);
          setViewMode("table");
          setShowMappedOnly(false);

          // Parent bileşenin verilerini yenilemesini sağla
          if (onDataSaved) {
            onDataSaved();
          }

          // File input'u temizle
          const fileInput = document.getElementById("fileInput");
          if (fileInput) {
            fileInput.value = "";
          }
        }, 2000);
      } else {
        toast.error(`❌ Hata: ${result.message}`);
      }
    } catch (error) {
      console.error("Hata:", error);
      toast.error(`❌ Hata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Dosya yükleme fonksiyonu
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
        addNotification("Excel okuma hatası: " + error.message, "error");
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      addNotification("Dosya okuma hatası", "error");
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Eşleme güncelleme fonksiyonu
  const updateMapping = (excelHeader, dbField) => {
    setHeaderMapping((prev) => ({
      ...prev,
      [excelHeader]: dbField,
    }));
  };

  // Eşleme uygulama fonksiyonu
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

  // Filtrelenmiş başlıkları getir
  const getFilteredHeaders = () => {
    if (!showMappedOnly) return excelHeaders;
    return excelHeaders.filter((header) => !headerMapping[header]);
  };

  // Hesaplanan değerler
  const isMappingApplied = mappedData.length > 0;

  return (
    <div className="dynamic-excel-container">
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />

      <div className="content-wrapper">
        <UploadSection
          handleFileUpload={handleFileUpload}
          isLoading={isLoading}
          cardInfos={cardInfos}
        />

        <MappingSection
          showMapping={showMapping}
          showMappedOnly={showMappedOnly}
          setShowMappedOnly={setShowMappedOnly}
          headerMapping={headerMapping}
          excelHeaders={excelHeaders}
          dynamicDbFields={dynamicDbFields}
          updateMapping={updateMapping}
          isLoading={isLoading}
          applyMapping={applyMapping}
          cardInfos={cardInfos}
          getFilteredHeaders={getFilteredHeaders}
        />

        <PreviewSection
          jsonData={jsonData}
          mappedData={mappedData}
          viewMode={viewMode}
          setViewMode={setViewMode}
          cardInfos={cardInfos}
        />

        <SummarySection
          mappedData={mappedData}
          headerMapping={headerMapping}
          dbFields={dbFields}
          excelHeaders={excelHeaders}
        />

        <SaveSection
          jsonData={jsonData}
          mappedData={mappedData}
          isLoading={isLoading}
          isMappingApplied={isMappingApplied}
          saveToBackend={saveToBackend}
        />
      </div>

      <LoadingOverlay isLoading={isLoading} />
      <ToastContainer />
    </div>
  );
}
