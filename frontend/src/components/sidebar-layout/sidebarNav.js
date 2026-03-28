export const SIDEBAR_NAV = {
  government: [
    { href: "/dashboard?role=government", label: "Home" },
    { href: "/gov/create", label: "Create Project" },
    { label: "Manage Bids", soon: true },
    { label: "Assign Approvers", soon: true },
    { label: "Fund Escrow", soon: true },
    { label: "Milestone Setup", soon: true },
    { label: "Project Status", soon: true },
    { label: "Audit Logs", soon: true }
  ],
  contractor: [
    { href: "/dashboard?role=contractor", label: "Home" },
    { href: "/contractor/available", label: "Available Projects" },
    { href: "/contractor/bids", label: "My Bids" },
    { label: "Workdesk", soon: true },
    { href: "/contractor/proofs", label: "Submit Proof" },
    { label: "Payments", soon: true },
    { href: "/contractor/stats", label: "Stats" }
  ],
  approver: [
    { href: "/dashboard?role=approver", label: "Home" },
    { label: "Assigned Projects", soon: true },
    { label: "Pending Reviews", soon: true },
    { label: "Review Workspace", soon: true },
    { label: "Decisions", soon: true },
    { label: "History", soon: true },
    { label: "Deadlines", soon: true },
    { label: "Logs", soon: true }
  ],
  public: [{ href: "/dashboard?role=public", label: "Public Ledger" }]
};
