import { postBundle } from '@/lib/posts';
import BasicSearchClient from './BasicSearchClient';

export default function BasicSearch() {
  const searchIndex = postBundle.getSearchIndex();

  return <BasicSearchClient posts={searchIndex} />;
}