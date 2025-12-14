import {MDXRemote} from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import path from 'path';
import * as fs from 'node:fs';
import Link from 'next/link';
import { PersonStructuredData } from '@/components/seo/StructuredData';
import { metadataInf } from '@/components/metadata';
import type { Metadata } from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: `About | ${metadataInf.siteName}`,
  description: 'A developer writing about software development, design patterns, and tools.',
  openGraph: {
    type: 'website',
    url: `${metadataInf.url}/about`,
    title: `About | ${metadataInf.siteName}`,
    description: 'A developer writing about software development, design patterns, and tools.',
    siteName: metadataInf.siteName,
    locale: 'en_US',
    images: [
      {
        url: '/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'About Abissens',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About | ${metadataInf.siteName}`,
    description: 'A developer writing about software development, design patterns, and tools.',
    images: ['/assets/og-image.png'],
  },
  alternates: {
    canonical: `${metadataInf.url}/about`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const mdOptions = {
    mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
    }
}

export default async function About() {
    const aboutPath = path.join(process.cwd(), 'src', 'posts', '.about.md');
    const content = fs.readFileSync(aboutPath, 'utf-8');

    return (
        <div className={styles.aboutPage}>
            <PersonStructuredData
                name="Abissens"
                url={metadataInf.url}
                sameAs={['https://github.com/abissens', 'https://twitter.com/abissens', 'https://www.linkedin.com/in/hichem-ben-sassi-5ab200224/']}
            />

            <main className={styles.aboutContent}>
                <MDXRemote source={content} options={mdOptions}/>
            </main>

            <div className={styles.socialLinks}>
                <Link href="https://github.com/abissens" target="_blank" rel="noopener noreferrer">GitHub</Link>
                <Link href="https://twitter.com/abissens" target="_blank" rel="noopener noreferrer">Twitter</Link>
                <Link href="https://www.linkedin.com/in/hichem-ben-sassi-5ab200224/" target="_blank" rel="noopener noreferrer">LinkedIn</Link>
            </div>
        </div>
    );
}
