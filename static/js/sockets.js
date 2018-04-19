var update = function (data) {

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


    if (data.winner) {
        $('#winner-title').html('Winner: ' + (data.winner === 'red_team' ? 'Red Team' : 'Blue Team'));
        $('#winner').toggleClass('hidden', false);
    } else {
        $('#winner').toggleClass('hidden', true);
        $('#winner-title').html('');
    }
};


$(function () {

    var poll = 0;

    var socket = io.connect({path: '/sockets'});


    socket.on('update', update);

    socket.emit('refresh');

    socket.on('error', function (err) {
        console.error(err);

        $('#error').toggleClass('hidden', false).html(err.message);
        setTimeout(function () {
            $('#error').toggleClass('hidden', true).html('');
        }, 5000);


    });

    $('#reset_game').on('click', function () {
        socket.emit('newGame');
    });

    $('#blue_team_hit, #red_team_hit').on('click', function () {
        var $this = $(this);
        var team = $this.data('team');

        socket.emit('hit', {team: team});
    });


});
