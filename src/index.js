/** GLOBALS **/
// DOM hooks
let canvas = document.getElementById('canvas');
let penTool = document.getElementById('pen');
let eraserTool = document.getElementById('eraser');
let textTool = document.getElementById('text');

// Canvas
let ctx = canvas.getContext('2d');
let canvasX = 0;
let canvasY = 0;
let canvasWidth = ctx.canvas.width;
let canvasHeight = ctx.canvas.height;
let canvasClientWidth = ctx.canvas.clientWidth;
let canvasClientHeight = ctx.canvas.clientHeight;

// Functionality Flags
let isPenDown = false;
let isPenEnabled = false;

/** EVENT LISTENERS **/
canvas.addEventListener('mousedown', (e) => {
  canvasX = (e.pageX / canvasClientWidth) * canvasWidth;
  canvasY = (e.pageY / canvasClientHeight) * canvasHeight;
  ctx.beginPath();
  ctx.moveTo(canvasX, canvasY);
  isPenDown = true;
});

canvas.addEventListener('mouseup', (e) => {
  ctx.closePath();
  isPenDown = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isPenDown) {
    return;
  }

  if (isPenEnabled) {
    canvasX = (e.pageX / canvasClientWidth) * canvasWidth;
    canvasY = (e.pageY / canvasClientHeight) * canvasHeight;
    ctx.lineTo(canvasX, canvasY);
    ctx.stroke();
  }
});

penTool.addEventListener('click', (e) => {
  // Enable Pen
  isPenEnabled = true;
  ctx.globalCompositeOperation = 'source-over';

  // Set active class in tools
  penTool.className = 'active';

  // Unset any previous active class in tools
  eraserTool.className = '';
  textTool.className = '';
});

eraserTool.addEventListener('click', (e) => {
  // Enable Pen (in this case the Pen is an Eraser)
  // The globalCompositeOperation is what enables us to "erase"
  isPenEnabled = true;
  ctx.globalCompositeOperation = 'destination-out';

  // Set active class in tools
  eraserTool.className = 'active';

  // Unset any previous active class in tools
  penTool.className = '';
  textTool.className = '';
});

textTool.addEventListener('click', (e) => {
  // Disable Pen
  isPenEnabled = false;

  // Set active class in tools
  textTool.className = 'active';

  // Unset any previous active class in tools
  eraserTool.className = '';
  penTool.className = '';
});
