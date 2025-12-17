import React, { useState, useRef, useEffect } from "react";
import "../styles/settings.css";
import { Navigate, useNavigate } from "react-router-dom";

interface AuthUser {
  id?: number;
  password?: string;
  email: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
}

type SettingsTab = "account" | "help" | "delete";

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("account");

  const [pwdForm, setPwdForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const accountTabRef = useRef<HTMLButtonElement | null>(null);
  const helpTabRef = useRef<HTMLButtonElement | null>(null);
  const deleteTabRef = useRef<HTMLButtonElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const changePasswordOnServer = async (params: {
    currentPassword: string;
    newPassword: string;
    confirmationPassword?: string;
  }) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch("http://localhost:3001/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: params.currentPassword,
        newPassword: params.newPassword,
        confirmationPassword: params.confirmationPassword,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Password change failed");
    }
  };

  const deleteAccountOnServer = async (params: { password: string }) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const res = await fetch("http://localhost:3001/delete-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: params.password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Account deletion failed");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPwdForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPwdError(null);
    setPwdSuccess(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    const { current, next, confirm } = pwdForm;

    if (!current || !next || !confirm) {
      setPwdError("Please fill in all fields.");
      return;
    }

    if (next.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }

    if (next !== confirm) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    if (!user?.email) {
      setPwdError("You are not logged in. Please log in and try again.");
      return;
    }

    try {
      await changePasswordOnServer({
        currentPassword: current,
        newPassword: next,
        confirmationPassword: confirm,
      });

      setPwdSuccess("Password changed successfully.");
    } catch (err: any) {
      console.error(err);
      setPwdError(
        err?.message || "An error occurred while changing the password."
      );
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!user?.email) {
      setPwdError("You are not logged in. Please log in and try again.");
      return;
    }

    if (!deleteConfirm) {
      setPwdError("Please enter your password for confirmation.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password: deleteConfirm }),
      });

      const resp = await res.json();

      if (!res.ok) {
        setPwdError(resp.error);
        return;
      }

      setPwdSuccess(resp.message);

      localStorage.removeItem("token");
      onClose();
      navigate("/login", { replace: true });
    } catch (err: any) {
      console.error(err);
      setPwdError(
        err?.message || "An error occurred while deleting the account."
      );
    }
  };

  const handleClose = () => {
    setSettingsTab("account");
    setPwdForm({ current: "", next: "", confirm: "" });
    setDeleteConfirm("");
    setPwdError(null);
    setPwdSuccess(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const updateIndicator = () => {
      let activeEl: HTMLButtonElement | null = null;

      if (settingsTab === "account") activeEl = accountTabRef.current;
      else if (settingsTab === "help") activeEl = helpTabRef.current;
      else activeEl = deleteTabRef.current;

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
  }, [settingsTab, isOpen]);

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
      <div className="modal" data-tab={settingsTab}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close settings"
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

        <div className="modal-tabs">
          <div className="tab-indicator" style={indicatorStyle} />

          <button
            type="button"
            ref={accountTabRef}
            className={`modal-tab ${settingsTab === "account" ? "active" : ""}`}
            onClick={() => {
              setSettingsTab("account");
              setPwdError(null);
              setPwdSuccess(null);
            }}
          >
            Account
          </button>

          <button
            type="button"
            ref={helpTabRef}
            className={`modal-tab ${settingsTab === "help" ? "active" : ""}`}
            onClick={() => {
              setSettingsTab("help");
              setPwdError(null);
              setPwdSuccess(null);
            }}
          >
            Help
          </button>

          <button
            type="button"
            ref={deleteTabRef}
            className={`modal-tab ${settingsTab === "delete" ? "active" : ""}`}
            onClick={() => {
              setSettingsTab("delete");
              setPwdError(null);
              setPwdSuccess(null);
            }}
          >
            Delete Account
          </button>
        </div>

        <div className="modal-body">
          {settingsTab === "account" && (
            <div className="tab-content">
              <form
                className="modal-form"
                onSubmit={handlePasswordSubmit}
                noValidate
              >
                {user?.email && (
                  <p className="field-hint" style={{ marginBottom: 6 }}>
                    Logged in as: <strong>{user.email}</strong>
                  </p>
                )}

                <div className="form-group">
                  <label className="field-label" htmlFor="current">
                    Current password
                  </label>
                  <input
                    id="current"
                    name="current"
                    type="password"
                    className="field-input"
                    value={pwdForm.current}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="next">
                    New password
                  </label>
                  <input
                    id="next"
                    name="next"
                    type="password"
                    className="field-input"
                    value={pwdForm.next}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                  />
                  <p className="field-hint">
                    Minimum 8 characters. Recommended: combination of letters,
                    numbers, and symbols.
                  </p>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="confirm">
                    Confirm new password
                  </label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    className="field-input"
                    value={pwdForm.confirm}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                  />
                </div>

                {pwdError && settingsTab === "account" && (
                  <div className="form-status form-status-error">
                    {pwdError}
                  </div>
                )}

                {pwdSuccess && settingsTab === "account" && (
                  <div className="form-status form-status-success">
                    {pwdSuccess}
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="primary-btn">
                    Save password
                  </button>
                </div>
              </form>
            </div>
          )}

          {settingsTab === "help" && (
            <div className="tab-content">
              <div className="modal-help">
                <div className="modal-help-section">
                  <h3>How to use Nexora?</h3>
                  <p>
                    Simply ask a question or paste your code. Nexora will try to
                    explain, optimize, or enhance your code in an understandable
                    way.
                  </p>
                </div>

                <div className="modal-help-section">
                  <h3>Types of questions</h3>
                  <ul>
                    <li>Debugging and finding bugs in code.</li>
                    <li>Writing new components or functions.</li>
                    <li>Explanations of TS/JS/React/Node concepts.</li>
                  </ul>
                </div>

                <div className="modal-help-section">
                  <h3>Need extra help?</h3>
                  <p>
                    If you have a specific problem, try to describe the context
                    (stack, versions, error messages) as clearly as possible and
                    Nexora will give you a more precise solution.
                  </p>
                  <div className="pdf-card">
                    <div className="pdf-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M8 13h8" />
                        <path d="M8 17h5" />
                      </svg>
                    </div>

                    <div className="pdf-meta">
                      <div className="pdf-title">Nexora Documentation</div>
                      <div className="pdf-subtitle">PDF • User guide & setup instructions</div>
                    </div>

                    <div className="pdf-actions">
                      <a
                        href="/docs/nexora-help.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-btn"
                      >
                        Open
                      </a>

                      <a
                        href="/docs/nexora-help.pdf"
                        download
                        className="pdf-btn pdf-btn--primary"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === "delete" && (
            <div className="tab-content">
              <form className="modal-form" onSubmit={handleDeleteSubmit}>
                <h3 className="danger-title">Permanent account deletion</h3>
                <p className="field-hint">
                  This action is <strong>irreversible</strong>. All data linked
                  to your account will be deleted. Enter your email for
                  confirmation.
                </p>

                {user?.email && (
                  <p className="field-hint" style={{ marginBottom: 6 }}>
                    Your email: <strong>{user.email}</strong>
                  </p>
                )}

                <div className="form-group">
                  <label className="field-label" htmlFor="delete-confirm">
                    Confirm password
                  </label>
                  <input
                    id="delete-confirm"
                    name="delete-confirm"
                    type="password"
                    className="field-input"
                    value={deleteConfirm}
                    onChange={(e) => {
                      setDeleteConfirm(e.target.value);
                      setPwdError(null);
                      setPwdSuccess(null);
                    }}
                    placeholder="Enter your password"
                  />
                </div>

                {pwdError && settingsTab === "delete" && (
                  <div className="form-status form-status-error">
                    {pwdError}
                  </div>
                )}

                {pwdSuccess && settingsTab === "delete" && (
                  <div className="form-status form-status-success">
                    {pwdSuccess}
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="danger-btn">
                    Permanently delete account
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
