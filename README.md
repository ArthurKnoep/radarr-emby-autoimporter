# Radarr/Emby auto importer
**This project allows to import your movies into Radarr from Emby or Plex.**

## How to run
In order to work, this project requires some environment variables

| Name | Description |
|-----|---|
| MEDIA_SERVER_TYPE | The media server type: Emby and Plex are supported. |
| MEDIA_SERVER_PUBLIC_URL | The url where the media server can be reached, if you are using a subpath you can add it here (ex: https://example.org/subPath) |
| MEDIA_SERVER_API_KEY | Media Server API key, can be generated in Dashboard > Advanced > API Key on Emby, you can also pass your access token if you are administrator or using Plex. |
| MEDIA_SERVER_STRIP_PATH | Indicates the part to strip in the paths in order to get your movie root folder (ex: If your movies are stored like this: /mnt/movies/Matrix (1999)/matrix.mkv, your strip path would be /mnt/movies) |
| RADARR_PUBLIC_URL | The url where Radarr can be reached, if you are using a subpath you can add it here (ex: https://example.org/subPath) |
| RADARR_API_KEY | Radarr API key, can be found in Settings > General > Security |
| RADARR_STRIP_PATH | Indicates the part to strip in the paths in order to get your movie root folder (ex: If your movies are stored like this: /movies/Matrix (1999)/matrix.mkv, your strip path would be /movies) |

You can set these variables using a dot env file (You can copy-paste the template `.env.example`) 

Then install dependencies and run node:
```bash
yarn install
node .
```
