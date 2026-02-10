import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * ✅ 백엔드 붙기 전 데모용 Invite 페이지
 * - partnerId 없는 유저가 들어오는 페이지
 * - "초대 코드 생성" + "상대 코드 입력" UI
 * - MOCK 모드: 연결 성공 버튼으로 partnerId를 세팅해서 /dashboard로 이동 테스트 가능
 */

export default function Invite() {
  const navigate = useNavigate();
  const { auth, setAuth, clearAuth } = useAuth();

  const [partnerCode, setPartnerCode] = useState("");
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const myInviteCode = useMemo(() => {
    // 데모용 코드: user id 기반으로 생성 (없으면 랜덤)
    const base = auth.user?.id ?? "guest";
    return `INV-${base.slice(0, 6).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
  }, [auth.user?.id]);

  const copyToClipboard = async () => {
    setStatusMsg("");
    setErrorMsg("");
    try {
      await navigator.clipboard.writeText(myInviteCode);
      setStatusMsg("Copied invite code!");
    } catch {
      setErrorMsg("Copy failed. Please copy manually.");
    }
  };

  const handleConnectMock = () => {
    setStatusMsg("");
    setErrorMsg("");

    if (!auth.token || !auth.user) {
      setErrorMsg("You must be logged in.");
      return;
    }

    if (partnerCode.trim().length < 4) {
      setErrorMsg("Please enter a valid partner code.");
      return;
    }

    // ✅ MOCK 연결: partnerId 세팅 → PartnerGate 통과 가능
    setAuth({
      token: auth.token,
      user: {
        ...auth.user,
        partnerId: "mock_partner_id",
      },
    });

    setStatusMsg("Partner connected! Redirecting to dashboard...");
    setTimeout(() => navigate("/dashboard", { replace: true }), 500);
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Connect with your partner</h2>
            <p style={styles.subtitle}>
              Share an invite code or enter your partner&apos;s code to link accounts.
            </p>
          </div>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            Log out
          </button>
        </div>

        {/* Status / Error */}
        {(statusMsg || errorMsg) && (
          <div
            role="alert"
            style={errorMsg ? styles.alertError : styles.alertSuccess}
          >
            {errorMsg || statusMsg}
          </div>
        )}

        {/* My Code */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Your invite code</h3>
          <div style={styles.codeRow}>
            <div style={styles.codeBox}>{myInviteCode}</div>
            <button onClick={copyToClipboard} style={styles.primaryBtn}>
              Copy
            </button>
          </div>
          <p style={styles.helpText}>
            Send this code to your partner so they can connect with you.
          </p>
        </section>

        <div style={styles.divider} />

        {/* Enter Partner Code */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Enter partner&apos;s code</h3>

          <label style={styles.label}>
            Partner code
            <input
              style={styles.input}
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value)}
              placeholder="e.g. INV-ABCD-1234"
            />
          </label>

          <button onClick={handleConnectMock} style={styles.primaryBtnWide}>
            Connect (Mock)
          </button>

          <p style={styles.helpText}>
            *Mock mode: This will set a partnerId locally so you can test the
            dashboard flow without backend.
          </p>
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "#f5f7fb",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  },
  card: {
    width: "min(720px, 100%)",
    background: "#fff",
    borderRadius: 14,
    padding: 28,
    boxShadow: "0 18px 40px rgba(10, 20, 40, 0.12)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  title: { margin: 0, fontSize: 24, fontWeight: 900, color: "#0f172a" },
  subtitle: { margin: "8px 0 0", fontSize: 13, color: "#64748b" },
  logoutBtn: {
    height: 36,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "0 12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  alertSuccess: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 14,
  },
  alertError: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 14,
  },
  section: { marginTop: 12 },
  sectionTitle: {
    margin: "0 0 10px",
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
  },
  codeRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "center",
  },
  codeBox: {
    height: 44,
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 13,
    fontWeight: 900,
    color: "#0f172a",
  },
  divider: { height: 1, background: "#e5e7eb", margin: "18px 0" },
  label: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 12,
    color: "#334155",
    fontWeight: 800,
    marginBottom: 14,
  },
  input: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    padding: "0 14px",
    fontSize: 14,
    outline: "none",
  },
  primaryBtn: {
    height: 44,
    borderRadius: 10,
    border: "none",
    background: "#1f6bff",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    padding: "0 14px",
  },
  primaryBtnWide: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: "none",
    background: "#1f6bff",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  helpText: { margin: "10px 0 0", fontSize: 12, color: "#64748b" },
};
