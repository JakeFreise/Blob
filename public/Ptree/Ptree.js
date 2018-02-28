var socket;
var cols, rows;
var scl = 500;
cols = 500/scl;
rows = 500/scl;
var SIZE = 10;
var SCOPE = 32/SIZE;
var blob;
var blobs = [];
var onlineblobs = [];
var bullet = [];
var food = [];
var zoom = 1;

function fire(power, speed, angle)
{
  var trajectory = createVector(mouseX-width/2, mouseY-height/2);
  trajectory.rotate(angle);
  console.log((blob.speed + speed)/(blob.power+power));
  trajectory.setMag((blob.speed + speed)/(blob.power+power));
  var data = {
	x1: blob.pos.x,
	y1: blob.pos.y,
	x2: trajectory.x,
	y2: trajectory.y,
	p: blob.power + power,
    id: socket.id
  };
  socket.emit('projectile', data);
}

function mousePressed()
{
  switch(blob.level)
  {
    case 0:
    {
      (blob.vel).rotate(180 + random(-5, 5));
      (blob.vel).setMag(blob.speed+blob.power-blob.defense);
      fire(0,0,0);
    break;
    }
    case 1:
    { 
      (blob.vel).rotate(180 + random(-5, -5));
      (blob.vel).setMag(blob.speed+blob.power);
      fire(0,0,0);
      fire(-1,1,-.1);
      fire(-1,1,.1);
      break;
    }
    case 2:
    {
      (blob.vel).rotate(180 + random(-10, 10));
	  (blob.vel).setMag(blob.speed+blob.power);
      fire(0,0,0);
      fire(0,0,-.1);
      fire(0,0,.1);
      fire(-1,1,-.2);
      fire(-1,1,.2);
      break
    }
  }
}

function generateSize()
{
  var size = 16;
  
  sizeChooser = int(random(10));
  
  if(sizeChooser == 9)//giant 1/10
  {
    size = random(64, 128);
  }else if(sizeChooser>6){ //big 2/10
    size = random(32, 64);
  }else if(sizeChooser>3){//medium 3/10
    size = random(16,32);
  }else{                  //small 4/10
    size = random(8,16);
  }
  
  return size;
}

function generateColors()
{
  var p = 1;
  var s = 1;
  var d = 1;
  var colorChooser = int(random(30));
  var luckyColor = 0;
  var psd = [p,s,d];
  
  switch(colorChooser) {
  case 0:
      luckyColor = int(random(100));
      if(luckyColor==100)
      {
        p=4;
      }else if (luckyColor>=90){
        p=3;
      }else{
        p=2;
      }
      break;    
  case 1:
      luckyColor = int(random(100));
      if(luckyColor==100)
      {
        s=4;
      }else if (luckyColor>=90){
        s=3;
      }else{
        s=2;
      }
      break; 
  case 2:
      luckyColor = int(random(100));
      if(luckyColor==100)
      {
        d=4;
      }else if (luckyColor>=90){
        d=3;
      }else{
        d=2;
      }
      break;     
  }
   psd = [p,s,d];
   return psd;
}

function setup() {
  createCanvas(1920,1080);

  socket = io.connect('https://blob-testdemo.herokuapp.com/Ptree/');
  blob = new Blob(1, socket.id, random(-width, width), random(-height, height), SIZE, 2, 1, 1);
    
  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
	p: blob.power,
	s: blob.speed,
	d: blob.defense
  };
  socket.emit('start', data);
  
  socket.on('heartbeat',
	function(data){
		//console.log(data);
		data.map(function(item, index){
			//console.log(item.alive);
			blobs[index] = new Blob(item.alive, item.id, item.x, item.y, item.r, item.power, item.speed, item.defense);
			blobs[index].updateColors();
		});
	});

  socket.on('foodbeat', 
	function(data){
		console.log(data);
		data.map(function(item, index){
			food[index] = new Food(item.x, item.y, item.type, item.r, item.alive);
		});
	});
	
  socket.on('bulletbeat', 
	function(data){
		data.map(function(item, index){
			position = createVector(item.x, item.y);
			bullet[index] = new Projectile(position, item.r, item.active);
		});
	});
	
  socket.on('update', 
	function(data){
		//console.log(data);
		blob.updateStats(data.alive, data.r, data.p, data.s, data.d);
		//console.log(blob.r +", "+blob.power+", "+blob.speed+", "+blob.defense);
	});
  
	
/*
  for(var i = 0; i < 1000; i++)
  {
    var x = random(-width*4, width*4);
    var y = random(-height*4,height*4);
    //var size = generateSize();
   // var psd = generateColors();
    
    //blobs[i] = new Blob(x, y,size,psd[0],psd[1],psd[2]);
  }
  
  for(var i = 0; i < 10; i++)
  {
     bullet[i] = new Projectile(blob.pos, blob.vel, 0, 0, 0);
  }
  
  for(var i = 0; i < 10; i++)
  {
     var x = random(-width*4, width*4);
     var y = random(-height*4,height*4);    
     food[i] = new Food(x,y);
  }*/
}

function draw() {
  background(0);
  
  
  //fill(255);
  //rect(0, 0, 100, 100);
  //console.log(blob.alive);
  if(blob.alive)
  {
	  translate(width / 2, height / 2);
	  var newzoom = SCOPE * SIZE / blob.r;
	  zoom = lerp(zoom, newzoom, 0.1);
	  scale(zoom);
	  translate(-blob.pos.x, -blob.pos.y);

	noStroke();
	var a = 0.0;
	var b = 0.0;
	var c = 0.0;
	for(var x = -cols; x < cols; x++)
	{
		for(var y = -rows; y < rows; y++)
		{	
			a += 0.1;
			b += 0.1;
			c += 0.1;
			
			var r = noise(a)*255;
			var g = noise(a, b)*255;
			var b = noise(a, b, c)*255;
			fill(r,g,b);
			rect(x*scl, y*scl, scl, scl);
		}
	}
	  
	var powerUI = blob.power.toString();
	var speedUI = blob.speed.toString();
	var defenseUI = blob.defense.toString();
	
	textSize(blob.r-2);
	fill(255, 0, 0);
	text("Power "+powerUI, blob.pos.x - blob.r*7.7, blob.pos.y - blob.r*8.5);
	fill(0, 255, 0);
	text("Speed "+speedUI, blob.pos.x - blob.r*7.7, blob.pos.y - blob.r*7.5);
	fill(0, 0, 255);
	text("Defense "+defenseUI, blob.pos.x - blob.r*7.4, blob.pos.y - blob.r*6.5);
	fill(255, 0, 255);  
	
	for (var i = blobs.length - 1; i >= 0; i--) {
		if(blobs[i].alive)
		{
			var id = blobs[i].id;
			if (id !== socket.id) {
			  blobs[i].show();
			  if(id!==0)
			  {
				  fill(0);
				  textAlign(CENTER);
				  textSize(blobs[i].r/4);
				  text(blobs[i].id, blobs[i].pos.x, blobs[i].pos.y + blobs[i].r/6);
			  }
			}
		}
	  }
	  
	  blob.show();
	  blob.update();
	  blob.constrain();
			
	  fill(0);
	  textAlign(CENTER);
	  textSize(blob.r/4);		
	  text(Math.floor(blob.r), blob.pos.x, blob.pos.y + blob.r/6);
	  
	  for(var i = 0; i<food.length; i++)
	  {
		if(food[i].alive)
		{
			food[i].show();
		}
	  }
	  //blob.constrain();
	  
	  for(i = 0; i<bullet.length; i++)
	  {
		if(bullet[i].active)
		{
		 //console.log(bullet[i]);
		 bullet[i].show();
		}
	  }
	  
	  var data = {
		x: blob.pos.x,
		y: blob.pos.y,
	  };
	socket.emit('update', data);
 }
 else{
    textSize(32);
	fill(255, 0, 255);
	text("YOUR DEAD",width/2-100, height/2-50);
 }
}
  /*
  textSize(32);

  var powerUI = blob.power.toString();
  var speedUI = blob.speed.toString();
  var defenseUI = blob.defense.toString();
  
  fill(255, 0, 0);
  text("Power "+powerUI, 10, 30);
  fill(0, 255, 0);
  text("Speed "+speedUI, 10, 60);
  fill(0, 0, 255);
  text("Defense "+defenseUI, 10, 90);
  fill(255, 0, 255);
  
  
  if(blob.dead)
  {
    text("YOUR DEAD",width/2-100, height/2-50);
  }
  else
  {
    translate(width/2, height/2);
    var newzoom = 64/blob.r;
    zoom = lerp(zoom, newzoom, 0.01)
    scale(zoom);
    translate(-blob.pos.x, -blob.pos.y);
    
    for(var i = onlineblobs.length - 1; i>= 0; i--)
    {
		//var id = onlineblobs[i].id;
		if(id.substring(2, id.length) !== socket.id)
		{
			fill(0, 0, 255);
			ellipse(onlineblobs[i].x, onlineblobs[i].y, onlineblobs[i].r*2, onlineblobs[i].r*2);
			
			fill(0);
			textAlign(CENTER);
			textSize(8);
			text(onlineblobs[i].id, onlineblobs[i].x, onlineblobs[i].y);
		}
/*       blobs[i].show();
      blobs[i].moveTo(blob);
      if(blob.eats(blobs[i]))
      {
        blobs.splice(i,1);
      } 
    }
    
    for(var i = 0; i<food.length; i++)
    {
      food[i].show();
      if(blob.eats(food[i]))
      {
        blob.levelUp(food[i].level);
        food.splice(i,1);
      }
    }
    
    blob.show();
    blob.update();
	blob.constrain();
	
	var data = {
		x: blob.pos.x,
		y: blob.pos.y,
		r: blob.r
	};
	socket.emit('update', data);
	
    for(i = 0; i<bulletCount+1; i++)
    {
      if(bullet[i].active)
      {
         bullet[i].show();
         
         for(var j = 0; j<blobs.length; j++)
         {
           if(bullet[i].hits(blobs[j]))
           {
               bulletCount--;
               blobs[j].shrink(bullet[i].r - blobs[j].defense);
               food.splice(i,1);
           }
         }
      }
    }
  } 
}*/