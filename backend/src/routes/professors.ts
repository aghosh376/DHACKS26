import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import Professor from '../models/professor.js';

const router = Router();

// GET /api/professors
router.get('/', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const sortBy = (req.query.sortBy as string) || 'currScore';
    const order = parseInt(req.query.order as string) || -1;
    const department = req.query.department as string;

    const query = department ? { department } : {};

    const professors = await Professor.find(query)
      .sort({ [sortBy]: order } as any)
      .limit(100);

    res.json({
      success: true,
      data: professors,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// GET /api/professors/:id
router.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const professor = await Professor.findById(req.params.id);

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
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

// GET /api/professors/search/:query
router.get('/search/:query', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const professors = await Professor.find({
      $text: { $search: req.params.query },
    });

    res.json({
      success: true,
      data: professors,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});

export default router;
