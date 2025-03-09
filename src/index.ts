import { CronJob } from 'cron';
import { postRecipe } from './postRecipe';

const cronTime = '0 11 1 * * *';

new CronJob(cronTime, postRecipe, null, true, 'America/Sao_Paulo');

console.log('Cron job started');
