function Food(x,y, type, r, alive){
  this.pos = createVector(x, y);
  this.r = r;
  this.type = type;
  this.alive = alive;
  
  if(this.type == 0)
  {
	this.colors = [255,0,0];
  } 
  else if(this.type == 1)
  {
	this.colors = [0, 255, 0];
  }
  else if(this.type == 2)
  {
	this.colors = [0, 0, 255];
  }
  else
  {
	this.colors = [0,0,0];
  }
  
  this.show = function(){
    fill(color(this.colors));
    rect(this.pos.x, this.pos.y, this.r, this.r);
  }
}