import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";
import { HeaderActionProvider } from "../contexts/HeaderActionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Passe",
  description: "Gestão da liga, do mercado à classificação",
};

export default function RootLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full min-h-screen w-full bg-background text-foreground antialiased m-0 p-0">
        <HeaderActionProvider>
          <Toaster>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </Toaster>
        </HeaderActionProvider>
      </body>
    </html>
  );
}
