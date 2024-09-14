import localFont from "next/font/local";
import "./globals.scss";
import Header from '@/components/header';
import styles from './layout.module.css';
import {ThemeProvider} from '@/components/providers/ThemeContext';
import { WebsiteStructuredData } from '@/components/seo/StructuredData';
import { metadataInf } from '@/components/metadata';
import 'highlight.js/styles/github-dark-dimmed.css';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export { metadata, viewport } from '@/components/metadata';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var d = document.documentElement;
                var c = d.classList;
                c.remove('light', 'dark');
                var e = localStorage.getItem('theme');
                var t = 'system';

                if (e === 'light' || e === 'dark') {
                  t = e;
                } else {
                  t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }

                if (t === 'light') c.add('light');
                if (t === 'dark') c.add('dark');

                d.style.colorScheme = t;
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <div className={styles.layoutWrapper}>
          <WebsiteStructuredData
            url={metadataInf.url}
            name={metadataInf.siteName}
            description={metadataInf.description}
          />
          <ThemeProvider>
            <Header></Header>
            {children}
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
