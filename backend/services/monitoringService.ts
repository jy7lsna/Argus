import cron from 'node-cron';
import { Analysis, User, Asset, RiskHistory, Organization } from '../models';
import sequelize from '../config/database';
import { scanQueue } from './queueService';


const MonitoringService = {
  start: () => {
    console.log('Continuous Monitoring Service Started (Layered Architecture).');

    // Default: Run every day at midnight ('0 0 * * *')
    // Currently set to 5 minutes for demonstration as per previous request
    cron.schedule('*/5 * * * *', async () => {
      console.log('Running background scans execution...');

      try {
        const users = await User.findAll({ include: [Organization] });

        for (const user of users) {
          // Get the latest analysis for each unique domain
          const latestUniqueAnalyses = await Analysis.findAll({
            where: { user_id: user.id },
            attributes: [
              'domain',
              [sequelize.fn('MAX', sequelize.col('created_at')), 'latest']
            ],
            group: ['domain'],
            raw: true
          });

          for (const entry of latestUniqueAnalyses) {
            const domain = entry.domain;

            console.log(`[Monitoring] Scheduling background scan for ${domain}`);

            await scanQueue.add('scan-domain', {
              domain,
              user_id: user.id,
              organization_id: user.organization_id,
              email: user.email
            });
          }
        }
      } catch (error) {
        console.error('Monitoring job scheduling failed:', error);
      }
    });
  }
};

export default MonitoringService;
