import Link from 'next/link';
import styles from './post-item.module.scss';
import AuthorComponent from '@/components/posts/author';
import TagList from '@/components/tags/TagList';
import PostSummary from '@/components/posts/PostSummary';
import { Author } from '@/lib/posts';

interface PostItemProps {
  slug: string;
  title: string;
  formattedDate: string;
  summary: string;
  author: Author | undefined;
  tags: string[];
  basePath?: string;
}

export default function PostItem({ title, slug, formattedDate, summary, author, tags, basePath = '/blog' }: PostItemProps) {
  const postUrl = `${basePath}/${slug}`;
  return (
    <div className={styles.postItem}>
      <div>
        <Link className={styles.postTitleLink} href={postUrl}>
          <h2 className={styles.postTitle}>{title}</h2>
        </Link>
        <div className={styles.postHead}>
          <div className={styles.calendar}>&nbps;</div>
          <span>{formattedDate}</span>
          <AuthorComponent className={styles.author} author={author} />
        </div>

        <TagList tags={tags} showLinks={true} className={styles.tags} />

        <div className={styles.postSummary}>
          <PostSummary summary={summary} />
          <Link className={styles.readMoreLink} href={postUrl}>read more</Link>
        </div>
      </div>
    </div>
  );
}
