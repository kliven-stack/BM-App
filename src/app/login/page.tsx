import { Suspense } from "react";
import LoginForm from "./LoginForm";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Client Portal"
      subtitle="Sign in to manage your websites & subscriptions"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
