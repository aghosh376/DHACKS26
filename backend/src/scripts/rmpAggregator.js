/**
 * Takes the output of scrapeRMPHistorical:
 *   { "Prof Name": { "YYYY-MM-DD": [rating, ...] } }
 *
 * Returns the same structure with each date's array summed to a single number:
 *   { "Prof Name": { "YYYY-MM-DD": totalSum } }
 */
export function aggregateRMPByDate(rmpHistoricalOutput) {
  const result = {};

  for (const [profName, dateMap] of Object.entries(rmpHistoricalOutput)) {
    result[profName] = {};
    for (const [date, ratings] of Object.entries(dateMap)) {
      result[profName][date] = ratings.reduce((sum, r) => sum + r, 0);
    }
  }

  return result;
}
