import express from 'express';
import AnalysisController from '../controllers/analysisController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post('/analyze', authMiddleware, AnalysisController.analyze);
router.get('/analyses', authMiddleware, AnalysisController.getAllAnalyses);
router.get('/analyses/:id', authMiddleware, AnalysisController.getAnalysisById);
router.get('/analyses/:id/export', authMiddleware, AnalysisController.exportAnalysis);
router.get('/analyses/:id/export/pdf', authMiddleware, AnalysisController.exportPdf);

export default router;
