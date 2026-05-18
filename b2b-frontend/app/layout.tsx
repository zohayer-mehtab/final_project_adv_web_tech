import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'B2B Marketplace', 
  description: 'The premier platform for B2B wholesale trading.', 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-base-100 text-base-content">
       <Toaster position="top-center" /> 
        {children}
      </body>
    </html>
  );
}