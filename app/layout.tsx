import type { Metadata } from "next";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Datacom | The Infrastructure Inside",
  description:
    "End-to-end data centre, enterprise network, GPON and outside plant infrastructure engineered for critical environments.",
  keywords: [
    "data centre infrastructure UAE",
    "structured cabling GCC",
    "fibre optic systems",
    "server racks and intelligent PDU",
    "Datacom networking",
  ],
  openGraph: {
    title: "Datacom — The Infrastructure Inside",
    description: "Spec-grade digital infrastructure for the connected world.",
    type: "website",
    locale: "en_AE",
    alternateLocale: "ar_AE",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
