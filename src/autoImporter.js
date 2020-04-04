const chalk = require('chalk');
const debug = require('debug')('importer');
const { prompt } = require('enquirer');
const path = require('path');
const Emby = require('./emby');
const Radarr = require('./radarr');

class AutoImporter {
    constructor(embyPublicUrl, embyApiKey, embyStripPath, radarrPublicUrl, radarrApiKey, radarrStripPath) {
        this._emby = new Emby(embyPublicUrl, embyApiKey, embyStripPath);
        this._radarr = new Radarr(radarrPublicUrl, radarrApiKey, radarrStripPath);
        this._radarrStipPath = radarrStripPath;
        this._qualityProfileId = 0;
        this._monitored = false;
        this._minimumAvailability = "";
    }

    async start() {
        try {
            await this.verifyConnection();
            await this.initImporterSetting();
        } catch (_) {
            return;
        }
        let movies;
        try {
            movies = await this._emby.listMovies();
        } catch (e) {
            debug('Could not get the movie list');
            debug(e);
            return;
        }
        for (let i = 0; movies[i]; i++) {
            const radarrMovie = await this._radarr.searchMovieByPath(movies[i].path);
            if (!radarrMovie) {
                if (!movies[i].providersIds.tmdb && !movies[i].providersIds.imdb) {
                    console.log(chalk.blue('Radarr'), `Could not find "${movies[i].name}" but will not be added to Radarr because there is no IMDB or TMDB id`);
                    continue;
                }
                console.log(chalk.blue('Radarr'), `Could not find "${movies[i].name}", adding to Radarr`);
                let tmpMovie;
                try {
                    if (movies[i].providersIds.imdb) {
                        tmpMovie = await this._radarr.lookUpByImdbId(movies[i].providersIds.imdb);
                    }
                    if (movies[i].providersIds.tmdb) {
                        tmpMovie = await this._radarr.lookUpByTmdbId(movies[i].providersIds.tmdb);
                    }
                } catch (e) {
                    console.log(chalk.blue('Radarr'), `Could not find "${movies[i].name}" on Imdb or Tmdb`);
                    debug(e);
                    continue;
                }
                if (!tmpMovie) {
                    debug(`Could not find info for ${movies[i].name}`);
                    continue;
                }
                tmpMovie.path = path.join(this._radarrStipPath, path.dirname(movies[i].path));
                tmpMovie.folder = path.dirname(movies[i].path);
                tmpMovie.qualityProfileId = this._qualityProfileId;
                tmpMovie.monitored = this._monitored;
                tmpMovie.minimumAvailability = this._minimumAvailability;
                await this._radarr.import([tmpMovie]);
            }
        }
    }

    async verifyConnection() {
        process.stdout.write('Verifying Emby connection:\t');
        try {
            await this._emby.ping();
        } catch (e) {
            console.log(chalk.red('❌'));
            debug('Could not connect to Emby');
            debug(e);
            return Promise.reject();
        }
        console.log(chalk.green('✔'));
        process.stdout.write('Verifying Radarr connection:\t');
        try {
            await this._radarr.ping();
        } catch (e) {
            console.log(chalk.red('❌'));
            debug('Could not connect to Radarr');
            debug(e);
            return Promise.reject();
        }
        console.log(chalk.green('✔'));
        return Promise.resolve();
    }

    async initImporterSetting() {
        let qualityProfile;
        try {
            qualityProfile = await this._radarr.listQualityProfile();
        } catch (e) {
            console.error('Could not list quality profile');
            debug(e);
            return Promise.reject();
        }
        const info = await prompt([
            {
                type: 'select',
                name: 'qualityProfile',
                message: 'Pick a quality profile',
                choices: qualityProfile.map(e => e.name),
            },
            {
                type: 'confirm',
                name: 'monitored',
                message: 'Should be monitored'
            },
            {
                type: 'select',
                name: 'minimumAvailability',
                message: 'Pick a minimum availability',
                choices: Object.keys(Radarr.minimumAvailabilityPrettyPrint),
            }
        ]);
        this._monitored = info.monitored;
        this._minimumAvailability = Radarr.minimumAvailabilityPrettyPrint[info.minimumAvailability];
        const profile = qualityProfile.find(e => e.name === info.qualityProfile);
        if (!profile) {
            console.error('Could not find the quality profile');
        }
        this._qualityProfileId = profile.id;
    }
}

module.exports = AutoImporter;
