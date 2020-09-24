var game = new Game();

function init() {
	if (game.init()){
		game.start();
	};
}


var imgRepository = new function() {
	this.background = new Image();
	this.spaceship = new Image();
	this.bullet = new Image();
	this.enemyBullet = new Image();
	this.enemy = new Image();
	
	var numImages = 5;
	var numLoaded = 0;
	function imageLoaded(){
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}

	this.background.onload = function(){
		imageLoaded();
	}

	this.spaceship.onload = function(){
		imageLoaded();
	}

	this.bullet.onload = function(){
		imageLoaded();
	}

	this.enemyBullet.onload = function(){
		imageLoaded();
	}

	this.enemy.onload = function() {
		imageLoaded()
	}

	this.background.src = "bg.png";
	this.spaceship.src = "spaceship.png";
	this.bullet.src = "bullet.png";
	this.enemy.src = "enemy.png";
	this.enemyBullet.src = "bullet_enemy.png";
}

function Drawable() {
	this.init = function(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	this.collidableWith = "";
	this.isColliding = false;
	this.type = "";

	this.draw = function() {
	};

	this.move = function(){
	};
	this.iscCollidableWith = function(object) {
		return (this.collidableWith === object.type);
	};
}

function Background() {
	this.speed = 1;

	this.draw = function() {

		this.y += this.speed;
		this.context.drawImage(imgRepository.background, this.x, this.y);
		this.context.drawImage(imgRepository.background, this.x, this.y - this.canvasHeight);

		if (this.y >= this.canvasHeight) {
			this.y = 0
		}		
	};
}

Background.prototype = new Drawable();

function Bullet(object) {
	this.alive = false;
	var self = object;

	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};

	this.draw = function() {
		this.context.clearRect(this.x-1, this.y-1, this.width+1, this.height+1);
		this.y -= this.speed;
		if (this.isColliding) {
			return true;
		} else if (self === "bullet" && this.y <= 0 - this.canvasHeight){
			return true;
		} else if (self === "enemyBullet" && this.y >= this.canvasHeight) {
			return true;
		} else {
			if (self === "bullet"){
				this.context.drawImage(imgRepository.bullet, this.x, this.y);
			} else if ( self === "enemyBullet") {
				this.context.drawImage(imgRepository.enemyBullet, this.x, this.y);
			}
			return false;
		}
	};

	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
		this.isColliding = false;
	};
}

Bullet.prototype = new Drawable();

function Pool(maxSize) {
	var size = maxSize;
	var pool = [];

	this.init = function(object){
		if(object === "bullet"){
			for(i = 0; i< size; i++){
				var bullet = new Bullet("bullet");
				bullet.init(0,0, imgRepository.bullet.width, imgRepository.bullet.height);
				bullet.collidableWith = "enemy";
				bullet.type = "bullet";
				pool[i] = bullet;
			}
		} else if (object === "enemy"){
			for(i = 0; i< size; i++){
				var enemy = new Enemy();
				enemy.init(0,0, imgRepository.enemy.width, imgRepository.enemy.height);
				pool[i] = enemy;
			}
		} else if (object === "enemyBullet") {
			for(i = 0; i< size; i++){
				var bullet = new Bullet("enemyBullet");
				bullet.init(0,0, imgRepository.enemyBullet.width, imgRepository.enemyBullet.height);
				bullet.collidableWith = "ship";
				bullet.type = "enemyBullet";
				pool[i] = bullet;
			}
		}

	};

	this.getPool  = function() {
		var obj = [];
		for (i=0; i<size; i++){
			if (pool[i].alive){
				obj.push(pool[i]);
			}
		}
		return obj;
	};

	this.get = function(x, y, speed) {
		if (!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	};

	this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
		if(!pool[size - 1].alive && !pool[size - 2].alive){
			this.get(x1, y1, speed1);
			this.get(x2, y2, speed2);
		}
	};

	this.animate = function() {
		for(i=0; i<size; i++){
			if(pool[i].alive){
				if(pool[i].draw()){
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			} else {
				break;
			}
		}
	};
}



function Ship() {
	this.speed = 3;
	this.bulletPool = new Pool(30);
	this.bulletPool.init("bullet");

	var fireRate = 9;
	var counter = 0;

	this.collidableWith = "enemyBullet";
	this.type = "ship";

	this.draw = function() {
		this.context.drawImage(imgRepository.spaceship, this.x, this.y);
	};

	this.move = function() {
		counter++;
		
		if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.down || KEY_STATUS.up){
			this.context.clearRect(this.x, this.y, this.width, this.height);

			if(KEY_STATUS.left) {
				this.x -= this.speed
				if (this.x <= 0){
					this.x = 0;
				}
			} else if (KEY_STATUS.right) {
				this.x += this.speed
				if (this.x >= this.canvasWidth - this.width)
					this.x = this.canvasWidth - this.width;
			} else if (KEY_STATUS.up) {
				this.y -= this.speed
				if (this.y <= this.canvasHeight/4*3){
					this.y = this.canvasHeight/4*3;
				}
			} else if (KEY_STATUS.down) {
				this.y += this.speed
				if (this.y >= this.canvasHeight - this.height) {
					this.y = this.canvasHeight - this.height;
				}
			}
			if (!this.isColliding) {
				this.draw();
			}

		} 
		if (KEY_STATUS.space && counter >= fireRate && !this.isColliding) {
			this.fire();
			counter = 0;
		}
	};

	this.fire = function() {
		this.bulletPool.getTwo(this.x+6, this.y, 3, 
							   this.x+33, this.y, 3);
	};
}

Ship.prototype = new Drawable();

function Enemy() {
	var percentFire = .01;
	var chance = 0;
	this.alive = false;
	this.iscCollidableWith = "bullet";
	this.type = "enemy";

	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.speedX = 0;
		this.speedY = speed;
		this.alive = true;
		this.leftEdge = this.x - 90;
		this.rightEdge = this.x + 90;
		this.bottomEdge = this.y + 140;
	};

	this.draw = function() {
		this.context.clearRect(this.x-1, this.y, this.width+1, this.height);
		this.x += this.speedX;
		this.y += this.speedY;
		if (this.x <= this.leftEdge) {
			this.speedX = this.speed;

		} else if (this.x >= this.rightEdge + this.width) {
			this.speedX = -this.speed;
			
		} else if (this.y >= this.bottomEdge) {
			this.speed = 1.5;
			this.speedY = 0;
			this.y -= 5;
			this.speedX = -this.speed;
		}
		if (!this.isColliding) {
			this.context.drawImage(imgRepository.enemy, this.x, this.y);

			//enemy has a chance to shood at any moment
			chance = Math.floor(Math.random()*101);
			if (chance/100 < percentFire){
				this.fire();
			}
			return false;
		} else {
			return true;
		}
	};

	this.fire = function() {
		game.enemyBulletPool.get(this.x + this.width/2, this.y + this.height, -2.5);
	}

	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.alive = false;
		this.isColliding = false;
	};
}

Enemy.prototype = new Drawable();
/*
// QuadTree obj
// 
//   1 |  0
//  ___|___
//     |
//   2 |  3
//

function QuadTree(boundBox, lvl) {
	var maxObjects = 10;
	this.bounds = boundBox || {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	var objects = [];
	this.nodes = [];
	var level = lvl || 0;
	var maxLevels = 5;

	this.clear = function() {
		objects = [];
		for (i=0; i<this.nodes.length; i++) {
			this.nodes[i].clear();
		}
		this.nodes = [];
	};

	this.getAllObjects = function(returnedObjects) {
		for (i=0; i< this.nodes.length; i++){
			this.nodes[i].getAllObjects(returnedObjects)
		}
		for (i=0, len = objects.length; i< len; i++){
			returnedObjects.push(objects[i])
		}
		return returnedObjects;
	};

	this.findObjects = function(returnedObjects, obj){
		if (typeof obj === "undefined") {
			console.log("UNDEFINED OBJECT");
			return;
		}
		var index = this.getIndex(obj);
		if (index != -1 && this.nodes.length){
			this.nodes[index].findObjects(returnedObjects, obj);
		}
		for (i =0, len = objects.length; i<len; i++){
			returnedObjects.push(objects[i]);
		}
		return returnedObjects;
	};

	this.insert = function(obj) {
		if (typeof obj === "undefined") {
			return;
		}
		if ( obj instanceof Array) {
			for (i=0, len = obj.length; i <len; i++){
				this.insert(obj[i]);
			}
			return;
		}
		if (this.nodes.length) {
			var index = this.getIndex(obj);
			if (index != -1) {
				this.nodes[index].insert(obj);
				return;
			}
		}
		objects.push(obj);
		if (objects.length > maxObjects && level <maxLevels){
			if (this.nodes[0] == null){
				this.split();
			}
			var i = 0;
			while (i<objects.length){
				var index = this.getIndex(objects[i]);
				if (index != -1) {
					this.nodes[index].insert((objects.splice(i, 1))[0]);
				} else {
					i++;
				}
			}
		}
	};

	this.getIndex = function(obj) {
		var index = -1;
		var verticalMidpoint = this.bounds.x + this.bounds.width /2;
		var horizontalMidpoint = this.bounds.y + this.bounds.height /2;

		var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
		var bottomQuadrant = (obj.y > horizontalMidpoint);

		if (obj.x < verticalMidpoint && obj.x + obj.width < verticalMidpoint) {
			if (topQuadrant) {
				index = 1;
			} else if (bottomQuadrant) {
				index = 2;
			}
		} else if ( obj.x > verticalMidpoint) {
			if (topQuadrant) {
				index = 0;
			} else if (bottomQuadrant) {
				index = 3;
			}
		}
		return index;
	};

	this.split = function(){
		var subWidth = (this.bounds.width/2) | 0;
		var subHeight = (this.bounds.height / 2) | 0;

		this.nodes[0] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[1] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[2] = new QuadTree({
			x: this.bounds.x,
			y: this.bounds.y + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
		this.nodes[3] = new QuadTree({
			x: this.bounds.x + subWidth,
			y: this.bounds.y  + subHeight,
			width: subWidth,
			height: subHeight
		}, level+1);
	};
}
*/

function Game() {

	this.init = function() {
		this.bgCanvas = document.querySelector("#bg");
		this.shipCanvas = document.querySelector("#ship");
		this.mainCanvas = document.querySelector("#main");

		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext("2d");
			this.shipContext = this.shipCanvas.getContext("2d");
			this.mainContext = this.mainCanvas.getContext("2d");

			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Ship.prototype.context = this.shipContext;
			Ship.prototype.canvasWidth = this.shipCanvas.width;
			Ship.prototype.canvasHeight = this.shipCanvas.height;

			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;

			Enemy.prototype.context = this.mainContext;
			Enemy.prototype.canvasWidth = this.mainCanvas.width;
			Enemy.prototype.canvasHeight = this.mainCanvas.height;

			this.background = new Background();
			this.background.init(0, 0);

			this.ship = new Ship();

			var shipStartX = this.shipCanvas.width/2 - imgRepository.spaceship.width;
			var shipStartY = this.shipCanvas.height/4*3 + imgRepository.spaceship.height*2;
			this.ship.init(shipStartX, shipStartY, imgRepository.spaceship.width, imgRepository.spaceship.height);

			this.enemyPool = new Pool(30);
			this.enemyPool.init("enemy");
			var height = imgRepository.enemy.height;
			var width = imgRepository.enemy.width;
			var x = 100;
			var y = -height;
			var spacer = y * 1.5;
			for (i = 1; i<=18; i++){
				this.enemyPool.get(x, y, 2);
				x += width + 25;
				if (i % 6 === 0) {
					x = 100;
					y += spacer 
				}
			}
			this.enemyBulletPool = new Pool(50);
			this.enemyBulletPool.init("enemyBullet");
			// this.quadTree = new QuadTree({x: 0, y: 0, width: this.mainCanvas.width, height: this.mainCanvas.height});
			
			return true;
		} else {
			return false;
		}
	};

	this.start = function() {
		this.ship.draw();
		animate();
	};
}

function animate() {
	/*
	game.quadTree.clear();
	game.quadTree.insert(game.ship);
	game.quadTree.insert(game.ship.bulletPool.getPool());
	game.quadTree.insert(game.enemyPool.getPool());
	game.quadTree.insert(game.enemyBulletPool.getPool());
	detectCollision();
*/

	requestAnimFrame(animate);
	game.background.draw();
	game.ship.move();
	game.ship.bulletPool.animate();
	game.enemyPool.animate();
	game.enemyBulletPool.animate();
}
/*
function detectCollision() {
	var objects = [];
	game.quadTree.getAllObjects(objects);

	for (x=0, len= objects.length; x<len; x++){
		game.quadTree.findObjects(obj = [], objects[x]);

		for (y = 0, length = obj.length; y < length; y++){
			if (objects[x].collidableWith === obj[y].type && 
				(objects[x].x < obj[y].x + obj[y].width &&
				objects[x].x + objects[x].width > obj[y].x &&
				objects[x].y < obj[y].y + obj[y].height &&
				objects[x].y +objects[x].height > obj[y].y)) {
					objects[x].isColliding = true;
					obj[y].isColliding = true;
			}
		}
	}
};
*/
KEY_CODES = {
	32: 'space',
	65: 'left',
	87: 'up',
	68: 'right',
	83: 'down'
}

KEY_STATUS = {};
for (code in KEY_CODES) {
	KEY_STATUS[KEY_CODES[code]] = false;
}

document.onkeydown = function(e){
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
	if (KEY_CODES[keyCode]) {
		e.preventDefault();
		console.log("pressed");
		KEY_STATUS[KEY_CODES[keyCode]] = true;
	}
}

document.onkeyup = function(e) {
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
	if (KEY_CODES[keyCode]) {
		e.preventDefault();
		KEY_STATUS[KEY_CODES[keyCode]] = false;
	}
}

window.requestAnimFrame = (function(){
	return window.requestAnimationFrame    ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(/*function*/ callback, /* DOMelement*/ element) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

