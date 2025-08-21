import React from "react";
import icon1 from "../assets/1.png";
import icon2 from "../assets/2.png";
import icon3 from "../assets/3.png";
import icon4 from "../assets/4.png";
import icon5 from "../assets/all.png";
import icon6 from "../assets/5.png";
import { FaTimes } from "react-icons/fa";

export default function Product({
  id,
  ad,
  ulusal,
  tur,
  kalkinmaAraci,
  tema,
  baslama,
  url,
  katilimci,
  katilimTur,
  kaliteKulturu,
  faaliyetKulturu,
  duzenleyenBirim,
  faaliyetYurutucusu,
  kariyerMerkezi,
  bagimlilik,
  dezavantajli,
  sektorIsbirligi,
  yarisma,
  visibleFields = [],
  customFieldMapping = {},
  customFields,
  onDelete,
  ...customProps
}) {
  const kalkinmaGorselleri = {
    "Yoksulluğa Son": "/yoksulluk.png",
    "Açlığa Son": "/aclik.png",
    "Sağlık ve Kaliteli Yaşam": "/saglik.png",
    "Nitelikli Eğitim": "/egitim.png",
    "Toplumsal Cinsiyet Eşitliği": "/cinsiyet.png",
    "Temiz Su ve Sanitasyon": "/su.png",
    "Erişilebilir ve Temiz Enerji": "/enerji.png",
    "İnsana Yakışır İş ve Ekonomik Büyüme": "/insan.png",
    "Sanayi, Yenilikçilik ve Altyapı": "/sanayi.png",
    "Eşitsizliklerin Azaltılması": "/esitsizlik.png",
    "Sürdürülebilir Şehirler ve Topluluklar": "/sehir.png",
    "Sorumlu Üretim ve Tüketim": "/uretim.png",
    "İklim Eylemi": "/iklim.png",
    "Sudaki Yaşam": "/sudakiyasam.png",
    "Karasal Yaşam": "/karasal.png",
    "Barış, Adalet ve Güçlü Kurumlar": "/baris.png",
    "Amaçlar İçin Ortaklıklar": "/amac.png",
  };

  const fieldIcons = {
    tema: icon1,
    tur: icon2,
    duzenleyenBirim: icon3,
    faaliyetYurutucusu: icon4,
    ulusal: icon6,
    kalkinmaAraci: icon5,
    default: icon1,
  };

  const fieldLabels = {
    ad: "Etkinlik Adı",
    tema: "Etkinlik Teması",
    tur: "Faaliyet Türü",
    duzenleyenBirim: "Düzenleyen Birim",
    faaliyetYurutucusu: "Faaliyet Yürütücüsü",
    ulusal: "Ulusal/Uluslararası",
    baslama: "Etkinlik Tarihi",
    kalkinmaAraci: "Sürdürülebilir Kalkınma Amaçları",
    katilimci: "Yurt Dışından Katılımcı Sayısı",
    katilimTur: "Katılım Türü",
    kaliteKulturu: "Kalite Kültürünü Yaygınlaştırma",
    faaliyetKulturu: "Faaliyet Kültürü",
    kariyerMerkezi: "Kariyer Merkezi Faaliyeti",
    bagimlilik: "Bağımlılıkla Mücadele",
    dezavantajli: "Dezavantajlı Gruplara Yönelik",
    sektorIsbirligi: "Sektör İş Birliği",
    yarisma: "Etkinlik Yarışma İçeriyor Mu",
  };

  const kalkinmaListesi = Array.isArray(kalkinmaAraci)
    ? kalkinmaAraci
    : kalkinmaAraci?.split(",") || [];

  const formattedDate = baslama
    ? (() => {
        const d = new Date(baslama);
        return isNaN(d.getTime()) ? baslama : d.toLocaleDateString("tr-TR");
      })()
    : "";

  const allProps = {
    id,
    ad,
    ulusal,
    tur,
    kalkinmaAraci,
    tema,
    baslama,
    url,
    katilimci,
    katilimTur,
    kaliteKulturu,
    faaliyetKulturu,
    duzenleyenBirim,
    faaliyetYurutucusu,
    kariyerMerkezi,
    bagimlilik,
    dezavantajli,
    sektorIsbirligi,
    yarisma,
    ...customFields,
    ...customProps,
  };

  const renderFieldValue = (field, value) => {
    if (value === null || value === undefined || value === "") return null;

    if (field === "baslama") {
      return formattedDate;
    }

    if (field === "kalkinmaAraci" && kalkinmaListesi.length > 0) {
      return (
        <div className="kalkinma-listesi">
          {kalkinmaListesi.map((arac, index) => (
            <div key={index} className="kalkinma-item">
              <img
                src={kalkinmaGorselleri[arac]}
                alt={arac}
                className="kalkinma-image"
              />
              <span className="product-tema">{arac}</span>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return value;
  };

  const getFieldLabel = (field) => {
    if (fieldLabels[field]) return fieldLabels[field];
    if (customFieldMapping[field]) return customFieldMapping[field];
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const isNew =
    baslama &&
    new Date(baslama) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <article className="product" aria-labelledby={`product-${id}-title`}>
      {/* Top controls: badge + delete button grouped to avoid overlap */}
      {(isNew || onDelete) && (
        <div className="product-top-controls" aria-hidden={false}>
          {isNew && (
            <span
              className="badge-new"
              title="Yeni eklenen etkinlik"
              aria-hidden="false"
            >
              YENİ
            </span>
          )}
          {onDelete && (
            <button
              type="button"
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id, e);
              }}
              title="Etkinliği Sil"
              aria-label="Etkinliği Sil"
            >
              <FaTimes />
            </button>
          )}
        </div>
      )}

      <div className="product-content">
        <div id="cizgi">
          {visibleFields.includes("ad") && (
            <h3 id={`product-${id}-title`}>{ad}</h3>
          )}

          {visibleFields.map((field) => {
            if (field === "ad") return null;
            const value = allProps[field];
            if (!value) return null;
            const label = getFieldLabel(field);
            const icon = fieldIcons[field] || fieldIcons.default;

            if (field === "kalkinmaAraci" && kalkinmaListesi.length > 0) {
              return (
                <div key={field} className="product-tema">
                  <div className="siralama">
                    <img className="resim kalkinma" src={icon5} alt="" />
                    <span className="ana-baslik">{label}:</span>
                  </div>
                  {renderFieldValue(field, value)}
                </div>
              );
            }

            if (field === "baslama") {
              return (
                <div key={field} className="baslangic">
                  <p className="product-tema">
                    <span className="ana-baslik">{label}: </span>
                    {renderFieldValue(field, value)}
                  </p>
                </div>
              );
            }

            return (
              <div key={field} className="siralama">
                <img className="resim" src={icon} alt="" />
                <p className="product-tema">
                  <span className="ana-baslik">{label}: </span>
                  {renderFieldValue(field, value)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
