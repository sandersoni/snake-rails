import consumer from "channels/consumer"

const snake_col_default = 'lightblue';

var snakeColours = {}
var user_id = Date.now()
var score = 0

const gameChannel = consumer.subscriptions.create({channel: "GameChannel", user_id: user_id}, {
  connected() {
    // Called when the subscription is ready for use on the server
    console.log('js subscription connected')
    game_init()

  },

  disconnected() {
    // Called when the subscription has been terminated by the server
    console.log('js subscription disconnected')
  },

  received(data) {
    var new_data = JSON.parse(data)
    // console.log(new_data)
    if (new_data.type == 'tick') {
      clear_board()

      for (var key in new_data.users) {
        if (new_data.users[key]["colour"] != null) {
          // console.log('user ', key, ' has colour ', new_data.users[key]["colour"])
          snakeColours[key] = new_data.users[key]["colour"]
        } else {
          // console.log('user ', key, ' has default colour')
          snakeColours[key] = snake_col_default
        }
        if (key == user_id) {
          score = new_data.users[key].score
          document.getElementById('score').innerHTML = score;
        }
      }
      draw_snakes(new_data.snakes)
      draw_food(new_data.food)
    }
    // Called when there's incoming data on the websocket for this channel
  }
});

document.getElementById("start").onclick = function() {start_button()};

var colorWell;
var defaultColor = "#ADD8E6";

window.addEventListener("load", startup, false);

function startup() {
  colorWell = document.querySelector("#colorWell");
  colorWell.value = defaultColor;
  colorWell.addEventListener("change", updateColour, false);
  colorWell.select();
}

function updateColour(event) {
  console.log('changing colour to ', event.target.value)
  gameChannel.perform("change_colour", {snake_colour: event.target.value});
}

const board_border = 'black';
const board_background = "white";

const snake_border = 'darkblue';

// Get the canvas element
var snakeboard = document.getElementById("snakeboard");
// Return a two dimensional drawing context
var snakeboard_ctx = snakeboard.getContext("2d");

function start_button() {
  console.log('start pressed')
  gameChannel.perform("add_snake", {});
}

function draw_snakes(snakes) {

  console.log("number of snakes: ", Object.keys(snakes).length)

  for (var key in snakes) {
    // console.log(key, snakes[key])
    draw_snake(snakes[key], snakeColours[key])
  }

}

// Draw the snake on the canvas
function draw_snake(snake, colour) {
  // Draw each part
  // console.log(snake)
  let first = true

  snake.coords.forEach((segment) => {
    // console.log(segment)

    if (first == true && snake.dead != true) {
      // console.log('making first')
      snakeboard_ctx.fillStyle = colour;
      snakeboard_ctx.strokestyle = snake_border;

      snakeboard_ctx.beginPath()

      // if (snake.direction == 'px') {
      //   snakeboard_ctx.moveTo(segment.x*10, segment.y*10)
      //   snakeboard_ctx.lineTo(segment.x*10, segment.y*10 + 10)
      //   snakeboard_ctx.lineTo(segment.x*10 + 10, segment.y*10 + 5)
      // } else if (snake.direction == 'nx') {
      //   snakeboard_ctx.moveTo(segment.x*10 + 10, segment.y*10 + 10)
      //   snakeboard_ctx.lineTo(segment.x*10 + 10, segment.y*10)
      //   snakeboard_ctx.lineTo(segment.x*10, segment.y*10 + 5)
      // } else if (snake.direction == 'py') {
      //   snakeboard_ctx.moveTo(segment.x*10, segment.y*10 )
      //   snakeboard_ctx.lineTo(segment.x*10 + 10, segment.y*10)
      //   snakeboard_ctx.lineTo(segment.x*10 + 5, segment.y*10 + 10)
      // } else if (snake.direction == 'ny') {
      //   snakeboard_ctx.moveTo(segment.x*10 + 10, segment.y*10 + 10)
      //   snakeboard_ctx.lineTo(segment.x*10, segment.y*10 + 10)
      //   snakeboard_ctx.lineTo(segment.x*10 + 5, segment.y*10)
      // }

      if (snake.direction == 'px') {
        snakeboard_ctx.moveTo(segment.x*10, segment.y*10)
        snakeboard_ctx.lineTo(segment.x*10 + 10, segment.y*10)
        snakeboard_ctx.lineTo(segment.x*10 + 5, segment.y*10 + 5)
        snakeboard_ctx.lineTo(segment.x*10 + 10, segment.y*10 + 10)
        snakeboard_ctx.lineTo(segment.x*10, segment.y*10 + 10)
      } else if (snake.direction == 'nx') {
        snakeboard_ctx.moveTo(segment.x*10 + 10, segment.y*10 + 10)
        snakeboard_ctx.lineTo(segment.x*10, segment.y*10 + 10)
        snakeboard_ctx.lineTo(segment.x*10 + 5, segment.y*10 + 5)
        snakeboard_ctx.lineTo(segment.x*10, segment.y*10)
        snakeboard_ctx.lineTo(segment.x*10 + 10, segment.y*10)
      } else if (snake.direction == 'py') {
        snakeboard_ctx.moveTo(segment.x*10, segment.y*10)
        snakeboard_ctx.lineTo(segment.x*10, segment.y*10 + 10)
        snakeboard_ctx.lineTo(segment.x*10 + 5, segment.y*10 + 5)
        snakeboard_ctx.lineTo(segment.x*10 + 10, segment.y*10 + 10)
        snakeboard_ctx.lineTo(segment.x*10 + 10, segment.y*10)
      } else if (snake.direction == 'ny') {
        snakeboard_ctx.moveTo(segment.x*10 + 10, segment.y*10 + 10)
        snakeboard_ctx.lineTo(segment.x*10 + 10, segment.y*10)
        snakeboard_ctx.lineTo(segment.x*10 + 5, segment.y*10 + 5)
        snakeboard_ctx.lineTo(segment.x*10, segment.y*10)
        snakeboard_ctx.lineTo(segment.x*10, segment.y*10 + 10)
      }
      
      snakeboard_ctx.closePath()
      snakeboard_ctx.fill()  
      snakeboard_ctx.stroke()      


      first = false
    } else {
      // console.log('making body')
      // Set the colour of the snake part
      snakeboard_ctx.fillStyle = colour;
      // Set the border colour of the snake part
      snakeboard_ctx.strokestyle = snake_border;
      // Draw a "filled" rectangle to represent the snake part at the coordinates
      // the part is located
      snakeboard_ctx.fillRect(segment.x*10, segment.y*10, 10, 10);
      // Draw a border around the snake part
      snakeboard_ctx.strokeRect(segment.x*10, segment.y*10, 10, 10);
    }

  })

}


// draw a border around the canvas
function clear_board() {
  //  Select the colour to fill the drawing
  snakeboard_ctx.fillStyle = board_background;
  //  Select the colour for the border of the canvas
  snakeboard_ctx.strokestyle = board_border;
  // Draw a "filled" rectangle to cover the entire canvas
  snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
  // Draw a "border" around the entire canvas
  snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

function draw_food(food) {

  food.forEach((cell) => {
  snakeboard_ctx.fillStyle = 'lightgreen';
  snakeboard_ctx.strokestyle = 'darkgreen';
  snakeboard_ctx.fillRect(cell.x*10, cell.y*10, 10, 10);
  snakeboard_ctx.strokeRect(cell.x*10, cell.y*10, 10, 10);
  })
}

function game_init() {
  // Get the canvas element
  snakeboard = document.getElementById("snakeboard");
  // Return a two dimensional drawing context
  snakeboard_ctx = snakeboard.getContext("2d");

  // set up board
  clear_board();
  
  document.addEventListener("keydown", send_key);

  function send_key(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const W_KEY = 87;
    const A_KEY = 65;
    const S_KEY = 83;
    const D_KEY = 68;
    const SPACEBAR = 32;
    const keyPressed = event.keyCode;

    if (keyPressed === LEFT_KEY || RIGHT_KEY || UP_KEY || DOWN_KEY ||  W_KEY || A_KEY || S_KEY || D_KEY || SPACEBAR) {
      gameChannel.perform("direction", { keySent: keyPressed });
    }

  }
    
}
