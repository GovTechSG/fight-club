# Fight Club

Fight Club is a simple Demo Application to demonstrate containerization and communication between services.

# Features:
* Display Health bar for two sides, red team and blue team 
* Players should be able to hit either the red team or blue team.
* Admin should be able to reset the game.

# TODO:
* Show game statistics, such as player with the highest number of hits, double agents, etc...
* Show backend application statistics, such as backend replica used in hits, app metrics, etc...
* Upload and Select pictures for use in-game
* Timed games
* Combo meter and combo attacks

# Environment Variables
- GAME_SERVER_OPTS_SERVER_TYPE: Indicates what role(s) this server is. Can be either gamemaster or damagecontroller or both (delimited by ',').
```$xslt
GAME_SERVER_OPTS_SERVER_TYPE=gamemaster,damagecontroller
```
There are also a few environment variables ONLY used by Game Master type servers to communicate with Damage Controller type servers.
* GAME_DAMAGE_CONTROLLER_PROTOCOL: The protocol used by the Damage Controller server.
* GAME_DAMAGE_CONTROLLER_HOST: Host URI of Damage Controller server.
* GAME_DAMAGE_CONTROLLER_PORT: Port of Damage Controller server.

Example (http://damagecontroller.domain.com:3000):
```$xslt
GAME_DAMAGE_CONTROLLER_PROTOCOL=http
GAME_DAMAGE_CONTROLLER_HOST=damagecontroller.domain.com
GAME_DAMAGE_CONTROLLER_PORT=3000
```

- SERVER_PORT: Indicates what port should this server be listening at.

Example:
```$xslt
SERVER_PORT=3000
```

* REDIS_URI: URI of Redis server. Note that Game Master and Damage Controller have to point to same Redis server.
* REDIS_DB_INDEX: The redis DB index to use.
Example:
```$xslt
REDIS_URI=redis://localhost:6379
REDIS_DB_INDEX=0
```

* HIT_POINT: Indicates how much points does each hit will incur. ONLY applicable to damage controller.
```$xslt
HIT_POINT=1
```