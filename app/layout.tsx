import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "She's On First | Women's Baseball Media",
  description:
    "Meet the Inaugural 60 through sourced profiles, structured data, and public-knowledge work.",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
