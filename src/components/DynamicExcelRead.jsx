import React, { useState, useEffect } from "react";
import UploadSection from "./DynamicExcelReader/UploadSection";
import MappingSection from "./DynamicExcelReader/MappingSection";
import PreviewSection from "./DynamicExcelReader/PreviewSection";
import SummarySection from "./DynamicExcelReader/SummarySection";
import SaveSection from "./DynamicExcelReader/SaveSection";
import Notification from "./DynamicExcelReader/Notification";
import LoadingOverlay from "./DynamicExcelReader/LoadingOverlay";

import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "./styles/excel-reader.css";
import "./styles/upload-section.css";

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

  // ✅ File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
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
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length === 0) return;

          const headers = jsonData[0].map((h) => h?.toString().trim() || "");
          headers.forEach((h) => h && discoveredHeaders.add(h));

          const dataRows = jsonData.slice(1).map((row) => {
            const rowObject = {};
            headers.forEach((header, index) => {
              if (header && row[index] !== undefined) {
                rowObject[header] = row[index];
              }
            });
            return rowObject;
          });

          allData.push({ sheetName, data: dataRows });
        });

        setJsonData(allData);
        setExcelHeaders(Array.from(discoveredHeaders));
        setHeaderMapping({});
        setShowMapping(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Excel okuma hatası:", err);
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // ✅ Mapping uygula
  const applyMapping = () => {
    setIsLoading(true);
    setTimeout(() => {
      const mapped = jsonData.map((sheet) => ({
        ...sheet,
        data: sheet.data.map((row) => {
          const mappedRow = {};
          Object.keys(headerMapping).forEach((excelHeader) => {
            const dbField = headerMapping[excelHeader];
            mappedRow[dbField] = row[excelHeader];
          });
          return mappedRow;
        }),
      }));
      setMappedData(mapped);
      setIsLoading(false);
    }, 500);
  };

  // ✅ Backend’e kaydet
  const saveToBackend = async () => {
    if (mappedData.length === 0) {
      toast.error("Lütfen önce eşlemeyi uygulayın!");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://backend-mg22.onrender.com/api/etkinlikler",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: mappedData }),
        }
      );
      const result = await response.json();
      if (result.success) {
        toast.success("Veri başarıyla kaydedildi!");
        onDataSaved?.();
      } else {
        toast.error("Kaydetme hatası!");
      }
    } catch (err) {
      toast.error("Bağlantı hatası!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dynamic-excel-container">
      <Notification
        notifications={notifications}
        setNotifications={setNotifications}
      />

      <UploadSection onFileUpload={handleFileUpload} isLoading={isLoading} />

      {showMapping && (
        <MappingSection
          excelHeaders={excelHeaders}
          headerMapping={headerMapping}
          setHeaderMapping={setHeaderMapping}
          applyMapping={applyMapping}
          showMappedOnly={showMappedOnly}
          setShowMappedOnly={setShowMappedOnly}
          dbFields={dbFields}
          isLoading={isLoading}
        />
      )}

      {(jsonData.length > 0 || mappedData.length > 0) && (
        <PreviewSection
          jsonData={jsonData}
          mappedData={mappedData}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      {mappedData.length > 0 && (
        <SummarySection
          excelHeaders={excelHeaders}
          headerMapping={headerMapping}
          dbFields={dbFields}
        />
      )}

      {(jsonData.length > 0 || mappedData.length > 0) && (
        <SaveSection
          saveToBackend={saveToBackend}
          isLoading={isLoading}
          isMappingApplied={mappedData.length > 0}
        />
      )}

      {isLoading && <LoadingOverlay />}
    </div>
  );
}
