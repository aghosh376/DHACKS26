export declare function scrapeRateMyProf(key: string): Promise<Record<string, number>>;
export declare function scrapeDayBackReddit(key: string): Promise<Record<string, string[]>>;
export declare function scrapeYearBackReddit(key: string): Promise<Record<string, string[]>>;
export declare function scrape5YearsBackReddit(key: string): Promise<Record<string, string[]>>;
export declare function scrapeRMPHistorical(key: string): Promise<{
  reviews: Record<string, Record<string, number[]>>;
  departments: Record<string, string>;
}>;
export declare function scrapeRedditHistorical(key: string): Promise<Record<string, string[]>>;
