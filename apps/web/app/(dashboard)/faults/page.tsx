import { ModulePage } from "@/components/module-page";
import { moduleConfig } from "@/lib/module-config";

export default function FaultsPage() {
  return <ModulePage endpoint="faults" title={moduleConfig.faults.title} description={moduleConfig.faults.description} />;
}
