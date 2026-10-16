crazyBattleRoyal
================

I was playing around with Three.js and my kids had me make this.

Just a simple program that produces some squares that try to reach the other side of the board. Collisions result in big booms. There is a score and all!

You (and my kids, HI!) can view it [here](http://www.petracci.org/crazyBattleRoyal/).
The historical demo link has not been verified by this documentation update.

## What it is

An autonomous JavaScript/Three.js battle **simulation**, not a networked
battle-royale game. Two teams of 50 units move toward opposite goals, bounce at
the boundaries, explode on opposing-unit collisions, respawn, and add to the
scoreboard. There are no player controls or multiplayer services to configure.

## Preview locally

There is no package manager or build step. From the repository root, serve the
static files with Python 3's standard-library HTTP server:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/ in a browser with JavaScript and WebGL enabled. Stop
the server with Ctrl+C. This command is a suggested preview method, not a
record of a successful run.

## Historical browser dependency

`index.html` loads the bundled `scripts/three.min.js`, whose header identifies
**Three.js revision 54**, and then `scripts/battlefield.js`. The library's header
links to [Three.js](http://github.com/mrdoob/three.js). This is a legacy API;
replacing it with a current Three.js release is not assumed to be compatible.
Modern-browser rendering and resize behavior have not been validated. If the
canvas is blank, check WebGL availability and the browser console rather than
assuming the hosted demo or a modern library upgrade will work.

