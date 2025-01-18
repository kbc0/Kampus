import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { Card } from '../../common/Card';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { Button } from '../../common/Button';
import { toast } from 'react-hot-toast';

export const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'TürkIVY',
    siteDescription: 'Elite University Network',
    topicsPerPage: '20',
    allowGuestViewing: true,
    requireEmailVerification: false,
    maintenanceMode: false
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="General Settings"
        icon={Settings}
        description="Configure global forum settings"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Site Name"
              value={settings.siteName}
              onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
            />
            <Input
              label="Site Description"
              value={settings.siteDescription}
              onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
            />
          </div>

          <Select
            label="Topics Per Page"
            value={settings.topicsPerPage}
            onChange={(e) => setSettings(prev => ({ ...prev, topicsPerPage: e.target.value }))}
            options={[
              { value: '10', label: '10 topics' },
              { value: '20', label: '20 topics' },
              { value: '30', label: '30 topics' },
              { value: '50', label: '50 topics' }
            ]}
          />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowGuestViewing"
                checked={settings.allowGuestViewing}
                onChange={(e) => setSettings(prev => ({ ...prev, allowGuestViewing: e.target.checked }))}
                className="rounded border-gray-600 text-violet-500 focus:ring-violet-500"
              />
              <label htmlFor="allowGuestViewing" className="text-sm text-gray-300">
                Allow guest viewing
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={(e) => setSettings(prev => ({ ...prev, requireEmailVerification: e.target.checked }))}
                className="rounded border-gray-600 text-violet-500 focus:ring-violet-500"
              />
              <label htmlFor="requireEmailVerification" className="text-sm text-gray-300">
                Require email verification
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="rounded border-gray-600 text-violet-500 focus:ring-violet-500"
              />
              <label htmlFor="maintenanceMode" className="text-sm text-gray-300">
                Enable maintenance mode
              </label>
            </div>
          </div>

          <Button
            onClick={handleSaveSettings}
            isLoading={loading}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </form>
      </Card>
    </div>
  );
};