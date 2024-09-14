import { postBundle } from '@/lib/posts';
import BasicSearchClient from './BasicSearchClient';

export default function BasicSearch() {
  const allPosts = postBundle.getPosts();

  return <BasicSearchClient posts={allPosts} />;
}