import { CronJob } from 'cron';
import { postRecipe } from './postRecipe';

/**
 * Post at 11 hours every day (America/Sao_Paulo timezone)
 */
const cronTime = '0 3 10 * * *';

new CronJob(cronTime, postRecipe, null, true, 'America/Sao_Paulo');

console.log('Cron job started');
