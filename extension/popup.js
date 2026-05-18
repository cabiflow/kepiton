const API_BASE_URL = 'https://kepiton.onrender.com/api/v1';
const APP_URL = 'https://kepiton.onrender.com';

const messages = {
  title: 'Kepiton',
  pinnedDeadline: 'Deadline đã ghim',
  loading: 'Đang tải deadline đã ghim...',
  emptyState: 'Chưa có deadline nào được ghim.',
  loginRequired: 'Vui lòng đăng nhập Kepiton trên web trước.',
  loadError: 'Không thể tải deadline, vui lòng thử lại.',
  overdue: 'QUÁ HẠN',
  days: 'ngày',
  hours: 'giờ',
  minutes: 'phút',
  seconds: 'giây',
  openApp: 'Mở Kepiton',
};

const stateElement = document.querySelector('#state');
const deadlineElement = document.querySelector('#deadline');
const deadlineNameElement = document.querySelector('#deadline-name');
const deadlineDateElement = document.querySelector('#deadline-date');
const openAppButton = document.querySelector('#open-app');
const daysElement = document.querySelector('#days');
const hoursElement = document.querySelector('#hours');
const minutesElement = document.querySelector('#minutes');
const secondsElement = document.querySelector('#seconds');

let countdownInterval = null;

document.querySelectorAll('[data-i18n]').forEach((element) => {
  const key = element.getAttribute('data-i18n');
  if (key && messages[key]) {
    element.textContent = messages[key];
  }
});

openAppButton?.addEventListener('click', () => {
  chrome.tabs.create({ url: APP_URL });
});

function setState(message) {
  if (!stateElement || !deadlineElement) {
    return;
  }

  stateElement.textContent = message;
  stateElement.hidden = false;
  deadlineElement.hidden = true;
}

function showDeadline() {
  if (!stateElement || !deadlineElement) {
    return;
  }

  stateElement.hidden = true;
  deadlineElement.hidden = false;
}

function updateCountdown(deadline) {
  const remainingMs = deadline.getTime() - Date.now();

  if (remainingMs <= 0) {
    if (deadlineElement) {
      deadlineElement.innerHTML = `<div class="overdue">${messages.overdue}</div>`;
    }
    if (countdownInterval) {
      window.clearInterval(countdownInterval);
    }
    return;
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (daysElement) {
    daysElement.textContent = String(days);
  }
  if (hoursElement) {
    hoursElement.textContent = String(hours);
  }
  if (minutesElement) {
    minutesElement.textContent = String(minutes);
  }
  if (secondsElement) {
    secondsElement.textContent = String(seconds);
  }
}

async function getToken() {
  const result = await chrome.storage.local.get('kepiton_token');
  return result.kepiton_token;
}

async function loadPinnedDeadline() {
  setState(messages.loading);

  try {
    const token = await getToken();
    if (!token) {
      setState(messages.loginRequired);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/me/pinned`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      setState(messages.loadError);
      return;
    }

    const data = await response.json();
    if (!data.pinned) {
      setState(messages.emptyState);
      return;
    }

    const deadline = new Date(data.pinned.deadline);
    if (deadlineNameElement) {
      deadlineNameElement.textContent = data.pinned.name;
    }
    if (deadlineDateElement) {
      deadlineDateElement.textContent = deadline.toLocaleString('vi-VN');
    }

    showDeadline();
    updateCountdown(deadline);
    countdownInterval = window.setInterval(() => updateCountdown(deadline), 1000);
  } catch {
    setState(messages.loadError);
  }
}

void loadPinnedDeadline();
