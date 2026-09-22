import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Shell from "@/components/Shell";
import { profile } from "@/data/content";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--font-orbitron" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-grotesk" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: `${profile.name} • ${profile.tagline}`,
  description:
    "Portfolio of Amandi De Silva — UI/UX engineer and creative frontend developer crafting intuitive, accessible, and immersive digital experiences.",
  openGraph: {
    title: `${profile.name} • ${profile.tagline}`,
    description: "Step into an immersive 3D workspace and explore my UI/UX and frontend work.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#04040a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${grotesk.variable} ${jetbrains.variable}`}>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
