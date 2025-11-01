export declare function fetchLatestCommonCrawlIndex(): Promise<string | null>;
/**
 * Query Common Crawl index for pages matching a prefix or pattern.
 * Note: CC index returns newline-separated JSON; we parse N lines.
 */
export declare function queryCommonCrawlIndex(indexId: string, pattern?: string, limit?: number): Promise<{
    url: string;
    title?: string;
    source: string;
}[]>;
//# sourceMappingURL=commoncrawlconnector.d.ts.map