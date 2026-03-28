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
    { href: "/approver/assigned", label: "Assigned Project" },
    { href: "/approver/pending", label: "Pending reviews" },
    { href: "/approver/decisions", label: "Decisions" },
    { href: "/approver/history", label: "History" }
  ],
  public: [{ href: "/dashboard?role=public", label: "Public Ledger" }]
};