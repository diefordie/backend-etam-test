import { cleanupRevokedTokens } from '../services/auth/logout.js'; // Adjust the import
import cron from 'node-cron'; 

export const startCleanupJob = () => {
    cron.schedule('0 0 * * *', () => {
        console.log('Running cleanup of revoked tokens...');
        cleanupRevokedTokens();
    });
};