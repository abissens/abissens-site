import path from 'path';
import * as fs from 'fs';
import matter from 'gray-matter';
import {format, parseISO} from 'date-fns';
import * as yaml from 'js-yaml';

export interface AuthorAttr {
    x: string | undefined;
    email: string | undefined;
    github: string | undefined;
    linkedin: string | undefined;
}

export interface Author extends AuthorAttr {
    name: string;
}

export interface PostData {
    slug: string;
    title: string;
    date: string;
    formattedDate: string,
    timestamp: number;
    summary: string;
    content: string;
    author: Author | undefined;
    tags: string[];
    socialUrls?: {
        x?: string;
        linkedin?: string;
        git?: string;
    };
}

// Lightweight post data for search - no full content
export interface SearchPost {
    slug: string;
    title: string;
    summary: string;
    tags: string[];
    formattedDate: string;
    author: Author | undefined;
    searchContent: string; // Processed plain text excerpt
}

class PostBundle {

    private readonly authors: Record<string, Author>;
    private readonly posts: Record<string, PostData>;
    private readonly sortedPosts: PostData[];
    private readonly tagIndex: Record<string, PostData[]>;
    private readonly allTags: string[];

    constructor(private postsDirectory: string) {
        this.authors = this.loadAuthors(postsDirectory);
        this.posts = this.load(postsDirectory, this.authors);
        this.sortedPosts = [...Object.values(this.posts)].sort((a, b) => b.timestamp - a.timestamp);
        this.tagIndex = this.buildTagIndex(this.sortedPosts);
        this.allTags = Object.keys(this.tagIndex).sort();
    }

    private isPreview(post: PostData): boolean {
        return post.tags.includes('preview');
    }

    getPosts(): PostData[] {
        return this.sortedPosts;
    }

    getPublishedPosts(): PostData[] {
        return this.sortedPosts.filter(post => !this.isPreview(post));
    }

    getPost(slug: string): PostData | undefined {
        return this.posts[slug];
    }

    getPostsByTag(tag: string): PostData[] {
        return this.tagIndex[tag] || [];
    }

    getPublishedPostsByTag(tag: string): PostData[] {
        return (this.tagIndex[tag] || []).filter(post => !this.isPreview(post));
    }

    getAllTags(): string[] {
        return this.allTags;
    }

    getPublishedTags(): string[] {
        return this.allTags.filter(tag => tag !== 'preview');
    }

    getTagsWithCount(): Array<{ tag: string; count: number }> {
        return this.allTags.map(tag => ({
            tag,
            count: this.tagIndex[tag].length
        }));
    }

    getPublishedTagsWithCount(): Array<{ tag: string; count: number }> {
        return this.getPublishedTags().map(tag => ({
            tag,
            count: this.getPublishedPostsByTag(tag).length
        }));
    }

    getAdjacentPosts(slug: string): { prev: PostData | null; next: PostData | null } {
        const publishedPosts = this.getPublishedPosts();
        const index = publishedPosts.findIndex(post => post.slug === slug);
        if (index === -1) {
            return { prev: null, next: null };
        }
        return {
            prev: index < publishedPosts.length - 1 ? publishedPosts[index + 1] : null,
            next: index > 0 ? publishedPosts[index - 1] : null,
        };
    }

    getAllAdjacentPosts(slug: string): { prev: PostData | null; next: PostData | null } {
        const index = this.sortedPosts.findIndex(post => post.slug === slug);
        if (index === -1) {
            return { prev: null, next: null };
        }
        return {
            prev: index < this.sortedPosts.length - 1 ? this.sortedPosts[index + 1] : null,
            next: index > 0 ? this.sortedPosts[index - 1] : null,
        };
    }

    getAuthor(name: string): Author | undefined {
        return this.authors[name.toLowerCase()];
    }

    getSearchIndex(): SearchPost[] {
        return this.getPublishedPosts().map(post => ({
            slug: post.slug,
            title: post.title,
            summary: post.summary,
            tags: post.tags,
            formattedDate: post.formattedDate,
            author: post.author,
            searchContent: this.stripMarkdown(post.content).slice(0, 500),
        }));
    }

    private stripMarkdown(content: string): string {
        return content
            .replace(/```[\s\S]*?```/g, ' ')        // Remove code blocks
            .replace(/`[^`]+`/g, ' ')               // Remove inline code
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links to text
            .replace(/!\[[^\]]*\]\([^)]+\)/g, '')   // Remove images
            .replace(/[#*_~>`|]/g, '')              // Remove markdown chars
            .replace(/<[^>]+>/g, '')                // Remove HTML tags
            .replace(/\s+/g, ' ')                   // Normalize whitespace
            .trim();
    }

    private buildTagIndex(posts: PostData[]): Record<string, PostData[]> {
        const index: Record<string, PostData[]> = {};

        for (const post of posts) {
            for (const tag of post.tags) {
                if (!index[tag]) {
                    index[tag] = [];
                }
                index[tag].push(post);
            }
        }

        return index;
    }

    private loadAuthors(dir: string): Record<string, Author> {
        const authorFilePath = path.join(dir, 'authors.yaml');
        if (!fs.existsSync(authorFilePath)) {
            return {};
        }
        const fileContent = fs.readFileSync(authorFilePath, 'utf8');
        const rawData = yaml.load(fileContent, {}) as Record<string, AuthorAttr>;
        return Object.entries(rawData).reduce(
            (acc, [key, value]) => {
                acc[key.toLowerCase()] = {
                    name: key,
                    ...value
                };
                return acc;
            },
            {} as Record<string, Author>
        );
    }

    private load(dir: string, authors: Record<string, Author>): Record<string, PostData> {
        const result = {};
        this._loadRec(dir, authors, result);
        return result;
    }

    private _loadRec(dir: string, authors: Record<string, Author>, result: Record<string, PostData>): void {
        const items = fs.readdirSync(dir, {withFileTypes: true});

        for (const item of items) {
            const itemPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                this._loadRec(itemPath, authors, result);
            } else if (/\.mdx?$/.test(item.name) && !item.name.startsWith('.')) {
                const postData = this.loadFile(itemPath, authors);
                if (!result[postData.slug]) {
                    result[postData.slug] = postData;
                }
            }
        }
    }

    private loadFile(filePath: string, authors: Record<string, Author>): PostData {

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split(/\r?\n/);

        let section = -1;
        let matterContent = '';
        let content = '';
        let summary = '';
        for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine === '---') {
                section++;
                continue;
            }

            if (section === 0) {
                matterContent += `${trimmedLine}\n`;
            } else if (section === 1) {
                summary += `${trimmedLine}\n`;
            } else if (section === 2) {
                content += `${line}\n`;
            }
        }
        const {data} = matter(`---\n${matterContent}\n---`);
        const parsedDate = parseISO(data.date);

        const tags = Array.isArray(data.tags) ? data.tags :
                     typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) :
                     [];

        let socialUrls: { x?: string; linkedin?: string; git?: string } | undefined;
        if (data.x || data.linkedin || data.git) {
            socialUrls = {
                x: data.x,
                linkedin: data.linkedin,
                git: data.git,
            };
        }

        return {
            title: data.title,
            date: data.date,
            formattedDate: format(parsedDate, 'MMMM dd, yyyy'),
            timestamp: parsedDate.getTime(),
            slug: this.makeSlug(data, filePath),
            summary,
            content,
            author: authors[data.author?.toLowerCase()],
            tags: tags.filter((tag: string) => tag.length > 0),
            socialUrls
        }
    }

    private makeSlug(data: { [p: string]: unknown }, filePath: string) {
        if (typeof data.slug === 'string') {
            return data.slug;
        }

        const relativePath = path.relative(this.postsDirectory, filePath);
        const parts = relativePath.split(path.sep);

        if (parts.length > 1) {
            return relativePath
                .replaceAll(/[\s\\/]/g, '_')
                .replace(/\..+?$/, '')
                .toLowerCase();
        } else {
            return parts[0]
                .replace(/\..+?$/, '')
                .replaceAll(/[\s]/g, '_')
                .toLowerCase();
        }
    }

}

const postsDirectory = path.join(process.cwd(), 'src', 'posts');

// In dev mode, always create fresh bundle to pick up MD changes
// In production, cache the bundle for performance
const createBundle = () => new PostBundle(postsDirectory);

const productionBundle = process.env.NODE_ENV === 'production' ? createBundle() : null;

export const postBundle = new Proxy({} as PostBundle, {
    get(_, prop: keyof PostBundle) {
        const bundle = productionBundle ?? createBundle();
        const value = bundle[prop];
        return typeof value === 'function' ? value.bind(bundle) : value;
    }
});
