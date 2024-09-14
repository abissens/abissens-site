import { postBundle } from '@/lib/posts';
import TagCloud from '@/components/tags/TagCloud';
import styles from './page.module.scss';

export default function TagsPage() {
  const tagsWithCount = postBundle.getTagsWithCount();

  return (
    <div className={styles.tagsPage}>
      <h1 className={styles.pageTitle}>All Tags</h1>
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