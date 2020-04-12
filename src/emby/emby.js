const axios = require('axios');
const chalk = require('chalk');
const stripPath = require('strip-path');
const path = require('path');

class Emby {
    name = "Emby";

    constructor(publicUrl, apiKey, stripPath) {
        const baseUrl = new URL(publicUrl);
        baseUrl.pathname = path.join(baseUrl.pathname, 'emby');
        this._requester = axios.create({
            baseURL: baseUrl.toString(),
            timeout: 20000,
            headers: {
                'X-Emby-Token': apiKey
            }
        });
        this._stripPath = stripPath;
    }

    async ping() {
        return this._requester.get('/System/Info');
    }

    async listMovies() {
        console.log(chalk.green('Emby'), `Searching for movies`);
        const { data: items } = await this._requester.get('/Items', {
            params: {
                Recursive: true,
                IncludeItemTypes: "Movie",
                Fields: "Name,Path,ProviderIds,ParentId",
            }
        });
        console.log(chalk.green('Emby'), `Found ${items.TotalRecordCount} ${items.TotalRecordCount > 1 ? 'movies' : 'movie'}`);
        const itemsSelected = [];
        for (let i = 0; items.Items[i]; i++) {
            const item = items.Items[i];
            itemsSelected.push({
                name: item.Name,
                path: stripPath(item.Path, this._stripPath),
                providersIds: {
                    imdb: item.ProviderIds.Imdb,
                    tmdb: item.ProviderIds.Tmdb
                }
            });
        }
        return itemsSelected;
    }
}

module.exports = Emby;
