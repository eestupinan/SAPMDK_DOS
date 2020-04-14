
export default class {

    /**
     * Format latitude/logitude as human readable output from a location json string
     * @param {String} locationString - Location JSON object as String
     * @returns {@nullable String} - '{latitude}, {longitude}' with 4 decimal precision 
     */
    static formatLocationStringObject(locationString) {
        let obj = JSON.parse(locationString);
        if (obj.x && obj.y) {
            return obj.y.toFixed(4) + ', ' + obj.x.toFixed(4);
        }
        return null;
    }

}
