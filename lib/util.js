
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

module.exports = {ensureSlug}