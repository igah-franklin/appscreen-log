import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/top-nav";
import { ChatLauncher } from "@/components/chat-launcher";

export const metadata: Metadata = {
  title:
    "AppScreens: App Screenshot Templates for App Store & Google Play",
  description:
    "AppScreens helps you create App Store and Google Play screenshots in minutes with templates, localization, store-ready exports, and direct upload.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="bg-zinc-900">
        <TopNav />
        <main className="min-h-[calc(100vh-64px)] bg-white">{children}</main>
        <ChatLauncher />
      </body>
    </html>
  );
}
