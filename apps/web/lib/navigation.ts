import {
  Activity,
  BellRing,
  Boxes,
  BrainCircuit,
  ChartColumn,
  CreditCard,
  DatabaseZap,
  FileText,
  LayoutDashboard,
  PackageSearch,
  RadioTower,
  Route,
  ShieldAlert,
  Users
} from "lucide-react";

export const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, resource: "dashboard" },
  { href: "/customers", label: "Customers", icon: Users, resource: "customers" },
  { href: "/products", label: "Products", icon: PackageSearch, resource: "products" },
  { href: "/orders", label: "Orders", icon: Route, resource: "orders" },
  { href: "/billing", label: "Billing", icon: CreditCard, resource: "billing" },
  { href: "/inventory", label: "Inventory", icon: Boxes, resource: "inventory" },
  { href: "/services", label: "Services", icon: DatabaseZap, resource: "services" },
  { href: "/faults", label: "Faults", icon: ShieldAlert, resource: "faults" },
  { href: "/performance", label: "Performance", icon: Activity, resource: "performance" },
  { href: "/workflows", label: "Workflows", icon: RadioTower, resource: "workflows" },
  { href: "/analytics", label: "Analytics", icon: ChartColumn, resource: "analytics" },
  { href: "/documents", label: "Documents", icon: FileText, resource: "documents" },
  { href: "/admin", label: "Admin", icon: BrainCircuit, resource: "admin" },
  { href: "/notifications", label: "Notifications", icon: BellRing, resource: "notifications" }
] as const;
