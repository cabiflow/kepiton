import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { vi } from '../i18n/vi';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { trackEvent } from '../hooks/useAnalytics';

type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface PaymentRequest {
  id: string;
  amountVnd: number;
  referenceCode: string;
  status: PaymentStatus;
  note?: string | null;
  createdAt: string;
}

interface PaymentResponse {
  paymentRequest: PaymentRequest | null;
  amountVnd: number;
  bankInfo: BankInfo;
  transferContent: string | null;
}

const statusText: Record<PaymentStatus, string> = {
  PENDING: vi.payment.pending,
  CONFIRMED: vi.payment.confirmed,
  REJECTED: vi.payment.rejected,
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function Upgrade() {
  const { user } = useAuth();
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const qrUrl = import.meta.env.VITE_PAYMENT_QR_URL as string | undefined;

  async function fetchPaymentStatus() {
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.get<PaymentResponse>('/payment/status');
      setPaymentData(response.data);
    } catch {
      setError(vi.errors.serverError);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchPaymentStatus();
  }, []);

  async function createRequest() {
    setError(null);
    setSuccess(null);
    setIsCreating(true);
    try {
      const response = await api.post<PaymentResponse>('/payment/request');
      setPaymentData(response.data);
      setSuccess(vi.payment.requestSuccess);
      trackEvent('upgrade_requested', { tier: user?.tier === 'PRO' ? 'pro' : 'free' });
    } catch {
      setError(vi.payment.requestError);
    } finally {
      setIsCreating(false);
    }
  }

  const paymentRequest = paymentData?.paymentRequest ?? null;
  const canCreateRequest =
    user?.tier !== 'PRO' && (!paymentRequest || paymentRequest.status === 'REJECTED');

  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header>
        <h1 className="text-3xl font-bold text-text">{vi.payment.title}</h1>
        <p className="mt-2 text-text-muted">{vi.payment.subtitle}</p>
      </header>

      {isLoading && <p className="text-sm text-text-muted">{vi.payment.loading}</p>}
      {error && <p className="rounded-md bg-danger px-4 py-3 text-sm text-white">{error}</p>}
      {success && <p className="rounded-md bg-safe px-4 py-3 text-sm text-white">{success}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="grid gap-5">
          <div>
            <p className="text-sm font-medium text-blue">{vi.payment.amount}</p>
            <p className="mt-2 text-4xl font-bold text-text">
              {formatMoney(paymentData?.amountVnd ?? 299000)}đ
            </p>
          </div>

          {user?.tier === 'PRO' && (
            <p className="rounded-md bg-safe px-4 py-3 text-sm text-white">{vi.payment.proActive}</p>
          )}

          {paymentRequest && (
            <div className="grid gap-2 rounded-md border border-border bg-bg-secondary p-4 text-sm">
              <p className="font-semibold text-text">{vi.payment.currentStatus}</p>
              <p className="text-text-muted">
                {statusText[paymentRequest.status]} · {paymentRequest.referenceCode}
              </p>
              {paymentRequest.note && <p className="text-text-muted">{paymentRequest.note}</p>}
            </div>
          )}

          {canCreateRequest && (
            <Button disabled={isCreating} onClick={() => void createRequest()}>
              {isCreating
                ? vi.payment.creating
                : paymentRequest
                  ? vi.payment.requestAgain
                  : vi.payment.createRequest}
            </Button>
          )}
        </Card>

        <Card className="grid gap-4">
          <h2 className="text-lg font-semibold">{vi.payment.bankInfo}</h2>
          {paymentData && (
            <div className="grid gap-3 text-sm">
              <InfoRow label={vi.payment.bankName} value={paymentData.bankInfo.bankName} />
              <InfoRow label={vi.payment.accountNumber} value={paymentData.bankInfo.accountNumber} />
              <InfoRow label={vi.payment.accountName} value={paymentData.bankInfo.accountName} />
              <InfoRow
                label={vi.payment.transferContent}
                value={paymentData.transferContent ?? vi.payment.instruction}
              />
            </div>
          )}

          <div className="rounded-md border border-dashed border-border bg-bg-secondary p-4 text-center">
            <p className="text-sm font-semibold">{vi.payment.qrTitle}</p>
            {qrUrl ? (
              <img
                alt={vi.payment.qrTitle}
                className="mx-auto mt-3 max-h-64 rounded-md"
                src={qrUrl}
              />
            ) : (
              <p className="mt-2 text-sm text-text-muted">{vi.payment.qrPending}</p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-text-muted">{label}</span>
      <strong className="break-words text-text">{value}</strong>
    </div>
  );
}
