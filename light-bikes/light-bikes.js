//Canvas Light-Bikes
//Jacob Troxel
//WIP

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
        canvas : document.getElementById('light-bikes'),

        setup : function() {
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
            Player.init();
            Enemy.init();
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
                Enemy.draw();
                Player.draw();
            }
        },

        restartGame: function() {
            Game.canvas.removeEventListener('click', Game.restartGame, false);
            Hud.level = 2;
            Game.init();
        },

        nextLevel: function() {
            Game.canvas.removeEventListener('click', Game.nextLevel, false);
            Hud.level++;
            Game.init();
        },

        runGame : function() {
            Game.canvas.removeEventListener('click', Game.runGame, false);
            Game.init();
            Game.animate();
        }
    };

    var Screen = {
        welcome : function() {
            this.text = 'LIGHT BIKES';
            this.textSub = 'Click to Start';
            this.textColor = 'white';

            this.create();
        },

        nextlevel : function() {
            this.text = 'YOU WIN';
            this.textSub = 'Click to Play Next Level';
            this.textColor = 'white';
            this.create();
        },

        gamewin : function() {
            this.text = 'YOU WIN';
            this.textSub = 'Click to Play Again';
            this.textColor = 'green';

            this.create();
        },

        gamelose : function() {
            this.text = 'YOU LOSE';
            this.textSub = 'Click to Play Again';
            this.textColor = 'red';

            this.create();
        },

        create : function() {
            ctx.fillStyle = '#000';
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

    var Player = {
        init: function() {
            this.path = [];
            this.speed = Hud.level;
            this.r = 2;
            this.x = Game.width / 2;
            this.y = Game.height;
            this.xs = 0;
            this.ys = -1;
            this.path.push({x: this.x, y: this.y});
        },

        draw: function() {
            this.move();

            var i;
            for(i = 0; i < this.path.length; i++) {
                var startX =    this.path[i].x;
                var startY =    this.path[i].y;

                if(i == this.path.length - 1) {
                    var endX =      this.x;
                    var endY =      this.y;
                } else {
                    var endX =      this.path[i+1].x;
                    var endY =      this.path[i+1].y;
                }

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.closePath();
                ctx.strokeStyle= '#18CAE6';
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            ctx.closePath();

            ctx.fillStyle = '#18CAE6';
            ctx.fill();

            this.collide();
        },

        move: function() {
            if(Ctrl.up && this.ys == 0) {
                this.xs = 0;
                this.ys = -1;
                Ctrl.up = false;
                Ctrl.left = false;
                Ctrl.down = false;
                Ctrl.right = false;
            }
            
            else if(Ctrl.left && this.xs == 0) {
                this.xs = -1;
                this.ys = 0;
                Ctrl.up = false;
                Ctrl.left = false;
                Ctrl.down = false;
                Ctrl.right = false;               
            }
            
            else if(Ctrl.down && this.ys == 0) {
                this.xs = 0;
                this.ys = 1;
                Ctrl.up = false;
                Ctrl.left = false;
                Ctrl.down = false;
                Ctrl.right = false;                
                //this.path.push({x: this.x, y: this.y});               
            }
            
            else if(Ctrl.right && this.xs == 0) {
                this.xs = 1;
                this.ys = 0;
                Ctrl.up = false;
                Ctrl.left = false;
                Ctrl.down = false;
                Ctrl.right = false;                
            }

            this.x += this.xs * this.speed;
            this.y += this.ys * this.speed;

            this.path.push({x: this.x, y: this.y});

            if(this.path.length > 600) this.path.shift();
        },

        collide : function() {
            if(Player.x == Enemy.x && Player.y == Enemy.y) {
                Game.gameOver = true;
                Screen.gamelose();
                Game.canvas.addEventListener('click', Game.restartGame, false);
                return;
            }

            if(Player.x > Game.width || Player.x < 0 || Player.y > Game.height || Player.y < 0) {
                Game.gameOver = true;
                Screen.gamelose();
                Game.canvas.addEventListener('click', Game.restartGame, false);
                return;
            }

            if(Enemy.x > Game.width || Enemy.x < 0 || Enemy.y > Game.height || Enemy.y < 0) {
                Game.gameOver = true;
                if(Hud.level == 6) {
                    Screen.gamewin();
                    Game.canvas.addEventListener('click', Game.restartGame, false);
                    return;
                } else {
                    Screen.nextlevel();
                    Game.canvas.addEventListener('click', Game.nextLevel, false);
                    return;
                }
            }

            var i;
            for(i = 0; i < Player.path.length - 1; i++) {
                if(Player.x == Player.path[i].x && Player.y == Player.path[i].y) {
                    Game.gameOver = true;
                    Screen.gamelose();
                    Game.canvas.addEventListener('click', Game.restartGame, false);
                    return;
                }
                if(Player.x == Enemy.path[i].x && Player.y == Enemy.path[i].y) {
                    Game.gameOver = true;
                    Screen.gamelose();
                    Game.canvas.addEventListener('click', Game.restartGame, false);
                    return;
                }
                if(Enemy.x == Enemy.path[i].x && Enemy.y == Enemy.path[i].y) {
                    Game.gameOver = true;
                    if(Hud.level == 6) {
                        Screen.gamewin();
                        Game.canvas.addEventListener('click', Game.restartGame, false);
                        return;
                    } else {
                        Screen.nextlevel();
                        Game.canvas.addEventListener('click', Game.nextLevel, false);
                        return;
                    }
                }
                if(Enemy.x == Player.path[i].x && Enemy.y == Player.path[i].y) {
                    Game.gameOver = true;
                    if(Hud.level == 6) {
                        Screen.gamewin();
                        Game.canvas.addEventListener('click', Game.restartGame, false);
                        return;
                    } else {
                        Screen.nextlevel();
                        Game.canvas.addEventListener('click', Game.nextLevel, false);
                        return;
                    }
                }
            }
        },
    };

    var Enemy = {

        init: function() {
            this.path = [];
            this.speed = Hud.level;
            this.r = 2;
            this.x = Game.width / 2;
            this.y = 0;
            this.xs = 0;
            this.ys = 1;
            this.path.push({x: this.x, y: this.y});
            this.robot = true;
            this.choice = 0;
        },

        draw: function() {
            this.move();

            var i;
            for(i = 0; i < this.path.length; i++) {
                var startX =    this.path[i].x;
                var startY =    this.path[i].y;

                if(i == this.path.length - 1) {
                    var endX =      this.x;
                    var endY =      this.y;
                } else {
                    var endX =      this.path[i+1].x;
                    var endY =      this.path[i+1].y;
                }

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle= '#F66A35';
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            ctx.closePath();

            ctx.fillStyle = '#F66A35';
            ctx.fill();
        },

        inPath : function(X, Y) {
            for(var i = 0; i < Player.path.length; i++) {
                if(X == Player.path[i].x && Y == Player.path[i].y) {
                    return true;
                }
                if(X == Enemy.path[i].x && Y == Enemy.path[i].y) {
                    return true;
                }
            }

            return false;
        },

        move: function() {
            if(this.robot) {
                var UP, DOWN, LEFT, RIGHT;
                UP = DOWN = LEFT = RIGHT = true;
                //Ctrl.eup = Ctrl.edown = Ctrl.eleft = Ctrl.eright = false;

                if(this.xs < 0) RIGHT = false;
                if(this.xs > 0) LEFT = false;
                if(this.ys > 0) UP = false;
                if(this.ys < 0) DOWN = false;

                //var Xdir = -(Enemy.x - Player.x);
                //var Ydir = -(Enemy.y - Player.y);

                //Avoid edges of track
                if(this.x <= this.speed) LEFT = false;
                if(this.y <= this.speed) UP = false;
                if(this.x >= (Game.width - this.speed)) RIGHT = false;
                if(this.y >= (Game.height - this.speed)) DOWN = false;

                //Avoid player track
                for(var i = 0; i < this.speed + 1; i++) {
                    var xT = this.x;
                    var yT = this.y + i + 1;

                    var point = {x: xT, y: yT};
                    if(this.inPath(xT, yT)) {
                        DOWN = false;
                        break;
                    }
                }
                for(var i = 0; i < this.speed + 1; i++) {
                    var xT = this.x;
                    var yT = this.y - (i + 1);

                    var point = {x: xT, y: yT};
                    if(this.inPath(xT, yT)) {
                        UP = false;
                        break;
                    }
                }
                for(var i = 0; i < this.speed + 1; i++) {
                    var yT = this.y;
                    var xT = this.x + i + 1;

                    var point = {x: xT, y: yT};
                    if(this.inPath(xT, yT)) {
                        RIGHT = false;
                        break;
                    }
                }
                for(var i = 0; i < this.speed + 1; i++) {
                    var yT = this.y;
                    var xT = this.x - (i + 1);

                    var point = {x: xT, y: yT};
                    if(this.inPath(xT, yT)) {
                        LEFT = false;
                        break;
                    }
                }
                
                if(DOWN) Ctrl.edown = true;
                else if(LEFT) Ctrl.eleft = true;
                else if(RIGHT) Ctrl.eright = true;
                else if(UP) Ctrl.eup = true;
            }

            if(Ctrl.eup && this.ys == 0) {
                this.xs = 0;
                this.ys = -1;
                Ctrl.eup = false;
                Ctrl.eleft = false;
                Ctrl.edown = false;
                Ctrl.eright = false;                
            }
            
            else if(Ctrl.eleft && this.xs == 0) {
                this.xs = -1;
                this.ys = 0;
                Ctrl.eup = false;
                Ctrl.eleft = false;
                Ctrl.edown = false;
                Ctrl.eright = false;                   }
            
            else if(Ctrl.edown && this.ys == 0) {
                this.xs = 0;
                this.ys = 1;
                Ctrl.eup = false;
                Ctrl.eleft = false;
                Ctrl.edown = false;
                Ctrl.eright = false;                   }
            
            else if(Ctrl.eright && this.xs == 0) {
                this.xs = 1;
                this.ys = 0;
                Ctrl.eup = false;
                Ctrl.eleft = false;
                Ctrl.edown = false;
                Ctrl.eright = false;                   }

            this.x += this.xs * this.speed;
            this.y += this.ys * this.speed;

            this.path.push({x: this.x, y: this.y});

            if(this.path.length > 600) this.path.shift();
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

    var Hud = {
        level : 2,

        init: function() {
            //this.score = 0;
        },

        draw: function() {
            if(Game.gameOver) return;
            ctx.font = '12px helvetica, arial';
            ctx.fillStyle = 'white';
            //ctx.textAlign = 'left';
            //ctx.fillText('Score: ' + this.score, 5, Game.height - 5);
            ctx.textAlign = 'right';
            ctx.fillText('Level: ' + (this.level - 2), Game.width - 5, Game.height - 5);
        }
    };

    var Ctrl = {
        fireReset : false,
        init: function() {
            Ctrl.W = false;
            window.addEventListener('keydown', this.keyDown, true);
            window.addEventListener('keyup', this.keyUp, true);
        },

        keyDown: function(event) {
            switch(event.keyCode) {
                case 87: //W
                    Ctrl.up = true;
                    break;
                case 65: //A
                    Ctrl.left = true;
                    break;
                case 83: //S
                    Ctrl.down = true;
                    break;
                case 68: //D
                    Ctrl.right = true;
                    break;
                case 38: //UP
                    Ctrl.eup = true;
                    break;
                case 40: //DOWN
                    Ctrl.edown = true;
                    break;
                case 37: //LEFT
                    Ctrl.eleft = true;
                    break;
                case 39: //RIGHT
                    Ctrl.eright = true;
                    break;
                default:
                    break;
            }
        },

        keyUp: function(event) {
            switch(event.keyCode) {
                case 87: //W
                    Ctrl.up = false;
                    break;
                case 65: //A
                    Ctrl.left = false;
                    break;
                case 83: //S
                    Ctrl.down = false;
                    break;
                case 68: //D
                    Ctrl.right = false;
                    break;
                case 38: //UP
                    Ctrl.eup = false;
                    break;
                case 40: //DOWN
                    Ctrl.edown = false;
                    break;
                case 37: //LEFT
                    Ctrl.eleft = false;
                    break;
                case 39: //RIGHT
                    Ctrl.eright = false;
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