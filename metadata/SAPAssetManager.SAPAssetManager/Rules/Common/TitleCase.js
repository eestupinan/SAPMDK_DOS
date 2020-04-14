/**
 * Credits: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
 * @param {String} inputString input to be converted to Title Case
 * @returns Title Case'ed string
 */
export default function TitleCase(inputString) {
    if (inputString) {
        return inputString.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    } else {
        return '';
    }
}
