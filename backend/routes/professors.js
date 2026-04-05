import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import Professor from '../models/professor.js';

const router = express.Router();

// @route   GET /api/professors
// @desc    Get all professors with optional filter/sort
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { department, sortBy = 'overallScore', order = '-1' } = req.query;
    
    let query = {};
    if (department) query.department = department;

    const professors = await Professor.find(query)
      .sort({ [sortBy]: parseInt(order) })
      .limit(100);

    res.json({
      success: true,
      data: professors,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/professors/:id
// @desc    Get professor by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id)
      .populate('rateMyProfEvals')
      .populate('setEvals')
      .populate('capeEvals')
      .populate('redditEvals');

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Professor not found',
      });
    }

    res.json({
      success: true,
      data: professor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/professors/search/:query
// @desc    Search professors by name or department
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const professors = await Professor.find({
      $text: { $search: req.params.query },
    });

    res.json({
      success: true,
      data: professors,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
