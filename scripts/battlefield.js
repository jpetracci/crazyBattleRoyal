// teams must be even
var UNITS_PER_SIDE = 50;

function init()
{
	game = new Game();
	game.init();

	update();
}

// main loopty loop
function update()
{
	requestAnimationFrame(update);
	game.update();
}

// general gamey stuff
Game = function()
{
	this.graphics;
	this.playingField;
	var units = [];
	var explosions = [];
	var total_units = 0;
	var rightScore = 0;
	var leftScore = 0;
	var clock = new THREE.Clock();

	this.init = function() 
	{
		// set up the graphics to display everything
		this.graphics = new Graphics();
		this.graphics.init();

		// configure the playing field
		this.playingField = new PlayingField();
		this.playingField.init();
		this.graphics.addObject(this.playingField.mesh);

		// initialize the units
		for(var i = 0; i < UNITS_PER_SIDE; i++)
		{
			units.push( new Unit() );
			units[total_units].init(new GreenSide());
			this.graphics.addObject(units[total_units].mesh);
			total_units++;

			units.push( new Unit() );
			units[total_units].init(new RedSide());
			this.graphics.addObject(units[total_units].mesh);
			total_units++;
		}
	}

	this.update = function()
	{
		for (var i = 0; i < units.length; i++) {
			// have the units do their AI
			units[i].update();

			// check for collisions
			this.collisions();

			// check for explosions
			this.explode();

			// check for goals
			this.goals();
		}

		//draw the stuff
		this.graphics.render();
	}

	this.collisions = function()
	{
		// loop through and check for collisions
		for (var i = 0; i < units.length; i++) {
			for (var j = i+1; j < units.length; j++) {
				// using distance to determine collision
				if( (units[i].mySide.text !== units[j].mySide.text) &&
					  (units[i].distance(units[j]) < 1) )
				{
					// cool explosions FXs!!
					explosions.push(new Explosion(units[i].mesh.position.x, units[i].mesh.position.y, clock.getElapsedTime()));

					//they are in the same square so kill both
					this.graphics.removeObject(units[i].mesh);
					this.graphics.removeObject(units[j].mesh);

					// create new units
					var side = units[i].mySide;
					units[i] = new Unit();
					units[i].init(side);
					this.graphics.addObject(units[i].mesh);

					side = units[j].mySide;
					units[j] = new Unit();
					units[j].init(side);
					this.graphics.addObject(units[j].mesh);
				}
			}
		}
	}

	this.goals = function()
	{
		// check all units for touchdown!
		for (var i = 0; i < units.length; i++) 
		{
			if( (units[i].alive === true) &&
				  (Math.abs(units[i].mySide.goalx + units[i].mesh.position.x) > 148) )
			{
				// they scored so remove from field
				this.graphics.removeObject(units[i].mesh);
				// add to score
				this.score(units[i].mySide);

				// create new unit
				var side = units[i].mySide;
				units[i] = new Unit();
				units[i].init(side);
				this.graphics.addObject(units[i].mesh);
			}
		}
	}

	this.score = function(side)
	{
		// display score
		if(side.goalx > 0)
		{
			game.graphics.scoreboard.leftScoreValue(++leftScore);
		}
		else
		{
			game.graphics.scoreboard.rightScoreValue(++rightScore);
		}
	}

	this.explode = function()
	{
		// look for explosions in progress
		for(var i = 0; i < explosions.length; i++)
		{
			game.graphics.addObject(explosions[i].mesh);			
			explosions[i].update(clock.getElapsedTime());
		}

		if(explosions.length > 0)
		{
			// have any current explosions blown everything up?
			if(explosions[0].die === true)
			{
				// get rid of the explosion
				game.graphics.removeObject(explosions[0].mesh);
				explosions.splice(0,1);
			}
		}
	}
}

// data for green side
GreenSide = function()
{
	this.geometry = new THREE.PlaneGeometry(1,1);
	this.material = new THREE.MeshBasicMaterial({color: 0x00bb00});
	this.startx = -74;
	this.goalx = 74;
	this.text = "green";
}

// data for red side
RedSide = function()
{
	this.geometry = new THREE.PlaneGeometry(1,1);
	this.material = new THREE.MeshBasicMaterial({color: 0xbb0000});
	this.startx = 74;
	this.goalx = -74;
	this.text = "red"
}

// super powerful guys
Unit = function()
{
	this.mesh;
	this.alive;
	this.mySide;

	// always move in one horizontal direction
	var speedx = Math.random()*(.2)+.1;
	// can move up or down
	var speedy = Math.random()*(.4)-.2;

	this.init = function(side)
	{
		this.alive = true;
		this.mySide = side;

		var geo = this.mySide.geometry;
		var mat = this.mySide.material;
		this.mesh = new THREE.Mesh(geo,mat);
		this.mesh.position.x = this.mySide.startx;
		this.mesh.position.y = (Math.random()*98)-49;
		this.mesh.position.z = .01; // just a little above to clear everything
	}

	this.update = function()
	{
		// very simple movement
		var x = this.mesh.position.x;
		var y = this.mesh.position.y;

		if(x < this.mySide.goalx)
		{
			x += speedx;
		}
		else if(x > this.mySide.goalx)
		{
			x -= speedx;
		}
		else
		{
			// reached goal and now it's time to party!
			//   ...or do nothing, maybe that's better
		}

		if(y < -50)
		{
			speedy = -speedy;
		}
		else if(y > 50)
		{
			speedy = -speedy;
		}

		y += speedy;

		this.mesh.position.x = x;
		this.mesh.position.y = y;
	}

	// distance from me to other
	this.distance = function(other)
	{
		var xd = other.mesh.position.x - this.mesh.position.x;
		var yd = other.mesh.position.y - this.mesh.position.y;

		return Math.sqrt(xd*xd + yd*yd);
	}

	// distance to XY point
	this.distanceXY = function(x,y)
	{
		var xd = x - this.mesh.position.x;
		var yd = y - this.mesh.position.y;

		return Math.sqrt(xd*xd + yd*yd);
	}
}

// background texture
PlayingField = function()
{
	this.mesh;

	this.init = function()
	{
		var geo = new THREE.PlaneGeometry(150,100);
		var mat = new THREE.MeshBasicMaterial({color: 0x333333});
		this.mesh = new THREE.Mesh(geo,mat)
	}
}

// handles the pretty stuff
Graphics = function()
{
	this.scene;
	this.camera;
	this.renderer;
	this.scoreboard = new ScoreBoard();

	this.init = function()
	{
		var container = document.getElementById( 'container' );
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, (window.innerWidth-20)/(window.innerHeight-20), 0.1, 1000);
		//this.renderer = new THREE.CanvasRenderer();
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(window.innerWidth-20, window.innerHeight-20);
		container.appendChild(this.renderer.domElement);
		container.appendChild(this.scoreboard.domElement);
		this.camera.position.z = 70;
	}

	this.render = function()
	{
		this.renderer.render(this.scene, this.camera);
	}

	this.addObject = function(object)
	{
		this.scene.add(object);
	}

	this.removeObject = function(object)
	{
		this.scene.remove(object);
	}
}

// displays the score, yo
ScoreBoard = function()
{
	var container = document.createElement("div");
	container.id = "scoreboard";
	container.style.cssText = "width: 100px; opacity: 0.5;position: absolute;top: 60px;left: 50%;margin: 0px 0px 0px -50px;color:#bbb";

	leftScore = document.createElement("div");
	leftScore.id = "leftScore";
	leftScore.innerHTML = "0";
	leftScore.style.cssText = "width:40px;border:1px solid;float:left;text-align:center;color:#00ee00";
	container.appendChild(leftScore);

	rightScore = document.createElement("div");
	rightScore.id = "rightScore";
	rightScore.innerHTML = "0";
	rightScore.style.cssText = "width:40px;border:1px solid;float:right;text-align:center;color:#ee0000";
	container.appendChild(rightScore);

	this.leftScoreValue = function(value)
	{
		leftScore.innerHTML = value;
	}

	this.rightScoreValue = function(value)
	{
		rightScore.innerHTML = value;
	}

	this.domElement = container;
}

// things that go boom
Explosion = function(x,y,time) 
{
    this.die = false;
    this.createdTime = time;
    //this.createdTime = clock.getElapsedTime();
    this.mesh = new THREE.Mesh( new THREE.CircleGeometry(4,32) , new THREE.MeshBasicMaterial( { color: 0xffbb00, wireframe: false } ));
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    //game.addObject(this.mesh);
    
    this.update = function(time)
    {
        if( (time-this.createdTime) > .1 )
        {
            this.die = true;
        }
    }
};

