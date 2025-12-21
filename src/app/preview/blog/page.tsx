import { Suspense } from 'react';
import { postBundle } from '@/lib/posts';
import styles from '@/app/blog/page.module.scss';
import PaginatedPostList from '@/components/blog/PaginatedPostList';

export default async function PreviewBlogPage() {
    const posts = postBundle.getPosts();

    return (
        <div className={styles.postListPage}>
            <Suspense fallback={<div>Loading posts...</div>}>
                <PaginatedPostList posts={posts} showDrafts={true} basePath="/preview/blog" />
            </Suspense>
        </div>
    );
}
