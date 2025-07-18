import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "next-themes"

const title = 'JSON Editor Pro | View, Edit & Format JSON Online';
const description = 'A powerful, free, and intuitive online tool to view, edit, and format JSON data in a clean, user-friendly tree view. Load JSON from a URL or file. Download your edited JSON with one click.';
const url = "https://iamtiksha.com/dev-tools/json-editor-pro/";

export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: ['json editor', 'json viewer', 'json formatter', 'online json tool', 'free json editor', 'visual json editor', 'json tree view'],
  openGraph: {
    title: title,
    description: description,
    url: url,
    type: 'website',
    images: [
        {
            url: `${url}og-image.png`,
            width: 1200,
            height: 630,
            alt: 'JSON Editor Pro',
        },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: [`${url}og-image.png`],
  },
  alternates: {
    canonical: url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4648414963251970"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="font-body antialiased h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
