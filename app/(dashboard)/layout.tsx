import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-transparent print:bg-white">
      <div className="mx-auto flex min-h-screen max-w-[1920px] gap-4 px-2 py-2 print:max-w-none print:px-0 print:py-0 lg:px-3">
        <div className="print:hidden">
          <AppSidebar />
        </div>
        <div className="flex min-h-[calc(100vh-1rem)] flex-1 flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white/82 shadow-spotlight backdrop-blur print:min-h-screen print:rounded-none print:border-0 print:bg-white print:shadow-none">
          <div className="print:hidden">
            <AppHeader />
          </div>
          <main className="flex-1 overflow-y-auto p-3 print:overflow-visible print:p-0 md:p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
