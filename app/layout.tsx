import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";

const clash = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
});

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vivek Ojha — Backend Engineer",
  description:
    "Backend engineer building distributed systems: Spring Boot microservices, Kafka event streaming, Kubernetes. Software Engineer II at Smarsh.",
  keywords: [
    "Backend Engineer",
    "Spring Boot",
    "Microservices",
    "Kubernetes",
    "Java",
    "Kafka",
    "AWS",
    "Vivek Ojha",
  ],
  authors: [{ name: "Vivek Ojha" }],
  openGraph: {
    title: "Vivek Ojha — Backend Engineer",
    description:
      "Backend engineer building distributed systems: Spring Boot microservices, Kafka event streaming, Kubernetes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${clash.variable} ${satoshi.variable} ${geistMono.variable} antialiased`}
      >
        <SmoothScroll>
          {children}
          <Cursor />
        </SmoothScroll>
      </body>
    </html>
  );
}
