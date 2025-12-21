import {MDXRemote} from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import path from 'path';
import * as fs from 'node:fs';
import Link from 'next/link';
import { PersonStructuredData } from '@/components/seo/StructuredData';
import { metadataInf } from '@/components/metadata';
import { postBundle } from '@/lib/posts';
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
    const author = postBundle.getAuthor('Abissens');

    const sameAs = [author?.github, author?.x, author?.linkedin].filter(Boolean) as string[];

    return (
        <div className={styles.aboutPage}>
            <PersonStructuredData
                name="Abissens"
                url={metadataInf.url}
                sameAs={sameAs}
            />

            <main className={styles.aboutContent}>
                <MDXRemote source={content} options={mdOptions}/>
            </main>

            <div className={styles.socialLinks}>
                {author?.github && (
                    <Link href={author.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                        <span className={`${styles.socialIcon} ${styles.github}`} />
                    </Link>
                )}
                {author?.x && (
                    <Link href={author.x} target="_blank" rel="noopener noreferrer" aria-label="X">
                        <span className={`${styles.socialIcon} ${styles.x}`} />
                    </Link>
                )}
                {author?.linkedin && (
                    <Link href={author.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <span className={`${styles.socialIcon} ${styles.linkedin}`} />
                    </Link>
                )}
                {author?.email && (
                    <Link href={`mailto:${author.email}`} aria-label="Email">
                        <span className={`${styles.socialIcon} ${styles.email}`} />
                    </Link>
                )}
            </div>
        </div>
    );
}
