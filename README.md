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