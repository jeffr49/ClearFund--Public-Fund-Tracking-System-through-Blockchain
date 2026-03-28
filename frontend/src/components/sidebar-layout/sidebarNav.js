/** Nav entries for the role sidebar. `href` enables Next routing; `soon` shows a non-link placeholder. */
export const SIDEBAR_NAV = {
  government: [
    { href: "/gov", label: "Home" },
    { href: "/gov/create", label: "Create Project" },
    { label: "Manage Bids", soon: true },
    { label: "Assign Approvers", soon: true },
    { label: "Fund Escrow", soon: true },
    { label: "Milestone Setup", soon: true },
    { label: "Project Status", soon: true },
    { label: "Audit Logs", soon: true }
  ],
  contractor: [
    { href: "/contractor", label: "Home" },
    { label: "Available Projects", soon: true },
    { label: "My Bids", soon: true },
    { label: "Workdesk", soon: true },
    { label: "Submit Proof", soon: true },
    { label: "Payments", soon: true },
    { label: "Stats", soon: true }
  ],
  approver: [
    { href: "/approver", label: "Home" },
    { label: "Assigned Projects", soon: true },
    { label: "Pending Reviews", soon: true },
    { label: "Review Workspace", soon: true },
    { label: "Decisions", soon: true },
    { label: "History", soon: true },
    { label: "Deadlines", soon: true },
    { label: "Logs", soon: true }
  ],
  public: [{ href: "/public", label: "Public Ledger" }]
};
