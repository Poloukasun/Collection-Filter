export default class CollectionFilter {
    constructor(objects, params, model) {
        this.objects = objects;
        this.params = params;
        this.model = model;
    }
    get() {
        let object = JSON.parse(JSON.stringify(this.objects));
        if (this.params != null) {
            let keys = Object.keys(this.params);

            if (keys[0] == "field") {
                let keyValue = this.params[keys[0]].split(',');

                let result = {};
                keyValue.forEach(key => {
                    if (object[0][key]) {
                        result[key] = [...new Set(object.map(o => o[key]))];
                    }
                });
                return [result];
            }
            // else
            keys.forEach(k => {
                if (this.model.isMember(k)) {
                    object = object.filter(o => this.valueMatch(o[k], this.params[keys[keys.indexOf(k)]]));
                }
            })

            if (keys.includes("sort")) {
                let keyValue = this.params[keys[keys.indexOf("sort")]].split(',');
                keyValue[0] = keyValue[0].replace(keyValue[0][0], keyValue[0][0].toUpperCase()); // Format keyValue
                if (this.model.isMember(keyValue[0]) && keyValue.length <= 2) {
                    if (keyValue[1] == 'desc') {
                        object = object.sort((a, b) => this.innerCompare(a[keyValue[0]], b[keyValue[0]]) * -1); // SORT Desc
                    } else if (keyValue[1] == null) {
                        object = object.sort((a, b) => this.innerCompare(a[keyValue[0]], b[keyValue[0]])); // SORT Asc
                    }
                }
            }

            if (keys.includes("limit")) {
                let offset = keys.includes('offset') ? parseInt(this.params[keys[keys.indexOf('offset')]]) : 0;
                let limit = parseInt(this.params[keys[keys.indexOf('limit')]]);

                if (!isNaN(limit)) {
                    let startIndex = offset * limit;
                    let endIndex = startIndex + limit;
                    object = object.slice(startIndex, endIndex); // return
                }
            }
        }
        return object;
    }

    // get() {
    //     let object = JSON.parse(JSON.stringify(this.objects));
    //     if (this.params != null) {
    //         let keys = Object.keys(this.params);
    //         let keyValue = this.params[keys[0]];

    //         // keys.forEach(key => {
    //         if (this.model.isMember(keys[0])) {
    //             object = object.filter(o => this.valueMatch(o[keys[0]], keyValue));
    //         } else if (keys[0] == "sort") {
    //             keyValue = this.params[keys[0]].split(',');
    //             if (this.model.isMember(keyValue[0]) && keyValue.length <= 2) {
    //                 if (keyValue[1] == 'desc') {
    //                     object.sort((a, b) => a[keyValue[0]] > b[keyValue[0]] ? -1 : 1); // SORT Desc
    //                 } else if (keyValue[1] == null) {
    //                     object.sort((a, b) => a[keyValue[0]] > b[keyValue[0]] ? 1 : -1); // SORT Asc
    //                 }
    //             }
    //         } else if (keys[0] == "limit") {
    //             let offset = keys[1] == 'offset' ? parseInt(this.params[keys[1]]) : 0;
    //             let limit = parseInt(keyValue);
    //             if (!isNaN(limit)) {
    //                 let startIndex = offset * limit;
    //                 let endIndex = startIndex + limit;

    //                 object = object.slice(startIndex, endIndex); // return
    //             }
    //         } else if (keys[0] == "field") {
    //             keyValue = this.params[keys[0]].split(',');

    //             let result = {};
    //             keyValue.forEach(key => {
    //                 if (object[0][key]) {
    //                     result[key] = [...new Set(object.map(o => o[key]))];
    //                 }
    //             });
    //             return [result];
    //         }
    //         // });
    //     }
    //     return object;
    // }
    valueMatch(value, searchValue) {
        try {
            let exp = '^' + searchValue.toLowerCase().replace(/\*/g, '.*') + '$';
            return new RegExp(exp).test(value.toString().toLowerCase());
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    compareNum(x, y) {
        if (x === y) return 0;
        else if (x < y) return -1;
        return 1;
    }
    innerCompare(x, y) {
        if ((typeof x) === 'string')
            return x.localeCompare(y);
        else
            return this.compareNum(x, y);
    }
}