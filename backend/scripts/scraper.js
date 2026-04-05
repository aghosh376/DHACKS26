import { BrowserUse } from "browser-use-sdk/v3";
import { z } from "zod";

// // Web Scraper Base Structure
// // This file outlines the scraping architecture needed

export async function scrapeRateMyProf(key) {
  process.env.BROWSER_USE_API_KEY = key;
  const client = new BrowserUse();

  const rmpSchema = z.object({
    professors: z.array(
      z.object({
        name: z.string(),
        rating: z.number().nullable(),
      })
    ),
  });

  const task = `
    Go to https://www.ratemyprofessors.com/search/professors/1079?q=*
    This page lists UC San Diego (UCSD) professors on RateMyProfessors.
    For each professor card on the page, extract:
      - Their full name (first and last name)
      - Their overall rating (a decimal number like 4.5 shown on each card).
        If a card shows "N/A" or no numeric rating, use null for that professor's rating.
    After collecting all professors on the first page, click the button to load more
    results (labeled "Show More" or similar). Repeat until you have at least 100
    professors total or no more results exist.
    Return all collected professors as JSON matching the provided schema.
  `.trim();

  const result = await client.run(task, { schema: rmpSchema });

  const ratingMap = {};
  for (const prof of result.output.professors) {
    if (prof.rating !== null && prof.rating !== undefined) {
      ratingMap[prof.name] = Math.round(((prof.rating - 1) / 4) * 100);
    }
  }

  return ratingMap;
}

async function scrapeReddit(key, timeFilter, timeDescription) {
  process.env.BROWSER_USE_API_KEY = key;
  const client = new BrowserUse();

  const redditSchema = z.object({
    professors: z.array(
      z.object({
        name: z.string(),
        comments: z.array(z.string()),
      })
    ),
  });

  const task = `
    Go to https://www.reddit.com/r/UCSD/search/?q=CSE+professor&restrict_sr=1&sort=new&t=${timeFilter}
    This search shows r/UCSD posts from the last ${timeDescription} about CSE (Computer Science & Engineering) professors at UCSD.

    For each post in the search results:
    1. Note the post title.
    2. Open the post.
    3. Read the post body and all comments.
    4. Identify which specific CSE professor(s) are being discussed or evaluated
       (look for full names like "First Last" or common references like "Prof. Last").
    5. From each comment or post body, extract only the individual sentences that
       directly evaluate the professor's:
         - Teaching performance (e.g. clarity, helpfulness, lecture quality, grading fairness)
         - Personality (e.g. approachable, rude, enthusiastic, boring)
         - Character traits (e.g. caring, arrogant, passionate, dismissive)
       Do NOT include sentences about course logistics, workload, homework, exams,
       or anything that does not describe the professor as a person or teacher.
       Each extracted sentence should stand alone and clearly be about the professor.

    IMPORTANT: Before processing any post, check its timestamp.
    Only include posts that were made within the last ${timeDescription}.
    If a post is older than ${timeDescription}, skip it entirely — do not open it
    or include any of its comments in the results.

    After processing all visible posts within the time frame (at least 20, or all available if fewer):
    - Group the collected comments by professor name.
    - Return the results as JSON matching the provided schema.
    - Only include professors who have at least one evaluative comment.

    STOP CONDITION: As soon as you have finished processing all available posts,
    immediately return your results — do not continue browsing.
    TIMEOUT SAFETY: If 10 minutes have elapsed since you started, stop immediately
    and return whatever professors and comments you have collected so far in the
    proper schema format, even if you have not finished all posts.
  `.trim();

  const TEN_MINUTES = 10 * 60 * 1000;
  const timeout = new Promise((resolve) =>
    setTimeout(() => resolve({ output: { professors: [] } }), TEN_MINUTES)
  );

  const result = await Promise.race([
    client.run(task, { schema: redditSchema }),
    timeout,
  ]);

  const commentMap = {};
  for (const prof of result.output.professors) {
    if (prof.comments && prof.comments.length > 0) {
      commentMap[prof.name] = prof.comments;
    }
  }

  return commentMap;
}

export async function scrapeDayBackReddit(key) {
  return await scrapeReddit(key, "day", "24 hours");
}

export async function scrapeYearBackReddit(key) {
  return await scrapeReddit(key, "year", "year");
}

export async function scrape5YearsBackReddit(key) {
  return await scrapeReddit(key, "all", "5 years");
}



export async function scrapeRMPHistorical(key) {
  process.env.BROWSER_USE_API_KEY = key;
  const client = new BrowserUse();

  const rmpHistSchema = z.object({
    professors: z.array(
      z.object({
        name: z.string(),
        reviews: z.array(
          z.object({
            date: z.string(),    // "YYYY-MM-DD"
            rating: z.number(),  // 1.0–5.0
          })
        ),
      })
    ),
  });

  const task = `
    Step 1: Go to https://cse.ucsd.edu/people/faculty-profiles/faculty
    Collect the full name (first + last) of every faculty member listed on the page.

    Step 2: For each faculty name:
      a. Navigate to https://www.ratemyprofessors.com/search/professors/1079?q=<NAME>
         (URL-encode the name, e.g. "Pavel Pevzner" → "Pavel+Pevzner").
      b. Find and click the professor card whose name matches exactly.
         If no exact match exists, skip this faculty member.
      c. On their profile page, scroll to the reviews section.
         Click "Load More Ratings" repeatedly until all reviews are visible.
      d. For each review extract:
         - The date it was posted, formatted as YYYY-MM-DD.
         - The overall quality rating (a number from 1.0 to 5.0).

    Step 3: Return collected data as JSON matching the provided schema.
    Only include faculty members who have at least one review.

    STOP CONDITION: Return immediately once all faculty have been processed.
    TIMEOUT SAFETY: If 30 minutes have elapsed, return whatever has been collected
    so far in the proper schema format.
  `.trim();

  const THIRTY_MINUTES = 30 * 60 * 1000;
  const timeout = new Promise((resolve) =>
    setTimeout(() => resolve({ output: { professors: [] } }), THIRTY_MINUTES)
  );

  const handle = client.run(task, { schema: rmpHistSchema });
  const raw = await Promise.race([handle, timeout]);

  try {
    const sessionId = handle.sessionId;
    if (sessionId) await client.sessions.stop(sessionId);
  } catch (_) {}

  const result = {};
  for (const prof of raw.output.professors) {
    if (!prof.reviews || prof.reviews.length === 0) continue;
    result[prof.name] = {};
    for (const review of prof.reviews) {
      if (!result[prof.name][review.date]) result[prof.name][review.date] = [];
      result[prof.name][review.date].push(review.rating);
    }
  }

  return result;
}

async function runRedditHistoricalAgent(key, lastNameStart, lastNameEnd) {
  process.env.BROWSER_USE_API_KEY = key;
  const client = new BrowserUse();

  const schema = z.object({
    professors: z.array(
      z.object({
        name: z.string(),
        comments: z.array(z.string()),
      })
    ),
  });

  const task = `
    Step 1: Go to https://cse.ucsd.edu/people/faculty-profiles/faculty
    Collect the full name (first + last) of every faculty member listed.

    Step 2: From the collected list, keep ONLY professors whose LAST NAME starts
    with a letter from ${lastNameStart} to ${lastNameEnd} (inclusive, case-insensitive).
    Completely ignore all other professors — do not search them on Reddit.

    Step 3: For each professor in your filtered list:
      a. Navigate to https://www.reddit.com/r/UCSD/search/?q=<NAME>&restrict_sr=1&sort=new&t=all
         (URL-encode the name, e.g. "Pavel Pevzner" → "Pavel+Pevzner").
      b. For each post in the results:
         - Open the post and read the body and all top-level comments.
         - Extract only individual sentences that directly evaluate the professor's:
             * Teaching performance (clarity, helpfulness, lecture quality, grading fairness)
             * Personality (approachable, rude, enthusiastic, boring)
             * Character traits (caring, arrogant, passionate, dismissive)
           Do NOT include sentences about course logistics, workload, homework, or exams.
           Each sentence must stand alone and clearly describe the professor as a person or teacher.
      c. If no results are found for a professor, skip them.

    Step 4: Return collected data as JSON matching the provided schema.
    Only include professors who have at least one evaluative sentence.

    STOP CONDITION: Return immediately once all professors in your assigned range have been processed.
    TIMEOUT SAFETY: If 30 minutes have elapsed, return whatever has been collected
    so far in the proper schema format.
  `.trim();

  const THIRTY_MINUTES = 30 * 60 * 1000;
  const timeout = new Promise((resolve) =>
    setTimeout(() => resolve({ output: { professors: [] } }), THIRTY_MINUTES)
  );

  const handle = client.run(task, { schema });
  const raw = await Promise.race([handle, timeout]);

  try {
    const sessionId = handle.sessionId;
    if (sessionId) await client.sessions.stop(sessionId);
  } catch (_) {}

  const result = {};
  for (const prof of raw.output.professors) {
    if (prof.comments && prof.comments.length > 0) {
      result[prof.name] = prof.comments;
    }
  }
  return result;
}

export async function scrapeRedditHistorical(key) {
  const [resultA, resultB, resultC] = await Promise.all([
    runRedditHistoricalAgent(key, "A", "H"),
    runRedditHistoricalAgent(key, "I", "P"),
    runRedditHistoricalAgent(key, "Q", "Z"),
  ]);

  return { ...resultA, ...resultB, ...resultC };
}

/**
 * Scheduler
 * - Runs scrapers on schedule
 * - Handles errors and retries
 */
export class ScraperScheduler {
  async scheduleDaily() {
    // TODO: Use node-schedule or cron
    // - CAPE/SET: Quarterly (check manually or on fixed date)
    // - RateMyProfessor: Daily at 2 AM
    // - Reddit: Daily at 2:30 AM
    // - Aggregation: Daily at 12 AM
  }

  async handleError(scraperName, error) {
    // TODO: Error handling and logging
    // - Log to database
    // - Send alerts if critical
    // - Retry logic
  }
}

/**
 * Usage in server.js:
 * 
 * import { ScraperScheduler } from './scripts/scraper.js';
 * 
 * const scheduler = new ScraperScheduler();
 * scheduler.scheduleDaily();
 */
