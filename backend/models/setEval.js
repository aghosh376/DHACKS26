import mongoose from 'mongoose';

const setEvalSchema = new mongoose.Schema(
  {
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professor',
      required: true,
      index: true,
    },
    courseCode: String,
    courseName: String,
    term: {
      type: String,
      index: true, // e.g., "F2023", "S2024"
    },
    enrollmentCount: Number,
    responseCount: Number,
    responseRate: Number,

    // SET Evaluation Scores
    scores: {
      recommendProfessor: Number, // 1-5
      courseOrganization: Number,
      courseContent: Number,
      communicationSkills: Number,
      assessmentFairness: Number,
      studentEngagement: Number,
      overallQuality: Number,
    },

    content: String,
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SetEval', setEvalSchema);
