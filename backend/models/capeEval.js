import mongoose from 'mongoose';

const capeEvalSchema = new mongoose.Schema(
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

    // CAPE Evaluation Scores
    scores: {
      recommendProfessor: Number,
      courseOrganization: Number,
      courseContent: Number,
      communicationSkills: Number,
      workloadExpectation: Number,
      gradeDistribution: Number,
      overallQuality: Number,
    },

    letterGradeDistribution: {
      a: Number,
      b: Number,
      c: Number,
      d: Number,
      f: Number,
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

export default mongoose.model('CapeEval', capeEvalSchema);
