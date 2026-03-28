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
    { label: "Available Projects", soon: true },
    { label: "My Bids", soon: true },
    { label: "Workdesk", soon: true },
    { label: "Submit Proof", soon: true },
    { label: "Payments", soon: true },
    { label: "Stats", soon: true }
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
