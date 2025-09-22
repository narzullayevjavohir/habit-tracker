// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">
            Sign in to your HabitTracker account
          </p>
        </div>
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          redirectUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border-0",
              headerTitle: "text-2xl font-bold",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              footerActionLink: "text-blue-600 hover:text-blue-800",
            },
          }}
        />
      </div>
    </div>
  );
}
