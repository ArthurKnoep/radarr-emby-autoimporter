require('dotenv').config();
const chalk = require('chalk');
const AutoImporter = require('./src/autoImporter');

const required_env = ['EMBY_PUBLIC_URL', 'EMBY_API_KEY', 'EMBY_STRIP_PATH', 'RADARR_PUBLIC_URL', 'RADARR_API_KEY', 'RADARR_STRIP_PATH'];

for (let i = 0; required_env[i]; i++) {
    if (!process.env[required_env[i]]) {
        console.error(chalk.red('Fatal error:'), `Missing environment variable "${required_env[i]}"`);
        process.exit(1);
    }
}

const importer = new AutoImporter(
    process.env.EMBY_PUBLIC_URL,
    process.env.EMBY_API_KEY,
    process.env.EMBY_STRIP_PATH,
    process.env.RADARR_PUBLIC_URL,
    process.env.RADARR_API_KEY,
    process.env.RADARR_STRIP_PATH
);

importer.start()
    .catch((err) => {
        console.error('Unhandled crash');
        console.error(err);
    });
