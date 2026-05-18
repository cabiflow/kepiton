import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { vi } from '../i18n/vi';

export function Register() {
  const navigate = useNavigate();
  const { error, isLoading, register, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) {
    navigate('/');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await register(email, password);
    navigate('/');
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-md place-items-center px-6">
      <Card className="w-full">
        <h1 className="text-2xl font-bold text-text">{vi.auth.register}</h1>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-medium">
            {vi.auth.email}
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {vi.auth.password}
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button disabled={isLoading} type="submit">
            {vi.auth.registerCta}
          </Button>
          <Link className="text-sm text-blue" to="/login">
            {vi.auth.goToLogin}
          </Link>
        </form>
      </Card>
    </section>
  );
}
