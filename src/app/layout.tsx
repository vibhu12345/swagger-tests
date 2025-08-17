import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './styles/app.css';
import './globals.css';
import { AuthProvider } from "./authContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = { 
  title: "Swagger Tests",
  description: "Generative AI based API Tests for your Swagger JSON",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
