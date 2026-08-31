import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
