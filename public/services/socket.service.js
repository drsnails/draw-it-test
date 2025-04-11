'use strict'




const SOCKET_EMIT_LOGIN = 'set-user-socket'
const SOCKET_EMIT_LOGOUT = 'unset-user-socket'


// const baseUrl = (process.env.NODE_ENV === 'production') ? '' : '//localhost:3030'
const socketService = createSocketService()
// export const socketService = createDummySocketService()

// for debugging from console
window.socketService = socketService

socketService.setup()


function createSocketService() {
    var socket = null
    const socketService = {
        setup() {
            const user = null
            socket = io()
            this.login()
        },
        on(eventName, cb) {
            socket.on(eventName, cb)
        },
        off(eventName, cb = null) {
            if (!socket) return
            if (!cb) socket.removeAllListeners(eventName)
            else socket.off(eventName, cb)
        },
        emit(eventName, data) {
            socket.emit(eventName, data)
        },
        login() {
            socket.emit(SOCKET_EMIT_LOGIN, 'LOGIN')
        },
        logout() {
            socket.emit(SOCKET_EMIT_LOGOUT)
        },
        terminate() {
            socket = null
        },

    }
    return socketService
}
