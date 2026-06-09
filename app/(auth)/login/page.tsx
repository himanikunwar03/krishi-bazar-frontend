import LoginForm from "../_components/LoginFormZod";
import { AuthShell } from "../_components/ui";

export default function LoginPage() {
  return (
    <AuthShell image="/auth-login.png" imageAlt="Fresh fruits and vegetables">
      <LoginForm />
    </AuthShell>
  );
}
