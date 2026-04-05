export interface Professor {
  id: string;
  ticker: string;
  name: string;
  department: string;
  avatar: string;
  sentiment: number; // 0-100
  rating: number; // 1-5
  difficulty: number; // 1-5
  tags: string[];
}

export const professors: Professor[] = [
  { id: "1", ticker: "CHEN", name: "Dr. Sarah Chen", department: "Computer Science", avatar: "👩‍💻", sentiment: 82, rating: 4.6, difficulty: 3.2, tags: ["Engaging", "Fair Grading"] },
  { id: "2", ticker: "PARK", name: "Dr. James Park", department: "Mathematics", avatar: "🧮", sentiment: 45, rating: 2.8, difficulty: 4.8, tags: ["Tough Exams", "Brilliant"] },
  { id: "3", ticker: "WLMS", name: "Dr. Maya Williams", department: "Physics", avatar: "⚛️", sentiment: 91, rating: 4.9, difficulty: 2.5, tags: ["Inspirational", "Easy A"] },
  { id: "4", ticker: "RODR", name: "Dr. Carlos Rodriguez", department: "Economics", avatar: "📊", sentiment: 67, rating: 3.7, difficulty: 3.8, tags: ["Real-World", "Homework Heavy"] },
  { id: "5", ticker: "PTEL", name: "Dr. Anika Patel", department: "Biology", avatar: "🧬", sentiment: 73, rating: 4.1, difficulty: 3.0, tags: ["Helpful", "Lab-Focused"] },
  { id: "6", ticker: "THMP", name: "Dr. Robert Thompson", department: "History", avatar: "📚", sentiment: 38, rating: 2.4, difficulty: 4.2, tags: ["Boring Lectures", "Strict"] },
  { id: "7", ticker: "NAKM", name: "Dr. Yuki Nakamura", department: "Chemistry", avatar: "🔬", sentiment: 85, rating: 4.5, difficulty: 3.5, tags: ["Passionate", "Great Labs"] },
  { id: "8", ticker: "OCON", name: "Dr. Liam O'Connor", department: "Philosophy", avatar: "🤔", sentiment: 56, rating: 3.3, difficulty: 2.8, tags: ["Mind-Blowing", "Vague Rubric"] },
  { id: "9", ticker: "KIMG", name: "Dr. Grace Kim", department: "Psychology", avatar: "🧠", sentiment: 78, rating: 4.3, difficulty: 2.2, tags: ["Caring", "Easy Tests"] },
  { id: "10", ticker: "BRNZ", name: "Dr. Marco Bronzini", department: "Engineering", avatar: "⚙️", sentiment: 61, rating: 3.5, difficulty: 4.5, tags: ["Projects", "Industry Ties"] },
];
