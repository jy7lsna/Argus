import AnalysisService from '../services/analysisService';
import PdfService from '../services/pdfService';
import redisClient from '../utils/cache';

const AnalysisController = {
  analyze: async (req: any, res: any) => {
    try {
      const { domain } = req.body;
      const userId = req.user.id;

      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }

      const result = await AnalysisService.runAnalysis(userId, domain);

      // Invalidate the cache since a new analysis was just created
      await redisClient.del(`analyses:user:${userId}`);

      res.json(result);
    } catch (error) {
      console.error('Analysis failed:', error.message);
      res.status(500).json({ error: error.message || 'Analysis failed' });
    }
  },

  getAllAnalyses: async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const cacheKey = `analyses:user:${userId}`;

      // Try fetching the result from Redis first
      const cachedAnalyses = await redisClient.get(cacheKey);
      if (cachedAnalyses) {
        return res.json(JSON.parse(cachedAnalyses.toString()));
      }

      // If cache miss, fetch from DB
      const analyses = await AnalysisService.getUserAnalyses(userId);

      // Store in Redis with an expiration of 5 minutes (300 seconds)
      await redisClient.setEx(cacheKey, 300, JSON.stringify(analyses));

      res.json(analyses);
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
      res.status(500).json({ error: 'Failed to fetch analyses' });
    }
  },

  getAnalysisById: async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const analysisId = req.params.id;
      const analysis = await AnalysisService.getAnalysisById(userId, analysisId);

      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analysis' });
    }
  },

  exportAnalysis: async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const analysisId = req.params.id;
      const analysis = await AnalysisService.getAnalysisById(userId, analysisId);

      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=argus-analysis-${analysis.domain}-${Date.now()}.json`);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Export failed' });
    }
  },

  exportPdf: async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const analysisId = req.params.id;
      const analysis = await AnalysisService.getAnalysisById(userId, analysisId);

      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=argus-report-${analysis.domain}-${Date.now()}.pdf`);

      PdfService.generateReport(analysis, res);
    } catch (error) {
      console.error('PDF export failed:', error.message);
      res.status(500).json({ error: 'PDF generation failed' });
    }
  }
};

export default AnalysisController;
