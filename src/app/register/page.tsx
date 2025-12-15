import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
import { auth } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/library");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 text-zinc-100">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(64,240,170,0.14),transparent_32%),radial-gradient(circle_at_85%_5%,rgba(120,180,255,0.14),transparent_35%),radial-gradient(circle_at_50%_75%,rgba(120,255,200,0.08),transparent_42%)] blur-[1px]" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800/80 bg-black/70 p-8 shadow-[0_20px_120px_rgba(0,0,0,0.45)] backdrop-blur">
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
            Obscra
          </p>
          <h1 className="text-2xl text-zinc-50">
            Create space for your chapters
          </h1>
        </header>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <div className="mt-6 flex flex-col items-center gap-2 text-xs text-zinc-500">
          <p>
            Already inside?{" "}
            <Link href="/login" className="text-emerald-200 underline underline-offset-4">
              Return to login
            </Link>
          </p>
          <Link href="/" className="text-zinc-400 underline underline-offset-4 hover:text-white">
            Back to landing
          </Link>
        </div>
      </div>
    </div>
  );
}
