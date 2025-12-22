/**
 * Custom highlight.js configuration with only needed languages.
 * This reduces bundle size by ~80% compared to loading all languages.
 *
 * Languages used in blog posts:
 * - java: Primary language for Spring/JPA articles
 * - shell/bash: Command line examples
 * - sql: Database queries
 * - typescript: Code examples
 * - properties: Spring configuration files
 * - xml: Maven/Spring XML configs
 * - json: API responses, configs
 * - yaml: Kubernetes, Docker configs
 */

import { common, createLowlight } from 'lowlight';

// Import only the languages we need (beyond common)
import java from 'highlight.js/lib/languages/java';
import sql from 'highlight.js/lib/languages/sql';
import properties from 'highlight.js/lib/languages/properties';
import yaml from 'highlight.js/lib/languages/yaml';

// Create lowlight instance with common languages
// Common includes: bash, c, cpp, csharp, css, diff, go, graphql, ini,
// java, javascript, json, kotlin, less, lua, makefile, markdown,
// objectivec, perl, php, python, r, ruby, rust, scss, shell, sql,
// swift, typescript, xml, wasm
const lowlight = createLowlight(common);

// Register additional languages not in common set
lowlight.register('java', java);
lowlight.register('sql', sql);
lowlight.register('properties', properties);
lowlight.register('yaml', yaml);

// Alias for convenience
lowlight.registerAlias('sh', 'bash');
lowlight.registerAlias('zsh', 'bash');
lowlight.registerAlias('yml', 'yaml');
lowlight.registerAlias('ts', 'typescript');
lowlight.registerAlias('js', 'javascript');

export { lowlight };
