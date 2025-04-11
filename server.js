import path from 'path'
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static(path.resolve('public')))



io.on('connection', (socket) => {

    socket.on('set-user-socket', () => {
        console.log('user connected')
        socket.userId = socket.id
    })

    socket.on('client-drawing', async (data) => {
        socket.broadcast.emit('server-drawing', data)
    })

    socket.on('client-pencil-up', async (data) => {
        socket.broadcast.emit('server-pencil-up')
    })


    socket.on('disconnect', () => {
        console.log('User disconnect')
    })
})



async function _getUserSocket(nickname) {
    const sockets = await _getAllSockets();
    const socket = sockets.find(s => s.nickname === nickname)
    return socket;
}

async function _getAllSockets() {
    // return all Socket instances
    const sockets = await io.fetchSockets();
    return sockets;
}



server.listen(3030, () => {
    console.log('server running at http://localhost:3030');
});
