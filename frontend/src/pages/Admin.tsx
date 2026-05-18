import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { vi } from '../i18n/vi';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

type Tier = 'FREE' | 'PRO';
type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

interface AdminUser {
  id: string;
  email: string;
  tier: Tier;
  isAdmin: boolean;
  uploadCount: number;
  createdAt: string;
}

interface PaymentRequest {
  id: string;
  amountVnd: number;
  referenceCode: string;
  status: PaymentStatus;
  note?: string | null;
  createdAt: string;
  user: Pick<AdminUser, 'id' | 'email' | 'tier'>;
}

interface PaymentsResponse {
  paymentRequests: PaymentRequest[];
}

interface UsersResponse {
  users: AdminUser[];
}

const statusLabel: Record<PaymentStatus, string> = {
  PENDING: vi.payment.pending,
  CONFIRMED: vi.payment.confirmed,
  REJECTED: vi.payment.rejected,
};

function formatMoney(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
}

export function Admin() {
  const { user } = useAuth();
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchAdminData() {
    setError(null);
    setIsLoading(true);
    try {
      const [paymentsResponse, usersResponse] = await Promise.all([
        api.get<PaymentsResponse>('/admin/payments'),
        api.get<UsersResponse>('/admin/users'),
      ]);
      setPaymentRequests(paymentsResponse.data.paymentRequests);
      setUsers(usersResponse.data.users);
    } catch {
      setError(vi.admin.actionError);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (user?.isAdmin) {
      void fetchAdminData();
    } else {
      setIsLoading(false);
    }
  }, [user?.isAdmin]);

  async function updatePayment(path: string) {
    setError(null);
    setSuccess(null);
    try {
      await api.patch(path);
      setSuccess(vi.admin.actionSuccess);
      await fetchAdminData();
    } catch {
      setError(vi.admin.actionError);
    }
  }

  if (!user?.isAdmin) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <Card>
          <h1 className="text-2xl font-bold">{vi.admin.title}</h1>
          <p className="mt-2 text-text-muted">{vi.admin.forbidden}</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header>
        <h1 className="text-3xl font-bold text-text">{vi.admin.title}</h1>
        <p className="mt-2 text-text-muted">{vi.admin.subtitle}</p>
      </header>

      {isLoading && <p className="text-sm text-text-muted">{vi.admin.loading}</p>}
      {error && <p className="rounded-md bg-danger px-4 py-3 text-sm text-white">{error}</p>}
      {success && <p className="rounded-md bg-safe px-4 py-3 text-sm text-white">{success}</p>}

      <Card>
        <h2 className="text-xl font-semibold">{vi.admin.payments}</h2>
        {paymentRequests.length === 0 && (
          <p className="mt-3 text-sm text-text-muted">{vi.admin.emptyPayments}</p>
        )}
        {paymentRequests.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="py-2 pr-4">{vi.admin.email}</th>
                  <th className="py-2 pr-4">{vi.admin.referenceCode}</th>
                  <th className="py-2 pr-4">{vi.admin.amount}</th>
                  <th className="py-2 pr-4">{vi.admin.status}</th>
                  <th className="py-2 pr-4">{vi.admin.createdAt}</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {paymentRequests.map((paymentRequest) => (
                  <tr className="border-b border-border" key={paymentRequest.id}>
                    <td className="py-3 pr-4">{paymentRequest.user.email}</td>
                    <td className="py-3 pr-4 font-semibold">{paymentRequest.referenceCode}</td>
                    <td className="py-3 pr-4">{formatMoney(paymentRequest.amountVnd)}</td>
                    <td className="py-3 pr-4">{statusLabel[paymentRequest.status]}</td>
                    <td className="py-3 pr-4">
                      {new Date(paymentRequest.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 pr-4">
                      {paymentRequest.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              void updatePayment(`/admin/payments/${paymentRequest.id}/confirm`)
                            }
                          >
                            {vi.admin.confirm}
                          </Button>
                          <Button
                            onClick={() =>
                              void updatePayment(`/admin/payments/${paymentRequest.id}/reject`)
                            }
                            variant="secondary"
                          >
                            {vi.admin.reject}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">{vi.admin.users}</h2>
        <div className="mt-4 grid gap-3">
          {users.map((adminUser) => (
            <div
              className="grid gap-3 rounded-md border border-border bg-bg-secondary p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              key={adminUser.id}
            >
              <div className="min-w-0">
                <p className="font-medium">{adminUser.email}</p>
                <p className="text-sm text-text-muted">
                  {adminUser.tier} · {vi.settings.uploadCount}: {adminUser.uploadCount}
                </p>
              </div>
              {adminUser.tier === 'PRO' && !adminUser.isAdmin && (
                <Button
                  onClick={() => void updatePayment(`/admin/users/${adminUser.id}/deactivate`)}
                  variant="secondary"
                >
                  {vi.admin.deactivate}
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
