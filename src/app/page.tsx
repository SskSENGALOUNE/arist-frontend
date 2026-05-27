import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40">
      <h1 className="text-3xl font-bold tracking-tight">Arist Employees</h1>
      <p className="text-muted-foreground">Employee Management System</p>
      <Link
        href="/login"
        className="mt-2 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Sign in
      </Link>
    </div>
  );
}
