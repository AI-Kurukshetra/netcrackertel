import { ModulePage } from "@/components/module-page";
import { moduleConfig } from "@/lib/module-config";

export default function NotificationsPage() {
  return <ModulePage endpoint="notifications" title={moduleConfig.notifications.title} description={moduleConfig.notifications.description} />;
}
