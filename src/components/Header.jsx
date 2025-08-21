import Logo from "../assets/logo.png";
import "./styles/header.css";
export default function Header(promps) {
  return (
    <header id="main-header">
      <div id="main-title">
        <img src={Logo} alt="" />
        <h1>ADMİN PANELİ</h1>
      </div>
    </header>
  );
}
