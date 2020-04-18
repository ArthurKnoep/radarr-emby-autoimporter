const axios = require('axios');
const chalk = require('chalk');
const stripPath = require('strip-path');
const path = require('path');

class Plex {
    name = "Plex"

    constructor(publicUrl, apiKey, stripPath) {
        const baseUrl = new URL(publicUrl);
        this._requester = axios.create({
            baseURL: baseUrl.toString(),
            timeout: 20000,
            headers: {
                'X-Plex-Token': apiKey,
                'Accept': 'application/json'
            }
        });
        this._stripPath = stripPath;
    }

    async ping() {
        await this._requester.get('/');
    }

    async listMovies() {
        console.log(chalk.green('Plex'), `Searching for movies`);
        const itemsSelected = [];
        const { data: { MediaContainer: { Directory: sections } } } = await this._requester.get('/library/sections');
        const movieSections = sections.filter(({ type }) => type === "movie")
        for (let i = 0; movieSections[i]; i++) {
            const section = movieSections[i];
            const { data: { MediaContainer: items } } = await this._requester.get(`/library/sections/${section.key}/all`);
            console.log(chalk.green('Plex'), `Found ${items.size} ${items.size > 1 ? 'movies' : 'movie'} in section "${section.title}"`);
            items.Metadata.forEach(item => {
                const imdbMatch = /com.plexapp.agents.imdb:\/\/(tt\d+)/g.exec(item.guid)
                const tmdbMatch = /com.plexapp.agents.themoviedb:\/\/(\d+)/g.exec(item.guid)
                if (item.Media[0] && item.Media[0].Part[0]) {
                    itemsSelected.push({
                        name: item.originalTitle || item.title,
                        path: stripPath(item.Media[0].Part[0].file, this._stripPath),
                        providersIds: {
                            imdb: imdbMatch && imdbMatch[1],
                            tmdb: tmdbMatch && tmdbMatch[1],
                        }
                    });
                }
            })
        }
        return itemsSelected;
    }
}

module.exports = Plex;
