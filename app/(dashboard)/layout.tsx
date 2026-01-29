import { Sidebar } from "@/components/sidebar";
import { BrandProvider } from "@/lib/brand-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BrandProvider>
      <div className="flex h-screen bg-neutral-950">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </BrandProvider>
  );
}
