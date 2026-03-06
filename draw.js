const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const sizePicker = document.getElementById('sizePicker');
const clearBtn = document.getElementById('clearBtn');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let drawing = false;

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    ctx.lineTo(e.clientX, e.clientY);
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = sizePicker.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});







// History stacks
const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 50;   // limit memory use

function pushState() {
    // Only store if the canvas actually changed
    const dataURL = canvas.toDataURL();
    if (undoStack.length && undoStack[undoStack.length - 1] === dataURL) return;

    if (undoStack.length >= MAX_HISTORY) undoStack.shift();
    undoStack.push(dataURL);
    redoStack.length = 0;
}

// Initialise with a blank state so undo works from the start
pushState();



// Call pushState() when a stroke finishes
canvas.addEventListener('mouseup', () => {
    drawing = false;
    pushState();
});
canvas.addEventListener('mouseleave', () => {
    if (drawing) {
        drawing = false;
        pushState();
    }
});



const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

function restoreFrom(dataURL) {
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
}

// Undo
undoBtn.addEventListener('click', () => {
    if (!undoStack.length) return;
    // move current state to redoStack
    redoStack.push(canvas.toDataURL());

    const previous = undoStack.pop();
    // schedule the draw on the next animation frame for no flicker
    requestAnimationFrame(() => restoreFrom(previous));
});

// Redo
redoBtn.addEventListener('click', () => {
    if (!redoStack.length) return;
    // move current state to undoStack
    undoStack.push(canvas.toDataURL());

    const next = redoStack.pop();
    requestAnimationFrame(() => restoreFrom(next));
});




function getCanvasDataURL() {
    // Create an offscreen canvas so we don't alter the visible one
    const off = document.createElement('canvas');
    off.width  = canvas.width;
    off.height = canvas.height;
    const offCtx = off.getContext('2d');

    // Fill with white
    offCtx.fillStyle = '#ffffff';
    offCtx.fillRect(0, 0, off.width, off.height);

    // Draw the current canvas on top
    offCtx.drawImage(canvas, 0, 0);

    // Return the data URL (PNG)
    return off.toDataURL('image/png');
}



const saveBtn = document.getElementById('saveBtn');
const saveAsBtn = document.getElementById('saveAsBtn');
const loadBtn = document.getElementById('loadBtn');
const loadInput = document.getElementById('loadInput');

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'test_drawing_test.png';
    //link.href = canvas.toDataURL('image/png');
	link.href = getCanvasDataURL();
    link.click();
});


saveAsBtn.addEventListener('click', async () => {
    // Ask the user for a filename
    const suggestedName = prompt('Enter file name (without extension):', 'drawing_app_image');
    if (!suggestedName) return;   // user cancelled

    // Generate the data URL with a white background
    const dataURL = getCanvasDataURL();

    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `${suggestedName}.png`;
    a.click();
});


loadBtn.addEventListener('click', () => loadInput.click());

loadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        pushState();   // treat the loaded image as a new history entry
    };
    img.src = URL.createObjectURL(file);
});





const toolSelect = document.getElementById('toolSelect');
let startX = 0, startY = 0;


let shapeSnapshot = null;   // holds ImageData for the preview start point

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    startX = e.clientX;
    startY = e.clientY;

    const tool = toolSelect.value;
    if (tool === 'pen' || tool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    } else {
        // Capture the current canvas state once, used for all preview frames
        shapeSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const curX = e.clientX;
    const curY = e.clientY;
    const tool = toolSelect.value;

    if (tool === 'pen') {
        ctx.lineTo(curX, curY);
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = sizePicker.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    } else if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(curX, curY);
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = sizePicker.value * 2;
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
    } else {
        // ---- preview ----
        // restore the snapshot (fast because it's ImageData, not a full image load)
        ctx.putImageData(shapeSnapshot, 0, 0);

        ctx.beginPath();
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = sizePicker.value;

        if (tool === 'line') {
            ctx.moveTo(startX, startY);
            ctx.lineTo(curX, curY);
        } else if (tool === 'rect') {
            const w = curX - startX;
            const h = curY - startY;
            ctx.rect(startX, startY, w, h);
        }
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    if (!drawing) return;
    drawing = false;

    // Finalize shape (if we were in line/rect mode the preview already drew the shape)
    if (toolSelect.value !== 'pen' && toolSelect.value !== 'eraser') {
        // No extra drawing needed, the preview already left the shape on the canvas
        // Just push the new state onto the history stack
        pushState();
    } else {
        // pen or eraser, push after the stroke ends
        pushState();
    }

    shapeSnapshot = null;   // clear for the next shape
});

canvas.addEventListener('mouseleave', () => {
    if (drawing) {
        // treat leaving the canvas like mouseup
        canvas.dispatchEvent(new Event('mouseup'));
    }
});






// bucket tool
function floodFill(x, y, fillColor) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = imgData.width;

    const startIdx = (y * width + x) * 4;
    const targetColor = data.slice(startIdx, startIdx + 4); // RGBA array

    // If the target color is already the fill color, stop
    if (colorsMatch(targetColor, fillColor)) return;

    const stack = [[x, y]];
    while (stack.length) {
        const [cx, cy] = stack.pop();
        const idx = (cy * width + cx) * 4;

        if (!colorsMatch(data.slice(idx, idx + 4), targetColor)) continue;

        // Paint current pixel
        data[idx]     = fillColor[0];
        data[idx + 1] = fillColor[1];
        data[idx + 2] = fillColor[2];
        data[idx + 3] = 255;               // fully opaque

        // Push neighboring pixels
        if (cx > 0)               stack.push([cx - 1, cy]);
        if (cx < width - 1)       stack.push([cx + 1, cy]);
        if (cy > 0)               stack.push([cx, cy - 1]);
        if (cy < canvas.height - 1) stack.push([cx, cy + 1]);
    }
    ctx.putImageData(imgData, 0, 0);
    pushState();   // add to undo history
}

function colorsMatch(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

// Convert a CSS hex colour to an [R,G,B] array
function hexToRgbArray(hex) {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return m ? [
        parseInt(m[1], 16),
        parseInt(m[2], 16),
        parseInt(m[3], 16)
    ] : [0, 0, 0];
}

// Bucket tool mouse handler
canvas.addEventListener('mousedown', (e) => {
    if (toolSelect.value !== 'bucket') return;   // ignore other tools
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    const fillRgb = hexToRgbArray(colorPicker.value);
    floodFill(x, y, fillRgb);
});