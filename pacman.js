const canvas = document.querySelector("canvas");
let scoreEl = document.getElementById("scoreEl");
const scoreResult = document.querySelector(".scoreResult")
const controls = document.querySelector(".controls");
const c = canvas.getContext("2d");
const moveUp = document.querySelector(".arrowUp");
const moveDown = document.querySelector(".arrowDown");
const moveLeft = document.querySelector(".arrowLeft");
const moveRight = document.querySelector(".arrowRight");
const win = document.querySelector(".win");
const lose = document.querySelector(".lose");
const coverImage = document.querySelector(".coverImage img");
const play = document.querySelector(".play");
const restart = document.querySelector(".restart");
const easy = document.querySelector(".levels .easy")
const hard = document.querySelector(".levels .hard")
const pro = document.querySelector(".levels .pro")
canvas.width = innerWidth ;
canvas.height = innerHeight;
let score = 0;
//buttons for movement 
let buttons = {
  moveUp: {
    pressed: false
  },
  moveDown: {
    pressed: false
  },
  moveLeft: {
    pressed: false
  },
  moveRight: {
    pressed: false
  }
}
//to check the last button that was pressed
let lastKey = "";
//the blueprint of our game  map
const planBlueprint = `
1_________2
|         |
| # [-] # |
|    ~    |
| []   [] |
|    ^    |
| # [+] # |
|    ~    |
| []   [] |
|    ^    |
| # [=] # |
|        .|
4_________3
`
//blue print converted to an array 
const plan = planBlueprint.trim().split("\n").map(row => {
  return [...row].map(ch => ch)
});
//boundaries
class Boundary{
  static width = 35;
  static height = 35;
  constructor({position, image}) {
    this.width = 35;
    this.height = 35;
    this.position = position;
    this.image = image;
  }
  //draws out the boundaries on the screen 
  draw () {
    c.drawImage(this.image, this.position.x, this.position.y )
  }
}
//The player
class Player{
  constructor({position, velocity}) {
    this.radius = 13.5;
    this.position = position;
    this.velocity = velocity;
    this.radian = 0.75;
    this.openRate = 0.12
    this.rotation = 0;
  }
  //draws out our player and adds the moving mouth
  draw() {
    c.save();
    c.translate(this.position.x, this.position.y);
    c.rotate(this.rotation);
    c.translate(-this.position.x, - this.position.y);
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, this.radian,Math.PI * 2 - this.radian);
    c.lineTo(this.position.x, this.position.y)
    c.fillStyle = "yellow";
    c.fill();
    c.restore();
  }
  //changes the position of the player
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y ;
    if (this.radian < 0 || this.radian > .75) {
    		this.openRate = -this.openRate;
    }
    this.radian += this.openRate; 
  }
}
//The enemies
class Ghost{
		static speed = 2.5
  constructor({position, velocity,color}) {
    this.radius = 12;
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.prevCollisions = [];
    this.speed = 2.5;
    this.direction = "";
    this.scared = false;
    this.angry = null;
  }
  //draws the ghost on the screen 
  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0,Math.PI * 2);
    c.fillStyle = this.scared ? "blue" : this.color ;
    c.fill();
  }
  //changes the position of the ghosts
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y ;
  }
}
//food for the player
class Pallets{
		constructor({position}) {
				this.position = position;
				this.radius = 3;
		}
		draw() {
				c.beginPath();
				c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
				c.fillStyle = "white";
				c.fill();
		}
}
//food that gives the players advantage over the enemy 
class PowerUp{
		constructor({position}) {
				this.position = position;
				this.radius = 8;
		}
		draw() {
				c.beginPath();
				c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
				c.fillStyle = "white";
				c.fill();
		}
}
//stores the boundaries 
let boundaries = [];
//stores the plallets
let pallets = [];
//stores the ghosts
let ghosts = [
		new Ghost({
				position:{
						x:Boundary.width * 6 + Boundary.width / 2, 
						y:Boundary.height + Boundary.height / 2
				},
				velocity:{
						x:Ghost.speed,
						y:0
				}, 
				color:"red"
		}), 
		new Ghost({
				position:{
						x:Boundary.width * 9+ Boundary.width / 2, 
						y:Boundary.height * 7 + Boundary.height / 2
				},
				velocity:{
						x:0,
						y:Ghost.speed
				}, 
				color:"pink"
		})
];
//saves power ups
let powerUps = [];
//creates image for boundaries 
function displayImage(src) {
		let img = new Image();
		img.src = src;
		return img;
}
//draws out the game  map on the screen 
plan.map((elt, i)=> {
  return elt.map((ch, j) => {
    switch (ch) {
      case '_':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/pipeHorizontal.png")
        }))
        break ;
      case '|':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/pipeVertical.png")
        }))
        break ;
      case '1':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/pipeCorner1.png")
        }))
        break ;
      case '2':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/pipeCorner2.png")
        }))
        break ;
      case '3':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/pipeCorner3.png")
        }))
        break ;
      case '4':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/pipeCorner4.png")
        }))
        break ;
      case '#':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/block.png")
        }))
        break ;
      case '[':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/capLeft.png")
        }))
        break ;
      case ']':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/capRight.png")
        }))
        break ;
      case '~':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/capBottom.png")
        }))
        break ;
      case '-':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/pipeConnectorBottom.png")
        }))
        break ;
      case '^':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/capTop.png")
        }))
        break ;
      case '+':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/pipeCross.png")
        }))
        break ;
      case '=':
        boundaries.push(new Boundary({
          position: {
            x: j * Boundary.width, 
            y: i * Boundary.height
          }, 
          image:displayImage("./Images/pipeConnectorTop.png")
        }))
        break ;
        case ' ':
        pallets.push(new Pallets({
          position: {
            x: j * Boundary.width + Boundary.width / 2 , 
            y: i * Boundary.height + Boundary.height /2
          }
        }))
        break ;
        case '.':
        powerUps.push(new PowerUp({
          position: {
            x: j * Boundary.width + Boundary.width / 2 , 
            y: i * Boundary.height + Boundary.height / 2
          }
        }))
        break ;
    }
  }) 
})
//draws the boundaries 
boundaries.map(boundary => {
  return boundary.draw();
})
//creates the player 
let player = new Player({
  position:{
    x:Boundary.width + Boundary.width / 2, 
    y:Boundary.height + Boundary.height / 2
  }, 
  velocity:{
    x:0,
    y:0
  }
})
//checks if the ghost or player is colliding with a boundary
function collisionDetector({rectangle, circle}) {
		let paddingX = Boundary.width / 2 - circle.radius - 2;
		let paddingY = Boundary.height / 2 - circle.radius - 2;
  return circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + 3 &&
  circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - 3 &&
  circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + 3 && 
  circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - 3
}
//checks if the player is colliding with pallets, ghost or powerups
function circleToCircleCollision({
		circle1, circle2
}) {
		return circle1.position.x + circle1.radius >= circle2 .position.x - circle2.radius && circle1.position.x - circle1.radius <= circle2.position.x + circle2.radius && circle1.position.y - circle1.radius <= circle2.position.y + circle2.radius && circle1.position.y + circle1.radius >= circle2.position.y - circle2.radius
}
//changes the display property of an element 
function display(elt, attr) {
		elt.style.display = attr;
}
//keeps count of how many times  the animation have run 
let animationId;
//requests for animation frame
function animate () {
//clear the canvas for Each iteration of the animation 
  c.clearRect(0,0,innerWidth, innerHeight)
  animationId = requestAnimationFrame(animate)
  //checks if the bondaries is colliding with the top part of the player
  if (buttons.moveUp.pressed && lastKey === "up") {
  for (boundary of boundaries) {
    if (collisionDetector({
      rectangle:boundary, 
      circle:{...player, velocity:{
        x:0,
        y:-5
      }}
    })) {
      player.velocity.y = 0;
      break;
    } else{
      player.velocity.y = -5;
    }
  }
}
//checks if the bondaries is colliding with the bottom part of the player
else if (buttons.moveDown.pressed && lastKey === "down") {
  for (boundary of boundaries) {
    if (collisionDetector({
      rectangle:boundary, 
      circle:{...player, velocity:{
        x:0,
        y:5
      }}
    })) {
      player.velocity.y = 0;
      break;
    } else{
      player.velocity.y = 5;
    }
  }
}
//checks if the bondaries is colliding with the right part of the player
else if (buttons.moveRight.pressed && lastKey === "right") {
  for (boundary of boundaries) {
    if (collisionDetector({
      rectangle:boundary, 
      circle:{...player, velocity:{
        x:5,
        y:0
      }}
    })) {
      player.velocity.x = 0;
      break;
    } else{
      player.velocity.x = 5;
    }
  }
}
//checks if the bondaries is colliding with the left part of the player
else if (buttons.moveLeft.pressed && lastKey === "left") {
  for (boundary of boundaries) {
    if (collisionDetector({
      rectangle:boundary, 
      circle:{...player, velocity:{
        x:-5,
        y:0
      }}
    })) {
      player.velocity.x = 0;      
      break;
    } else{
      player.velocity.x = -5;
    }
  }
} else {
  //intiates velocity in the x and y axis to zero 
  player.velocity.x = 0;
  player.velocity.y = 0; 
}
//eliminates the velocity of the player when it collides with a boundary 
  boundaries.map(boundary => {
   boundary.draw();
   if (collisionDetector({
     rectangle:boundary, 
     circle:player
   })) {
     player.velocity.y = 0;
     player.velocity.x = 0;
   }
})
//removes pallets from storage when collected by player and increments the score
for (let i = pallets.length - 1; 0 < i; i--) {
		let pallet = pallets[i];
		pallet.draw();
		if (circleToCircleCollision({
		  circle1:player, 
		  circle2:pallet
		})) {
			 pallets.splice(i,1);
			 score += 10;
			 scoreEl.innerHTML = score;
		}
}
//removes ghost in scared mode from storage when collected by player
for (let i = ghosts.length - 1; 0 <= i; i--) {
		let ghost = ghosts[i];
		if (ghost.scared) {
				if (circleToCircleCollision({
		 		 circle1:player, 
		  		circle2:ghost
				})) {
						ghosts.splice(i,1)
				}
		}
}
//make ghost AI movements 
ghosts.map(ghost => {
		//stores the ghost collisions
		let collisions = [];
		boundaries.map(boundary =>  {
		//checks if the top  part of the ghost is colliding with a boundary
			if (collisionDetector({
      rectangle:boundary, 
      circle:{...ghost, velocity:{
        x:0,
        y:-ghost.speed
      }}
    }) && !collisions.includes('up')) {
    		collisions.push('up');
    }
    //checks if the buttom part of the ghost is colliding with a boundary
    else	if (collisionDetector({
      rectangle:boundary, 
      circle:{...ghost, velocity:{
        x:0,
        y:ghost.speed
      }}
    }) && !collisions.includes('down')) {
    		collisions.push('down');
    } 
    //checks if the left part of the ghost is colliding with a boundary
    else  if (collisionDetector({
      rectangle:boundary, 
      circle:{...ghost, velocity:{
        x:-ghost.speed,
        y:0
      }}
    }) && !collisions.includes('left')) {
    		collisions.push('left');
    } 
    //checks if the right  part of the ghost is colliding with a boundary
    else if (collisionDetector({
      rectangle:boundary, 
      circle:{...ghost, velocity:{
        x:ghost.speed,
        y:0
      }}
    }) && !collisions.includes('right')) {
    		collisions.push('right');
    } 
		})
		//sets the previous collision of each ghost to the collision that just passed 
	if (collisions.length > ghost.prevCollisions.length) {
		ghost.prevCollisions = collisions;
}
//compares the previous Collisons with the current one
		if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
		//predicts the movement of the ghost 
				if (ghost.velocity.x > 0 && !ghost.prevCollisions.includes("right")) {
								ghost.prevCollisions.push("right");
				}   
				else if (ghost.velocity.x < 0 && !ghost.prevCollisions.includes("left") ) {
								ghost.prevCollisions.push("left");
				}    
				else if (ghost.velocity.y > 0 && !ghost.prevCollisions.includes("down")) {
								ghost.prevCollisions.push("down");
				}   
				else if (ghost.velocity.y < 0 && !ghost.prevCollisions.includes("up")) {
								ghost.prevCollisions.push("up");
				}   
				//checks the pathways available for the ghosts
				let pathways = ghost.prevCollisions.filter(pathway => {
						return !collisions.includes(pathway)
				})
				//randomize the direction of the ghost 
			 ghost.direction = pathways[Math.floor(Math.random() * pathways.length)];
			 //decides the movement of the ghost depending on the direction 
				switch (ghost.direction) {
						case 'right':
								ghost.velocity.x = ghost.speed;
								ghost.velocity.y = 0;
								break;
						case 'left':
								ghost.velocity.x = -ghost.speed;
								ghost.velocity.y = 0;
								break; 
						case 'down':
								ghost.velocity.x = 0;
								ghost.velocity.y = ghost.speed;
								break;
						case 'up':
								ghost.velocity.x = 0;
								ghost.velocity.y = -ghost.speed;
								break;
				}		
				ghost.prevCollisions = []; 
		}
		// win condition 
		if (score === 700 || pallets.length === 0) {
	          cancelAnimationFrame(animationId);
 		  win.style.display = "block"; 
 	          restart.style.display = "block"
 		  canvas.style.opacity = 0.1;
 		  controls.style.opacity = 0.1;
		}  
		//decides what happens  when player collides with powerups and makes the ghost go into  scared mood for 5 seconds 
		for (let i = powerUps.length - 1; 0 <= i; i--) {
		let powerUp = powerUps[i];
		powerUp.draw();
		if (circleToCircleCollision({
		  circle1:player, 
		  circle2:powerUp
		})) {
			 powerUps.splice(i,1);
			 ghosts.map(ghost => {
			 		ghost.scared = true;
			 		setTimeout(() => {
			 		ghost.scared = false;
			 		}, 5000) 
			 })
		}
}
//sets a loose condition when player collides with ghost 
		if (circleToCircleCollision({
		  circle1:player, 
		  circle2:ghost
		}) && !ghost.scared) {
  	cancelAnimationFrame(animationId);
  lose.style.display = "block";
  restart.style.display = "block"
  canvas.style.opacity = 0.1;
  controls.style.opacity = 0.1;
  scoreResult.innerHTML = score;
  }
		ghost.update(); 
})
// predicts the rotation of the player mouth depending on the the direction of the  player
  player.update();
  if (player.velocity.x > 0) {
  		player.rotation = 0
  } 
  else if (player.velocity.x < 0) {
  		player.rotation = Math.PI;
  }  
  else if (player.velocity.y > 0) {
  		player.rotation = Math.PI * 0.5;
  } 
  else  if (player.velocity.y < 0) {
  		player.rotation = Math.PI * 1.5;
  }
}//end of animation function 
//starts the animation 
function startGame() {
		display(coverImage, "none");
		display(play, "none");
		display(canvas, "block");
		display(controls, "block");
		display(easy, "none");
		display(hard, "none");
		display(pro, "none");
		animate();//calls animation functions 
}
//starts the game
play.addEventListener("click", (e) => {
		display(play, "none");
		display(easy, "block")
		display(hard, "block");
		display(pro, "block");
})
easy.addEventListener("click", () => {
		scoreEl.style.color = "gold";
		startGame();
})
hard.addEventListener("click", () => {
		startGame();
		scoreEl.style.color = "rgb(45,130,232)";
		ghosts.push(new Ghost({
				position:{
						x:Boundary.width * 3+ Boundary.width / 2, 
						y:Boundary.height * 9 + Boundary.height / 2
				},
				velocity:{
						x:0,
						y:Ghost.speed
				}, 
				color:"lightblue"
		}))		
})
pro.addEventListener("click", () => {
		startGame();
		scoreEl.style.color = "purple";
		ghosts.push(new Ghost({
				position:{
						x:Boundary.width * 3+ Boundary.width / 2, 
						y:Boundary.height * 9 + Boundary.height / 2
				},
				velocity:{
						x:0,
						y:Ghost.speed
				}, 
				color:"red"
				
		}))
		ghosts.push(new Ghost({
				position:{
						x:Boundary.width * 4 + Boundary.width / 2, 
						y:Boundary.height * 4  + Boundary.height / 2
				},
				velocity:{
						x:0,
						y:Ghost.speed
				}, 
				color:"lightblue"
		})) 
})
//adds  event listeners to the buttons 👇👇
addEventListener("touchstart", (e) => {
  switch (e.target) {
    case moveUp:
      buttons.moveUp.pressed = true;
      lastKey = "up";      
      break;
    case moveRight:
      buttons.moveRight.pressed = true;
      lastKey = "right";
      break;
    case moveLeft:
      buttons.moveLeft.pressed = true;
      lastKey = "left";           
      break;
    case moveDown:
      buttons.moveDown.pressed = true;
      lastKey = "down";
      break;
  }
})
addEventListener("touchend", (e) => {
  switch (e.target) {
    case moveUp:
      buttons.moveUp.pressed = false;
      break;
    case moveRight:
      buttons.moveRight.pressed = false;
      break;
    case moveLeft:
      buttons.moveLeft.pressed = false;
      break;
    case moveDown:
      buttons.moveDown.pressed = false;
      break;
  }
})
