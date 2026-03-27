"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginCard.module.css";

const Icons = {
  Bank: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="20" width="20" height="2"></rect>
      <rect x="4" y="10" width="16" height="10"></rect>
      <path d="M12 2L2 8v2h20V8L12 2z"></path>
      <path d="M12 10v10"></path>
      <path d="M8 10v10"></path>
      <path d="M16 10v10"></path>
    </svg>
  ),
  Briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  Check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  ),
  Users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  Wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
    </svg>
  )
};

const ROLES = [
  {
    id: "government",
    label: "Government / Approvers",
    icon: Icons.Bank,
    subRoles: [
      { id: "agency", label: "Government Administrator", route: "/gov" },
      { id: "approver", label: "Independent Approver", route: "/approver" }
    ]
  },
  {
    id: "contractor",
    label: "Registered Contractor",
    icon: Icons.Briefcase,
    route: "/contractor",
  },
  {
    id: "public",
    label: "Public Citizen",
    icon: Icons.Users,
    route: "/dashboard/index.html?role=public",
  },
];

export default function LoginCard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSubRole, setSelectedSubRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  function handleEmailChange(e) {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: "" }));
    setGeneralError("");
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: "" }));
    setGeneralError("");
  }

  function handleRoleSelect(roleId) {
    if (selectedRole !== roleId) {
      setSelectedRole(roleId);
      setSelectedSubRole(null);
    }
    setErrors((prev) => ({ ...prev, role: "" }));
    setGeneralError("");
  }

  function validate() {
    const newErrors = {};
    if (!selectedRole) {
      newErrors.role = "Role selection is mandatory for authentication.";
    } else if (selectedRole === "government" && !selectedSubRole) {
      newErrors.role = "Please select a specific clearance level.";
    }
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid official email format.";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters for security.";
    }
    
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneralError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    // Simulate secure network authentication
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setLoading(false);

    const role = ROLES.find((r) => r.id === selectedRole);
    if (role) {
      let routePath = "";
      if (role.subRoles) {
        const sub = role.subRoles.find(s => s.id === selectedSubRole);
        if (sub) routePath = sub.route;
      } else {
        routePath = role.route;
      }

      if (routePath) {
        if (routePath.startsWith("http") || routePath.startsWith("/dashboard")) {
          window.location.href = routePath;
        } else {
          router.push(routePath);
        }
      }
    }
  }

  return (
    <div className={styles.splitLayout}>
      {/* Left branding panel */}
      <div className={styles.brandingPanel}>
        <div className={styles.brandingContent}>
          <div className={styles.corpLogo}>
            <div className={styles.logoMark}>CF</div>
            <span className={styles.logoType}>ClearFund</span>
          </div>
          <div className={styles.heroText}>
            <h2>Transparency. Trust. Accountability.</h2>
            <p>
              The unified portal for managing, tracking, and auditing public development funds through immutable ledger technology.
            </p>
          </div>
        </div>
        <div className={styles.footerLegal}>
          <p>© {new Date().getFullYear()} ClearFund Public Framework.</p>
          <p>Authorized access only. Monitored environment.</p>
        </div>
      </div>

      {/* Right login panel */}
      <div className={styles.authPanel}>
        <div className={styles.authContainer}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Secure Login</h1>
            <p className={styles.authSubtitle}>Authenticate to access your designated workspace.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {generalError && (
              <div className={styles.errorBanner}>
                {generalError}
              </div>
            )}

            {/* Mandatory Role Selector */}
            <div className={styles.formGroup}>
              <div className={styles.labelWrapper}>
                <label className={styles.label}>Authorization Role</label>
                <span className={styles.requiredMark}>*Required</span>
              </div>
              <div className={styles.roleList}>
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <div key={role.id} className={styles.roleGroupWrapper}>
                      <div
                        className={`${styles.roleItem} ${isSelected ? styles.roleItemSelected : ""}`}
                        onClick={() => handleRoleSelect(role.id)}
                      >
                        <div className={styles.roleIconBox}>{role.icon}</div>
                        <div className={styles.roleDetails}>
                          <span className={styles.roleName}>{role.label}</span>
                        </div>
                        <div className={`${styles.radioCircle} ${isSelected ? styles.radioChecked : ""}`} />
                      </div>

                      {/* Sub-Roles Expansion */}
                      {isSelected && role.subRoles && (
                        <div className={styles.subRoleContainer}>
                          {role.subRoles.map(sub => (
                            <div 
                              key={sub.id}
                              className={`${styles.subRoleItem} ${selectedSubRole === sub.id ? styles.subRoleSelected : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubRole(sub.id);
                                setErrors(prev => ({ ...prev, role: "" }));
                                setGeneralError("");
                              }}
                            >
                              <div className={`${styles.radioCircle} ${styles.radioCircleSmall} ${selectedSubRole === sub.id ? styles.radioChecked : ""}`} />
                              <span className={styles.subRoleName}>{sub.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.role && <span className={styles.errorText}>{errors.role}</span>}
            </div>

            <div className={styles.credentialsGrid}>
              {/* Email */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="login-email">Official Email</label>
                <input
                  id="login-email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  type="email"
                  placeholder="name@domain.gov.in"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              {/* Password */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  autoComplete="current-password"
                />
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>
            </div>

            <button
              className={styles.primaryBtn}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  Authenticating...
                </span>
              ) : (
                "Authenticate"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
