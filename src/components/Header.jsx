import Logo from "../assets/logo.png";
export default function Header(promps) {
  return (
    <header id="main-header">
      <div id="main-title">
        <img src={Logo} alt="" />
        <h1>ETKİNLİK VERİ GİRİŞİ</h1>
      </div>
    </header>
  );
}
