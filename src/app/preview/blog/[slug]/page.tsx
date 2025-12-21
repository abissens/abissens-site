import {MDXRemote} from 'next-mdx-remote/rsc';
import {postBundle} from '@/lib/posts';
import {notFound} from 'next/navigation';
import AuthorComponent from '@/components/posts/author';
import TagList from '@/components/tags/TagList';
import dynamic from 'next/dynamic';
import styles from '@/app/blog/[slug]/page.module.scss';
import PostFooter from '@/components/blog/PostFooter';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { metadataInf } from '@/components/metadata';
import 'highlight.js/styles/github-dark-dimmed.css';
import Diagram from '@/components/diagram/Diagram';

const FloatingSocialShare = dynamic(() => import('@/components/share/FloatingSocialShare'), {
    loading: () => <div style={{ minHeight: '200px' }} />
});

export async function generateStaticParams() {
    return postBundle.getPosts().map(post => ({slug: post.slug}));
}

const mdxComponents = {
    Diagram,
};

const mdOptions = {
    mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight],
    }
}

export default async function PreviewBlogPost({params}: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = postBundle.getPost(slug);
    if (!post) {
        return notFound();
    }
    const {content, title, formattedDate, author, tags, summary, socialUrls} = post;
    const postUrl = `${metadataInf.url}/preview/blog/${slug}`;
    const { prev, next } = postBundle.getAdjacentPosts(slug);

    return (
        <div>
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
                <MDXRemote source={content} options={mdOptions} components={mdxComponents}/>
            </div>
            <FloatingSocialShare
                url={postUrl}
                title={title}
                description={summary}
                socialUrls={socialUrls}
            />
            <PostFooter
                author={author}
                prevPost={prev}
                nextPost={next}
                gitUrl={socialUrls?.git}
                shareUrl={postUrl}
                shareTitle={title}
                shareDescription={summary}
                socialUrls={socialUrls}
            />
        </div>
    );
}
