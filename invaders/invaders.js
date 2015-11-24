//Canvas Space Invaders
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
        canvas : document.getElementById('invaders'),

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
            this.MenuOpen = false;
            Background.init();
            Hud.init();
            Gun.init();
            InvaderPool.init();
            BulletPool.init();
            Ship.init();
        },

        animate: function() {
            Game.play = requestAnimFrame(Game.animate);
            Game.draw();
        },

        draw: function() {
            if(!Game.gameOver) {
                if(this.MenuOpen) {
                    //Menu.draw();
                    Hud.drawMenu();
                } else {
                    ctx.clearRect(0, 0, this.width, this.height);
                    Background.draw();
                    Hud.draw();
                    //InvaderPool.draw();
                    Ship.draw();
                    BulletPool.draw();
                }
            }
        },

        restartGame: function() {
            Game.canvas.removeEventListener('click', Game.restartGame, false);
            Game.init();
        },

        runGame : function() {
            Game.canvas.removeEventListener('click', Game.runGame, false);
            Game.init();
            Game.animate();
        }
    };

    var Menu = {
        draw: function() {
            ctx.fillStyle = '#091122';
            ctx.fillRect(0, 0, Game.width, Game.height);

            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = '40px helvetica, arial';
            ctx.fillText("PAUSED", Game.width / 2, Game.height / 2);
        }
    };

    var Screen = {
        welcome : function() {
            this.text = 'SPACE INVADERS';
            this.textSub = 'Click to Start';
            this.textColor = 'white';

            this.create();
        },

        gamewin : function() {
            this.text = 'YOU WIN (Score: ' + Hud.score + ')';
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
            //ctx.fillStyle = '#091122';
            ctx.fillStyle = 'black';
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

    var Level = {
        loadLevel: function(level) {
            switch(level) {
                case 1:
                    Hud.goal = 100;
                    for(var i = 0; i < 100; i++) {
                        var newInvader = {
                            life: 2,
                            x: 200 + (i%10) * 25,
                            y: 0 - 25 * Math.floor(i / 10),
                            dead: false
                        };
                        InvaderPool.addNew(newInvader);
                    }
                    break;
                case 2:
                    break;
                case 3:
                    break;
            }
        }
    };

    var Gun = {
        init: function() {
            this.setGun(1);
        },

        setGun: function(id) {
            switch(id) {
                case 0:
                    this.dmg = 1;
                    this.r = 10;
                    this.bulletCount = 1;
                    this.bulletSpread = 1;
                    this.fireRate = 10;
                    this.color = 'red';
                    break;
                case 1:
                    this.dmg = 2;
                    this.r = 15;
                    this.bulletCount = 9;
                    this.bulletSpread = 3;
                    this.fireRate = 5;
                    this.color = 'red';
                    break;
                default:
                    break;
            }
        },

        getBulletDirection: function(bulletCount, i) {
            if(i < (Math.floor(bulletCount / 2))) return (i - Math.floor(bulletCount / 2));
            else return (i - Math.floor(bulletCount / 2) + 1);
        },

        shoot: function() {
            if(this.bulletCount % 2 == 0) {
                for(var i = 0; i < this.bulletCount; i++) {
                    var newBullet = {
                        x: Ship.x + 2 * this.getBulletDirection(this.bulletCount, i),
                        y: Ship.y - 15,
                        xs: this.bulletSpread * this.getBulletDirection(this.bulletCount, i),
                        ys: -15,
                        r: this.r,
                        dmg: this.dmg,
                        color: this.color
                    };
                    BulletPool.addNew(newBullet);
                }
            } else {
                for(var i = 0; i < this.bulletCount; i++) {
                    var newBullet = {
                        x: Ship.x + 2 * (i - (Math.floor(this.bulletCount / 2))),
                        y: Ship.y - 15,
                        xs: this.bulletSpread * (i - (Math.floor(this.bulletCount / 2))),
                        ys: -15,
                        r: this.r,
                        dmg: this.dmg,
                        color: this.color
                    };
                    BulletPool.addNew(newBullet);
                }
            }
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
        point1 : {x: 0, y: -25},
        point2 : {x: -10, y: 0},
        point3 : {x: 10, y: 0},
        point4 : {x: 0, y: 0},
        
        init: function() {
            this.resetTimer = Gun.fireRate;
            this.x = 290;
            this.y = 590;
            this.speed = 4;
        },

        draw: function() {
            if(Game.gameOver) return;
            this.move();

            ctx.beginPath();
            ctx.moveTo(this.x + this.point1.x, this.y + this.point1.y);
            ctx.lineTo(this.x + this.point2.x, this.y + this.point2.y);
            ctx.lineTo(this.x + this.point3.x, this.y + this.point3.y);
            ctx.closePath();
            ctx.fillStyle = '#eee';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x + this.point4.x,this.y + this.point4.y, 3, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = 'orange';
            ctx.fill();
        },

        move: function() {
            if (Ctrl.left && this.x > 100) {
                this.x += -this.speed;
            } else if (Ctrl.right && this.x < 500) {
                this.x += this.speed;
            }

            if(this.x > 700) this.x = 500;
            if(this.x < 100) this.x = 100;

            if(Ctrl.fire) {
                if(this.resetTimer == 0) {
                    this.shoot();
                    this.resetTimer = Gun.fireRate;
                }
                this.resetTimer--;
            }
        },

        shoot: function() {
            Gun.shoot();
            //Ctrl.fire = false;
            //Ctrl.fireReset = true;
        }

    };

    var BulletPool = {
        init: function() {
            this.maxSize = 100;
            this.count = 0;
            this.objects = [];
            this.open = 0;
            this.end = 0;
        },

        draw: function() {
            if(Game.gameOver) return;
            for(var i = 0; i < this.end; i++) {
                var bullet = this.objects[i];
                if(bullet) {
                    bullet.x += bullet.xs;
                    bullet.y += bullet.ys;
            
                    ctx.beginPath();
                    ctx.arc(bullet.x, bullet.y, bullet.r, 0, 2 * Math.PI);
                    ctx.closePath();

                    ctx.fillStyle = bullet.color;
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(bullet.x, bullet.y, bullet.r - 4, 0, 2 * Math.PI);
                    ctx.closePath();

                    ctx.fillStyle = 'white';
                    ctx.fill();

                    if(bullet.y < -5) {
                        this.removeIndex(bullet.index);
                    }
                }
            }

            this.collide();
        },

        addNew: function(ob) {
            if(this.open == this.end) {
                ob.index = this.open;
                this.objects.push(ob);
                this.end++;
                this.open++;
            } else {
                ob.index = this.open;
                this.objects[this.open] = ob;
                this.open = this.getOpenIndex();
            }
        },

        removeIndex: function(index) {
            this.objects[index] = null;
            if(index < this.open) this.open = index;
        },

        collide: function() {
            for(var i = 0; i < this.end; i++) {
                var Bullet = this.objects[i];
                if(Bullet) {
                    for(var j = 0; j < InvaderPool.end; j++) {
                        var Invader = InvaderPool.objects[j];
                        if(Invader && !Invader.dead) {
                            if(Math.sqrt((Invader.x - Bullet.x) * (Invader.x - Bullet.x) + (Invader.y - Bullet.y) * (Invader.y - Bullet.y)) < 15) {
                                this.removeIndex(Bullet.index);
                                InvaderPool.objects[j].life -= Bullet.dmg;
                                if(InvaderPool.objects[j].life <= 0) {
                                    //InvaderPool.removeIndex(Invader.index);
                                    InvaderPool.objects[j].dead = true;
                                    Hud.goal--;
                                    Hud.score++;
                                }
                               /*if(Hud.goal == 0) {
                                    Game.gameOver = true;
                                    Screen.gamewin();
                                    Game.canvas.addEventListener('click', Game.restartGame, false);
                                    return;
                                }*/
                                break;
                            }
                        }
                    }  
                }
            }
        },

        getOpenIndex: function() {
            for(var i = 0; i < this.end; i++) {
                if(this.objects[i] == null) return i;
            }
            return this.end;
        }
    };

     var InvaderPool = {
        init: function() {
            this.maxSize = 100;
            this.count = 0;
            this.objects = [];
            this.open = 0;
            this.end = 0;
            Level.loadLevel(1);
        },

        draw: function() {
            if(Game.gameOver) return;
            for(var i = 0; i < this.end; i++) {
                var A = this.objects[i];

                if(A) {
                    if(A.dead) {
                        A.y += 5;

                        ctx.beginPath();
                        ctx.arc(A.x, A.y, 4, 0, 2 * Math.PI);
                        ctx.closePath();

                        ctx.fillStyle = 'gold';
                        ctx.fill(); 
                    } else {
                        A.y += 1;
                
                        ctx.beginPath();
                        ctx.moveTo(A.x, A.y + 15);
                        ctx.lineTo(A.x - 10, A.y - 10);
                        ctx.lineTo(A.x + 10, A.y - 10);
                        ctx.closePath();
                        if(A.life == 1) ctx.fillStyle = '#eee';
                        if(A.life == 2) ctx.fillStyle = 'blue';
                        ctx.fill();
                    }

                    /*if(A.y > Game.height - 30) {
                        Game.gameOver = true;
                        Screen.gamelose();
                        Game.canvas.addEventListener('click', Game.restartGame, false);
                        return;
                    }*/
                    if(A.y == Game.height + 5) {
                        this.removeIndex(A.index);
                    }
                }
            }
        },

        addNew: function(ob) {
            if(this.open == this.end) {
                ob.index = this.open;
                this.objects.push(ob);
                this.end++;
                this.open++;
            } else {
                ob.index = this.open;
                this.objects[this.open] = ob;
                this.open = this.getOpenIndex();
            }
        },

        removeIndex: function(index) {
            this.objects[index] = null;
            if(index < this.open) this.open = index;
        },

        getOpenIndex: function() {
            for(var i = 0; i < this.end; i++) {
                if(this.objects[i] == null) return i;
            }
            return this.end;
        }
    };

    var Hud = {
        init: function() {
            this.mainMenu = [
            {
                text: "GUN 1",
                cmd: function() {
                    Gun.setGun(0);
                    Game.MenuOpen = false;
                }
            },
            {
                text: "GUN 2",
                cmd: function() {
                    Gun.setGun(1);
                    Game.MenuOpen = false;
                }
            }];
            this.level = 0;
            this.score = 0;
            this.menux = 200;
            this.menuy = 200;
            this.gunLevel = 0;
            this.selected = 0;
        },

        draw: function() {
            if(Game.gameOver) return;
            ctx.font = '12px helvetica, arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.fillText('Score: ' + this.score, 5, Game.height - 5);
            ctx.textAlign = 'left';
            ctx.fillText('Level: ' + this.level, 5, Game.height - 19);
        },

        drawMenu: function() {
            if(Ctrl.left && Ctrl.leftReset && this.selected > 0) {
                this.selected--;
                Ctrl.leftReset = false;
            }
            else if(Ctrl.right && Ctrl.rightReset && this.selected < this.mainMenu.length - 1) {
                this.selected++; 
                Ctrl.rightReset = false;
            }
            ctx.clearRect(this.menux, this.menuy, 200, 200);
            ctx.fillStyle = 'black';
            ctx.fillRect(this.menux, this.menuy, 200, 200);
            ctx.font = '12px helvetica, arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            for(var i = 0; i < this.mainMenu.length; i++) {
                var text = this.mainMenu[i].text;
                if(i == this.selected) text += " <";
                ctx.fillText(text, this.menux + 5, this.menuy + 17 + (i * 14));
            }
            if(Ctrl.fire) {
                this.mainMenu[this.selected].cmd();
            }
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
                case 65: //A
                    Ctrl.left = true;
                    break;
                case 68: //D
                    Ctrl.right = true;
                    break;
                case 16: //Shift or
                case 74: //J
                    Ctrl.fire = true;
                    if(Ctrl.fireReset == false) {
                        Ship.resetTimer = 0;
                        Ctrl.fireReset = true;
                    }
                    break;
                case 80: //P
                    Game.MenuOpen = !Game.MenuOpen;
                    break;
                /*case 85:
                    Hud.gunLevel++;
                    Gun.setGun(Hud.gunLevel);
                    break;*/
                default:
                    break;
            }
        },

        keyUp: function(event) {
            switch(event.keyCode) {
                case 65: //A
                    Ctrl.left = false;
                    Ctrl.leftReset = true;
                    break;
                case 68: //D
                    Ctrl.right = false;
                    Ctrl.rightReset = true;
                    break;
                case 16: //Shift or
                case 74: //J
                    Ctrl.fireReset = false;
                    Ctrl.fire = false;
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