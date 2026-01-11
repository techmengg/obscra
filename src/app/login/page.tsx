import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "log-in",
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/library");
  }

  return (
    <div className="min-h-screen bg-[#151515] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Obscra</p>
          <h1 className="text-2xl text-zinc-50">Sign in</h1>
        </header>
        <div className="mt-6">
          <LoginForm />
        </div>
        <div className="mt-6 flex flex-col items-center gap-2 text-xs text-zinc-500">
          <p>
            Don&apos;t have one?{" "}
            <Link href="/register" className="border-b border-zinc-600 pb-0.5 text-zinc-300">
              Create account
            </Link>
          </p>
          <Link href="/" className="text-zinc-400 transition hover:text-white">
            Back to landing
          </Link>
        </div>
      </div>
    </div>
  );
}
