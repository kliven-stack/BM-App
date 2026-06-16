import { getProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function ClientSettingsPage() {
  const profile = await getProfile();
  return (
    <div>
      <PageHeader title="Settings" description="Manage your account." />
      <SettingsForm
        initialName={profile?.name ?? ""}
        email={profile?.email ?? ""}
      />
    </div>
  );
}
