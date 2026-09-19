

/** Which screen the auth flow is currently showing. */
export type AuthMode = 'login' | 'signup';

/** Every field the auth form can hold. Login mode simply ignores some of them. */
export interface AuthFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Field name -> human readable error. Only invalid fields appear here. */
export type AuthFormErrors = Partial<Record<keyof AuthFormValues, string>>;

/** Minimal user shape for the prototype. Replace when a real API lands. */
export interface User {
  id: string;
  name: string;
  email: string;
  /** True when the session was started via "Continue as Guest". */
  isGuest: boolean;
}

/** Payloads handed back to the page when the form is valid. */
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
}