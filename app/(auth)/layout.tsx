export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-soft-grid">
      <div className="absolute inset-0 bg-soft-grid opacity-50" />
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        {children}
      </main>
    </div>
  );
}

