const API_BASE_URL = 'https://kepiton.onrender.com/api/v1';
const PINNED_ALARM_NAME = 'kepiton-pinned-deadline';
const STORAGE_TOKEN_KEY = 'kepiton_token';
const STORAGE_PINNED_KEY = 'kepiton_pinned_deadline';
const STORAGE_OFFLINE_KEY = 'kepiton_pinned_offline';

const COLORS = {
  safe: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  overdue: '#DC2626',
  offline: '#6B7280',
};

function getStorage(keys) {
  return chrome.storage.local.get(keys);
}

function setStorage(items) {
  return chrome.storage.local.set(items);
}

async function updateBadge() {
  const data = await getStorage([STORAGE_PINNED_KEY, STORAGE_OFFLINE_KEY]);
  const isOffline = Boolean(data[STORAGE_OFFLINE_KEY]);
  const pinned = data[STORAGE_PINNED_KEY];

  if (isOffline || !pinned?.deadline) {
    await chrome.action.setBadgeText({ text: '—' });
    await chrome.action.setBadgeBackgroundColor({ color: COLORS.offline });
    return;
  }

  const deadline = new Date(pinned.deadline);
  const createdAt = pinned.createdAt ? new Date(pinned.createdAt) : new Date();
  const totalMs = Math.max(deadline.getTime() - createdAt.getTime(), 1);
  const remainingMs = deadline.getTime() - Date.now();

  if (remainingMs <= 0) {
    await chrome.action.setBadgeText({ text: 'QH' });
    await chrome.action.setBadgeBackgroundColor({ color: COLORS.overdue });
    return;
  }

  const remainingRatio = remainingMs / totalMs;
  const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  const badgeText = remainingDays >= 1 ? `${remainingDays}d` : `${remainingHours}h`;

  let color = COLORS.danger;
  if (remainingRatio > 0.5) {
    color = COLORS.safe;
  } else if (remainingRatio >= 0.2) {
    color = COLORS.warning;
  }

  await chrome.action.setBadgeText({ text: badgeText });
  await chrome.action.setBadgeBackgroundColor({ color });
}

async function syncDeadline() {
  try {
    const data = await getStorage(STORAGE_TOKEN_KEY);
    const token = data[STORAGE_TOKEN_KEY];

    if (!token) {
      await setStorage({
        [STORAGE_PINNED_KEY]: null,
        [STORAGE_OFFLINE_KEY]: true,
      });
      await updateBadge();
      return;
    }

    const response = await fetch(`${API_BASE_URL}/me/pinned`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await setStorage({ [STORAGE_OFFLINE_KEY]: true });
      await updateBadge();
      return;
    }

    const result = await response.json();
    await setStorage({
      [STORAGE_PINNED_KEY]: result.pinned ?? null,
      [STORAGE_OFFLINE_KEY]: false,
    });
    await updateBadge();
  } catch {
    await setStorage({ [STORAGE_OFFLINE_KEY]: true });
    await updateBadge();
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(PINNED_ALARM_NAME, {
    periodInMinutes: 5,
  });
  void syncDeadline();
});

chrome.runtime.onStartup.addListener(() => {
  void syncDeadline();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === PINNED_ALARM_NAME) {
    void syncDeadline();
  }
});

void syncDeadline();
