import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vivek Ojha | Backend Engineer",
  description: "Backend Engineer specializing in Spring Boot microservices, Kubernetes, and event-driven architectures. 3+ years of experience in fintech and logistics domains.",
  keywords: ["Backend Engineer", "Spring Boot", "Microservices", "Kubernetes", "Java", "Kafka", "AWS", "Vivek Ojha"],
  authors: [{ name: "Vivek Ojha" }],
  openGraph: {
    title: "Vivek Ojha | Backend Engineer",
    description: "Backend Engineer specializing in Spring Boot microservices, Kubernetes, and event-driven architectures.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
