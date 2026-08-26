import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { ADMIN_CREDENTIALS, COURT_IMAGES } from '@/utils/constants';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email and password');
      return;
    }
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setFormError('Invalid email or password');
    }
  };

  const fillDemo = () => {
    setEmail(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-charcoal">
      <div className="absolute inset-0">
        <img
          src={COURT_IMAGES.hero}
          alt=""
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950 via-forest-950/90 to-charcoal" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-cream-muted hover:text-gold-300 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400/10">
              <Shield className="h-7 w-7 text-gold-400" />
            </div>
            <Logo size="md" to="" />
            <h1 className="mt-4 font-display text-2xl font-bold text-cream">Admin Portal</h1>
            <p className="mt-1 text-sm text-cream-muted">Sign in to manage bookings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@picklejoe.com"
              leftIcon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {(formError || error) && (
              <div className="flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {formError ?? error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={loading}
              leftIcon={<Shield className="h-5 w-5" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-gold-400/20 bg-gold-400/5 p-4">
            <p className="text-xs font-semibold text-gold-300">Demo Credentials</p>
            <p className="mt-1 text-xs text-cream-muted">
              Email: <span className="font-mono text-cream">{ADMIN_CREDENTIALS.email}</span>
            </p>
            <p className="text-xs text-cream-muted">
              Password: <span className="font-mono text-cream">{ADMIN_CREDENTIALS.password}</span>
            </p>
            <button
              onClick={fillDemo}
              className="mt-2 text-xs font-medium text-gold-400 underline hover:text-gold-300"
            >
              Auto-fill credentials
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
