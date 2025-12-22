import styles from './post-list.module.scss';
import PostItem from '@/components/posts/post-item';
import { PostData, SearchPost } from '@/lib/posts';

interface PostListProps {
    posts: (PostData | SearchPost)[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
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
