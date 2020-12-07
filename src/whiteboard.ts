// NOTE `io` will be available from cdn script
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
const defaultLineWidth = 5;
const eraserLineWidth = 20;
let canvasX = 0;
let canvasY = 0;

ctx.lineWidth = defaultLineWidth;

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
 * Creates a textbox positioned at the coordinates given
 *
 * Events:
 * - input: resize the textarea when the content goes beyond the current dimensions.
 * - change: delete the element if there is no content
 */
const createTextbox = (x, y) => {
  const textbox = document.createElement('div');
  textbox.setAttribute('contenteditable', 'true');
  textbox.style.transform = `translate(${x}px,${y}px)`;

  textbox.addEventListener('blur', ({ target }) => {
    if (textbox.textContent.length === 0) {
      textbox.parentNode.removeChild(textbox);
    }
  });
  whiteboard.insertAdjacentElement('beforeend', textbox);
  textbox.focus();
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

  // Send socket message to draw
  // @ts-ignore
  socket.emit('mousedown', e.pageX, e.pageY);
});

canvas.addEventListener('mouseup', (e) => {
  ctx.closePath();
  isPenDown = false;

  // @ts-ignore
  socket.emit('mouseup');
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

    // @ts-ignore
    socket.emit('mousemove', e.pageX, e.pageY);
  }
});

penTool.addEventListener('click', (e) => {
  ctx.lineWidth = defaultLineWidth;
  // Enable Pen
  isPenEnabled = true;
  ctx.globalCompositeOperation = 'source-over';

  setActiveTool('pen');
});

eraserTool.addEventListener('click', (e) => {
  ctx.lineWidth = eraserLineWidth;
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

// Kudos to the forever helpful Christian Heilmann
// https://christianheilmann.com/2020/11/01/back-to-basics-event-delegation/
document
  .querySelector('.colour-picker[data-tool=pen]')
  .addEventListener('click', (e) => {
    const { target } = e;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }
    const { dataset } = target;

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

/** TEXT TOOL **/
whiteboard.addEventListener('click', (e) => {
  const targetElem = e.target as HTMLElement;
  if (
    whiteboard.classList.contains('add-text') &&
    targetElem.tagName !== 'DIV'
  ) {
    createTextbox(e.pageX, e.pageY);
  }
});

whiteboard.addEventListener('focusin', (e) => {
  const targetElem = e.target as HTMLElement;

  if (
    targetElem.tagName === 'DIV' &&
    !whiteboard.classList.contains('add-text')
  ) {
    e.preventDefault();
  }
});

/** SIDE **/
// Toggle views
document.querySelector('#selector').addEventListener('click', (e) => {
  // Get the selected view
  const { target } = e;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  const {
    dataset: { view },
  } = target;

  // Set the selected view as active
  document.querySelectorAll('.component').forEach((node) => {
    if (node.classList.contains('active')) {
      node.classList.remove('active');
    }
    if (node.id === view) {
      node.classList.add('active');
    }
  });
});

/** ADMIN **/
document.querySelector('#clear-btn').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

/** SOCKET **/
// @ts-ignore
socket.on('mousedown', (e: { pageX: number; pageY: number }) => {
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

// @ts-ignore
socket.on('mouseup', () => {
  ctx.closePath();
  isPenDown = false;
});

// @ts-ignore
socket.on('mousemove', (e: { pageX: number; pageY: number }) => {
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
