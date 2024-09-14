import { PostData } from '@/lib/posts';

interface WebsiteStructuredDataProps {
  url: string;
  name: string;
  description: string;
}

interface BlogPostStructuredDataProps {
  post: PostData;
  url: string;
}

interface PersonStructuredDataProps {
  name: string;
  url: string;
  sameAs?: string[];
}

export function WebsiteStructuredData({ url, name, description }: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "description": description,
    "url": url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/search?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

export function BlogPostStructuredData({ post, url }: BlogPostStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.summary.substring(0, 160).trim(),
    "image": `${url}/assets/og-image.png`,
    "author": {
      "@type": "Person",
      "name": post.author?.name || "Abissens",
      "url": `${url}/about`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Abissens",
      "logo": {
        "@type": "ImageObject",
        "url": `${url}/assets/logo.svg`
      }
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${url}/blog/${post.slug}`
    },
    "url": `${url}/blog/${post.slug}`,
    "articleSection": "Technology",
    "keywords": ["programming", "coding", "software development", "technology", ...post.tags]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

export function PersonStructuredData({ name, url, sameAs = [] }: PersonStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "url": url,
    "sameAs": sameAs,
    "jobTitle": "Software Developer",
    "worksFor": {
      "@type": "Organization",
      "name": "Abissens"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

export function BlogStructuredData({ url }: { url: string }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Abissens Blog",
    "description": "Notes from a developer stumbling forward",
    "url": `${url}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "Abissens",
      "logo": {
        "@type": "ImageObject",
        "url": `${url}/assets/logo.svg`
      }
    },
    "inLanguage": "en-US"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}
