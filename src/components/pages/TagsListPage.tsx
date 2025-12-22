import { postBundle } from '@/lib/posts';
import { RouteMode } from '@/lib/routes';
import TagCloud from '@/components/tags/TagCloud';
import styles from '@/app/tags/page.module.scss';

interface TagsListPageProps {
  mode: RouteMode;
}

export default function TagsListPage({ mode }: TagsListPageProps) {
  const tagsWithCount = mode === 'preview'
    ? postBundle.getTagsWithCount()
    : postBundle.getPublishedTagsWithCount();

  const title = mode === 'preview' ? 'All Tags (Preview)' : 'All Tags';

  return (
    <div className={styles.tagsPage}>
      <h1 className={styles.pageTitle}>{title}</h1>
      <p className={styles.description}>
        Browse posts by tags. Click on any tag to see related posts.
      </p>

      <div className={styles.tagCloudContainer}>
        <TagCloud tags={tagsWithCount} />
      </div>

      {tagsWithCount.length === 0 && (
        <div className={styles.noTags}>
          <p>No tags found. Tags will appear here when posts include them in their frontmatter.</p>
        </div>
      )}
    </div>
  );
}
