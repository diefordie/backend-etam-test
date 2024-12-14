import { cleanupRevokedTokens } from '../services/auth/logout.js'; // Adjust the import
import cron from 'node-cron'; 

// Set up a cron job to run every hour
export const startCleanupJob = () => {
    // Set up a cron job to run every hour
    cron.schedule('0 * * * *', () => {
        console.log('Running cleanup of revoked tokens...');
        cleanupRevokedTokens();
    });
};