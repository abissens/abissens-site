export type RouteMode = 'published' | 'preview';

export interface RouteConfig {
  mode: RouteMode;
  paths: {
    blog: string;
    blogPost: (slug: string) => string;
    tags: string;
    tag: (tag: string) => string;
  };
  includePreviews: boolean;
}

const configs: Record<RouteMode, RouteConfig> = {
  published: {
    mode: 'published',
    paths: {
      blog: '/blog',
      blogPost: (slug) => `/blog/${slug}`,
      tags: '/tags',
      tag: (tag) => `/tags/${encodeURIComponent(tag)}`,
    },
    includePreviews: false,
  },
  preview: {
    mode: 'preview',
    paths: {
      blog: '/preview/blog',
      blogPost: (slug) => `/preview/blog/${slug}`,
      tags: '/preview/tags',
      tag: (tag) => `/preview/tags/${encodeURIComponent(tag)}`,
    },
    includePreviews: true,
  },
};

export function getRouteConfig(pathname: string): RouteConfig {
  return pathname.startsWith('/preview') ? configs.preview : configs.published;
}

export function getModeFromPathname(pathname: string): RouteMode {
  return pathname.startsWith('/preview') ? 'preview' : 'published';
}

export const routeConfigs = configs;
