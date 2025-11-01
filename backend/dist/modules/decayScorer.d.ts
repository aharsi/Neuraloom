/**
 * Compute a decay probability (0..1) using multiple signals:
 * - domain age (WHOIS) -> newer domains more risky
 * - SSL days left -> short remaining cert -> risky
 * - content size / truncated flag -> smaller content slightly riskier
 * - host hints (if host contains free hosting providers, increase risk)
 */
export declare function computeDecayProbability(url: string, contentTruncated?: boolean): Promise<number>;
//# sourceMappingURL=decayScorer.d.ts.map