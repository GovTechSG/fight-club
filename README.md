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
## Game Master Variables
The following is a list of environment variables applicable to game masters only.
* GAME_DAMAGE_CONTROLLER_PROTOCOL: The protocol used by the Damage Controller server.
* GAME_DAMAGE_CONTROLLER_HOST: Host URI of Damage Controller server.
* GAME_DAMAGE_CONTROLLER_PORT: Port of Damage Controller server.

Example (http://damagecontroller.domain.com:3000):
```$xslt
GAME_DAMAGE_CONTROLLER_PROTOCOL=http
GAME_DAMAGE_CONTROLLER_HOST=damagecontroller.domain.com
GAME_DAMAGE_CONTROLLER_PORT=3000
```
* STARTING_HP: Indicates how much HP at the start. ONLY applicable to game master
```$xslt
STARTING_HP=100
```

## Damage Controller Variables
* HIT_POINT: Indicates how much points does each hit will incur. ONLY applicable to damage controller.
```$xslt
HIT_POINT=1
```

## Common Variables
* NODE_ENV: Determines what config to load. For example, if the value is development, the configuration config/development.js will be read.

Example:
```$xslt
NODE_ENV=development
```

* GAME_SERVER_OPTS_SERVER_TYPE: Indicates what role(s) this server is. Can be either gamemaster or damagecontroller or both (delimited by ',').

Example:
```$xslt
GAME_SERVER_OPTS_SERVER_TYPE=gamemaster,damagecontroller
```

* SERVER_PORT: Indicates what port should this server be listening at.

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