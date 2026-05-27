export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Arist Employees",
  description: "Employee Management Admin Dashboard",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;
