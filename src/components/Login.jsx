import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/login-page.css"; // CSS dosyasını import et

export default function Login({ setIsAuth }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    // Gerçekçi loading efekti için küçük delay
    setTimeout(() => {
      if (code === "kalite53") {
        // ✅ giriş kodun
        setIsAuth(true);
        navigate("/"); // Ana sayfaya yönlendir
      } else {
        setError("Hatalı kod! Lütfen tekrar deneyin.");
      }
      setIsLoading(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Giriş Yap</h2>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <input
              type="password"
              className="login-input"
              placeholder="Giriş kodunu girin"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>

          <button
            className={`login-button ${isLoading ? "loading" : ""}`}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {!isLoading && "Giriş Yap"}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
}
