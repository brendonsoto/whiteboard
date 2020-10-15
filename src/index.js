/** GLOBALS **/
let canvas = document.getElementById('canvas');
let penTool = document.getElementById('pen');
let eraserTool = document.getElementById('eraser');
let textTool = document.getElementById('text');
let ctx = canvas.getContext('2d');
let isDrawing = false;
let canvasX = 0;
let canvasY = 0;
let canvasWidth = ctx.canvas.width;
let canvasHeight = ctx.canvas.height;
let canvasClientWidth = ctx.canvas.clientWidth;
let canvasClientHeight = ctx.canvas.clientHeight;

/** EVENT LISTENERS **/
canvas.addEventListener('mousedown', (e) => {
  canvasX = (e.pageX / canvasClientWidth) * canvasWidth;
  canvasY = (e.pageY / canvasClientHeight) * canvasHeight;
  ctx.beginPath();
  ctx.moveTo(canvasX, canvasY);
  isDrawing = true;
});

canvas.addEventListener('mouseup', (e) => {
  ctx.closePath();
  isDrawing = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) {
    return;
  }
  canvasX = (e.pageX / canvasClientWidth) * canvasWidth;
  canvasY = (e.pageY / canvasClientHeight) * canvasHeight;
  ctx.lineTo(canvasX, canvasY);
  ctx.stroke();
});

penTool.addEventListener('click', (e) => {
  console.log('CLICKED PEN');
});

eraserTool.addEventListener('click', (e) => {
  console.log('CLICKED ERASER');
});

textTool.addEventListener('click', (e) => {
  console.log('CLICKED TEXT');
});
