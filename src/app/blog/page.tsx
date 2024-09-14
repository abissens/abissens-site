import { Suspense } from 'react';
import { postBundle } from '@/lib/posts';
import styles from './page.module.scss';
import PaginatedPostList from '@/components/blog/PaginatedPostList';
import { BlogStructuredData } from '@/components/seo/StructuredData';
import { metadataInf } from '@/components/metadata';

export default async function BlogPage() {
    const posts = postBundle.getPosts();

    return (
        <div className={styles.postListPage}>
            <BlogStructuredData url={metadataInf.url} />
            <Suspense fallback={<div>Loading posts...</div>}>
                <PaginatedPostList posts={posts} />
            </Suspense>
        </div>
    );
}
