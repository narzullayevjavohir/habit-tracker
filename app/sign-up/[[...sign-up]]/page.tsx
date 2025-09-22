// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Get Started</h1>
          <p className="mt-2 text-gray-600">Create your HabitTracker account</p>
        </div>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          redirectUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border-0",
              headerTitle: "text-2xl font-bold",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton: "border-gray-300 hover:bg-gray-50",
              formButtonPrimary: "bg-green-600 hover:bg-green-700",
              footerActionLink: "text-green-600 hover:text-green-800",
            },
          }}
        />
      </div>
    </div>
  );
}
