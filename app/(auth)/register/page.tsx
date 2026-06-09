import RegisterForm from "../_components/RegisterFormZod";
export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#eeeeee] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-lg grid md:grid-cols-2">

        {/* Left Side Image */}
        <div className="bg-white flex items-center justify-center p-8 border-r border-gray-200">
          <img
            src="/images/logo.png"
            alt="Krishi Bazar"
            className="w-full max-w-[420px] object-contain"
          />
        </div>

        {/* Right Side Form */}
        <div className="bg-[#fafafa] flex items-center justify-center p-10">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>

      </div>
    </div>
  );
}