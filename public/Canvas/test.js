var socket;

function setup() {
  createCanvas(200, 200);
  background(51);
  
  socket = io.connect('http://localhost:8365');
  socket.on('mouse', newDrawing);
}

function mouseDragged(){
	console.log(mouseX + ','+ mouseY);
	
	var data = {
		x: mouseX,
		y: mouseY
	}
	
	socket.emit('mouse', data);
	
	noStroke();
	fill(255);
	ellipse(mouseX, mouseY, 36, 36);
}

function newDrawing(data){
	noStroke();
	fill(255, 0, 100);
	ellipse(data.x, data.y, 36, 36);
}

function draw() {

}