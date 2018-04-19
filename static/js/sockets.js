var update = function (data) {
    $('#red_team').find('.progress-bar')
        .css('width', +String(data.red_team.hp) + '%')
        .attr('aria-valuenow', String(data.red_team.hp))
        .attr('aria-valuemin', '0')
        .attr('aria-valuemax', String(data.red_team.starting_hp))
        .html(data.red_team.hp);
    $('#blue_team').find('.progress-bar')
        .css('width', +String(data.blue_team.hp) + '%')
        .attr('aria-valuenow', String(data.blue_team.hp))
        .attr('aria-valuemin', '0')
        .attr('aria-valuemax', String(data.blue_team.starting_hp))
        .html(data.blue_team.hp);

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
