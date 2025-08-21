import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputField from "./InputField";
import SelectField from "./SelectField";
import FormSection from "./FormSection";
import Select from "react-select";
import "./styles/multiSelect.css";

import React, { useState } from "react";
import "./styles/EventForm.css";

import FormProgressBar from "./FormProgressBar";

const EventForm = () => {
  const [kalkinmaSecim, setKalkinmaSecim] = useState([]);
  const [hoveredOption, setHoveredOption] = useState("");
  const [excelData, setExcelData] = useState([]);

  const validateSelectFields = () => {
    const selects = document.querySelectorAll("select");
    let allValid = true;

    selects.forEach((select) => {
      if (select.value === "" || select.value === "Seçiniz") {
        select.classList.add("invalid-select");
        allValid = false;
      } else {
        select.classList.remove("invalid-select");
      }
    });

    return allValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateSelectFields()) {
      toast.error("Lütfen tüm seçim alanlarını doldurun 🌸");
      return;
    }

    // 1️⃣ Form verilerini al
    const formData = {
      ad: document.getElementById("ad").value,
      ulusal: document.getElementById("ulusal").value,
      tur: document.getElementById("tur").value,
      tema: document.getElementById("tema").value,
      baslama: document.getElementById("baslama").value,
      url: document.getElementById("url").value,
      katilimci: document.getElementById("katilimci").value,
      katilimTur: document.getElementById("katilimTur").value,
      kaliteKulturu: document.getElementById("kaliteKulturu").value,
      duzenleyenBirim: document.getElementById("duzenleyenBirim").value,
      faaliyetYurutucusu: document.getElementById("faaliyetYurutucusu").value,
      kariyerMerkezi: document.getElementById("kariyerMerkezi").value,
      bagimlilik: document.getElementById("bagimlilik").value,
      dezavantajli: document.getElementById("dezavantajli").value,
      sektorIsbirligi: document.getElementById("sektorIsbirligi").value,
      yarisma: document.getElementById("yarisma").value,
      kalkinmaAraci: kalkinmaSecim,
    };

    try {
      if (excelData && excelData.length > 0) {
        await axios.post("https://backend-mg22.onrender.com/api/etkinlikler", {
          data: excelData,
          filename: "veriler.json",
          overwrite: false,
        });
        toast.success("Excel verileri başarıyla kaydedildi 💾");
      }

      if (formData.ad.trim() !== "") {
        await axios.post("https://backend-mg22.onrender.com/api/etkinlikler", {
          data: [formData],
          filename: "veriler.json",
          overwrite: false,
        });
        toast.success("Form verisi başarıyla kaydedildi 💾");
      }

      setKalkinmaSecim([]);
      e.target.reset();
    } catch (error) {
      toast.error("Bir hata oluştu 🚨");
      console.error(error);
    }
  };

  const fieldIds = [
    "ad",
    "ulusal",
    "tur",
    "tema",
    "baslama",
    "url",
    "katilimci",
    "katilimTur",
    "kaliteKulturu",
    "duzenleyenBirim",
    "faaliyetYurutucusu",
    "kariyerMerkezi",
    "bagimlilik",
    "dezavantajli",
    "sektorIsbirligi",
    "yarisma",
  ];

  const kalkinmaAciklamalari = {
    "Yoksulluğa Son": "Yoksulluğun tüm biçimlerini her yerde sona erdirmek",
    "Açlığa Son":
      "Açlığı bitirmek, gıda güvenliğine ve iyi beslenmeye ulaşmak ve sürdürülebilir tarımı desteklemek.",
    "Sağlık ve Kaliteli Yaşam":
      " Sağlıklı ve kaliteli yaşamı her yaşta güvence altına almak",
    "Nitelikli Eğitim":
      "Kapsayıcı ve hakkaniyete dayanan nitelikli eğitimi sağlamak ve herkes için yaşam boyu öğrenim fırsatlarını teşvik etmek.",
    "Toplumsal Cinsiyet Eşitliği":
      "Cinsiyet eşitliğini sağlamak ve tüm kadınlar ile kız çocuklarını güçlendirmek.",
    "Temiz Su ve Sanitasyon":
      "Herkes için erişilebilir su ve atıksu hizmetlerini ve sürdürülebilir su yönetimini güvence altına almak.",
    "Erişilebilir ve Temiz Enerji":
      "Herkes için karşılanabilir, güvenilir, sürdürülebilir ve modern enerjiye erişimi sağlamak.",
    "İnsana Yakışır İş ve Ekonomik Büyüme":
      "İstikrarlı, kapsayıcı ve sürdürülebilir ekonomik büyümeyi, tam ve üretken istihdamı ve herkes için insana yakışır işleri desteklemek.",
    "Sanayi, Yenilikçilik ve Altyapı":
      "Dayanıklı altyapılar tesis etmek, kapsayıcı ve sürdürülebilir sanayileşmeyi desteklemek ve yenilikçiliği güçlendirmek.",
    "Eşitsizliklerin Azaltılması":
      "Ülkelerin içinde ve arasında eşitsizlikleri azaltmak.",
    "Sürdürülebilir Şehirler ve Topluluklar":
      "Şehirleri ve insan yerleşimlerini kapsayıcı, güvenli, dayanıklı ve sürdürülebilir kılmak.",
    "Sorumlu Üretim ve Tüketim":
      "Sürdürülebilir üretim ve tüketim kalıplarını sağlamak.",
    "İklim Eylemi":
      " İklim değişikliği ve etkileri ile mücadele için acilen eyleme geçmek.",
    "Sudaki Yaşam":
      "Sürdürülebilir kalkınma için okyanusları, denizleri ve deniz kaynaklarını korumak ve sürdürülebilir kullanmak.",
    "Karasal Yaşam":
      "Karasal ekosistemleri korumak, iyileştirmek ve sürdürülebilir kullanımını desteklemek; sürdürülebilir orman yönetimini sağlamak; çölleşme ile mücadele etmek; arazi bozunumunu durdurmak ve tersine çevirmek; biyolojik çeşitlilik kaybını engellemek.",
    "Barış, Adalet ve Güçlü Kurumlar":
      "Sürdürülebilir kalkınma için barışçıl ve kapsayıcı toplumlar tesis etmek, herkes için adalete erişimi sağlamak ve her düzeyde etkili, hesap verebilir ve kapsayıcı kurumlar oluşturmak. ",
    "Amaçlar İçin Ortaklıklar":
      "Uygulama araçlarını güçlendirmek ve sürdürülebilir kalkınma için küresel ortaklığı canlandırmak.",
  };
  const kalkinmaOptions = Object.keys(kalkinmaAciklamalari).map((key) => ({
    value: key,
    label: key,
  }));
  return (
    <>
      <div className="form-container">
        <FormProgressBar fieldIds={fieldIds} kalkinmaSecim={kalkinmaSecim} />

        <form className="form-fields" onSubmit={handleSubmit} method="POST">
          <FormSection legend="Genel Bilgiler">
            <InputField
              id="ad"
              label="Toplantının / Faaliyetin Adı:"
              placeholder="Etkinlik adını giriniz..."
            />
            <SelectField
              id="ulusal"
              label="Ulusal / Uluslararası:"
              options={["Ulusal", "Uluslararası"]}
            />
            <SelectField
              id="tur"
              label="Faaliyet Türü:"
              options={[
                "Çalıştay",
                "Konferans",
                "Kongre",
                "Panel",
                "Sanatsal Sergi",
                "Seminer",
                "Sempozyum",
                "E-Toplantı",
                "Mezun-Öğrenci Buluşması",
                "Sektör-Öğrenci Buluşması",
                "Diğer Etkinlikler",
              ]}
            />
            <div className="visibility-form-container">
              <label>Sürdürülebilir Kalkınma Amacı:</label>
              <Select
                className="my-select"
                classNamePrefix="my-select"
                isMulti
                placeholder="Seçiniz"
                options={kalkinmaOptions}
                value={kalkinmaOptions.filter((opt) =>
                  kalkinmaSecim.includes(opt.value)
                )}
                onChange={(selectedOptions) =>
                  setKalkinmaSecim(selectedOptions.map((opt) => opt.value))
                }
              />
            </div>

            {kalkinmaSecim.length > 0 && (
              <div className="info-box">
                {kalkinmaSecim.map((secim) => (
                  <div key={secim}>
                    <strong>{secim}</strong>
                    <p>{kalkinmaAciklamalari[secim]}</p>
                  </div>
                ))}
              </div>
            )}

            <SelectField
              id="tema"
              label="Etkinlik Teması:"
              options={[
                "Akademik Çalışmalar",
                "Sosyo-Kültürel",
                "Spor",
                "Sürdürülebilirlik",
                "Teknoloji ve İnovasyon",
                "Toplumsal Fayda",
                "Girişimcilik",
                "Bilim İletişimi",
                "Diğer",
              ]}
            />
            <InputField id="baslama" label="Başlama Tarihi:" type="date" />
            <InputField
              id="url"
              label="Etkinliğe Ait Web Sitesi:"
              type="url"
              placeholder="https://"
            />
          </FormSection>

          <FormSection legend="Katılımcı Bilgileri">
            <InputField
              id="katilimci"
              label="Yurt Dışından Katılımcı Sayısı:"
              type="number"
              placeholder="0"
            />
            <SelectField
              id="katilimTur"
              label="Katılım Türü:"
              options={[
                "Tek Düzenleyici",
                "Düzenleyici Ortak",
                "Kurumsal Katılımcı",
                "Kurumsal Ziyaretçi",
              ]}
            />
          </FormSection>

          <FormSection legend="Detaylar">
            <SelectField
              id="kaliteKulturu"
              label="Kalite Kültürünü Yaygınlaştırma Amacı Var mı:"
              options={["Evet", "Hayır"]}
            />
            <InputField
              id="duzenleyenBirim"
              label="Düzenleyen Birim:"
              placeholder="Birimin adını giriniz..."
            />
            <SelectField
              id="faaliyetYurutucusu"
              label="Faaliyet Yürütücüsü:"
              options={[
                "Öğrenci",
                "Akademik Personel",
                "İdari Personel",
                "Kurumsal Kimlik",
              ]}
            />
            <SelectField
              id="kariyerMerkezi"
              label="Kariyer Merkezi Faaliyeti mi:"
              options={["Evet", "Hayır"]}
            />
            <SelectField
              id="bagimlilik"
              label="Bağımlılıkla Mücadele Faaliyeti mi:"
              options={["Evet", "Hayır"]}
            />
            <SelectField
              id="dezavantajli"
              label="Dezavantajlı Gruplara Yönelik Faaliyet mi:"
              options={["Evet", "Hayır"]}
            />
            <SelectField
              id="sektorIsbirligi"
              label="Sektör İş Birliği Var mı:"
              options={["Evet", "Hayır"]}
            />
            <SelectField
              id="yarisma"
              label="Etkinlik Yarışma İçeriyor mu:"
              options={[
                "Yarışma İçeriyor",
                "Yarışma İçermiyor",
                "Yarışma ve Madalya Ödülü İçeriyor",
                "Yarışma ve Diğer Ödülü İçeriyor",
                "Yarışmasız Plaket vb. Ödül İçeriyor",
              ]}
            />
          </FormSection>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EventForm;
