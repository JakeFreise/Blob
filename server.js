var port = 8365;
var blobs = [];
var food = [];
var maxH = 500;
var maxW = 500;
var bullets = [];
var bulletCount = 0;
var PI = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679;
var NUMBEROFAI = 3; 
var NUMBEROFFRUITS = 100;

var Vec2 = require('vec2');

function Projectile(xS, yS, xD, yD, power, active, id)
{
  this.x = xS;
  this.y = yS;
  this.pos = new Vec2(xS, yS);
  this.vel = new Vec2(xD, yD);
  //this.vel.normalize();
  //this.vel.multiply((speed/(power+1))/2);
  this.r = power;
  this.active = active;
  this.id = id;
  
  this.updatePosition = function()
  {
    this.x = this.pos.x;
    this.y = this.pos.y;
    this.bounds();
  }
  
  this.bounds = function()
  {
    if(this.x >= maxW || this.x <= -maxW || this.y <= -maxH || this.y >= maxH)
    {
      this.disable();
      return true;
    }
    return false;
  }
  
  this.disable = function(){
    this.active = 0;
  }
}

function Blob(id, x, y, r, power, speed, defense){
  this.alive = 1;
  this.pos = new Vec2(x, y);
  this.vel = new Vec2(0, 0);
  this.acc = new Vec2(0, 0);
  this.wandertheta = 0;
  this.x = x;
  this.y = y;
  this.id = id;
  this.r = r;
  this.power = power;
  this.speed = speed;
  this.defense = defense;
  this.totalStats = this.power + this.speed + this.defense;
  this.colors = [255*power/this.totalStats, 255*speed/this.totalStats, 255*defense/this.totalStats];
 
  this.disable = function(){
    this.alive = 0;
  }

  this.updateVectors = function()
  {
    this.pos = new Vec2(this.x, this.y);
  }

  this.updatePosition = function()
  {
    this.x = this.pos.x;
    this.y = this.pos.y;
    if(this.bounds())
    {
      var center = new Vec2(0,0);
      this.runTo(center);
    }
  }
  
  this.updateForce = function()
  {
	this.dragForce();
	
    if(this.vel.length() > this.speed)
    {
      this.vel.normalize();
      this.vel.multiply(this.speed);
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.multiply(0);
    this.updatePosition();
  }
  
  this.bounds = function()
  {
    if(this.x + this.r >= maxW || this.x - this.r <= -maxW || this.y - this.r <= -maxH || this.y + this.r >= maxH)
    {
      if(this.x >= maxW)
      {
        this.x = maxW - this.r; 
      } else if(this.x <= -maxW)
      {
        this.x = -maxW + this.r; 
      }
      if(this.y >= maxH)
      {
        this.y = maxH - this.r; 
      } else if(this.y <= -maxH)
      {
        this.y = -maxH + this.r; 
      }      
      //console.log("bounded");
      return true;
    }
    return false;
  }
  
  this.applyForce = function(force)
  {
    var mass = PI * this.r * this.r;
    force.divide(mass);
    this.acc.add(force);
  }

  this.updateColor = function()
  {
    this.totalStats = this.power + this.speed + this.defense;
    this.colors = [255*power/this.totalStats, 255*speed/this.totalStats, 255*defense/this.totalStats];
  }
  
  this.dragForce = function()
  {
	//drag force
	var drag = this.vel.clone();
	drag.normalize();
	var resistance = this.vel.lengthSquared();
	if(!isNaN(resistance))
	{
		var normalForce = this.r * resistance;
	}
	else
	{
		var normalForce = this.r;
	}
	
	drag.multiply(-1 * normalForce);
	this.applyForce(drag);
  }

  this.runTo = function(other)
  {    
    var desired = new Vec2(other.x, other.y);
    desired.subtract(this.pos);
    desired.normalize();
    desired.multiply(this.speed);
    
    var steer = new Vec2(desired.x, desired.y);
    steer.subtract(this.vel);
    this.applyForce(steer);
  }

  this.runFrom = function(other)
  {
    var newVel = new Vec2(this.x, this.y);
    newVel.subtract(other.pos);
    newVel.normalize();
    newVel.multiply(this.speed);
    this.applyForce(newVel); 
    //this.updatePosition();
  }
  
  this.wander = function()
  {
    var wanderR = 25;         // Radius for our "wander circle"
    var wanderD = 80;         // Distance for our "wander circle"
    var change = 0.3;
    var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    
    this.wandertheta += Math.random() * change * plusOrMinus;     // Randomly change wander theta

    // Now we have to calculate the new position to steer towards on the wander circle
    var circlepos = this.vel;
    circlepos.normalize();            // Normalize to get heading
    circlepos.multiply(wanderD);          // Multiply by distance
    circlepos.add(this.pos);               // Make it relative to boid's position
    var center = new Vec2(0,0);
    var h = this.vel.angleTo(center) + 2;        // We need to know the heading to offset wandertheta

    var circleOffSet = new Vec2(wanderR*Math.cos(this.wandertheta+h),wanderR*Math.sin(this.wandertheta+h));
    circlepos.add(circleOffSet);
    this.runTo(circlepos);
  }
  
  this.eat = function(other, blob)
  {
    if(blob && this.r > other.r)
    {
      this.levelUp(other.power-this.power, other.speed-this.speed, other.defense-this.defense);
    }
    else if (!blob) //fruit
    {
      this.levelUp(other.power, other.speed, other.defense);
    }
    else
    {
      return false;
    }
    var sum = PI * this.r * this.r +PI * other.r * other.r;
    this.r = Math.sqrt(sum/PI);
    this.updateColor();
    return true;
  }
  
  this.levelUp = function(p, s, d)
  {
    if(p>0)
    {
      this.power += p;
    }
    if(s>0)
    {
      this.speed += s;
    }
    if(d>0)
    {
      this.defense += d;
    }
  }
  
  this.hitBy = function(bullet)
  {
    var change = Math.max((bullet.r * bullet.r)/this.defense, 0); 
    if(change>0)
    {
      return this.shrink(change);
    }
  }
  
  this.shrink = function(change)
  {
    var oldR = this.r;
    var currentArea = (PI * this.r * this.r);
    var changeArea = (PI * change * change);
    var sum = currentArea - changeArea;
    
    //console.log(currentArea + " - " + changeArea + " = " + sum);
    this.r = Math.sqrt(sum/PI);
    
    if(this.r <= 0)
    {
      this.r = 1;
      console.log("MINUMIN REACHED "+this.r);
      return false;
    }
    var expectedSize = (oldR-this.r) * (oldR-this.r) * PI ;
    //console.log(expectedSize);
    return change;
  }
  
  this.grow = function(change)
  {
    this.r += change;
    //console.log(this.r);
  }
}

function Food(x, y, type)
{
  this.x = x;
  this.y = y;
  this.pos = new Vec2(this.x, this.y);
  this.type = type;
  this.r = 5;
  this.power = type==0 ? 1 : 0;
  this.speed = type==1 ? 1 : 0;
  this.defense = type==2 ? 1 : 0;
  this.alive = 1;
  
  this.disable = function()
  {
    this.alive = 0;
  }
}

function spawnFood(number)
{
  for (i = 0; i<number; i++)
  {
    var xplusOrMinus = Math.random() < 0.5 ? -1 : 1;
    var yplusOrMinus = Math.random() < 0.5 ? -1 : 1;

    var x = Math.floor(maxW*Math.random()) * xplusOrMinus;
    var y = Math.floor(maxH*Math.random()) * yplusOrMinus;
    var t = 3*Math.random()>>0;

    temp = new Food(x, y, t);
    food.push(temp);
  }
}

function spawnAI(number)
{
  for (i = 0; i<number; i++)
  {
    var xplusOrMinus = Math.random() < 0.5 ? -1 : 1;
    var yplusOrMinus = Math.random() < 0.5 ? -1 : 1;

    var x = Math.floor(maxW*Math.random()) * xplusOrMinus;
    var y = Math.floor(maxH*Math.random()) * yplusOrMinus;
    var t = 3*Math.random()>>0;
    var r = 0;

    var sizeChooser = Math.random() * 10;
  
    if(sizeChooser == 9)//giant 1/10
    {
      r = (Math.random() * (64-32)) + 32; //32 - 64
    }else if(sizeChooser>6){ //big 2/10
      r = (Math.random() * (32-16)) + 16;//16-32
    }else if(sizeChooser>3){//medium 3/10
      r = (Math.random() * (16-8)) + 8; //8-16
    }else{                  //small 4/10
      r = (Math.random() * (8-2)) + 2; // 4-8
    }

    var p = 1;
    var s = 1;
    var d = 1;

    switch(t)
    {
    case 0: 
      p++;
      break;
    case 1:
      s++;
      break;
    case 2:
      d++;
      break;
    }

    var ai = new Blob(0, x, y, r, p, s, d);
    blobs.push(ai);
  }
}

function updateAI(units)
{
  //console.log(units);
  for (i = units.length -1; i>=0; i--)
  {
    if (units[i].id==0)
    {
      for (j = 0; j<units.length; j++)
      {
        var distance = units[i].pos.distance(units[j].pos);
        //we see things
        if (distance < (units[i].r + units[j].r)*4)
        {
          var smaller = units[i].r < units[j].r;
          var bigger = units[i].r > units[j].r;

          if(smaller) //FLEE
          {
            units[i].runFrom(units[j]);
          } 
          else if (bigger) //CHASE
          {
            units[i].runTo(units[j]);
          }
          else //FLOCK
          {
            //console.log("Flock");
          }
          //units[i].updateForce();
		   units[i].updateForce();
        }
        //wander
        //units[i].wander();
        //apply the aggregated force
      }
    }
  }
}

function updateProjectiles(units)
{
  for (i = units.length -1; i>=0; i--)
  {
    if(units[i].active)
    {
      units[i].pos.add(units[i].vel);
      units[i].updatePosition();
    }
  }
}

function checkCollisions()
{
  for(i = blobs.length-1; i>=0; i--)
  {
    if(blobs[i].alive)
    {
		//check against a player collision
		for(j = blobs.length-1; j>=0; j--)
		{
			if(blobs[j].alive)
			{
			  var distance = blobs[i].pos.distance(blobs[j].pos);        
			  if(distance <= blobs[i].r + blobs[j].r)
			  {
				if(blobs[i].eat(blobs[j], 1))
				{
				  blobs[j].disable();
				  break;
				}
			  } 
			}
		} 
		//check against a bullet collision
		for(k = 0; k<bullets.length; k++)
		{
		  if(bullets[k].active && (bullets[k].id !== blobs[i].id))
		  {
			var distance = blobs[i].pos.distance(bullets[k].pos);
			
			if(distance <= blobs[i].r + bullets[k].r)
			{
			  babyBlobR = blobs[i].hitBy(bullets[k])
			  if(babyBlobR)
			  {
				//console.log("MAKING NEW BLOB: radius" + babyBlobR);
				makeBabyBlob(blobs[i], babyBlobR, i);
			  }
			  bullets[k].disable();
			}
		  }
		}
		//check against a fruit collision
		for(f = food.length-1; f>=0; f--)
		{
		  if(food[f].alive)
		  {
			var distance = (blobs[i].pos).distance(food[f].pos);
			var target = blobs[i].r + food[f].r;
			//console.log(distance +", "+ target);
			if(distance <= blobs[i].r + food[f].r)
			{
			  blobs[i].eat(food[f], 0)
			  {
				food[f].disable();
			  }
			}
		  }
		}
    }
  }
}

function makeBabyBlob(parent, size, index)
{
  var plusOrMinusX1 = Math.random() < 0.5 ? -1 : 1;
  var plusOrMinusX2 = Math.random() < 0.5 ? -1 : 1;
  var plusOrMinusY1 = Math.random() < 0.5 ? -1 : 1;
  var plusOrMinusY2 = Math.random() < 0.5 ? -1 : 1;
  var xOffset = Math.random() * parent.r / 4;
  var yOffset = Math.random() * parent.r / 4;
  
  var newX = parent.x + (plusOrMinusX1 * parent.r) + (plusOrMinusX2 * xOffset);
  var newY = parent.y +(plusOrMinusY2 * parent.r) + (plusOrMinusY2 * yOffset);
  newBlob = new Blob(0, newX, newY, babyBlobR, parent.power, parent.speed, parent.defense )
  
  //console.log(parent);
  //console.log(newBlob);
  blobs.splice(index,0,newBlob);
}

function setup() 
{ 
  spawnFood(NUMBEROFFRUITS);
  spawnAI(NUMBEROFAI);
  var emptyBullet = new Projectile(0, 0, 0, 0, 0, 0, 0);
  bullets[bulletCount] = emptyBullet;
  console.log("Set up complete");
}

console.log("Seting up.");
setup();
console.log("Starting server");
////////////////////SERVER STARTING/////////////////
var express = require('express');
var app = express();
port = process.env.PORT || port;

var server = app.listen(port, '0.0.0.0', 
  function() {
  console.log('Listening to port:  ' + port);
});

app.use(express.static('public'));

console.log("My socket server is running");

var socket = require('socket.io');
var io = socket(server);
////////////////////STARTED///////////////////////
console.log("Spawned " + food.length + " fruits");

setInterval(heartbeat, 33);
function heartbeat() {
  io.sockets.emit('heartbeat', blobs);
  io.sockets.emit('foodbeat', food);
  io.sockets.emit('bulletbeat', bullets);
}

setInterval(loop, 5);

function loop()
{
  //console.log("scream");
  updateAI(blobs); 
  updateProjectiles(bullets);
  checkCollisions();
}

io.sockets.on('connection', 
  function(socket)
{
  console.log('new connection ' + socket.id); 

  socket.on('start', 
    function(data) {
    console.log(socket.id + " has joined");
    var blob = new Blob(socket.id, data.x, data.y, data.r, data.p, data.s, data.d);
    blobs.push(blob);
  });

  socket.on('update', 
    function(data) {
    //console.log(socket.id + " " + data.x + " " + data.y);
    var blob;
    for (var i = 0; i<blobs.length; i++)
    {
      if (socket.id == blobs[i].id)
      {
        blob = blobs[i];
        break;
      }
    }

    if (data !== undefined)
    {
      blob.x = data.x;
      blob.y = data.y;
      blob.updateVectors();
      blob.bounds();
    }
    
    var returnData = {
      alive: blob.alive,
      r: blob.r,
      p: blob.power,
      s: blob.speed,
      d: blob.defense
    };
    socket.emit('update', returnData);
  });
  
  socket.on('projectile', 
  function(data) {
    var found = 0;
    var active = 1;
    newBullet = new Projectile(data.x1, data.y1, data.x2, data.y2, data.p, active, data.id);
    
    for(var i = 0; i<bulletCount+1; i++)
    {
      if(!(bullets[i].active))
      {
        bullets.splice(i,1,newBullet);
        found = 1;
        break;
      }
    }
    if(!found)
    {
      bullets.splice(i,0,newBullet);
      bulletCount++;
      //console.log("MADE A BULLET");
    }
  });
});