import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Takes the output of a scrapeReddit function ({ professorName: string[] })
 * and uses Gemini to evaluate each professor from 0–100.
 *
 * Returns a map suitable for MongoDB storage:
 * {
 *   "Prof Name": {
 *     score: 78,
 *     summary: "Highly regarded for clear explanations...",
 *     commentCount: 5,
 *     evaluatedAt: Date
 *   }
 * }
 */
export async function evaluateProfessorsFromReddit(redditOutput, geminiApiKey) {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const professorEntries = Object.entries(redditOutput).filter(
    ([, comments]) => comments && comments.length > 0
  );

  if (professorEntries.length === 0) return {};

  const evaluations = await Promise.all(
    professorEntries.map(async ([name, comments]) => {
      const prompt = `
        You are evaluating a UCSD professor based on student comments from Reddit.
        Professor: ${name}

        Student comments:
        ${comments.map((c, i) => `${i + 1}. ${c}`).join("\n")}

        Evaluate this professor on teaching performance, personality, and character
        traits on a scale from 0 to 100 (0 = very poor, 100 = excellent).

        Respond with ONLY a valid JSON object, no markdown, no extra text:
        {"score": <integer 0-100>, "summary": "<1-2 sentence evaluation summary>"}
      `.trim();

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().replace(/```json\n?|\n?```/g, "");
        const parsed = JSON.parse(text);
        return [
          name,
          {
            score: Math.max(0, Math.min(100, Math.round(parsed.score))),
            summary: parsed.summary,
            commentCount: comments.length,
            evaluatedAt: new Date(),
          },
        ];
      } catch {
        return [
          name,
          {
            score: 50,
            summary: "Evaluation unavailable.",
            commentCount: comments.length,
            evaluatedAt: new Date(),
          },
        ];
      }
    })
  );

  return Object.fromEntries(evaluations);
}
