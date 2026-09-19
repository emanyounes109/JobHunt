
import React, { useState } from 'react';
import { useToastStore } from '../store/toastStore';

/*  types  */

export type AuthMode = 'login' | 'signup';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
type FormErrors = Partial<Record<keyof FormState, string>>;

export interface AuthScreensProps {
  onLogin?: (email: string, password: string) => void;
  onSignup?: (name: string, email: string, password: string) => void;
  onGuestContinue?: () => void;
  onForgotPassword?: () => void;
  initialMode?: AuthMode;
}

/*  localStorage "database"  */

const STORAGE_KEY = 'jhc-accounts';
interface StoredAccount { name: string; password: string; createdAt: string }
type AccountMap = Record<string, StoredAccount>;

const normalize = (email: string) => email.trim().toLowerCase();

function loadAccounts(): AccountMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as AccountMap) : {};
  } catch {
    return {};
  }
}

function saveAccounts(map: AccountMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/*  constants  */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY: FormState = { name: '', email: '', password: '', confirmPassword: '' };

const COPY = {
  login: {
    heading: 'Welcome back',
    sub: 'Sign in to continue your job search',
    submit: 'Log in',
    prompt: "Don't have an account?",
    action: 'Sign up',
  },
  signup: {
    heading: 'Create your account',
    sub: 'Track every application in one calm place',
    submit: 'Create account',
    prompt: 'Already have an account?',
    action: 'Log in',
  },
} as const;

/*  small pieces  */

function LogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3D5A73] shadow-md shadow-[#3D5A73]/30">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white" aria-hidden="true">
        <path d="M12 2 22 7 12 12 2 7Z" />
        <path d="M2 10.5 12 15.5 22 10.5V13L12 18 2 13Z" />
        <path d="M2 14.5 12 19.5 22 14.5V17L12 22 2 17Z" />
      </svg>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  input: React.InputHTMLAttributes<HTMLInputElement>;
}

function Field({ id, label, error, input }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-[#8B9694]">
        {label}
      </label>
      <input
        id={id}
        {...input}
        className={[
          'w-full rounded-xl border px-3 py-2 text-sm outline-none transition',
          'placeholder:text-[#A9B1AF]',
          error
            ? 'border-[#C97064] bg-[#F3F2EE] focus:ring-4 focus:ring-[#C97064]/15'
            : 'border-transparent bg-[#F3F2EE] focus:border-[#3D5A73] focus:bg-white focus:ring-4 focus:ring-[#3D5A73]/10',
          'dark:bg-[#151C24] dark:text-[#F5F4F1] dark:placeholder:text-[#6E7A78] dark:focus:bg-[#151C24]',
        ].join(' ')}
      />
      {error && <p className="mt-1 text-[11px] font-medium text-[#C97064]">{error}</p>}
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-4" role="separator">
      <span className="h-px flex-1 bg-[#E7E5E0] dark:bg-white/10" />
      <span className="text-xs text-[#8B9694]">or</span>
      <span className="h-px flex-1 bg-[#E7E5E0] dark:bg-white/10" />
    </div>
  );
}

/*  component  */

export default function AuthScreens({
  onLogin,
  onSignup,
  onGuestContinue,
  onForgotPassword,
  initialMode = 'login',
}: AuthScreensProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const showToast = useToastStore((s) => s.showToast); // global → survives navigation

  const isSignup = mode === 'signup';
  const copy = COPY[mode];

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...values, [field]: e.target.value };
      setValues(next);
      if (submitted) setErrors(validate(next));
    };

  function validate(v: FormState): FormErrors {
    const err: FormErrors = {};
    if (isSignup && !v.name.trim()) err.name = 'Please enter your name';
    if (!v.email.trim()) err.email = 'Email is required';
    else if (!EMAIL_RE.test(v.email.trim())) err.email = 'Enter a valid email address';
    if (!v.password) err.password = 'Password is required';
    else if (isSignup && v.password.length < 8) err.password = 'Use at least 8 characters';
    if (isSignup && v.confirmPassword !== v.password) err.confirmPassword = 'Passwords do not match';
    return err;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const email = normalize(values.email);
    const accounts = loadAccounts();

    if (isSignup) {
      if (accounts[email]) {
        showToast('error', 'An account with this email already exists. Log in instead.');
        return;
      }
      accounts[email] = {
        name: values.name.trim(),
        password: values.password,
        createdAt: new Date().toISOString(),
      };
      saveAccounts(accounts);
      onSignup?.(values.name.trim(), email, values.password);

      setMode('login');
      setValues({ ...EMPTY, email: values.email.trim() });
      setErrors({});
      setSubmitted(false);
      showToast('success', 'Account created successfully! Log in to continue.');
    } else {
      const account = accounts[email];
      if (!account) {
        showToast('error', 'No account found with this email. Sign up first.');
        return;
      }
      if (account.password !== values.password) {
        showToast('error', 'Incorrect password. Please try again.');
        return;
      }
      // Toast FIRST, then let the page navigate — the alert follows to /dashboard.
      showToast('success', `Welcome back, ${account.name}! Signed in successfully.`);
      onLogin?.(email, values.password);
    }
  }

  function toggleMode() {
    setMode(isSignup ? 'login' : 'signup');
    setValues(EMPTY);
    setErrors({});
    setSubmitted(false);
  }

  const linkCls =
    'font-semibold text-[#3D5A73] hover:underline dark:text-[#F0A868] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5A73]/40';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4 py-4 dark:bg-[#151C24]">
      <div className="w-full max-w-[400px]">
        {/*  brand header  */}
        <header className="mb-4 flex flex-col items-center text-center">
          <LogoMark />
          <h1 className="mt-2 text-lg font-bold tracking-tight text-[#151C24] dark:text-[#F5F4F1]">
            Job Hunt Companion
          </h1>
          <p className="mt-0.5 text-xs text-[#8B9694]">Your focused job search, all in one place</p>
        </header>

        {/* card  */}
        <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(21,28,36,0.04),0_12px_32px_-14px_rgba(21,28,36,0.14)] ring-1 ring-[#151C24]/[0.04] dark:bg-[#1C242E] dark:ring-white/10">
          <h2 className="text-base font-bold tracking-tight text-[#151C24] dark:text-[#F5F4F1]">
            {copy.heading}
          </h2>
          <p className="mt-0.5 text-[13px] text-[#8B9694]">{copy.sub}</p>

          <form onSubmit={handleSubmit} noValidate className="mt-3 space-y-2.5">
            {isSignup && (
              <Field
                id="name"
                label="Full name"
                error={errors.name}
                input={{ type: 'text', autoComplete: 'name', placeholder: 'Alex Morgan', value: values.name, onChange: set('name') }}
              />
            )}

            <Field
              id="email"
              label="Email"
              error={errors.email}
              input={{ type: 'email', autoComplete: 'email', placeholder: 'you@example.com', value: values.email, onChange: set('email') }}
            />

            <div>
              <Field
                id="password"
                label="Password"
                error={errors.password}
                input={{ type: 'password', autoComplete: isSignup ? 'new-password' : 'current-password', placeholder: '••••••••', value: values.password, onChange: set('password') }}
              />
              {!isSignup && (
                <div className="mt-1 flex justify-end">
                  <button type="button" onClick={onForgotPassword} className={`text-xs ${linkCls}`}>
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {isSignup && (
              <Field
                id="confirmPassword"
                label="Confirm password"
                error={errors.confirmPassword}
                input={{ type: 'password', autoComplete: 'new-password', placeholder: '••••••••', value: values.confirmPassword, onChange: set('confirmPassword') }}
              />
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#3D5A73] py-2 text-sm font-semibold text-white transition hover:bg-[#334B60] active:bg-[#2C4152] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3D5A73]/30"
            >
              {copy.submit}
            </button>
          </form>

          <div className="my-3">
            <OrDivider />
          </div>

          <button
            type="button"
            onClick={onGuestContinue}
            className="w-full rounded-xl bg-[#EAE8E3] py-2 text-sm font-semibold text-[#151C24] transition hover:bg-[#E0DDD6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#8B9694]/25 dark:bg-white/10 dark:text-[#F5F4F1] dark:hover:bg-white/15"
          >
            Continue as Guest
          </button>

          <p className="mt-3 text-center text-[13px] text-[#8B9694]">
            {copy.prompt}{' '}
            <button type="button" onClick={toggleMode} className={linkCls}>
              {copy.action}
            </button>
          </p>
        </section>

        <p className="mx-auto mt-3 max-w-[340px] text-center text-[11px] leading-relaxed text-[#8B9694]">
          This is a design prototype. Accounts are saved only in this browser — nothing is transmitted.
        </p>
      </div>
    </div>
  );
}