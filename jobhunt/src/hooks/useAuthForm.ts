import { useCallback, useRef, useState } from 'react';
import type {
  AuthFormErrors,
  AuthFormValues,
  AuthMode,
  LoginPayload,
  SignupPayload,
} from '../types/auth';

/** Deliberately permissive email check — real validation happens server-side. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD_LENGTH = 8;

const EMPTY_FORM: AuthFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

/** Validation order also decides which field receives focus on a failed submit. */
const FIELD_ORDER: (keyof AuthFormValues)[] = ['name', 'email', 'password', 'confirmPassword'];

/**
 * Pure validator — no React, trivially unit testable.
 * Returns an empty object when the form is valid.
 */
export function validateAuthForm(values: AuthFormValues, mode: AuthMode): AuthFormErrors {
  const errors: AuthFormErrors = {};

  if (mode === 'signup' && !values.name.trim()) {
    errors.name = 'Please tell us your name';
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address (e.g. you@example.com)';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (mode === 'signup' && values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  if (mode === 'signup') {
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return errors;
}

export interface UseAuthFormOptions {
  initialMode?: AuthMode;
  /** Invoked only when login-mode validation passes. May be async. */
  onLogin?: (payload: LoginPayload) => void | Promise<void>;
  /** Invoked only when signup-mode validation passes. May be async. */
  onSignup?: (payload: SignupPayload) => void | Promise<void>;
}

/*
 * Owns all auth form state: values, errors, mode toggle, submit lifecycle.
 * Keeping this outside the component makes AuthScreens purely presentational.
 */
export function useAuthForm({ initialMode = 'login', onLogin, onSignup }: UseAuthFormOptions = {}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [values, setValues] = useState<AuthFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Errors stay hidden until the first submit, so typing isn't noisy. */
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  /** Refs let us move focus to the first invalid field. */
  const fieldRefs = useRef<Partial<Record<keyof AuthFormValues, HTMLInputElement | null>>>({});

  const registerField = useCallback(
    (field: keyof AuthFormValues) => (el: HTMLInputElement | null) => {
      fieldRefs.current[field] = el;
    },
    [],
  );

  /** Controlled change handler; re-validates live once the user has submitted. */
  const handleChange = useCallback(
    (field: keyof AuthFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setValues((prev) => {
        const next = { ...prev, [field]: nextValue };
        if (hasAttemptedSubmit) setErrors(validateAuthForm(next, mode));
        return next;
      });
    },
    [hasAttemptedSubmit, mode],
  );

  /** Validate a single field on blur for field-by-field feedback. */
  const handleBlur = useCallback(
    (field: keyof AuthFormValues) => () => {
      const fieldErrors = validateAuthForm(values, mode);
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    },
    [values, mode],
  );

  /** Switch login <-> signup and clear everything so stale errors don't linger. */
  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setValues(EMPTY_FORM);
    setErrors({});
    setHasAttemptedSubmit(false);
  }, []);

  const resetForm = useCallback(() => {
    setValues(EMPTY_FORM);
    setErrors({});
    setHasAttemptedSubmit(false);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setHasAttemptedSubmit(true);

      const nextErrors = validateAuthForm(values, mode);
      setErrors(nextErrors);

      const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstInvalid) {
        fieldRefs.current[firstInvalid]?.focus();
        return;
      }

      const email = values.email.trim();

      try {
        setIsSubmitting(true);
        if (mode === 'signup') {
          await onSignup?.({ name: values.name.trim(), email, password: values.password });
        } else {
          await onLogin?.({ email, password: values.password });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, mode, onLogin, onSignup],
  );

  return {
    mode,
    setMode,
    toggleMode,
    values,
    errors,
    isSubmitting,
    registerField,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } as const;
}