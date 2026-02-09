import { Button } from "@/components/ui/button";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import ProfileSettings from "../components/settings/ProfileSettings";

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your account and application preferences.
          </p>
        </header>

        <div className="space-y-12">
          {/* Profile Settings */}
          <ProfileSettings />

          {/* Appearance Settings */}
          <AppearanceSettings />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
