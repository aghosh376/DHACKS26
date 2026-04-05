export declare function buildStockHistory(
  rmpHistoricalOutput: Record<string, Record<string, number[]>>
): Record<string, Array<{ date: string; price: number }>>;

export declare function applyDailyUpdate(
  currentPrice: number,
  newRatings: number[]
): number;
