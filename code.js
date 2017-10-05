 $(document).ready(function() {
    $("#myModal").modal();
 })
	 //FIREBASE INIT AND ALIASES
	var config = {
	    apiKey: "AIzaSyDSj18TRSynxj39GsNx_QuImcXtHPAVgXI",
	    authDomain: "yass-37d22.firebaseapp.com",
	    databaseURL: "https://yass-37d22.firebaseio.com",
	    projectId: "yass-37d22",
	    storageBucket: "yass-37d22.appspot.com",
	    messagingSenderId: "735865762356"
	  };
	firebase.initializeApp(config);
	var db = firebase.database();
	var chat = db.ref('chat');
	var users = db.ref('users');


	var wins, losses, ties;

	//PLAYERS
	var player = {
		id : '',
		pic: '',
		order: '0',
		move: 'NA',
		w: 0,
		l: 0,
		t: 0
	}

	var enemy = {
		id : '',
		pic: '',
		order: '0',
		move: 'NA',
		w: 0,
		l: 0,
		t: 0
	}


	//UPDATE NAME/PIC
	 $("#createButton").on("click", function(){
	 	player.pic = $("#imgURLFrm").val();
	 	player.id = $("#userIdFrm").val();
	});

	//RECORD PLAYERS IN FIREBASE
	var player_connection;
	users.once('value').then(function(res){
		//ASSIGN PLAYER NUMBER
		//console.log(res.val());
		if (Object.keys(res.val()).indexOf('1') === -1)
		{
			player.order = '1'; enemy.order = '2';
			//console.log("you are 1, enemy is 2")
		}
		else if (Object.keys(res.val()).indexOf('2') === -1)
		{
			player.order = '2'; enemy.order = '1';
			//console.log("you are 2, enemy is 1")
		}

		//ADD USER TO FIREBASE
		if (player.order !== '0')
		{
			player_connection = users.child(player.order)
			player_connection.set(player);
			chat.set(null);
			player_connection.onDisconnect().remove();
		}
		else
		{
			console.log("ROOM IS FULL. CLOSE WINDOW")
		}
	})


	//LISTEN FOR VALUE CHANGES
	users.on('value', function(res){
		if (player_connection)
		{
			//console.log(Object.keys(res.val()).indexOf(enemy.order))
			if (Object.keys(res.val()).indexOf(enemy.order) !== -1)
			{
				//GET PLAYER VALUES
				enemy = res.val()[enemy.order];
				player = res.val()[player.order];
				//console.log("Updated")

				//DISPLAY INFO
				if (player.id != "")
					$("#playername").html(player.id);
				if (enemy.id != "")
					$("#enemyname").html(enemy.id)

				//COMPARE CHOICES
				var player_move = res.val()[player.order].move;
				var enemy_move = res.val()[enemy.order].move;

				//if (player_move != "NA")
					//console.log(player_move);

				//BOTH PLAYERS HAVE CHOSEN
				if (player_move != "NA" && enemy_move != "NA")
				{
					player_connection.update({move: "NA"});
					gameresult = rps(player_move, enemy_move);
					var getenemy;
					enemy_move == "R" ? getenemy = $("#erock") : enemy_move == "P" ? getenemy = $("#epaper") : getenemy = $("#escissors");
					var gamemessage;
					if (gameresult == "Win")
					{
						gamemessage = "You Win!";
						$(".chosen").addClass("win")
						player.w++;
						player_connection.update({w: player.w});
						getenemy.addClass("lose");

					}
					else if (gameresult == "Lose")
					{
						gamemessage = "You Lose!";
						$(".chosen").addClass("lose")
						player.l++;
						player_connection.update({l: player.l});
						getenemy.addClass("win");
					}
					else if (gameresult == "Tie")
					{
						gamemessage = "It's a Tie!";
						$(".chosen").addClass("tie")
						player.t++;
						player_connection.update({t: player.t});
						getenemy.addClass("tie");
					}
					//DISPLAY WINNER
					console.log(gamemessage);
					$("#g_msg").html(gamemessage+" Pick your next move!");
					var game_stats = "Wins: "+player.w+" &nbsp; &nbsp;Losses: "+player.l+" &nbsp; &nbsp;Draws: "+player.t;
					$("#w_msg").html(game_stats);
					
					
					setTimeout(gamereset(), 5000);
				}
				//ENEMY HAS CHOSEN, BUT PLAYER HASN'T
				else if (player_move == "NA" && enemy_move != "NA")
				{
					$("#g_msg").html(enemy.id+" has picked a move!");
				}
				//WAITING FOR ENEMY TO MAKE A MOVE
				else if (player_move != "NA" && enemy_move == "NA")
				{
					$("#g_msg").html("Waiting for "+enemy.id+" to pick a move...");
				}
			}
			else //ENEMY IS NO LONGER CONNECTED
			{
				$("#g_msg").html(enemy.id+" disconnected!");
			}
			
		}
	})

	//GAME RESET
	function gamereset(){
		$(".choice").attr("da", '0');
		//$(".choice, .echoice").removeClass("chosen win lose tie");

	}

	//PLAYER MAKE A MOVE
	$(".choice").on("click", function(){
		//console.log("clicked on choice")
		console.log($(this).attr("You chose "+$(this).html));
		$(".choice").removeClass("chosen win lose tie");
		$(".echoice").removeClass("win lose tie");
		if ($(this).attr("da") == "0")
		{

			var c = $(this).html().trim();
			//console.log(c);
			if (c == 'Rock')
				player.move = 'R';
			else if (c == 'Paper')
				player.move = 'P';
			else if (c == 'Scissors')
				player.move = 'S';
			$(this).addClass("chosen")
			$(".choice").attr("da", "1");
			users.child(player.order).update({move: player.move});
		}
	});

	//CHECK WHO WINS
	var rps = function(p, e){
		var gr;
		switch(p)
		{
			case 'R':
				e == 'S' ? gr = "Win" : e == 'P' ? gr = "Lose" : gr = "Tie";
				return gr;
			case 'P':
				e == 'R' ? gr = "Win" : e == 'S' ? gr = "Lose" : gr = "Tie";
				return gr;
			case 'S':
				e == 'P' ? gr = "Win" : e == 'R' ? gr = "Lose" : gr = "Tie";
				return gr;
		}
	}

	//UPDATE PLAYER STATS
	function update_value(){
		users.child(player.order).update({
			w: player.w,
			l: player.l,
			t: player.t,
			id: player.id,
			pic: player.pic
		})
	}

	//CREATE CHARACTER
	$('#createButton').on("click", function(){
		var newname = $("#userIDFrm").val();
		var piclink = $("#imgURLFrm").val();
		if (newname != '')
		{
			player.name = newname;
			//users.child(player.order).update({"id": newname})
			$("#playername").html(player.id);
		}
		if (piclink != '')
		{
			player.pic = piclink
		}
		update_value();
	})

	//LISTEN TO CHAT
	chat.on('child_added', function(res){
		if (res.val()){
			var _chat = res.val();
			//<li class="list-group-item text-left">Cras justo odio</li>

			var $list = $("<li class=\"list-group-item\">");
			var msg = "<strong>"+_chat.sender+": </strong>"+_chat.text;
			//var col9 = $("<div class='col-md-9'>");
			//col9.append(msg);
			//var col3 = $("<div class='col-md-3 pull-right'>");
			var gettime = Date.parse(_chat.time);
			//var hour = moment(gettime).hour();
			//var minutes = moment(gettime).minute();
			var times = moment(gettime).format("h:mm:ss A")
			var p = $("<p class='text-muted' style='font-size: 1em; float: right;'>");
			p.append(times);
			$list.append(msg);
			$list.append(p);
			//console.log(hour, minutes);
			
			$("#chatlist").append($list);
			$("#chatlist")[0].scrollTop = $("#chatlist")[0].scrollHeight;
		}
	});

	//SEND MESSAGE IN CHAT
	$("#ChatSubmit").on("click", function(){
		event.preventDefault();
		var d = moment(); var ds = d.toString();
		var msg = $("#msgFrm");
		var line = {
			text: msg.val(),
			time: ds,
			sender: player.id
		};
		chat.push(line);
		msg.val('');
	})

	//MESSAGES



