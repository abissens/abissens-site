import Image from 'next/image';
import styles from './post-list.module.scss';
import PostItem from '@/components/posts/post-item';
import { PostData, SearchPost } from '@/lib/posts';

interface PostListProps {
    posts: (PostData | SearchPost)[];
}

function EmptyState() {
    return (
        <div className={styles.emptyState}>
            <Image
                src="/assets/workinprogress.png"
                alt="Work in progress"
                width={280}
                height={280}
                className={styles.emptyImage}
            />
            <h3 className={styles.emptyTitle}>Coming Soon</h3>
            <p className={styles.emptyMessage}>
                Articles will be published soon. Stay tuned!
            </p>
        </div>
    );
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
    if (posts.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={styles.postList + ' grid'}>
            {posts.map((post, index) => (
                <div
                    key={post.slug}
                    className={`${index < 4 ? styles.largePost : styles.gridPost}`}
                >
                    <PostItem
                        title={post.title}
                        slug={post.slug}
                        formattedDate={post.formattedDate}
                        summary={post.summary}
                        author={post.author}
                        tags={post.tags}
                    />
                </div>
            ))}
        </div>
    );
};

export default PostList;
