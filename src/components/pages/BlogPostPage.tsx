import { postBundle, PostData } from '@/lib/posts';
import { RouteMode } from '@/lib/routes';
import AuthorComponent from '@/components/posts/author';
import TagList from '@/components/tags/TagList';
import dynamic from 'next/dynamic';
import PostFooter from '@/components/blog/PostFooter';
import { BlogPostStructuredData } from '@/components/seo/StructuredData';
import { metadataInf } from '@/components/metadata';
import SafeMDXContent from '@/components/mdx/SafeMDXContent';
import Diagram from '@/components/diagram/Diagram';
import { NewsletterSubscribe } from '@/components/newsletter';
import styles from '@/app/blog/[slug]/page.module.scss';

const ShareButtons = dynamic(() => import('@/components/share/ShareButtons'), {
  loading: () => <div style={{ minHeight: '200px' }} />
});

const mdxComponents = {
  Diagram,
};

interface BlogPostPageProps {
  post: PostData;
  mode: RouteMode;
}

export default function BlogPostPage({ post, mode }: BlogPostPageProps) {
  const { content, title, formattedDate, author, tags, summary, socialUrls, slug } = post;
  const basePath = mode === 'preview' ? '/preview/blog' : '/blog';
  const postUrl = `${metadataInf.url}${basePath}/${slug}`;

  const { prev, next } = mode === 'preview'
    ? postBundle.getAllAdjacentPosts(slug)
    : postBundle.getAdjacentPosts(slug);

  return (
    <div>
      {mode === 'published' && <BlogPostStructuredData post={post} url={metadataInf.url} />}
      <div className={styles.postHeader}>
        <h2 className={styles.postTitle}>{title}</h2>
        <div className={styles.postHead}>
          <div className={styles.calendar}>&nbsp;</div>
          <span>{formattedDate}</span>
          <AuthorComponent className={styles.author} author={author} />
        </div>
        <TagList tags={tags} showLinks={true} className={styles.tags} />
      </div>
      <div className={styles.postContent}>
        <SafeMDXContent content={content} components={mdxComponents} />
      </div>
      <NewsletterSubscribe />
      <ShareButtons
        variant="floating"
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
