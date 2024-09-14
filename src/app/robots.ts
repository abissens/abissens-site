import { MetadataRoute } from 'next';
import { metadataInf } from '@/components/metadata';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/'],
    },
    sitemap: `${metadataInf.url}/sitemap.xml`,
  };
}