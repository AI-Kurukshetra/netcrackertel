import { ModulePage } from "@/components/module-page";
import { moduleConfig } from "@/lib/module-config";

export default function PerformancePage() {
  return <ModulePage endpoint="performance" title={moduleConfig.performance.title} description={moduleConfig.performance.description} />;
}
