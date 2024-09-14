import {MDXRemote} from 'next-mdx-remote/rsc';
import {postBundle} from '@/lib/posts';
import {notFound} from 'next/navigation';
import AuthorComponent from '@/components/posts/author';
import TagList from '@/components/tags/TagList';
import FloatingSocialShare from '@/components/share/FloatingSocialShare';
import styles from './page.module.scss';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { BlogPostStructuredData } from '@/components/seo/StructuredData';
import { metadataInf } from '@/components/metadata';
import type { Metadata } from 'next';

export async function generateStaticParams() {
    return postBundle.getPosts().map(post => ({slug: post.slug}));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = postBundle.getPost(slug);

    if (!post) {
        return {};
    }

    const url = `${metadataInf.url}/blog/${post.slug}`;
    const summary = post.summary.substring(0, 160).trim();

    return {
        title: `${post.title} | ${metadataInf.siteName}`,
        description: summary,
        keywords: ['programming', 'coding', 'software development', 'technology', 'blog', post.title.toLowerCase()],
        authors: [{ name: post.author?.name || 'Abissens', url: post.author?.github || metadataInf.url }],
        openGraph: {
            type: 'article',
            url,
            title: post.title,
            description: summary,
            siteName: metadataInf.siteName,
            locale: 'en_US',
            images: [
                {
                    url: '/assets/og-image.png',
                    width: 793,
                    height: 771,
                    alt: post.title,
                }
            ],
            publishedTime: post.date,
            authors: [post.author?.name || 'Abissens'],
            section: 'Technology',
            tags: ['programming', 'coding', 'technology'],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: summary,
            images: ['/assets/og-image.png'],
            creator: '@abissens',
        },
        alternates: {
            canonical: url,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

const mdOptions = {
    mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
    }
}

export default async function BlogPost({params}: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = postBundle.getPost(slug);
    if (!post) {
        return notFound();
    }
    const {content, title, formattedDate, author, tags, summary, socialUrls} = post;
    const postUrl = `${metadataInf.url}/blog/${slug}`;

    return (
        <div>
            <BlogPostStructuredData post={post} url={metadataInf.url} />
            <div className={styles.postHeader}>
                <h2 className={styles.postTitle}>{title}</h2>
                <div className={styles.postHead}>
                    <div className={styles.calendar}>&nbsp;</div>
                    <span>{formattedDate}</span>
                    <AuthorComponent className={styles.author} author={author}/>
                </div>
                <TagList tags={tags} showLinks={true} className={styles.tags} />
            </div>
            <div className={styles.postContent}>
                <MDXRemote source={content} options={mdOptions}/>
            </div>
            <FloatingSocialShare
                url={postUrl}
                title={title}
                description={summary}
                socialUrls={socialUrls}
            />
        </div>
    );
}
