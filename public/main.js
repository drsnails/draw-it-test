'use strict'
let gElCanvas
/**
 * The 2D rendering context of the canvas element.
 * @type {CanvasRenderingContext2D}
 */
let gCtx
let gLastPos = null
let gIsMouseDown = false;
let gBrush = {
    color: 'black',
    size: 2,
    shape: 'pencil',
}
let gSocket

let gLastPositions = []





function onInit() {
    gElCanvas = document.querySelector('canvas')
    gCtx = gElCanvas.getContext('2d')
    // resizeCanvas()
    gSocket = io()
    socketService.on('server-drawing', ({ pos, brush }) => {
        // const pos = getEvPos(ev)
        const lastPos = gLastPositions.at(-1) || { ...pos }
        gLastPositions.push(pos)
        const draw = drawFns[brush.shape]
        draw({ pos, brush, lastPos })
        clearServerLastPos()
    })
}

const clearServerLastPos = debounce(() => {
    gLastPositions.push(null)
}, 500)

const drawFns = {
    pencil: drawPencil
}


function onDown(ev) {
    const pos = getEvPos(ev)
    gIsMouseDown = true
    gLastPos = pos

}

function onMove(ev) {
    if (!gIsMouseDown) return
    const pos = getEvPos(ev)

    const draw = drawFns[gBrush.shape]
    draw({ pos })
    socketService.emit('client-drawing', { brush: gBrush, pos, lastPos: gLastPos })
    //* Update start position for next move calculation
    gLastPos = pos

    //* Redraw the canvas with updated circle position
}



function drawPencil({ pos, brush = gBrush, lastPos = gLastPos }) {
    gCtx.beginPath()
    gCtx.moveTo(lastPos.x, lastPos.y)
    gCtx.lineTo(pos.x, pos.y)
    gCtx.lineCap = 'round'
    gCtx.strokeStyle = brush.color
    gCtx.lineWidth = brush.size
    gCtx.stroke()

}


function onUp() {
    gIsMouseDown = false
}

function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
}

function getEvPos(ev) {
    const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

    let pos = {
        x: ev.offsetX,
        y: ev.offsetY,
    }

    if (TOUCH_EVS.includes(ev.type)) {
        //* Prevent triggering the default mouse behavior
        ev.preventDefault()

        //* Gets the first touch point (could be multiple in touch event)
        ev = ev.changedTouches[0]

        /* 
        * Calculate touch coordinates relative to canvas 
        * position by subtracting canvas offsets (left and top) from page coordinates
        */
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
            // x: ev.pageX ,
            // y: ev.pageY ,
        }
    }
    return pos
}