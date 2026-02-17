Game.Setup = OZ.Class();
Game.Setup.prototype.init = function() {
	document.body.innerHTML = "";
	this._players = [
		{type:"D", state:"human", name:"Helmut Pohl"},
		{type:"U", state:"human", name:"Jane Blonda"},
		{type:"F", state:"inactive", name:"Vera Cruise"},
		{type:"J", state:"inactive", name:"Mikro Mawasaki"},
		{type:"E", state:"inactive", name:"James Fond"},
		{type:"I", state:"inactive", name:"Luigi Maserotti"},
		{type:"M", state:"inactive", name:"Zora Meander"},
		{type:"V", state:"inactive", name:"Armino Gesserti"}
	];

	this._build();
	document.body.appendChild(this._node);
}

Game.Setup.prototype._build = function() {
	this._node = OZ.DOM.elm("div", {id:"setup", position:"relative"});
	
	var offsetX = [112, 548];
	var offsetY = 33;
	var offsetX = [94, 530];
	var offsetY = 21;
	var offsetX = [94, 530];
	var offsetY = 19;

	for (var i=0;i<this._players.length;i++) {
		var p = this._players[i];
		var node = OZ.DOM.elm("div", {width:"116px", height:"116px", position:"absolute"});
		node.style.left = offsetX[i % 2] + "px";
		node.style.top = (offsetY + 130*Math.floor(i/2)) + "px";
		p.node = node;
		
		var name = OZ.DOM.elm("input", {position:"absolute", value:p.name});
		name.style.left = (offsetX[i % 2] + 125) + "px";
		name.style.top = (offsetY + 130*Math.floor(i/2)) + "px";
		p.name = name;
		
		this._sync(p);
		this._node.appendChild(node);
		this._node.appendChild(name);
	}
	
	OZ.Touch.onActivate(this._node, this._click.bind(this));
	
	var done = OZ.DOM.elm("img", {id:"start", src:"img/setup/start.png", title:"Race!", alt:"Race!"});
	this._node.appendChild(done);
	OZ.Touch.onActivate(done, this._done.bind(this));
}

Game.Setup.prototype._click = function(e) {
	OZ.Event.stop(e);
	var target = OZ.Event.target(e);
	var cycle = {"inactive":"ai", "ai":"human", "human":"inactive"};
	for (var i=0;i<this._players.length;i++) {
		var player = this._players[i];
		if (player.node == target) {
			player.state = cycle[player.state];
			this._sync(player);
			return;
		}
	}
}

Game.Setup.prototype._sync = function(player) {
	if (player.state == "inactive") {
		player.node.style.backgroundImage = "none";
		player.node.style.filter = "";
		player.name.style.display = "none";
	} else {
		player.node.style.backgroundImage = "url(img/setup/" + player.type + ".png)";
		player.node.style.filter = (player.state == "ai" ? "grayscale(100%)" : "");
		player.name.style.display = "";
	}
}

Game.Setup.prototype._done = function(e) {
	OZ.Event.stop(e);
	var count = 0;
	for (var i=0;i<this._players.length;i++) {
		var p = this._players[i];
		if (p.state != "inactive" && p.name.value) { count++; }
	}
	if (count == 0) { return; }

	for (var i=0;i<this._players.length;i++) {
		var p = this._players[i];
		if (p.state != "inactive" && p.name.value) { Game.createPlayer(p.type, p.name.value, p.state == "ai"); }
	}

	this._close();
	Game.play(false);
}

Game.Setup.prototype._close = function() {
	OZ.DOM.removeClass(document.body, "setup");
	this._node.parentNode.removeChild(this._node);
}

Game.Setup.prototype._load = function(e) {
	OZ.Event.stop(e);
	this._close();
	Game.play(true);
}
