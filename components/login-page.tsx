import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-green-700 text-center">
          Krishi Bazar
        </h1>

        <p className="text-center text-gray-600 mt-2">
          Welcome Back
        </p>

        <LoginForm />
      </div>
    </div>
  );
}