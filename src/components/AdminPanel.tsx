// src/components/AdminPanel.tsx
import React, { useState, useRef, useEffect } from "react";
import "../styles/settings.css";
import "../styles/AdminPanel.css";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = "filters" | "stats" | "logs";

// Tip podatka koji ćeš kasnije dobivati iz baze
interface AdminResultRow {
  id: number;
  korisnik: string;
  uredaj: string;
  aktivnost: string;
  vrijeme: string; // npr. ISO string ili formatirani datum
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [adminTab, setAdminTab] = useState<AdminTab>("filters");

  // 4 glavna polja (filteri)
  const [aktivnost, setAktivnost] = useState("");
  const [filterKorisnika, setFilterKorisnika] = useState("");
  const [filterUredaja, setFilterUredaja] = useState("");
  const [filterAktivnosti, setFilterAktivnosti] = useState("");

  // Rezultati (kasnije iz baze)
  const [results, setResults] = useState<AdminResultRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // kratka info poruka
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // refs za tab gumbe (indikator)
  const filtersTabRef = useRef<HTMLButtonElement | null>(null);
  const statsTabRef = useRef<HTMLButtonElement | null>(null);
  const logsTabRef = useRef<HTMLButtonElement | null>(null);

  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  // ⛏️ placeholder za budući poziv prema backendu/bazi
  const fetchAdminResults = async (params: {
    aktivnost: string;
    filterKorisnika: string;
    filterUredaja: string;
    filterAktivnosti: string;
  }): Promise<AdminResultRow[]> => {
    // ❗ OVDJE ĆEŠ KASNIJE SPOJITI BAZU (API, fetch, axios, sl.)
    // Sad samo simuliramo delay + fake podatke
    console.log("Fetch iz baze (kasnije): ", params);

    await new Promise((resolve) => setTimeout(resolve, 600));

    // DEMO PODACI – kasnije zamijeni s podacima iz baze
    return [
      {
        id: 1,
        korisnik: "admin@nexora.dev",
        uredaj: "Desktop",
        aktivnost: params.aktivnost || "Pregled",
        vrijeme: "2025-12-09 21:30",
      },
      {
        id: 2,
        korisnik: "user@example.com",
        uredaj: "Mobile",
        aktivnost: params.aktivnost || "Kreiranje",
        vrijeme: "2025-12-09 21:35",
      },
    ];
  };

  const handleClose = () => {
    setAdminTab("filters");
    setAktivnost("");
    setFilterKorisnika("");
    setFilterUredaja("");
    setFilterAktivnosti("");
    setResults([]);
    setErrorMsg(null);
    setStatusMsg(null);
    setIsLoading(false);
    onClose();
  };

  const handleApplyFilters = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);
    setIsLoading(true);

    try {
      const data = await fetchAdminResults({
        aktivnost,
        filterKorisnika,
        filterUredaja,
        filterAktivnosti,
      });

      setResults(data);
      setStatusMsg(
        "Filteri su primijenjeni. Prikazujem rezultate u statistici."
      );
      setAdminTab("stats"); // automatski prebaci na Statistika tab
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err?.message || "Došlo je do greške pri dohvaćanju podataka."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Dinamičko pozicioniranje indikatora (isto kao u SettingsModalu)
  useEffect(() => {
    if (!isOpen) return;

    const updateIndicator = () => {
      let activeEl: HTMLButtonElement | null = null;

      if (adminTab === "filters") activeEl = filtersTabRef.current;
      else if (adminTab === "stats") activeEl = statsTabRef.current;
      else activeEl = logsTabRef.current;

      if (!activeEl) return;

      const { offsetLeft, offsetWidth } = activeEl;
      setIndicatorStyle({
        width: offsetWidth,
        transform: `translateX(${offsetLeft}px)`,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [adminTab, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="modal" data-tab={adminTab}>
        {/* HEADER */}
        <div className="modal-header">
          <h2>Admin panel</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Zatvori admin panel"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* TABOVI */}
        <div className="modal-tabs">
          <div className="tab-indicator" style={indicatorStyle} />

          <button
            type="button"
            ref={filtersTabRef}
            className={`modal-tab ${adminTab === "filters" ? "active" : ""}`}
            onClick={() => {
              setAdminTab("filters");
              setErrorMsg(null);
              setStatusMsg(null);
            }}
          >
            Filteri
          </button>

          <button
            type="button"
            ref={statsTabRef}
            className={`modal-tab ${adminTab === "stats" ? "active" : ""}`}
            onClick={() => {
              setAdminTab("stats");
              // ne brišemo results, samo poruke
              setErrorMsg(null);
              setStatusMsg(null);
            }}
          >
            Statistika
          </button>

          <button
            type="button"
            ref={logsTabRef}
            className={`modal-tab ${adminTab === "logs" ? "active" : ""}`}
            onClick={() => {
              setAdminTab("logs");
              setErrorMsg(null);
              setStatusMsg(null);
            }}
          >
            Logovi
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {/* TAB: FILTERI */}
          {adminTab === "filters" && (
            <div className="tab-content">
              <form className="modal-form" onSubmit={handleApplyFilters}>
                {/* AKTIVNOST */}
                <div className="form-group">
                  <label className="field-label" htmlFor="aktivnost">
                    Aktivnost
                  </label>
                  <select
                    id="aktivnost"
                    className="field-input"
                    value={aktivnost}
                    onChange={(e) => setAktivnost(e.target.value)}
                  >
                    <option value="">Odaberi aktivnost...</option>
                    <option value="pregled">Pregled</option>
                    <option value="uređivanje">Uređivanje</option>
                    <option value="brisanje">Brisanje</option>
                    <option value="kreiranje">Kreiranje</option>
                  </select>
                </div>

                {/* FILTER KORISNIKA */}
                <div className="form-group">
                  <label className="field-label" htmlFor="filterKorisnika">
                    Filter korisnika
                  </label>
                  <select
                    id="filterKorisnika"
                    className="field-input"
                    value={filterKorisnika}
                    onChange={(e) => setFilterKorisnika(e.target.value)}
                  >
                    <option value="">Svi korisnici</option>
                    <option value="admin">Admini</option>
                    <option value="standard">Standard korisnici</option>
                    <option value="guest">Gosti</option>
                  </select>
                </div>

                {/* FILTER UREĐAJA */}
                <div className="form-group">
                  <label className="field-label" htmlFor="filterUredaja">
                    Filter uređaja
                  </label>
                  <select
                    id="filterUredaja"
                    className="field-input"
                    value={filterUredaja}
                    onChange={(e) => setFilterUredaja(e.target.value)}
                  >
                    <option value="">Svi uređaji</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>

                {/* FILTER AKTIVNOSTI */}
                <div className="form-group">
                  <label className="field-label" htmlFor="filterAktivnosti">
                    Filter aktivnosti
                  </label>
                  <select
                    id="filterAktivnosti"
                    className="field-input"
                    value={filterAktivnosti}
                    onChange={(e) => setFilterAktivnosti(e.target.value)}
                  >
                    <option value="">Sve aktivnosti</option>
                    <option value="zadnjih-24h">Zadnjih 24 sata</option>
                    <option value="zadnjih-7d">Zadnjih 7 dana</option>
                    <option value="zadnjih-30d">Zadnjih 30 dana</option>
                  </select>
                </div>

                {errorMsg && (
                  <div className="form-status form-status-error">
                    {errorMsg}
                  </div>
                )}

                {statusMsg && (
                  <div className="form-status form-status-success">
                    {statusMsg}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleClose}
                  >
                    Zatvori
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? "Učitavanje..." : "Primijeni filtere"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: STATISTIKA — TABLICA REZULTATA */}
          {adminTab === "stats" && (
            <div className="tab-content">
              <div className="modal-help-section">
                <h3>Rezultati prema filtrima</h3>

                {isLoading && <p>Učitavam podatke...</p>}

                {!isLoading && results.length === 0 && (
                  <p className="field-hint">
                    Trenutno nema rezultata za odabrane filtere. Pokušaj
                    primijeniti filtere u prvom tabu.
                  </p>
                )}

                {!isLoading && results.length > 0 && (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Korisnik</th>
                          <th>Uređaj</th>
                          <th>Aktivnost</th>
                          <th>Vrijeme</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((row) => (
                          <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.korisnik}</td>
                            <td>{row.uredaj}</td>
                            <td>{row.aktivnost}</td>
                            <td>{row.vrijeme}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: LOGOVI — placeholder za kasnije */}
          {adminTab === "logs" && (
            <div className="tab-content">
              <div className="modal-help">
                <div className="modal-help-section">
                  <h3>Logovi aktivnosti</h3>
                  <p>
                    Ovdje kasnije možeš prikazivati zadnje admin akcije,
                    promjene postavki, audit logove itd.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
