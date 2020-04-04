# Radarr/Emby auto importer
This project allows to import your movies inside Radarr from Emby

## How to run
In order to work, this project requires some environment variables

| Name | Description |
|-----|---|
| EMBY_PUBLIC_URL | The url where Emby can be reached, if you are using a subpath you can add it here (ex: https://example.org/subPath) |
| EMBY_API_KEY | Emby API key, can be generated in Dashboard > Advanced > API Key, you can also pass your access token if you are administrator |
| EMBY_STRIP_PATH | Indicates the part to strip in the paths in order to get your movie root folder (ex: If your movies are stored like this: /mnt/movies/Matrix (1999)/matrix.mkv, your strip path would be /mnt/movies) |
| RADARR_PUBLIC_URL | The url where Radarr can be reached, if you are using a subpath you can add it here (ex: https://example.org/subPath) |
| RADARR_API_KEY | Radarr API key, can be found in Settings > General > Security |
| RADARR_STRIP_PATH | Indicates the part to strip in the paths in order to get your movie root folder (ex: If your movies are stored like this: /movies/Matrix (1999)/matrix.mkv, your strip path would be /movies) |

You can set these variables using a dot env file (You can copy-paste the template `.env.example`) 

Then run node:
```bash
node .
```
