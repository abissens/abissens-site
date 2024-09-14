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
  description: 'Learn about Abissens - a developer who writes code and shares thoughts on software development without oversimplified metaphors.',
  openGraph: {
    type: 'website',
    url: `${metadataInf.url}/about`,
    title: `About | ${metadataInf.siteName}`,
    description: 'Learn about Abissens - a developer who writes code and shares thoughts on software development without oversimplified metaphors.',
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
    description: 'Learn about Abissens - a developer who writes code and shares thoughts on software development without oversimplified metaphors.',
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

            <div className={styles.decorativeElement}></div>


            <main className={styles.aboutContent}>
                <MDXRemote source={content} options={mdOptions}/>
            </main>

            <footer className={styles.socialLinks}>
                <Link href="https://github.com/abissens" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                    <span>GitHub</span>
                </Link>
                <Link href="https://twitter.com/abissens" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                    <span>Twitter</span>
                </Link>
                <Link href="https://www.linkedin.com/in/hichem-ben-sassi-5ab200224/" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                    <span>LinkedIn</span>
                </Link>
                <Link href="/blog" className={styles.socialLink}>
                    <span>Blog</span>
                </Link>
            </footer>
        </div>
    );
}
