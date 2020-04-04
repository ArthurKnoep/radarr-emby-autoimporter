const axios = require('axios');
const path = require('path');
const stripPath = require('strip-path');
const debug = require('debug')('importer');

const MOVIE_LIST_TIMEOUT = 10 * 60 * 1000; // 10 minutes

class Radarr {
    constructor(publicUrl, apiKey, pathStrip) {
        const baseUrl = new URL(publicUrl);
        baseUrl.pathname = path.join(baseUrl.pathname, 'api/v3');
        this._requester = axios.create({
            baseURL: baseUrl.toString(),
            timeout: 20000,
            headers: {
                'X-Api-Key': apiKey
            }
        });
        this._pathStrip = pathStrip;
        this._movieList = [];
        this._lastMovieUpdate = null;
    }

    async ping() {
        await this._requester.get('/system/status');
    }

    async listQualityProfile() {
        debug('Requesting quality profile');
        const { data: profile } = await this._requester.get('/qualityprofile');
        return profile;
    }

    async listMovies() {
        if (this._lastMovieUpdate && new Date() - this._lastMovieUpdate < MOVIE_LIST_TIMEOUT) {
            return this._movieList;
        }
        debug('Updating movie list');
        const { data: movies } = await this._requester.get('/movie');
        this._movieList = movies;
        this._lastMovieUpdate = new Date();
        return movies;
    }

    async searchMovieByImdbId(imdbId) {
        const movies = await this.listMovies();
        for (let i = 0; movies[i]; i++) {
            if (movies[i].imdbId === imdbId) {
                return movies[i];
            }
        }
        return undefined;
    }

    async searchMovieByTmdbId(tmdbId) {
        const movies = await this.listMovies();
        for (let i = 0; movies[i]; i++) {
            if (movies[i].tmdbId === tmdbId) {
                return movies[i];
            }
        }
        return undefined;
    }

    async searchMovieByTitle(title) {
        const movies = await this.listMovies();
        for (let i = 0; movies[i]; i++) {
            if (movies[i].title === title) {
                return movies[i];
            }
        }
        return undefined;
    }

    async searchMovieByPath(path) {
        const movies = await this.listMovies();
        for (let i = 0; movies[i]; i++) {
            if (movies[i].movieFile && stripPath(movies[i].movieFile.path, this._pathStrip) === path) {
                return movies[i];
            }
        }
        return undefined;
    }

    async lookUpByImdbId(imdbId) {
        const { data: item } = await this._requester.get('/movie/lookup/imdb', {
            params: {
                imdbId
            }
        });
        return item;
    }

    async lookUpByTmdbId(tmdbId) {
        const { data: item } = await this._requester.get('/movie/lookup/tmdb', {
            params: {
                tmdbId
            }
        });
        return item;
    }

    async import(items) {
        await this._requester.post('/movie/import', items);
        return;
    }

    static minimumAvailability = ['announced', 'inCinemas', 'released', 'preDB'];
    static minimumAvailabilityPrettyPrint = {'Announced': 'announced', 'In cinemas': 'inCinemas', 'Released': 'released', 'PreDB': 'preDB'};
}

module.exports = Radarr;
