const Schema = require('mongoose').Schema;

const Hit = require('./Hit.js');

module.exports = new Schema({
    red_team: {
        name: String,
        starting_hp: Number,
        hits: []
    },
    blue_team: {
        name: String,
        starting_hp: Number,
        hits: []
    },
    winner: String
});


// game

// game.id
// game.name
// game.description
// game.matches
