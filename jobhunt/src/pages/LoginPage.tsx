import { useNavigate } from 'react-router-dom';
import AuthScreens from '../components/AuthScreens';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);

  // AuthScreens does its own local (localStorage) credential check first,
  // then calls this — so by the time we're here, the "login" is verified.
  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
    navigate('/');
  };

  // AuthScreens flips itself back to the login view after signup succeeds —
  // it does NOT log the user in immediately, so we don't navigate here.
  const handleSignup = async (name: string, email: string, password: string) => {
    await signup({ name, email, password });
  };

  const handleGuestContinue = () => {
    continueAsGuest();
    navigate('/');
  };

  return (
    <AuthScreens
      onLogin={handleLogin}
      onSignup={handleSignup}
      onGuestContinue={handleGuestContinue}
    />
  );
}