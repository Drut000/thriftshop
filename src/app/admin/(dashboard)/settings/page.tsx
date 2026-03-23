import { Settings, Construction } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-cream-50 border border-cream-200 px-6 py-12 text-center">
        <Construction className="w-12 h-12 mx-auto text-espresso-300 mb-4" />
        <h2 className="text-xl font-display text-espresso-900 mb-2">
          Settings Coming Soon
        </h2>
        <p className="text-espresso-500 max-w-md mx-auto">
          Store settings, payment configuration, and other options will be available here in a future update.
        </p>
      </div>

      {/* Placeholder settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-cream-50 border border-cream-200 p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-espresso-500" />
            <h3 className="font-medium text-espresso-900">Store Information</h3>
          </div>
          <p className="text-sm text-espresso-500">
            Store name, contact email, address...
          </p>
        </div>

        <div className="bg-cream-50 border border-cream-200 p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-espresso-500" />
            <h3 className="font-medium text-espresso-900">Payment Settings</h3>
          </div>
          <p className="text-sm text-espresso-500">
            Stripe configuration, currency, tax settings...
          </p>
        </div>

        <div className="bg-cream-50 border border-cream-200 p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-espresso-500" />
            <h3 className="font-medium text-espresso-900">Email Templates</h3>
          </div>
          <p className="text-sm text-espresso-500">
            Order confirmation, shipping notification...
          </p>
        </div>

        <div className="bg-cream-50 border border-cream-200 p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-espresso-500" />
            <h3 className="font-medium text-espresso-900">Admin Security</h3>
          </div>
          <p className="text-sm text-espresso-500">
            Change password, 2FA settings...
          </p>
        </div>
      </div>
    </div>
  );
}
