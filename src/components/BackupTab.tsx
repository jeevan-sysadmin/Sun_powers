import React from "react";
import { FiClock, FiDownload, FiDatabase } from "react-icons/fi";

interface BackupHistoryItem {
  id: number;
  fileName: string;
  createdAt: string;
}

interface BackupTabProps {
  onTakeBackup: () => void;
  isTakingBackup: boolean;
  backupHistory: BackupHistoryItem[];
}

const BackupTab: React.FC<BackupTabProps> = ({ onTakeBackup, isTakingBackup, backupHistory }) => {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: "0 0 10px 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiDatabase />
          Database Backup
        </h2>
        <p style={{ margin: "0 0 14px 0", color: "#64748b" }}>
          Click below to download your `sun_powers.sql` backup file.
        </p>
        <button
          onClick={onTakeBackup}
          disabled={isTakingBackup}
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            border: "none",
            borderRadius: "10px",
            padding: "11px 18px",
            color: "#fff",
            fontWeight: 700,
            cursor: isTakingBackup ? "not-allowed" : "pointer",
            opacity: isTakingBackup ? 0.7 : 1,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FiDownload />
          {isTakingBackup ? "Taking Backup..." : "Take Backup"}
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "20px",
        }}
      >
        <h3 style={{ margin: "0 0 14px 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiClock />
          Backup History
        </h3>
        {backupHistory.length === 0 ? (
          <p style={{ margin: 0, color: "#64748b" }}>No backup history yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {backupHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#0f172a", fontWeight: 600 }}>{item.fileName}</span>
                <span style={{ color: "#475569", fontSize: "13px" }}>{formatDate(item.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupTab;
