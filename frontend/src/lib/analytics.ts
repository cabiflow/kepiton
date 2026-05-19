type AnalyticsEventName =
  | 'page_view'
  | 'sign_up'
  | 'login'
  | 'project_created'
  | 'import_started'
  | 'import_completed'
  | 'task_created'
  | 'share_link_created'
  | 'upgrade_requested'
  | 'extension_nudge_shown';

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

interface GtagConfig {
  page_path?: string;
  page_title?: string;
}

type GtagCommand =
  | ['js', Date]
  | ['config', string, GtagConfig?]
  | ['event', AnalyticsEventName, AnalyticsParams?];

declare global {
  interface Window {
    dataLayer?: GtagCommand[];
    gtag?: (...args: GtagCommand) => void;
  }
}

const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;
let isInitialized = false;

function hasMeasurementId() {
  return Boolean(measurementId && measurementId.trim().length > 0);
}

export function initGA4() {
  if (!hasMeasurementId() || isInitialized) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: GtagCommand) => {
      window.dataLayer?.push(args);
    });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', measurementId as string, {
    page_path: window.location.pathname,
    page_title: document.title,
  });
  isInitialized = true;
}

export function trackEvent(name: AnalyticsEventName, params: AnalyticsParams = {}) {
  if (!hasMeasurementId()) {
    return;
  }

  if (!isInitialized) {
    initGA4();
  }

  window.gtag?.('event', name, params);
}

export function trackPageView(path: string, title = document.title) {
  trackEvent('page_view', {
    page_path: path,
    page_title: title,
  });
}
