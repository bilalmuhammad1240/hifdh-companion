export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white text-xl font-bold">
          ح
        </div>
        <span className="text-lg font-semibold text-text-primary">Hifdh Companion</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
