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

    var loop = function () {
        $.ajax('/game', {
            data: {poll: poll},
            success: function (data) {
                update(data);
                poll = 1;
                setTimeout(loop, 1000);
            },
            error: function () {
                poll = 0;
                setTimeout(loop, 1000);
            }
        });
    };


    $('#reset_game').on('click', function () {
        var $this = $(this);
        var team = $this.data('team');

        var data = new FormData();

        $.ajax('/game', {
            method: 'POST',
            data: data,
            contentType: false,
            processData: false,
            success: update
        })
    });

    loop();


    $('#blue_team_hit, #red_team_hit').on('click', function () {
        var $this = $(this);
        var team = $this.data('team');

        var data = new FormData();
        data.append('team', team);

        $.ajax('/game/hit', {
            method: 'POST',
            data: data,
            contentType: false,
            processData: false,
            success: update
        })
    });


});
