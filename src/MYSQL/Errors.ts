export class AlreadyConnectedError extends Error {
    message = 'This SQLConnection has already connected'
}

export class NotYetConnectedError extends Error {
    message = 'This SQLConnection does not yet have a connection and can not be disconnected'
}