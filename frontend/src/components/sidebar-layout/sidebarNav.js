export const SIDEBAR_NAV = {
  government: [
    { href: "/dashboard?role=government", label: "Home" },
    { href: "/gov/create", label: "Create Project" },
    { href: "/gov/bids", label: "Manage Bids" },
    { href: "/gov/assign", label: "Assign Approvers" },
    { href: "/dashboard?role=government", label: "Project Status" }
  ],
  contractor: [
    { href: "/dashboard?role=contractor", label: "Home" },
    { href: "/contractor/available", label: "Available Projects" },
    { href: "/contractor/bids", label: "My Bids" },
    { href: "/contractor/proofs", label: "Execution" },
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
