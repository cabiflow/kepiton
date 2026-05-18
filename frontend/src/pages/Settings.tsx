import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { vi } from '../i18n/vi';
import { useAuth } from '../hooks/useAuth';

type SettingsTab = 'reminders' | 'account' | 'appearance';

export function Settings() {
  const { error, isLoading, updateSettings, user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('reminders');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [remindAt7Days, setRemindAt7Days] = useState(true);
  const [remindAt3Days, setRemindAt3Days] = useState(true);
  const [remindAt1Day, setRemindAt1Day] = useState(true);
  const [remindAtDeadline, setRemindAtDeadline] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setTimezone(user.timezone);
    setRemindAt7Days(user.remindAt7Days);
    setRemindAt3Days(user.remindAt3Days);
    setRemindAt1Day(user.remindAt1Day);
    setRemindAtDeadline(user.remindAtDeadline);
    setDailyDigest(user.dailyDigest);
    setDarkMode(user.darkMode);
  }, [user]);

  async function saveSettings() {
    setSuccess(null);
    const isSaved = await updateSettings({
      timezone,
      remindAt7Days,
      remindAt3Days,
      remindAt1Day,
      remindAtDeadline,
      dailyDigest,
      darkMode,
    });
    if (isSaved) {
      setSuccess(vi.settings.saveSuccess);
    }
  }

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'reminders', label: vi.settings.tabs.reminders },
    { id: 'account', label: vi.settings.tabs.account },
    { id: 'appearance', label: vi.settings.tabs.appearance },
  ];

  return (
    <section className="mx-auto grid max-w-4xl gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <div>
        <h1 className="text-2xl font-bold text-text">{vi.settings.title}</h1>
      </div>

      <Card className="grid gap-5">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-blue text-white'
                  : 'border border-border bg-bg-secondary text-text-muted'
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'reminders' && (
          <div className="grid gap-4">
            <div>
              <h2 className="text-lg font-semibold">{vi.settings.reminderTitle}</h2>
              <p className="mt-1 text-sm text-text-muted">{vi.settings.reminderSubtitle}</p>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input
                checked={remindAt7Days}
                onChange={(event) => setRemindAt7Days(event.target.checked)}
                type="checkbox"
              />
              {vi.settings.remindAt7Days}
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                checked={remindAt3Days}
                onChange={(event) => setRemindAt3Days(event.target.checked)}
                type="checkbox"
              />
              {vi.settings.remindAt3Days}
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                checked={remindAt1Day}
                onChange={(event) => setRemindAt1Day(event.target.checked)}
                type="checkbox"
              />
              {vi.settings.remindAt1Day}
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                checked={remindAtDeadline}
                onChange={(event) => setRemindAtDeadline(event.target.checked)}
                type="checkbox"
              />
              {vi.settings.remindAtDeadline}
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                checked={dailyDigest}
                onChange={(event) => setDailyDigest(event.target.checked)}
                type="checkbox"
              />
              {vi.settings.dailyDigest}
            </label>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">{vi.settings.accountTitle}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                {vi.auth.email}
                <Input disabled value={user?.email ?? ''} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                {vi.settings.timezone}
                <Input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
              </label>
              <p className="text-sm text-text-muted">
                {vi.settings.tier}: <span className="font-semibold text-text">{user?.tier}</span>
              </p>
              <p className="text-sm text-text-muted">
                {vi.settings.uploadCount}:{' '}
                <span className="font-semibold text-text">{user?.uploadCount ?? 0}</span>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">{vi.settings.appearanceTitle}</h2>
            <label className="flex items-center gap-3 text-sm">
              <input
                checked={darkMode}
                onChange={(event) => setDarkMode(event.target.checked)}
                type="checkbox"
              />
              {vi.settings.darkMode}
            </label>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
        {success && !error && <p className="text-sm text-safe">{success}</p>}
        <Button className="w-full sm:w-fit" disabled={isLoading} onClick={() => void saveSettings()}>
          {isLoading ? vi.settings.saving : vi.settings.save}
        </Button>
      </Card>
    </section>
  );
}
