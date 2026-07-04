import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hifdh Companion',
  description: "Sistema inteligente para memorização do Al-Qur'an",
  themeColor: '#1B5E42',
  viewport: 'width=device-width, initial-scale=1',
  manifest: '/manifest.json',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
