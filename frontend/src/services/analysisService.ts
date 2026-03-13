import api from './api';
import type { Analysis } from '../types';

export const analysisService = {
    getAnalyses: async (): Promise<Analysis[]> => {
        const { data } = await api.get('/analyses');
        return data;
    },
    getAnalysisById: async (id: string): Promise<Analysis> => {
        const { data } = await api.get(`/analyses/${id}`);
        return data;
    },
    triggerAnalysis: async (domain: string): Promise<Analysis> => {
        const { data } = await api.post('/analyze', { domain });
        return data;
    },
    exportJson: async (id: string, domain: string): Promise<void> => {
        const { data } = await api.get(`/analyses/${id}/export`);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `argus-analysis-${domain}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    exportPdf: async (id: string, domain: string): Promise<void> => {
        const response = await api.get(`/analyses/${id}/export/pdf`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `argus-report-${domain}-${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    },
};

