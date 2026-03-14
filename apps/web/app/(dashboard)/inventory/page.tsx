import { ModulePage } from "@/components/module-page";
import { moduleConfig } from "@/lib/module-config";

export default function InventoryPage() {
  return <ModulePage endpoint="inventory" title={moduleConfig.inventory.title} description={moduleConfig.inventory.description} />;
}
