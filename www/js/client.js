var WIDTH = 1100;
var HEIGHT = 580;
// This IP is hardcoded to my server, replace with your own
var socket = io.connect('http://192.168.1.242:8082');
var game = new Game('#arena', WIDTH, HEIGHT, socket);
var selectedTank = 1;
var tankName = '';
var last_sec = (new Date()).getSeconds();
var num_syncs_per_sec = 0;

socket.on('addTank', function(tank){
	game.addTank(tank.id, tank.type, tank.isLocal, tank.x, tank.y);
});

socket.on('sync', function(gameServerData){
	var sec = (new Date()).getSeconds();
	if (sec != last_sec) {
	  console.log('# syncs/sec: ' + num_syncs_per_sec);
	  last_sec = sec;
	  num_syncs_per_sec = 1;
	}
	else {
	  num_syncs_per_sec++;
	}

	game.receiveData(gameServerData);
});

socket.on('killTank', function(tankData){
	game.killTank(tankData);
});

socket.on('removeTank', function(tankId){
	game.removeTank(tankId);
});

$(document).ready( function(){

	$('#join').click( function(){
		tankName = $('#tank-name').val();
		joinGame(tankName, selectedTank, socket);
	});

	$('#tank-name').keyup( function(e){
		tankName = $('#tank-name').val();
		var k = e.keyCode || e.which;
		if(k == 13){
			joinGame(tankName, selectedTank, socket);
		}
	});

	$('ul.tank-selection li').click( function(){
		$('.tank-selection li').removeClass('selected')
		$(this).addClass('selected');
		selectedTank = $(this).data('tank');
	});

});

$(window).on('beforeunload', function(){
	socket.emit('leaveGame', tankName);
});

function joinGame(tankName, tankType, socket){
	if(tankName != ''){
		$('#prompt').hide();
		socket.emit('joinGame', {id: tankName, type: tankType});
	}
}
