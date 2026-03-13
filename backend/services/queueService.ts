import ScannerService from './scannerService';
import DeltaCalculator from '../utils/deltaCalculator';
import nodemailer from 'nodemailer';
import { Analysis, Asset, RiskHistory, Job } from '../models';
import { getIO } from '../utils/socket';

/**
 * REDIS-FREE JOB QUEUE
 * Uses PostgreSQL as the backing store for tasks.
 */

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

let isEmailConfigured = false;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify((error) => { isEmailConfigured = !error; });
}

async function sendAlert(user: any, domain: string, delta: any) {
    try {
        let reasons: string[] = [];
        if (delta.scoreIncreasedSignificantly) reasons.push(`Risk score increased by ${delta.scoreDiff} points.`);
        if (delta.hasNewCriticalAssets) reasons.push(`${delta.newCriticalAssets.length} new critical asset(s) discovered.`);
        const html = `<h2>Argus Alert: ${domain}</h2><ul>${reasons.map(r => `<li>${r}</li>`).join('')}</ul>`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER, to: user.email,
            subject: `Argus Alert: Risk Changes for ${domain}`, html
        });
    } catch (error) {
        console.error(`Queue alert failed for ${user.email}:`, error);
    }
}

const processJob = async (job: Job) => {
    const { domain, user_id, organization_id, email } = job.data;
    console.log(`[Worker] Processing job ${job.id} for ${domain}`);

    try {
        await job.update({ status: 'processing' });
        try { getIO().emit(`scan:started:${user_id}`, { domain }); } catch {}

        const previousAnalysis = await Analysis.findOne({
            where: { domain, user_id }, order: [['createdAt', 'DESC']], include: [Asset]
        });

        const result = await ScannerService.analyzeDomain(domain);

        const newAnalysis = await Analysis.create({
            domain: result.domain, overallRiskScore: result.overallRiskScore,
            overallRiskLevel: result.overallRiskLevel, totalAssets: result.totalAssets,
            criticalAssets: result.criticalAssets, highRiskAssets: result.highRiskAssets,
            mediumRiskAssets: result.mediumRiskAssets, lowRiskAssets: result.lowRiskAssets,
            user_id, organization_id, analyzedAt: new Date()
        });

        await Asset.bulkCreate(result.assets.map((a: any) => ({ ...a, analysis_id: newAnalysis.id })));
        await RiskHistory.create({ date: new Date().toISOString().split('T')[0], score: result.overallRiskScore, analysis_id: newAnalysis.id });

        const delta = DeltaCalculator.calculateDelta(result, previousAnalysis);
        if (delta.isAlertRequired && isEmailConfigured) await sendAlert({ email }, domain, delta);

        await job.update({ status: 'completed' });
        try { getIO().emit(`scan:completed:${user_id}`, { domain, riskScore: result.overallRiskScore }); } catch {}
        
    } catch (error: any) {
        console.error(`[Worker] Job ${job.id} failed:`, error.message);
        await job.update({ status: 'failed', error: error.message });
        try { if (user_id) getIO().emit(`scan:failed:${user_id}`, { domain, error: error.message }); } catch {}
    }
};

// Worker Loop: Poll for pending jobs
const startWorker = async () => {
    console.log('✅ Argus DB-Worker Initialized (Redis-Free Mode)');
    
    // Continuous polling
    setInterval(async () => {
        try {
            const nextJob = await Job.findOne({
                where: { status: 'pending' },
                order: [['createdAt', 'ASC']]
            });

            if (nextJob) {
                await processJob(nextJob);
            }
        } catch (error) {
            console.error('[Worker] Error polling jobs:', error);
        }
    }, 5000); // Check every 5 seconds
};

export const scanQueue = {
    add: async (name: string, data: any) => {
        return await Job.create({
            type: name,
            data,
            status: 'pending'
        });
    }
};

startWorker();
