import React, { useState, useEffect } from "react";
import {
  Upload,
  Download,
  Check,
  X,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Info } from "lucide-react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import * as XLSX from "xlsx";

import NotificationList from "./NotificationList";
import UploadSection from "./UploadSection";
import MappingSection from "./MappingSection";
import PreviewSection from "./PreviewSection";
import SummarySection from "./SummarySection";
import SaveSection from "./SaveSection";

import { autoMapHeaders } from "../utils/excelUtils";

import "./styles/excel-reader.css";
import "./styles/upload-section.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DynamicExcelReader({ onDataSaved }) {
  const [jsonData, setJsonData] = useState([]);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [showMapping, setShowMapping] = useState(false);
  const [headerMapping, setHeaderMapping] = useState({});
  const [mappedData, setMappedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [showMappedOnly, setShowMappedOnly] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dynamicDbFields, setDynamicDbFields] = useState({});

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

  // notifications helpers
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

  // Dosya okuma + header auto map
  const handleFileUpload = (file) => {
    if (!file) return;
    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const allData = [];
        let discoveredHeaders = new Set();

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];

          const jsonDataArr = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: false,
            dateNF: "yyyy-mm-dd",
          });

          if (jsonDataArr.length === 0) return;

          const headers = jsonDataArr[0]
            .map((h) => (h ? h.toString().trim() : ""))
            .filter((h) => h);

          headers.forEach((h) => discoveredHeaders.add(h));

          const dataRows = jsonDataArr
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

        setJsonData(allData);
        setExcelHeaders(Array.from(discoveredHeaders));

        const autoMapping = autoMapHeaders(
          Array.from(discoveredHeaders),
          dbFields
        );
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

            // önce eşleşen alanları ekle
            Object.keys(headerMapping).forEach((excelHeader) => {
              const dbField = headerMapping[excelHeader];
              const value = row[excelHeader];

              if (dbField && value !== undefined) {
                mappedRow[dbField] = value;
              }
            });

            // sonra eşleşmeyen alanları Excel başlığı ile ekle
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

  const saveToBackend = async () => {
    setIsLoading(true);
    const isMappingApplied = mappedData.length > 0;
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
          setJsonData([]);
          setExcelHeaders([]);
          setShowMapping(false);
          setHeaderMapping({});
          setMappedData([]);
          setViewMode("table");
          setShowMappedOnly(false);

          if (onDataSaved) {
            onDataSaved();
          }

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

  const isMappingApplied = mappedData.length > 0;

  return (
    <div className="dynamic-excel-container">
      <NotificationList
        notifications={notifications}
        removeNotification={removeNotification}
      />

      <div className="content-wrapper">
        <UploadSection
          handleFileUpload={handleFileUpload}
          isLoading={isLoading}
          cardInfos={cardInfos}
        />

        {showMapping && (
          <MappingSection
            excelHeaders={excelHeaders}
            headerMapping={headerMapping}
            updateMapping={updateMapping}
            dynamicDbFields={dynamicDbFields}
            applyMapping={applyMapping}
            isLoading={isLoading}
            showMappedOnly={showMappedOnly}
            setShowMappedOnly={setShowMappedOnly}
            cardInfos={cardInfos}
          />
        )}

        {(jsonData.length > 0 || mappedData.length > 0) && (
          <PreviewSection
            mappedData={mappedData}
            jsonData={jsonData}
            viewMode={viewMode}
            setViewMode={setViewMode}
            cardInfos={cardInfos}
          />
        )}

        {mappedData.length > 0 && (
          <SummarySection
            headerMapping={headerMapping}
            excelHeaders={excelHeaders}
            dbFields={dbFields}
          />
        )}

        {(jsonData.length > 0 || mappedData.length > 0) && (
          <SaveSection
            saveToBackend={saveToBackend}
            isLoading={isLoading}
            isMappingApplied={isMappingApplied}
            cardInfos={cardInfos}
          />
        )}
      </div>

      <Tooltip id="upload-info" />

      <ToastContainer position="top-right" autoClose={4000} />
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
