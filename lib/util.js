const fs = require('fs');

const ensureSlug = (string) => {
    string = string.toLowerCase();
    string = string.replace(/[^0-9a-z]/gi, '_');
    string = string.replace(/_+/g, '_');
    if (string[0] === '_') {
        string = string.slice(1);
    }
    if (string[string.length - 1] === '_') {
        string = string.slice(0, -1)
    }
    return string.toLowerCase()
}

const createFile = (file = {path, filename, type: 'json'}, data, cb = (err) => {
    if (err) {
        console.error(`[${item_name}] Error while saving to file`);
        throw err;
    }
}) => {

    if (!fs.existsSync(file.path)){
        fs.mkdirSync(file.path);
    }

    fs.writeFile(`${file.path}/${file.filename}.${file.type}`, data, (err) => cb(err))
}

module.exports = {ensureSlug, createFile}