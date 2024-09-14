import type {Metadata, Viewport} from 'next';

export const metadataInf = {
    title: "Abissens",
    description: "Notes from a developer stumbling forward",
    icons: "/assets/logo.svg",
    url: "https://abissens.elethoughts.tech",
    siteName: "Abissens"
};

export const metadata: Metadata = {
    ...metadataInf,
    metadataBase: new URL(metadataInf.url),
    robots: {
        index: true,
        follow: true,
    },
    authors: [{ name: 'Abissens', url: metadataInf.url }],
    creator: 'Abissens',
    publisher: 'Abissens',
    keywords: ['programming', 'coding', 'software development', 'technology', 'blog'],
    category: 'technology',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: metadataInf.url,
        siteName: metadataInf.siteName,
        title: metadataInf.title,
        description: metadataInf.description,
        images: [
            {
                url: '/assets/og-image.png',
                width: 793,
                height: 771,
                alt: 'Abissens - Programming Blog',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: metadataInf.title,
        description: metadataInf.description,
        images: ['/assets/og-image.png'],
        creator: '@abissens',
    },
    alternates: {
        canonical: metadataInf.url,
        types: {
            'application/rss+xml': '/rss.xml',
        },
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};
