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
        twitter?: string;
        linkedin?: string;
    };
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

    getPosts(): PostData[] {
        return this.sortedPosts;
    }

    getPost(slug: string): PostData | undefined {
        return this.posts[slug];
    }

    getPostsByTag(tag: string): PostData[] {
        return this.tagIndex[tag] || [];
    }

    getAllTags(): string[] {
        return this.allTags;
    }

    getTagsWithCount(): Array<{ tag: string; count: number }> {
        return this.allTags.map(tag => ({
            tag,
            count: this.tagIndex[tag].length
        }));
    }

    getAdjacentPosts(slug: string): { prev: PostData | null; next: PostData | null } {
        const index = this.sortedPosts.findIndex(post => post.slug === slug);
        if (index === -1) {
            return { prev: null, next: null };
        }
        return {
            prev: index < this.sortedPosts.length - 1 ? this.sortedPosts[index + 1] : null,
            next: index > 0 ? this.sortedPosts[index - 1] : null,
        };
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
                content += `${trimmedLine}\n`;
            }
        }
        const {data} = matter(`---\n${matterContent}\n---`);
        const parsedDate = parseISO(data.date);

        const tags = Array.isArray(data.tags) ? data.tags :
                     typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) :
                     [];

        let socialUrls: { twitter?: string; linkedin?: string } | undefined;
        if (data.twitter || data.linkedin) {
            socialUrls = {
                twitter: data.twitter,
                linkedin: data.linkedin,
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

export const postBundle = new PostBundle(postsDirectory);
