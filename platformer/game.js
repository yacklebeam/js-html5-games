(function () {
    window.requestAnimFrame = (function() {
        return  window.requestAnimationFrame        ||
        window.webkitRequestAnimationFrame          ||
        window.mozRequestAnimationFrame             ||
        window.oRequestAnimationFrame               ||
        window.msRequestAnimationFrame              ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    var ctx = null;

    var Game = {
        canvas : document.getElementById('canvas'),

        setup : function() {
            if(this.canvas.getContext) {
                this.FrameCount = 0;
                ctx = this.canvas.getContext('2d');

                this.width = this.canvas.width;
                this.height = this.canvas.height;

                AssetLoader.load();
                TextRenderer.init();
                this.runGame();
            }
        },

        init: function() {//move this to a scene
            Ctrl.init();
            SceneHandler.init();
            Screen.init();

            InvaderPool.init();
            BulletPool.init();
            LootPool.init();
            //Level.init();
            Hud.init();
            Gun.init();
            Ship.init();
        },

        animate: function() {
            Game.play = requestAnimFrame(Game.animate);
            Game.draw();
        },

        draw: function() {
            Screen.draw();

            this.FrameCount++;
            if(this.FrameCount > 99) this.FrameCount == 0;
        },

        runGame : function() {
            Game.init();
            Game.animate();
        }
    };

    var Screen = {
        init: function() {
            SceneHandler.createScene({   
                name: "START-SCREEN",
                init: function(){},
                draw: function() {
                    if(Ctrl.enter && Ctrl.enterReset) {
                        SceneHandler.setCurrentScene('CONTROL-GUIDE');
                        Ctrl.enterReset = false;
                    }
                    TextRenderer.renderText("@L@WSTAR CADET", 175, 290, -1);
                    TextRenderer.renderText("@L@YSTAR CADET@S@RBETA", 176, 291, -1);
                    TextRenderer.renderText("@M@Wpress \"shift\" to start", 170, Game.height - 25, -1);
                }
            });

            SceneHandler.createScene({   
                name: "INTRO-SCRIPT",
                init: function() {
                    this.script = [ "@M@CWELCOME, PILOT",
                                    "@M@Cyou have been chosen for a very special mission...",
                                    "@M@Cthe @RRektarin @Cfleet approaches Earth.@N@NYou have been chosen to stop them.@N@Nthis should be an easy task..."];
                    this.current = 0;
                },
                draw: function() {
                    if(Ctrl.enter && Ctrl.enterReset) {
                        if(this.current < this.script.length - 1) this.current++;
                        else SceneHandler.setCurrentScene("GAME-LEVEL-1");
                        Ctrl.enterReset = false;
                    }
                    TextRenderer.renderText(this.script[this.current], 210, 250, 250);
                    TextRenderer.renderText("@M@Wpress \"shift\" to continue", 170, Game.height - 25, -1);
                }
            });

            SceneHandler.createScene({
                name: 'CONTROL-GUIDE',
                init: function() {},
                draw: function() {
                    if(Ctrl.enter && Ctrl.enterReset) {
                        SceneHandler.setCurrentScene('INTRO-SCRIPT');
                        Ctrl.enterReset = false;
                    }
                    TextRenderer.renderText("@L@GCONTROLS",220,200,-1);
                    TextRenderer.renderText("@M@W\"A\",\"D\" to move@N@NHold \"SHIFT\" to fire@N@N\"/\" to launch bomb", 200, 280, -1);
                    TextRenderer.renderText("@M@Wpress \"shift\" to begin", 170, Game.height - 25, -1);                    
                }
            });

            SceneHandler.createScene({
                name: "GAME-LEVEL-1",
                init: function() {
                    InvaderPool.clear();
                    Level.init();
                },
                draw: function() {
                    InvaderPool.draw();
                    Ship.draw();
                    BulletPool.draw();
                    LootPool.draw();
                    Hud.draw();
                }
            });

            SceneHandler.createScene({
                name: "GAME-OVER-WIN",
                init: function() {
                    Ctrl.enterReset = false;
                },
                draw: function() {
                    if(Ctrl.enter && Ctrl.enterReset) {
                        SceneHandler.setCurrentScene("START-SCREEN");
                        Ctrl.enterReset = false;
                    }
                    TextRenderer.renderText("@L@GGAME OVER@N@N@M [FINAL SCORE:"+Hud.score+"]", 190, 290, -1);
                    TextRenderer.renderText("@M@Wpress \"shift\" to restart", 170, Game.height - 25, -1);
                }
            });

            SceneHandler.setCurrentScene("START-SCREEN");
        },

        draw: function() {
            ctx.clearRect(  0,0,Game.width,Game.height);
            ctx.fillStyle = 'black';
            ctx.fillRect(   0,0,Game.width,Game.height);
            var Scene = SceneHandler.sceneList[SceneHandler.currentScene];
            Scene.draw();
        }
    };

    var AssetLoader = {
        load: function() {
            this.AlphabetSmall = new Image();
            this.AlphabetSmall.src = 'res/chars-small.png';
            this.AlphabetMedium = new Image();
            this.AlphabetMedium.src = 'res/chars-med.png';
            this.AlphabetLarge = new Image();
            this.AlphabetLarge.src = 'res/chars-large.png';
            this.hSeg = new Image();
            /*this.hSeg.src = 'res/heath_segment.png';
            this.hSegEmpty = new Image();
            this.hSegEmpty.src = "res/heath_segment_empty.png";
            this.sSeg = new Image();
            this.sSeg.src = "res/shield_segment.png";
            this.sSegEmpty = new Image();
            this.sSegEmpty.src = "res/shield_segment_empty.png";
            this.hudLeft = new Image();
            this.hudLeft.src = 'res/hud_left.png';
            this.hudRight = new Image();
            this.hudRight.src = 'res/hud_right.png';*/
            this.uiSegments = new Image();
            this.uiSegments.src = 'res/ui-segments.png';
            this.effects = new Image();
            this.effects.src = 'res/effects.png';
            this.ships = new Image();
            this.ships.src = 'res/ships.png';
        }
    };

    var SceneHandler = {
        init: function() {
            this.sceneList = [];
            this.currentScene = -1;
        },

        createScene: function(scene) {
            this.sceneList.push(scene);
        },

        setCurrentScene: function(nameIn) {
            for(var i = 0; i < this.sceneList.length; i++) {
                if(this.sceneList[i].name == nameIn) {
                    this.currentScene = i;
                    this.sceneList[i].init();
                    return;
                }
            }
        },

        clearScenes: function() {
            this.sceneList = [];
        }
    };

    var TextRenderer = {
        init: function() {
            this.CharMap = ['A','B','C','D','E','F','G','H','I','J',
                            'K','L','M','N','O','P','Q','R','S','T',
                            'U','V','W','X','Y','Z','.',',','-','!',
                            '?','_','(',')','[',']','/','\\',':',';',
                            '#','$','%','+','=','<','>','"','\'','|',
                            '1','2','3','4','5','6','7','8','9','0'];

            this.SmallText = {
                src: AssetLoader.AlphabetSmall,
                space: 5,

            };

            this.MedText = {
                src: AssetLoader.AlphabetMedium,
                space: 10,
                
            };

            this.LargeText = {
                src: AssetLoader.AlphabetLarge,
                space: 20,
                
            };
        },

        getIndexFromChar: function(c) {
            for(var i = 0; i < this.CharMap.length; i++) {
                if(c == this.CharMap[i]) return i;
            }

            return -1;
        },

        renderText: function(textIn, x, y, max_width) {
            var text = textIn.toUpperCase();
            var color = 0;
            var Font = this.MedText;
            var X = x;
            var Y = y;

            for(var i = 0; i < text.length; i++) {
                if(text.charAt(i) == '@') { //change text
                    if(text.charAt(i+1) == 'S') Font = this.SmallText;
                    if(text.charAt(i+1) == 'M') Font = this.MedText;
                    if(text.charAt(i+1) == 'L') Font = this.LargeText;
                    if(text.charAt(i+1) == 'G') color = 2;
                    if(text.charAt(i+1) == 'R') color = 3;
                    if(text.charAt(i+1) == 'B') color = 1;
                    if(text.charAt(i+1) == 'W') color = 0;
                    if(text.charAt(i+1) == 'Y') color = 4;
                    if(text.charAt(i+1) == 'P') color = 5;
                    if(text.charAt(i+1) == 'C') color = 6;
                    if(text.charAt(i+1) == 'N') {
                        Y += Font.space+(Font.space/5);
                        X = x;
                    }

                    i+=1;
                    continue;
                }

                var charCode = this.getIndexFromChar(text.charAt(i));
                var colorOffset = color * 6 * Font.space;

                if(charCode >= 0) {
                    var sx = charCode % 10;
                    var sy = Math.floor(charCode / 10);
                    ctx.drawImage(Font.src, sx*Font.space, colorOffset+sy*Font.space, Font.space, Font.space, X, Y, Font.space, Font.space);
                    X += Font.space+(Font.space/5);                    
                } else {//space, usually
                    X += Font.space+(Font.space/5);
                    var nextSpace = text.indexOf(' ', i+1);
                    if(nextSpace == -1) nextSpace = text.length;

                    var wordLen = (nextSpace - i) * (Font.space+(Font.space/5));
                    if(X - x + wordLen > max_width && max_width > 0) {
                        Y += Font.space+(Font.space/5);
                        X = x;                    
                    }
                }
            }
        }
    };

    var Level = {
        init: function() {
            this.loadLevel(0);
        },

        loadLevel: function(level) {
            switch(level) {
                case 0:
                    Hud.goal = 20;
                    for(var i = 0; i < Hud.goal; i++) {
                        var random = 10 * getRandomIntInclusive(0,2);
                        var newInvader = {
                            life: 5,
                            x: 200 + (i%5) * 54 + (i/5)%2 * 27,
                            y: 0 - 45 * Math.floor(i / 5),
                            dead: false,
                            type: "ship",
                            fcount : random,
                            count : 0,
                            radius: 8,
                            currentPath: 0,
                            distTraveled: 0,
                            loot: 5,
                            path: [ {xs:-1, ys: 2, d: 100, next: 1},//move this OUT of each guy
                                    {xs:0, ys: 1, d: 100, next: 2},
                                    {xs:1, ys: 0, d: 100, next: 3},
                                    {xs:0, ys: -1, d: 100, next: 4},
                                    {xs:-1, ys: 0, d: 100, next: 1}]
                        };
                        InvaderPool.addNew(newInvader);
                    }

                    /*var newInvader = {
                        life: 1,
                        x: 288,
                        y: 20,
                        dead: false,
                        type: "ship"
                    };
                    InvaderPool.addNew(newInvader);*/
                    break;
                case 1:
                    Hud.goal = 1;
                    var random = 10 * getRandomIntInclusive(0,2);
                    var newInvader = {
                        life: 100,
                        x: 300,
                        y: 80,
                        dead: false,
                        type: "boss",
                        fcount : random,
                        count : 0,
                        radius: 30
                    };
                    InvaderPool.addNew(newInvader);
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
                    this.r = 5;
                    this.bulletCount = 2;
                    this.bulletSpread = 1;
                    this.fireRate = 5;
                    this.color = 'red';
                    break;
                case 1:
                    this.dmg = 1;
                    this.r = 5;
                    this.bulletCount = 1;
                    this.bulletSpread = 1;
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
                        faction: 0,
                        x: Ship.x + 2 * this.getBulletDirection(this.bulletCount, i),
                        y: Ship.y - 15,
                        xs: this.bulletSpread * this.getBulletDirection(this.bulletCount, i),
                        ys: -15,
                        r: this.r,
                        dmg: this.dmg,
                        color: this.color,
                        life: 1
                    };
                    BulletPool.addNew(newBullet);
                }
            } else {
                for(var i = 0; i < this.bulletCount; i++) {
                    var newBullet = {
                        faction: 0,
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
            this.y = 550;
            this.speed = 8;
            this.health = 4;
            this.shields = 4;
            this.fcount = 0;
            this.cooldownTimer = 0;
            this.cooldown = true;
        },

        draw: function() {
            if(Game.gameOver) return;
            //if(Game.FrameCount % 60 == 0) 
            this.cooldownTimer--;
            if(this.cooldownTimer <= 0) {
                this.cooldownTimer = 0;
                this.cooldown = true;
            }
            else this.cooldown = false;

            this.move();

            ctx.drawImage(AssetLoader.ships, 0, 75, 25, 25, this.x - 12, this.y - 12, 25, 25);
            ctx.drawImage(AssetLoader.effects, this.fcount, 65, 9, 15, this.x-5, this.y + 12, 9, 15);
            if(Game.FrameCount %10 == 0) {
                this.fcount += 10;
                if(this.fcount == 30) this.fcount = 0;
            }
        },

        move: function() {
            if (Ctrl.left && this.x > 120) {
                this.x += -this.speed;
            } else if (Ctrl.right && this.x < 480) {
                this.x += this.speed;
            }

            if(this.x > 480) this.x = 480;
            if(this.x < 120) this.x = 120;            

            if(Ctrl.enter) {
                if(this.resetTimer == 0) {
                    this.shoot();
                    this.resetTimer = Gun.fireRate;
                }
                this.resetTimer--;
            }

            if(Ctrl.item && Ctrl.itemReset && this.cooldown) {
                Ctrl.itemReset = false;
                this.cooldownTimer = 300;
                this.launchBomb();
            }
        },

        launchBomb: function() {
            var bomb = {
                faction: 0,
                x: Ship.x,
                y: Ship.y - 15,
                xs: 0,
                ys: -10,
                r: 10,
                dmg: 0,
                type: "bomb",
                life: 30,
                blink: false
            };
            BulletPool.addNew(bomb);
        },

        shoot: function() {
            Gun.shoot();
            //Ctrl.fire = false;
            //Ctrl.fireReset = true;
        },

        hit: function(dmg) {
            this.shields -= dmg;
            if(this.shields < 0) {
                this.health += this.shields;
                this.shields = 0;
            }
            
            ctx.clearRect(0, 0, Game.width, Game.height);
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, Game.width, Game.height);

            if(this.health == 0) {
                Game.gameOver = true;
                Screen.gamelose();
                Game.canvas.addEventListener('click', Game.restartGame, false);
                return;
            }
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
            
                    if(bullet.type == 'bomb') {
                        if(Game.FrameCount %10 == 0) {
                            bullet.blink = !bullet.blink;
                        }
                        if(!bullet.blink) ctx.drawImage(AssetLoader.effects, 60,50,20,20,bullet.x-10, bullet.y-10, 20, 20);
                        else ctx.drawImage(AssetLoader.effects, 40,50,20,20,bullet.x-10, bullet.y-10, 20, 20);

                        //this.objects[i].life--;
                    } else {
                        ctx.drawImage(AssetLoader.effects, 30,50,10,10,bullet.x-5, bullet.y-5, 10, 10);
                    }

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
                    //Check '1' bullets for ship collisions
                    if(Bullet.faction == 1) {
                        if(Math.sqrt((Ship.x - Bullet.x) * (Ship.x - Bullet.x) + (Ship.y - Bullet.y) * (Ship.y - Bullet.y)) < 15) {
                            Ship.hit(Bullet.dmg);
                            this.removeIndex(Bullet.index);
                            break;
                        }
                    } 

                    //Check '0' bullets for invader collisions
                    for(var j = 0; j < InvaderPool.end; j++) {
                        var Invader = InvaderPool.objects[j];
                        //if(Invader.type =='explosion') continue;
                        if((Bullet.faction == 0) && Invader && !Invader.dead && Invader.type != 'explosion') {
                            if(Math.sqrt((Invader.x - Bullet.x) * (Invader.x - Bullet.x) + (Invader.y - Bullet.y) * (Invader.y - Bullet.y)) < (Bullet.r + Invader.radius) || Bullet.life <= 0) {
                                this.removeIndex(Bullet.index);
                                if(Bullet.type == 'bomb') {
                                    var XDir = [15,0,-15,0,12,-12,12,-12];
                                    var YDir = [0,15,0,-15,12,-12,-12,12];
                                    for(var i = 0; i < 8; i++) {
                                        var bullet = {
                                            faction: 0,
                                            x: Bullet.x,
                                            y: Bullet.y,
                                            xs: XDir[i],
                                            ys: YDir[i],
                                            r: 10,
                                            dmg: 3,
                                            life: 1
                                        };
                                        this.addNew(bullet);
                                    }
                                }
                                InvaderPool.objects[j].life -= Bullet.dmg;
                                InvaderPool.addNew({
                                    life: 0,
                                    x: Bullet.x,
                                    y: Bullet.y,
                                    dead: false,
                                    type: "explosion",
                                    count : 0
                                });
                                if(InvaderPool.objects[j].life <= 0) {
                                    /*InvaderPool.addNew({
                                        life: 0,
                                        x: Invader.x,
                                        y: Invader.y,
                                        dead: false,
                                        type: "explosion",
                                        count : 0
                                    });*/
                                    InvaderPool.removeIndex(Invader.index);
                                    //InvaderPool.objects[j].type = "explosion";
                                    //InvaderPool.objects[j].dead = true;
                                    Hud.goal--;
                                    Hud.score++;
                                }
                                /*if(InvaderPool.objects[j].life == 0) {
                                    InvaderPool.objects[j].dead = true;
                                }*/
                                if(Hud.goal == 0) {
                                    //Game.gameOver = true;
                                    //Screen.gamewin();
                                    //Game.canvas.addEventListener('click', Game.restartGame, false);
                                    //Level.loadLevel(1);
                                    SceneHandler.setCurrentScene('GAME-OVER-WIN');
                                    return;
                                }
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
            this.bossReset = 20; //MOVE THIS
            this.maxSize = 100;
            this.count = 0;
            this.objects = [];
            this.open = 0;
            this.end = 0;
            this.left = true;//MOVE THIS
            this.count = 0; //MOVE THIS
        },

        clear: function() {
            this.init();
        },

        draw: function() {
            //Hud.level = this.end;
            if(Game.gameOver) return;
            for(var i = 0; i < this.end; i++) {
                var A = this.objects[i];

                if(A) {
                    //Move this code into object, rather than pool
                    if(A.type == "ship") {
                        //A.y += 1;
                        A.x += A.path[A.currentPath].xs;
                        A.y += A.path[A.currentPath].ys;
                        A.distTraveled++;
                        if(A.distTraveled == A.path[A.currentPath].d) {
                            A.currentPath = A.path[A.currentPath].next;
                            A.distTraveled = 0;
                        }

                        ctx.drawImage(AssetLoader.ships, 0, 0, 25, 25, A.x-12, A.y-12, 25, 25);
                        ctx.drawImage(AssetLoader.effects, A.fcount, 50, 9, 15, A.x-5, A.y-27, 9, 15);
                        if(Game.FrameCount %10 == 0) {
                            A.fcount += 10;
                            if(A.fcount == 30) A.fcount = 0;
                        }
                    } else if(A.type == 'explosion') {
                        ctx.drawImage(AssetLoader.effects, A.count, 0, 50, 50, A.x - 25, A.y - 25, 50, 50);
                        if(Game.FrameCount % 3 == 0) {
                            A.count += 50;
                            if(A.count == 300) {
                                A.count = 0;
                                InvaderPool.removeIndex(A.index);
                            }
                        }
                    } else {
                        ctx.drawImage(AssetLoader.ships, 25, 0, 100, 100, A.x-50, A.y-50, 100, 100);
                        /*ctx.drawImage(AssetLoader.effects, A.fcount, 50, 10, 15, A.x-5, A.y-65, 10, 15);
                        if(Game.FrameCount %10 == 0) {
                            A.fcount += 10;
                            if(A.fcount == 30) A.fcount = 0;
                        }*/
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

    var LootPool = {
        init: function() {
            this.maxSize = 100;
            this.count = 0;
            this.objects = [];
            this.open = 0;
            this.end = 0;
        },

        clear: function() {
            this.init();
        },

        draw: function() {
            if(Game.gameOver) return;
            for(var i = 0; i < this.end; i++) {
                
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

            //this.ready = false;

            /*this.hSeg = new Image();
            this.hSeg.src = 'heath_segment.png';
            this.hSegEmpty = new Image();
            this.hSegEmpty.src = "heath_segment_empty.png";
            this.sSeg = new Image();
            this.sSeg.src = "shield_segment.png";
            this.sSegEmpty = new Image();
            this.sSegEmpty.src = "shield_segment_empty.png";
            this.hudLeft = new Image();
            this.hudLeft.src = 'hud_left.png';
            this.hudRight = new Image();
            this.hudRight.src = 'hud_right.png';
            this.uiSegments = new Image();
            this.uiSegments.src = 'ui-segments.png';*/

            /*this.hSeg.onload = function() {
                this.ready = true;
            }*/
        },

        draw: function() {
            if(!Ship.cooldown) {
                TextRenderer.renderText("@M@W" + ((Ship.cooldownTimer / 60).toFixed(1)), 10, 480, -1);
                ctx.drawImage(AssetLoader.effects, 40,50,20,20, 15, 500, 20, 20);
            } else {
                ctx.drawImage(AssetLoader.effects, 60,50,20,20, 15, 500, 20, 20);
            }           
            for(var i = 0; i < Ship.health; i++) {
                ctx.drawImage(AssetLoader.uiSegments, 0, 0, 20, 50, 10, 10 + i * 55, 20, 50);
            }

            for(var i = 0; i < Ship.shields; i++) {
                ctx.drawImage(AssetLoader.uiSegments, 20, 0, 20, 50, 35, 10 + i * 55, 20, 50);
            }
        }
    };

    var Ctrl = {
        init: function() {
            Ctrl.leftReset = true;
            Ctrl.rightReset = true;
            Ctrl.enterReset = true;
            Ctrl.itemReset = true;
            window.addEventListener('keydown', this.keyDown, true);
            window.addEventListener('keyup', this.keyUp, true);
        },

        keyDown: function(event) {
            Ctrl.anyKey = true;
            switch(event.keyCode) {
                case 65: //A
                    Ctrl.left = true;
                    break;
                case 68: //D
                    Ctrl.right = true;
                    break;                
                case 87: //W
                    Ctrl.up = true;
                    break;
                case 83: //S
                    Ctrl.down = true;
                    break;
                case 16://shift
                    Ctrl.enter = true;
                    break;
                case 191://slash
                    Ctrl.item = true;
                    break;
                default:
                    break;
            }
        },

        keyUp: function(event) {
            Ctrl.anyKey = false;
            switch(event.keyCode) {
                case 65: //A
                    Ctrl.left = false;
                    Ctrl.leftReset = true;
                    break;
                case 68: //D
                    Ctrl.right = false;
                    Ctrl.rightReset = true;
                    break;
                case 87: //W
                    Ctrl.up = false;
                    break;
                case 83: //S
                    Ctrl.down = false;
                    break;    
                case 16:
                    Ctrl.enter = false;
                    Ctrl.enterReset = true;
                    break;
                case 191:
                    Ctrl.item = false;
                    Ctrl.itemReset = true;
                    break;
                default:
                    break;
            }
        }
    };

    //TODO REMOVE
    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    window.onload = function() {
        Game.setup();
    }
}());