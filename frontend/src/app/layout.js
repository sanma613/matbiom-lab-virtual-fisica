import { DM_Sans, DM_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "Virtual Physics Lab",
  description: "Modular classical mechanics sandbox — real-time WebSocket simulation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body style={{ height: "100vh", overflow: "hidden" }}>{children}</body>
    </html>
  );
}