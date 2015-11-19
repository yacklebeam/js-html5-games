//Canvas Asteroids
//Jacob Troxel
//Still very much a work in progress.

(function () {
	window.requestAnimFrame = (function() {
        return  window.requestAnimationFrame        ||
        window.webkitRequestAnimationFrame          ||
        window.mozRequestAnimationFrame             ||
        window.oRequestAnimationFrame               ||
        window.msRequestAnimationFrame              ||
        function(callback) {
            window.setTimeout(callback, 1000 / 30);
        };
    })();

    var ctx = null;

	var Game = {
		canvas: document.getElementById('asteroids'),

		setup: function() {
			if(this.canvas.getContext) {
				ctx = this.canvas.getContext('2d');

				this.width = this.canvas.width;
				this.height = this.canvas.height;

				Screen.welcome();
				this.canvas.addEventListener('click', this.runGame, false);
				Ctrl.init();
			}
		},

		init: function() {
			this.gameOver = false;
			Background.init();
			Hud.init();
			Asteroids.init();
			Bullets.init();
			Ship.init();
		},

		animate: function() {
			Game.play = requestAnimFrame(Game.animate);
			Game.draw();
		},

		draw: function() {
			if(!Game.gameOver) {
				ctx.clearRect(0, 0, this.width, this.height);

				Background.draw();
				Hud.draw();
				Asteroids.draw();
				Ship.draw();
				Bullets.draw();
			}
		},

		restartGame: function() {
            Game.canvas.removeEventListener('click', Game.restartGame, false);
            Game.init();
        },

		runGame: function() {
			Game.canvas.removeEventListener('click', Game.runGame, false);
			Game.init();
			Game.animate();
		}

	};

	var Screen = {
		welcome: function() {
			this.text = 'ASTEROIDS';
			this.textSub = 'Click to Start';
			this.textColor = 'white';

			this.create();
		},

		gamewin: function() {
            this.text = 'YOU WIN (Score: ' + Hud.score + ')';
            this.textSub = 'Click To Play Again';
            this.textColor = 'green';

            this.create();
        },

        gamelose: function() {
            this.text = 'YOU LOSE';
            this.textSub = 'Click To Play Again';
            this.textColor = 'red';

            this.create();
        },

		create: function() {
            ctx.fillStyle = '#091122';
            ctx.fillRect(0, 0, Game.width, Game.height);

            ctx.fillStyle = this.textColor;
            ctx.textAlign = 'center';
            ctx.font = '40px helvetica, arial';
            ctx.fillText(this.text, Game.width / 2, Game.height / 2);

            ctx.fillStyle = '#999999';
            ctx.font = '20px helvetica, arial';
            ctx.fillText(this.textSub, Game.width / 2, Game.height / 2 + 30);
        }
	};

	var Background = {
		init: function() {
            this.ready = false;

            this.img = new Image();
            this.img.src = 'background.jpg';
            this.img.onload = function() {
                Background.ready = true;
            };
        },

        draw: function() {
            if (this.ready) {
                ctx.drawImage(this.img, 0, 0);
            }
        }
	};

	var Ship = {
		w: 20,
        h: 20,
        r: 0,
        point1 : {x: 15, y: 0},
        point2 : {x: -10, y: 10},
        point3 : {x: -10, y: -10},
        point4 : {x: -10, y: 0},
        
        init: function() {
            this.x = 390;
            this.y = 290;
            this.speed = 4;
            this.moving = false;
            this.xs = 0;
            this.ys = 0;
        },

        rotate: function (angle) {
        	var theCos = Math.cos(angle * Math.PI / 180);
        	var theSin = Math.sin(angle * Math.PI / 180);

        	this.point1 = {
        			x: (15 * theCos) - (0  * theSin),
        			y: (0  * theCos) + (15 * theSin)
        		};
        	this.point2 = {
        			x: (-10 * theCos) - (10  * theSin),
        			y: (10  * theCos) + (-10 * theSin)
        		};
        	this.point3 = {
        			x: (-10 * theCos) - (-10 * theSin),
        			y: (-10 * theCos) + (-10 * theSin)
        		};
        	this.point4 = {
        			x: (-10 * theCos) - (0 * theSin),
        			y: (0 * theCos) + (-10 * theSin)
        		};
        },

        draw: function() {
        	if(Game.gameOver) return;
            this.move();
            if(Math.abs(this.xs) < 0.01) this.xs = 0;
            if(Math.abs(this.ys) < 0.01) this.ys = 0;
            if(Math.abs(this.xs) > 10) this.xs = 10 * this.xs / Math.abs(this.xs);
            if(Math.abs(this.ys) > 10) this.ys = 10 * this.ys / Math.abs(this.ys);

            this.rotate(this.r);

            ctx.beginPath();
            ctx.moveTo(this.x + this.point1.x, this.y + this.point1.y);
            ctx.lineTo(this.x + this.point2.x, this.y + this.point2.y);
            ctx.lineTo(this.x + this.point3.x, this.y + this.point3.y);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
        	ctx.arc(this.x + this.point4.x,this.y + this.point4.y, 3, 0, 2 * Math.PI);
        	ctx.closePath();
        	ctx.fillStyle = 'orange';
        	ctx.fill();
        },

        move: function() {
            if (Ctrl.left) {
                this.r += this.speed;
            } else if (Ctrl.right) {
                this.r += -this.speed;
            }

            if(Ctrl.forward) {
            	this.xs += 0.1 * Math.cos(this.r * Math.PI / 180);
            	this.ys += 0.1 * Math.sin(this.r * Math.PI / 180);
              	this.moving = true;
            }

            if(this.moving) {
            	this.x += this.xs;
            	this.y += this.ys;
            }

            if(this.x < 0) this.x = Game.width;
            if(this.x > Game.width) this.x = 0;
            if(this.y < 0) this.y = Game.height;
            if(this.y > Game.height) this.y = 0;

            if(Ctrl.fire) {
            	Bullets.addBullet();
            	Ctrl.fire = false;
            	Ctrl.fireReset = true;
            }
        }

	};

	var Bullets = {
		count : 100,
		current : 0,

		init : function() {
			this.ents = [this.count];
		},

		draw : function() {
			if(Game.gameOver) return;
			var i;
			for(i = 0; i < this.count; i++) {
				var B = this.ents[i];

				if(B) {

					B.x += B.xs;
					B.y += B.ys;

					if(B.x < -0) {
						B.x = Game.width + 0;
						B.life--;
					}
            		if(B.x > Game.width + 0) {
            			B.x = -0;
						B.life--;
            		}
            		if(B.y < -0) {
           				B.y = Game.height + 0;
						B.life--;
           			}
            		if(B.y > Game.height + 0) {
            			B.y = -0;
						B.life--;
            		}

					this.collide(i);
				
					ctx.beginPath();
	            	ctx.arc(B.x, B.y, B.r, 0, 2 * Math.PI);
	            	ctx.closePath();

	            	ctx.fillStyle = '#eee';
	            	ctx.fill();

	            	if(B.life == 0) {
						this.ents[i] = null;
						this.current--;
					}
					if(Asteroids.current == 0) {
		   				Game.gameOver = true;
						Screen.gamewin();
		            	Game.canvas.addEventListener('click', Game.restartGame, false);
					}
				}
			}
		},

		collide : function(index) {
			var B = this.ents[index];
			var i;
			for(i = 0; i < 30; i++) {
				var A = Asteroids.ents[i];
				if(	A &&
					Math.sqrt(	(B.x - A.x) * (B.x - A.x) +
								(B.y - A.y) * (B.y - A.y)) < A.r + 3) { //hitting asteroid
					this.ents[index] = null;
					this.current--;
                    Asteroids.explode(i);
					Asteroids.ents[i] = null;
					Asteroids.current--;
					Hud.score++;
					break;
				}
			}
		},

		addBullet : function() {
			if(this.current === this.count) return;
			else {
				var open;
				var i;
				for(i = 0; i < this.count; i++)
				{
					if(this.ents[i] == null)
					{
						open = i;
						break;
					};
				}
				this.ents[open] = {
					x : Ship.x,
					y : Ship.y,
					r : 3,
					life : 3,
					xs : 10 * Math.cos(Ship.r * Math.PI / 180),
            		ys : 10 * Math.sin(Ship.r * Math.PI / 180),
				};
				this.current++;
			}
		}

	};

	var Asteroids = {
		count : 10,

		getRandomInt : function(min, max) {
			return Math.floor(Math.random() * (max - min)) + min;
		},

		init : function() {
			this.current = this.count;
			this.ents = [30];
			var i;
			for(i = 0; i < this.count; i++) {
				var X = this.getRandomInt(20, 780);
				var Y = this.getRandomInt(20, 580);

				var Xs = this.getRandomInt(-2,2);
				var Ys = this.getRandomInt(-2,2);

				this.addAsteroid(i, X, Y, Xs, Ys, 2);
			}
		},

		draw : function() {
        	if(Game.gameOver) return;
			var i;
			for(i = 0; i < 30; i++) {
				var A = this.ents[i];

				if(A) {

					A.x += A.xs;
					A.y += A.ys;
				
					ctx.beginPath();
	            	ctx.arc(A.x, A.y, A.r, 0, 2 * Math.PI);
	            	ctx.closePath();

	            	ctx.fillStyle = '#eee';
	            	ctx.fill();

	            	if(A.x < -20) A.x = Game.width + 20;
            		else if(A.x > Game.width + 20) A.x = -20;
            		
            		if(A.y < -20) A.y = Game.height + 20;
            		else if(A.y > Game.height + 20) A.y = -20;

            		if(Math.sqrt((Ship.x - A.x) * (Ship.x - A.x) +
								( Ship.y - A.y) * (Ship.y - A.y)) < 20) { //collide with ship
            			Hud.lv--;
            			this.ents[i] = null; //destroy so it doesnt hit a bunch of time again
            			Asteroids.current--;
            			if(Hud.lv == 0) {
            				//this.ents = [];
            				Game.gameOver = true;
							Screen.gamelose();
            				Game.canvas.addEventListener('click', Game.restartGame, false);
            				return;
						}
            		}
				}
			}
		},

		explode : function(index) {
            var newIndex = index * 2 + 10;

            var Parent = this.ents[index];

            if(Parent.life > 1) {
                var Xs = this.getRandomInt(-2,2);
                var Ys = this.getRandomInt(-2,2);
                this.addAsteroid(newIndex, Parent.x, Parent.y, Xs, Ys, Parent.life - 1);

                var Xs2 = this.getRandomInt(-2,2);
                var Ys2 = this.getRandomInt(-2,2);
                this.addAsteroid(newIndex + 1, Parent.x, Parent.y, Xs2, Ys2, Parent.life - 1);

                this.current+=2;
            }
    	},

		addAsteroid : function(i, xIn, yIn, xsIn, ysIn, lifeIn) {
			var open = i;
			
			this.ents[open] = {
				x : xIn,
				y : yIn,
				r : lifeIn * 10,
				xs : xsIn,
        		ys : ysIn,
                life: lifeIn
			};
		}
	};

	var Hud = {
		init: function() {
            this.lv = 5;
            this.score = 0;
        },

        draw: function() {
        	if(Game.gameOver) return;
            ctx.font = '12px helvetica, arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.fillText('Score: ' + this.score, 5, Game.height - 5);
            ctx.textAlign = 'right';
            ctx.fillText('Lives: ' + this.lv, Game.width - 5, Game.height - 5);
        }
	};

	var Ctrl = {
		fireReset : false,
        init: function() {
            window.addEventListener('keydown', this.keyDown, true);
            window.addEventListener('keyup', this.keyUp, true);
        },

        keyDown: function(event) {
            switch(event.keyCode) {
                case 39: // Left
                    Ctrl.left = true;
                    break;
                case 37: // Right
                    Ctrl.right = true;
                    break;
                case 38: //W
                	Ctrl.forward = true;
                	break;
                case 87: //Space
                	if(Ctrl.fireReset == false) Ctrl.fire = true;
                	break;
                default:
                    break;
            }
        },

        keyUp: function(event) {
            switch(event.keyCode) {
                case 39: // Left
                    Ctrl.left = false;
                    break;
                case 37: // Right
                    Ctrl.right = false;
                    break;
                case 38: //W
                	Ctrl.forward = false;
                	break;
                case 87: //Space
                	Ctrl.fireReset = false;
                	break;
                default:
                    break;
            }
        }
	};

	window.onload = function() {
		Game.setup();
	}
}());