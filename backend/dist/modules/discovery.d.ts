/**
 * Connector: arXiv RSS feed (default: Computer Science)
 */
export declare function connectorArxiv(rssUrl?: string): Promise<{
    url: string;
    title?: string;
    source: string;
}[]>;
/**
 * Connector: OpenAlex (recent works)
 */
export declare function connectorOpenAlex(cursor?: string, perPage?: number): Promise<{
    url: string;
    title?: string;
    source: string;
}[]>;
/**
 * Connector: CrossRef (recent publications)
 */
export declare function connectorCrossRef(rows?: number): Promise<{
    url: string;
    title?: string;
    source: string;
}[]>;
/**
 * Connector: Common Crawl (very lightweight demo)
 */
export declare function connectorCommonCrawl(query?: string): Promise<{
    url: string;
    title?: string;
    source: string;
}[]>;
/**
 * Main: Run discovery cycle and insert into Supabase
 */
export declare function runDiscoveryCycle(): Promise<{
    added: number;
    skipped: number;
}>;
//# sourceMappingURL=discovery.d.ts.map