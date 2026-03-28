"use client";

export default function ProjectListCard({
  projectId,
  title,
  badge,
  meta = [],
  description,
  budgetLabel = "Max Budget",
  budgetValue,
  headerDivider = false,
  children
}) {
  return (
    <div
      className="avail-card"
      style={{
        background: "var(--card-bg)",
        borderRadius: "20px",
        border: "1px solid var(--border-color)",
        overflow: "hidden",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease"
      }}
    >
      <div
        className="avail-card-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "2rem",
          borderBottom: headerDivider ? "1px solid var(--border-color)" : "none"
        }}
      >
        <div style={{ flex: 1 }}>
          {(badge || projectId) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem"
              }}
            >
              {badge ? (
                <span
                  className="avail-bid-badge"
                  style={{
                    background: badge.background,
                    color: badge.color,
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    textTransform: "uppercase"
                  }}
                >
                  {badge.icon ? <i className={`fa-solid ${badge.icon}`}></i> : null}
                  {badge.label}
                </span>
              ) : null}
              {projectId ? (
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {projectId}
                </span>
              ) : null}
            </div>
          )}

          <h3
            className="avail-title"
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "0.5rem"
            }}
          >
            {title}
          </h3>

          {meta.length > 0 ? (
            <div
              className="avail-meta"
              style={{
                display: "flex",
                gap: "1.5rem",
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                flexWrap: "wrap"
              }}
            >
              {meta.map((item, idx) => (
                <span key={`${item.label}-${idx}`}>
                  {item.icon ? <i className={`fa-solid ${item.icon}`} style={{ marginRight: "6px" }}></i> : null}
                  {item.label}
                </span>
              ))}
            </div>
          ) : null}

          {description ? (
            <p
              className="avail-desc"
              style={{
                marginTop: "1.25rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6"
              }}
            >
              {description}
            </p>
          ) : null}
        </div>

        {budgetValue !== undefined ? (
          <div
            className="avail-budget-box"
            style={{
              textAlign: "right",
              background: "var(--bg-secondary)",
              padding: "1.25rem",
              borderRadius: "16px",
              border: "1px solid var(--border-color)"
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                fontWeight: "800",
                color: "var(--text-secondary)",
                marginBottom: "4px"
              }}
            >
              {budgetLabel}
            </span>
            <strong style={{ fontSize: "1.5rem", color: "var(--primary-color)" }}>
              {budgetValue}
            </strong>
          </div>
        ) : null}
      </div>

      {children ? <div style={{ padding: "0 2rem 2rem" }}>{children}</div> : null}
    </div>
  );
}
