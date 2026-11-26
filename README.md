# disneyar

An unofficial 3D augmented reality fan map of Disneyland Park, built with three.js. The whole park sits on your table, laid out like the real one, with the current wait time floating over every attraction.

Not affiliated with or endorsed by Disney. Wait times are powered by [Queue-Times.com](https://queue-times.com).

## What's here

- `index.html` is the whole app: one file, no build step. three.js loads from jsDelivr.
- `.github/workflows/deploy.yml` publishes the site to GitHub Pages and refreshes `waits.json` from Queue-Times every 30 minutes.

## Running it

Open the GitHub Pages URL on your phone. The live camera, gyroscope and location need HTTPS and a tap on "Enter the park" to grant access.

To run locally, serve the folder (for example `python3 -m http.server`) and open `http://localhost:8000`. Camera and motion sensors only work on `localhost` or HTTPS.

## Features

- 3D model of the park with a wait-time marker over every attraction
- Guide with search, land filters, favorites and wait trends
- Route planner: shortest walk through your favorites or the longest lines, drawn on the map
- Low-wait alerts for starred rides while the page is open
- "You are here" pin from GPS when you are in the park
- AR backdrops: live camera, or a photo or video of your room
- Day and night from the real sun position, fireworks, generated music

## Wait times

The page first asks Queue-Times directly. If the browser blocks that request, it reads `waits.json`, which the workflow refreshes. If both fail it shows a built-in snapshot and labels how old it is.

## Hosting note

GitHub Pages on a private repository needs a paid GitHub plan. On the free plan, make the repository public, then run the workflow again from the Actions tab.
