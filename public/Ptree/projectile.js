function Projectile(pos, r, active){
  this.pos = pos;
  this.r = r;
  this.active = active;
  
  this.inBounds = function() {
    return true;//this.pos.x >= -width && this.pos.x <= width &&
      //this.pos.y >= -height && this.pos.y <= height;
  };
  
  this.hits = function(other){
    var d = p5.Vector.dist(this.pos, other.pos);
    if(d < (this.r + other.r))
    {
      this.active = 0;
      return true;
    }
    else
    {
      return false;
    }
  }
  
  this.disable = function(){
    this.active = 0;
  }
  
  this.show = function(){
    fill(color([255,0,0]));
    ellipse(this.pos.x,this.pos.y,this.r*2,this.r*2);
  }
}