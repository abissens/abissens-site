import { postBundle } from '@/lib/posts';
import BasicSearchClient from './BasicSearchClient';

export default function BasicSearch() {
  const allPosts = postBundle.getPublishedPosts();

  return <BasicSearchClient posts={allPosts} />;
}