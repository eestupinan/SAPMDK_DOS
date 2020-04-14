module.exports = function(content) {
	this.cacheable && this.cacheable();

    // validation:
    // 1: any alphanumeric in 1 word
    // 2: '=' sign, with or without space on before and after
    // 3: any value
    // 4: new line as ending (optional)

    // bypass:
    // 1: comment lines (#)
    // 2: empty or space only lines

    // example:
    // hello=Hello!
    // test = Testing

    // var re = new RegExp(/(?:[\n]{0,1})(\w+)(?:=)("[^\n]*")(?:[\n]{0,1})/gm);
    var re = new RegExp(/^(\w+\s?=\s?)([^\n]*)(?:[\n]{0,1})/gm);
    var valueArr = content.split('\n');
    if(valueArr.length >= 1) {
        var result = false;
        for(var i = 0; i < valueArr.length; i++) {
            result = false;
            // bypass comment line (starts with #) and empty line
            if (valueArr[i].indexOf('#') === 0 || valueArr[i].trim() === '') {                
                result = true;
            } else {
                re.lastIndex = 0;
                result = re.test(valueArr[i]);
            }
            if(!result) {
                break;
            }
        }
        if(!result) {
            throw new Error("Invalid i18n properties strings file.");
        }
    }
    
    return "module.exports = " + JSON.stringify(content);
}