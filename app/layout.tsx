import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from '@/components/providers'
import { FloatingButtons } from '@/components/floating-buttons'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Affordable Diagnostic Tests & Blood Tests in Bankra | Capsic Care',
  description: 'Book low-cost diagnostic tests and affordable blood tests in Bankra, Bankra Bazar, Kabar Para, Kona, Makardah, Domjur, Santragachi & Howrah. 100% transparent pricing, free home sample collection & NABL verified smart reports.',
  applicationName: 'Capsic Care',
  keywords: [
    'Affordable Blood Tests in Bankra',
    'Low-Cost Diagnostic Tests in Bankra',
    'Blood Test Near Bankra',
    'Affordable Pathology Tests',
    'Home Sample Collection in Bankra',
    'Diagnostic Tests at Low Prices',
    'Affordable Blood Tests Near Me',
    'Low-Cost Diagnostic Tests Near Me',
    'Affordable Diagnostic Centre in Bankra & Nearby Areas',
    'Blood Test Near Bankra Bazar',
    'Blood Test Kabar Para',
    'Diagnostic Tests Kona',
    'Blood Test Makardah',
    'Blood Test Domjur',
    'Blood Test Santragachi',
    'Home Sample Collection Near Me',
    'Transparent Test Pricing Howrah'
  ],
  authors: [{ name: 'Capsic Care Diagnostics', url: 'https://capsic.in' }],
  creator: 'Capsic Care',
  publisher: 'Capsic Care',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://capsic.in',
    siteName: 'Capsic Care Diagnostics',
    title: 'Capsic Care - Affordable Diagnostic Tests & Free Home Collection in Bankra',
    description: 'Low-cost, budget-friendly diagnostic testing with transparent pricing and free doorstep collection across Bankra, Kona, Makardah, Domjur & Santragachi.',
  },
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon.ico-nxS6U5rxDT825FktLrsnxQGfW3GKNS.x-icon',
    apple: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon.ico-nxS6U5rxDT825FktLrsnxQGfW3GKNS.x-icon',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0D9488',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-449P3ZJ4J9"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-449P3ZJ4J9');
          `}
        </Script>

        {/* Clarity tracking code for https://capsic.in/ */}
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vusq4h0thk");
          `}
        </Script>

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1005214548730833');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1005214548730833&ev=PageView&noscript=1" alt="" />
        </noscript>
      </head>
      <body suppressHydrationWarning className={`${_geist.className} font-sans antialiased bg-white dark:bg-[#0a0e14] text-slate-900 dark:text-[#f0f4f8]`}>
        <Providers>
          {children}
          <FloatingButtons />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
