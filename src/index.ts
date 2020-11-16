/** GLOBALS **/
// DOM hooks
const whiteboard = document.getElementById('whiteboard');
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const penTool = document.getElementById('pen');
const eraserTool = document.getElementById('eraser');
const textTool = document.getElementById('text');
let colourPickerButtons = document.querySelectorAll('.colour');
let colourChoices = document.querySelectorAll('.colour-choice');

const tools = [penTool, eraserTool, textTool];

// Canvas
canvas.width = whiteboard.clientWidth;
canvas.height = whiteboard.clientHeight;
const ctx = canvas.getContext('2d');
const canvasWidth = ctx.canvas.width;
const canvasHeight = ctx.canvas.height;
const canvasClientWidth = ctx.canvas.clientWidth;
const canvasClientHeight = ctx.canvas.clientHeight;
let canvasX = 0;
let canvasY = 0;

// Functionality Flags
let isPenDown = false;
let isPenEnabled = false;

/** HELPERS **/
/**
 * Unsets all other active tools and sets current tool
 * @param {string} toolId - tool to set active
 */
const setActiveTool = (toolId) => {
  tools.forEach((elem) => {
    if (elem.id === toolId) {
      elem.classList.add('active');
    } else if (elem.classList.contains('active')) {
      elem.classList.remove('active');
    }
  });

  if (toolId === 'text') {
    whiteboard.classList.add('add-text');
  } else if (whiteboard.classList.contains('add-text')) {
    whiteboard.classList.remove('add-text');
  }
};

/**
 * Creates a textarea elem positioned at the coordinates given
 */
const createTextarea = (x, y) => {
  const textarea = document.createElement('textarea');
  textarea.style.transform = `translate(${x}px,${y}px)`;
  whiteboard.insertAdjacentElement('beforeend', textarea);
  textarea.focus();
};

/** EVENT LISTENERS **/
/** UTIL **/
window.addEventListener('resize', () => {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight * 0.8;
});

/** DRAWING **/
canvas.addEventListener('mousedown', (e) => {
  // Close any active tool menus that may be open
  document
    .querySelectorAll('.colour-picker')
    .forEach((elem) => elem.classList.add('hidden'));

  /* NOTE The canvas has different dimensions than the browser window, so we're setting the correct coordinates here */
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

  setActiveTool('pen');
});

eraserTool.addEventListener('click', (e) => {
  // Enable Pen (in this case the Pen is an Eraser)
  // The globalCompositeOperation is what enables us to "erase"
  isPenEnabled = true;
  ctx.globalCompositeOperation = 'destination-out';

  setActiveTool('eraser');
});

textTool.addEventListener('click', (e) => {
  // Disable Pen
  isPenEnabled = false;

  setActiveTool('text');
  whiteboard.classList.add('add-text');
});

/** COLOUR PIKCERS **/
colourPickerButtons.forEach((elem) => {
  elem.addEventListener('click', (e) => {
    if (!(e.target instanceof HTMLButtonElement)) {
      return;
    }
    const {
      target: { dataset },
    } = e;
    document
      .querySelector(`.colour-picker[data-tool=${dataset.tool}]`)
      .classList.toggle('hidden');
  });
});

colourChoices.forEach((elem) => {
  elem.addEventListener('click', (e) => {
    if (!(e.target instanceof HTMLButtonElement)) {
      return;
    }
    const {
      target: { dataset },
    } = e;

    console.log('COLOUR CLICKED', dataset.colour);

    // Set the stroke colour
    ctx.strokeStyle = dataset.colour;

    // Set the colour of the corresponding colour picker button to the active colour
    document.querySelector<HTMLButtonElement>(
      `.colour[data-tool=${dataset.tool}]`,
    ).dataset.colour = dataset.colour;

    // Set the active class
    colourChoices.forEach((elem: HTMLButtonElement) => {
      if (elem.dataset.colour === dataset.colour) {
        elem.classList.add('active');
      } else if (elem.classList.contains('active')) {
        elem.classList.remove('active');
      }
    });
  });
});

/** TEXT TOOL **/
whiteboard.addEventListener('click', (e) => {
  if (whiteboard.classList.contains('add-text')) {
    createTextarea(e.pageX, e.pageY);
  }
});
