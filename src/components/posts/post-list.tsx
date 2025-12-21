import styles from './post-list.module.scss';
import PostItem from '@/components/posts/post-item';
import {PostData} from '@/lib/posts';

interface PostListProps {
    posts: PostData[];
    basePath?: string;
}

const PostList: React.FC<PostListProps> = ({posts, basePath = '/blog'}) => {
    return (
        <div className={styles.postList + ' grid'}>
            {posts.map((post, index) => (
                <div
                    key={post.slug}
                    className={`${index < 4 ? styles.largePost : styles.gridPost}`}
                ><PostItem
                    title={post.title}
                    slug={post.slug}
                    formattedDate={post.formattedDate}
                    summary={post.summary}
                    author={post.author}
                    tags={post.tags}
                    basePath={basePath}
                />
                </div>
            ))}
        </div>
    );
};

export default PostList;
