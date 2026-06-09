import RegisterForm from "../_components/RegisterFormZod";
import { AuthShell } from "../_components/ui";

export default function SignupPage() {
  return (
    <AuthShell image="/auth-login.png" imageAlt="Fresh produce harvest">
      <RegisterForm />
    </AuthShell>
  );
}
