import "./globals.css";

export const metadata = {
  title: "ClearFund — On-chain Transparency for Public Funds",
  description:
    "ClearFund brings on-chain transparency to public development funds through smart-contract-locked budgets, milestone-based releases, and real-time public auditing.",
  keywords: ["blockchain", "public funds", "transparency", "smart contracts", "clearfund"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
