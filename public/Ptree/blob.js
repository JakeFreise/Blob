function Blob(alive, id,x,y,r, power, speed, defense){
  this.alive = alive;
  this.id = id;
  this.pos = createVector(x, y);
  this.r = r;
  this.vel = createVector(0,0);
  this.colors = [power*85, speed*85, defense*85];
  this.power = power;
  this.speed = speed;
  this.defense = defense;
  this.dead = false;
  this.level = 0;
  
  this.update = function()
  {
    var newvel = createVector(mouseX-width/2, mouseY-height/2);
    newvel.setMag(this.speed);
    this.vel.lerp(newvel, 0.1);
    this.pos.add(this.vel);
  }
  
  this.updateStats = function(alive, r, p, s, d)
  {
	this.alive = alive;
	this.r = r;
	this.power = p;
	this.speed = s;
	this.defense = d;
	this.updateColors();
  }
  
  this.updateColors = function()
  {
	totalStats = this.power + this.speed + this.defense;
	var red = this.power/totalStats * 255; //if we are both red then we
	var green = this.speed/totalStats * 255;
	var blue = this.defense/totalStats * 255;
	
	this.colors = [red,green,blue];
  }
  
  /*
  this.moveTo = function(other)
  {
    var newvel = createVector(0, 0);
    if(this.r>other.r)
    {
      newvel = p5.Vector.sub(other.pos, this.pos);
    }
    else if(other.r>this.r*2)
    {
      newvel = p5.Vector.sub(this.pos, other.pos);
    }

    newvel.setMag(this.speed);
    this.vel.lerp(newvel, 0.1);
    this.pos.add(this.vel);
  }
  
  this.getVel = function()
  {
    return this.vel;
  }
  
  this.levelUp = function(powerUp)
  {
    this.level += powerUp;
  }
  
  this.eats = function(other)
  {
    var d = p5.Vector.dist(this.pos, other.pos);
    if(d < (this.r + other.r))
    {
      var eats = 0;
      var eaten = 0;
        
      if(this.r>other.r)
      {
         eats = 1;
      }
      if(other.r>this.r)
      {
        eaten = 1;
      }
      
      if(eats && eaten)
      {
        if(this.speed>other.speed)
        {
          eaten = 0;
        }
        else if(other.speed>this.speed)
        {
          eats = 0
        }
      }
      
      if(eats)
      {
        var sum = PI * this.r * this.r +PI * other.r * other.r;
        this.r = sqrt(sum/PI);
        
        this.power += max((other.power - 1), 0);
        this.speed += max((other.speed - 1),0);
        this.defense += max((other.defense - 1),0);
        this.totalStats = this.power + this.speed + this.defense;
        return true;
      }
      else if (eaten)//eaten
      {
        this.dead = true;
        return false;
      }
      else
      {
        return false
      }
    }
    else
    {
      return false; 
    }
  }
  
  this.shrink = function(size)
  {
     this.r = this.r - size;
  }
  */
  

  this.constrain = function() {
    this.pos.x = constrain(this.pos.x, -500, 500);
    this.pos.y = constrain(this.pos.y, -500, 500);
  }
 
  this.show = function(){
    fill(color(this.colors));
    ellipse(this.pos.x,this.pos.y,this.r*2,this.r*2);
  }
}