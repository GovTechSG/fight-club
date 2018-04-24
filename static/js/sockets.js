let update = function (data) {

    let blue_team_hp = _.get(data, ['blue_team', 'hp']);
    let red_team_hp = _.get(data, ['red_team', 'hp']);
    let blue_team_starting_hp = _.get(data, ['blue_team', 'starting_hp']);
    let red_team_starting_hp = _.get(data, ['red_team', 'starting_hp']);


    $('#blue_team_hp')
        .css('width', _.toString(_.toInteger(blue_team_hp / blue_team_starting_hp * 100)) + '%')
        .attr('aria-valuenow', _.toString(blue_team_hp))
        .attr('aria-valuemin', _.toString(0))
        .attr('aria-valuemax', _.toString(blue_team_starting_hp))
        .html(_.toString(blue_team_hp) + ' / ' + _.toString(blue_team_starting_hp));

    $('#blue_team_hp_fill')
        .css('width', _.toString(_.toInteger((blue_team_starting_hp - blue_team_hp) / blue_team_starting_hp * 100)) + '%')
        .attr('aria-valuenow', _.toString(blue_team_starting_hp - blue_team_hp))
        .attr('aria-valuemin', _.toString(0))
        .attr('aria-valuemax', _.toString(blue_team_starting_hp))
        .html(_.toString(blue_team_starting_hp - blue_team_hp) + ' / ' + _.toString(blue_team_starting_hp));

    $('#red_team_hp')
        .css('width', _.toString(_.toInteger(red_team_hp / red_team_starting_hp * 100)) + '%')
        .attr('aria-valuenow', _.toString(red_team_hp))
        .attr('aria-valuemin', _.toString(0))
        .attr('aria-valuemax', _.toString(red_team_starting_hp))
        .html(_.toString(red_team_hp) + ' / ' + _.toString(red_team_starting_hp));

    $('#red_team_hp_fill')
        .css('width', _.toString(_.toInteger((red_team_starting_hp - red_team_hp) / red_team_starting_hp * 100)) + '%')
        .attr('aria-valuenow', _.toString(red_team_starting_hp - red_team_hp))
        .attr('aria-valuemin', _.toString(0))
        .attr('aria-valuemax', _.toString(red_team_starting_hp))
        .html(_.toString(red_team_starting_hp - red_team_hp) + ' / ' + _.toString(red_team_starting_hp));


    let blue_team_hp_bar_percentage = _.toString((blue_team_hp / blue_team_starting_hp * 100)) + '%';
    $('#blue_team_hp_bar').css('clip-path', 'polygon(0 0, 0 100%, ' + blue_team_hp_bar_percentage + ' 100%, ' + blue_team_hp_bar_percentage + ' 0)');

    let red_team_hp_bar_percentage = _.toString((red_team_starting_hp - red_team_hp / red_team_starting_hp * 100)) + '%';
    $('#red_team_hp_bar').css('clip-path', 'polygon(100% 100%, ' + red_team_hp_bar_percentage + ' 100%, ' + red_team_hp_bar_percentage + ' 0%, 100% 0)');


    let $winner = $('#winner');
    let $winnerTitle = $winner.find('h2');

    if (data.winner) {
        $winnerTitle.html('Winner: ' + (data.winner === 'red_team' ? 'Red Team' : 'Blue Team'));
        $winner.toggleClass('hidden', false);



        let red_team_hits_by_player = _.reduce(red_team_hits, function (result, hit) {
            var client_id = result.client_id;
            _.set(result, client_id, _.get(result, client_id, 0) + 1);
            return result;
        }, {});
        _.set(game, ['red_team', 'hits_by_player'], red_team_hits_by_player);

        let blue_team_hits_by_player = _.reduce(blue_team_hits, function (result, hit) {
            var client_id = result.client_id;
            _.set(result, client_id, _.get(result, client_id, 0) + 1);
            return result;
        }, {});
        _.set(game, ['blue_team', 'hits_by_player'], blue_team_hits_by_player);


        var red_team_players = _.keys(red_team_hits_by_player);
        var blue_team_players = _.keys(blue_team_hits_by_player);

        var traitors = _.intersection(red_team_players, blue_team_players);

        _.set(game, 'traitors', traitors);


    } else {
        $winner.toggleClass('hidden', true);
        $winnerTitle.html('');
    }

    $('#info').html('Server: ' + data.hostname);
};


$(function () {

    var poll = 0;

    var socket = io.connect({path: '/sockets'});


    socket.on('update', update);

    socket.emit('refresh');

    socket.on('error', function (err) {
        console.error(err);

        let $error = $('#error');
        let $errorText = $error.find('div.card');

        $errorText.html(err.message);
        $error.toggleClass('hidden', false);
        setTimeout(function () {
            $error.toggleClass('hidden', true);
            $errorText.html('');
        }, 5000);


    });

    $('#reset_game').on('click', function () {
        socket.emit('newGame');
    });

    $('#blue_team_hit, #red_team_hit').on('click', function () {
        let $this = $(this);
        let team = $this.data('team');

        socket.emit('hit', {team: team});
    });


});
