import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { Player } from "@/components/player/Player";
import { QueueDrawer } from "@/components/QueueDrawer"; // <--- Import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rythmiq - Modern Music Streaming",
  description: "Listen to the best tracks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />

        <div className="flex h-screen bg-gray-50 overflow-hidden">
          <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
             <Sidebar />
          </div>

          <main className="md:pl-64 flex-1 flex flex-col h-full w-full relative bg-white">
            <Header />
            <div className="flex-1 overflow-y-auto bg-white pb-32 md:pb-0">
              {children}
            </div>
            <BottomNav />
            <Player />

            {/* NEW: Place Drawer here */}
            <QueueDrawer />
          </main>
        </div>
      </body>
    </html>
  );
}
