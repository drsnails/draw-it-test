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

// let gLastPositions = []
let gLastPositions = {}


const gDrawFns = {
    pencil: drawPencil
}



function onInit() {
    gElCanvas = document.querySelector('canvas')
    gCtx = gElCanvas.getContext('2d')
    resizeCanvas()
    gSocket = io()
    socketService.on('server-drawing', ({ pos, brush, userId }) => {
        pos = getPosPixels(pos)
        gLastPositions[userId] ||= []
        const lastPos = gLastPositions[userId].at(-1) || { ...pos }
        gLastPositions[userId].push(pos)
        const draw = gDrawFns[brush.shape]
        draw({ pos, brush, lastPos })
    })

    socketService.on('server-pencil-up', ({ userId }) => {
        gLastPositions[userId] ||= []
        gLastPositions[userId].push(null)
    })


    document.addEventListener('keydown', ev => {
        if (ev.key === 'Escape' || ev.key.toLowerCase() === 'c') {
            gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)
        }
    })
}



function onDown(ev) {
    const pos = getEvPos(ev)
    gIsMouseDown = true
    gLastPos = pos
}

function onMove(ev) {
    if (!gIsMouseDown) return
    const pos = getEvPos(ev)
    const draw = gDrawFns[gBrush.shape]
    draw({ pos })
    socketService.emit('client-drawing', {
        brush: gBrush,
        pos: getPosPercent(pos),
        lastPos: gLastPos
    })
    gLastPos = pos

}


function onUp() {
    gIsMouseDown = false
    socketService.emit('client-pencil-up')
}

function getPosPercent(pos) {
    return {
        x: pos.x / gElCanvas.width,
        y: pos.y / gElCanvas.height,
    }
}

function getPosPixels(pos) {
    return {
        x: pos.x * gElCanvas.width,
        y: pos.y * gElCanvas.height,
    }
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

function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container')
    let width = elContainer.offsetWidth
    let height = elContainer.offsetHeight
    const minSize = Math.min(window.innerWidth, window.innerHeight) * 0.85
    if (width > minSize || height > minSize) {
        width = minSize
        height = minSize
    } 
    gElCanvas.width = width
    gElCanvas.height = height
}
