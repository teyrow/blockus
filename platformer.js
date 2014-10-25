// # Quintus platformer example
//
// [Run the example](../examples/platformer/index.html)
// WARNING: this game must be run from a non-file:// url
// as it loads a level json file.
//
// This is the example from the website homepage, it consists
// a simple, non-animated platformer with some enemies and a
// target for the player.
window.addEventListener("load",function() {
var start_level = "level1";
// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Touch, UI")
        // Maximize this game to whatever the size of the browser is
        .setup({ maximize: true })
        // And turn on default input controls and touch input (for UI)
        .controls().touch();
//Q.debug = true;
// ## Player Sprite
// The very basic player sprite, this is just a normal sprite
// using the player sprite sheet with default controls added to it.
Q.Sprite.extend("Player",{

  // the init constructor is called on creation
  init: function(p) {

    // You can call the parent's constructor with this._super(..)
    this._super(p, {
      sheet: "player",  // Setting a sprite sheet sets sprite width and height
      x: 410,           // You can also set additional properties that can
      y: 90             // be overridden on object creation
    });

    // Add in pre-made components to get up and running quickly
    // The `2d` component adds in default 2d collision detection
    // and kinetics (velocity, gravity)
    // The `platformerControls` makes the player controllable by the
    // default input actions (left, right to move,  up or action to jump)
    // It also checks to make sure the player is on a horizontal surface before
    // letting them jump.
    this.add('2d, platformerControls');
    // Write event handlers to respond hook into behaviors.
    // hit.sprite is called everytime the player collides with a sprite
    this.on("hit.sprite",function(collision) {
      // Check the collision, if it's the Tower, you win!
      if(collision.obj.isA("Tower")) {
        var tower = collision.obj;
        Q.stageScene("endLevel",{ label: tower.nextLevel, btnText: "Fortsätt" });
        this.destroy();
      }
    });

    this.on("bump.bottom", this, function(collision) {      
      if(collision.obj.isA("Crack")) {
        collision.obj.destroy();
      }
      if(collision.obj.isA("Brick")) {
        this.p.x = collision.obj.p.x;
        //collision.obj.destroy();
      }      
    });
  }
});


// ## Tower Sprite
// Sprites can be simple, the Tower sprite just sets a custom sprite sheet
Q.Sprite.extend("Tower", {
  init: function(p, nextLevel) {
    this._super(p, { sheet: 'tower' });
    this.nextLevel = nextLevel;
  }
});

Q.Sprite.extend("Crack", {
  init: function(p) {
    this._super(p, { sheet: 'crack' });
  }
});
Q.Sprite.extend("Brick", {
  init: function(p) {
    this._super(p, { sheet: 'brick' });
    this.add('2d, aiBounce');
    this.p.gravity = 0;
  },

});

// ## Enemy Sprite
// Create the Enemy class to add in some baddies
Q.Sprite.extend("Enemy",{
  init: function(p) {
    this._super(p, { sheet: 'enemy', vx: 100 });

    // Enemies use the Bounce AI to change direction
    // whenver they run into something.
    this.add('2d, aiBounce');

    // Listen for a sprite collision, if it's the player,
    // end the game unless the enemy is hit on top
    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) {
        var level = this.stage.options.level;
        Q.stageScene("endLevel", { label: "level" + level, btnText: "Försök igen" });        
        collision.obj.destroy();
      }
    });
    this.bounce = true;

    this.on("bump.left,bump.right", function(collision) {
      if(this.bounce) {this.p.vy = -Math.random()*500;}
    });

    // If the enemy gets hit on the top, destroy it
    // and give the user a "hop"
    this.on("bump.top",function(collision) {
      if(collision.obj.isA("Player")) {
        this.destroy();
        collision.obj.p.vy = -300;
      }
    });
  }
});

// ## Level1 scene
// Create a new scene called level 1
Q.scene("level1",function(stage) {

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level1.json',
                             sheet:     'tiles' }));

  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player({x: 55, y: 90}));

  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);

  // Add in a couple of enemies
  //stage.insert(new Q.Enemy({ x: 700, y: 50, vx: 150 }));
  var enemy = new Q.Enemy({ x: 800, y: 50 , vx: 80});
  enemy.bounce = false;
  stage.insert(enemy);
  //stage.insert(new Q.Enemy({ x: 200, y: 50 , vx: -150}));

  // Finally add in the tower goal
  stage.insert(new Q.Tower({ x: 1130, y: 337}, "level2"));
}, {level: 1});
// ## Level1 scene
// Create a new scene called level 1
Q.scene("level2",function(stage) {

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level.json',
                             sheet:     'tiles' }));

  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player({x: 400, y: 400}));

  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);

  // Add in a couple of enemies
  var enemy = new Q.Enemy({ x: 800, y: 50 , vx: 80});
  enemy.bounce = false;
  stage.insert(enemy);
  stage.insert(new Q.Enemy({ x: 800, y: 50 , vx: 150, bounce: false}));
  // Finally add in the tower goal
  stage.insert(new Q.Tower({ x: 180, y: 365}, "level3"));
}, {level: 2});

Q.scene("level3",function(stage) {

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level.json',
                             sheet:     'tiles' }));

  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player({x: 400, y: 400}))

  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);

  // Add in a couple of enemies
  stage.insert(new Q.Enemy({ x: 700, y: 50, vx: 115 }));
  stage.insert(new Q.Enemy({ x: 800, y: 50 , vx: 115}));
  stage.insert(new Q.Enemy({ x: 200, y: 50 , vx: -115}));

  // Finally add in the tower goal
  stage.insert(new Q.Tower({ x: 180, y: 365 }, "level4"));
}, {level: 3});

Q.scene("level4",function(stage) {

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level4.json',
                             sheet:     'tiles' }));

  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player());
  window.p = player;
  player.p.x = 50;
  player.p.gravity = 0.725;
  //player.p.x = 
  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);

  // Add in a couple of enemies
  /*stage.insert(new Q.Enemy({ x: 700, y: 50, vx: 150 }));
  stage.insert(new Q.Enemy({ x: 800, y: 50 , vx: 150}));
  stage.insert(new Q.Enemy({ x: 200, y: 50 , vx: -150}));
  stage.insert(new Q.Enemy({ x: 200, y: 50 , vx: -50}));
*/
  // Finally add in the tower goal
  stage.insert(new Q.Tower({ x: 1130, y: 337 }, "level5")); 
  for (var i = 3; i < 36; i++) {
    //stage.insert(new Q.Crack({ x: 16+32*(11 + i), y: 32*6+16}));
    if(i%3 !=0) {
      stage.insert(new Q.Crack({ x: i*32+16, y: 32*11+16}));
    }
  };
  //stage.insert(new Q.Enemy({x: 500, y:300, vx: -150}))
  var enemy  = new Q.Enemy({x: 800, y:300, vx: 100});
  enemy.bounce = false;
  stage.insert(enemy);
}, {level: 4});

Q.scene("level5",function(stage) {

  // Add in a tile layer, and make it the collision layer
  stage.collisionLayer(new Q.TileLayer({
                             dataAsset: 'level5.json',
                             sheet:     'tiles' }));

  // Create the player and add them to the stage
  var player = stage.insert(new Q.Player());
  window.p = player;
  player.p.x = 50;
  player.p.gravity = 0.725;
  //player.p.x = 
  // Give the stage a moveable viewport and tell it
  // to follow the player.
  stage.add("viewport").follow(player);
  for (var r = 0; r < 3; r++) {
    for (var i = 0; i < 3; i++) {
      stage.insert(new Q.Brick({
       x: (7+i+2*r)*32+16, 
       y: 32*(7+r) +18, 
       vx: 100,
       ax: 0,
       ay: 0,  
       vy: 0
     }));    
    };
  };
  // Add in a couple of enemies
  /*stage.insert(new Q.Enemy({ x: 700, y: 50, vx: 150 }));
  stage.insert(new Q.Enemy({ x: 800, y: 50 , vx: 150}));
  stage.insert(new Q.Enemy({ x: 200, y: 50 , vx: -150}));
  stage.insert(new Q.Enemy({ x: 200, y: 50 , vx: -50}));
*/
  // Finally add in the tower goal
  stage.insert(new Q.Tower({ x: 1130, y: 34*4.5 }, "level5")); 

  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: 0, fill: "rgba(0,0,0,0.5)"
  }));

  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Again" }));
  // var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h,
  //                                                  label: "LABEL" }));
  // // When the button is clicked, clear all the stages
  // and restart the game.
  var b = button.on("click",function() {
    Q.clearStages();
    Q.stageScene("level5");
  });
  //console.dir(b);
  // Expand the container to visibily fit it's contents
  // (with a padding of 20 pixels)
  container.fit(20);


}, {level: 5});

// To display a game over / game won popup box,
// create a endLevel scene that takes in a `label` option
// to control the displayed message.
Q.scene('endLevel',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: stage.options.btnText }));
  var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h,
                                                   label: stage.options.label }));
  // When the button is clicked, clear all the stages
  // and restart the game.
  var b = button.on("click",function() {
    Q.clearStages();
    Q.stageScene(stage.options.label);
  });
  //console.dir(b);
  // Expand the container to visibily fit it's contents
  // (with a padding of 20 pixels)
  container.fit(120);
});

// ## Asset Loading and Game Launch
// Q.load can be called at any time to load additional assets
// assets that are already loaded will be skipped
// The callback will be triggered when everything is loaded
Q.load("sprites.png, sprites.json, level.json, tiles.png, level1.json, level4.json,level5.json, tiles.json", function() {
  // Sprites sheets can be created manually
  Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });

  // Or from a .json asset that defines sprite locations
  Q.compileSheets("sprites.png","sprites.json");
  Q.compileSheets("tiles.png","tiles.json");

  // Finally, call stageScene to run the game
  Q.stageScene(start_level);
});

// ## Possible Experimentations:
//
// The are lots of things to try out here.
//
// 1. Modify level.json to change the level around and add in some more enemies.
// 2. Add in a second level by creating a level2.json and a level2 scene that gets
//    loaded after level 1 is complete.
// 3. Add in a title screen
// 4. Add in a hud and points for jumping on enemies.
// 5. Add in a `Repeater` behind the TileLayer to create a paralax scrolling effect.

});
