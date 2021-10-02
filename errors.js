class Error {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
}

module.exports = {
    InvalidSessionToken: new Error(1, 'Invalid session cookie')
}