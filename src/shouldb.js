class ShouldDB {

    constructor() {
        if (typeof(Storage) === "undefined") {
            console.warn('WEBSTORAGE NOT SUPPORTED')
        }

        this.ls = window.localStorage

        if (this.ls.getItem('shouldb') !== undefined) {
            this.ls.setItem('shouldb', this.js())
        }

        if (this.ls.getItem('shouldb_schemas') !== undefined) {
            this.ls.setItem('shouldb_schemas', this.js())
        }
    }

    insert(model, obj) {
        
        let schema = this.getSchema(model);
        if (schema === undefined) return false;

        let db = this.getDB();

        obj = Object.assign({}, schema.schema, {__sdbKey: schema.lastId+1}, obj);

        db[model].push(obj);

        this.setDB(db);
        this.setSchema(model, schema.schema, schema.lastId+1)

        return obj;
    
    }

    select(model, id) {
       return this.getDB(model).filter(obj => obj.__sdbKey === id)[0] || false;
    }

    // find(model, filters) {
    //     return this.getDB(model).filter(obj => {
    //         for(var i = 0; i < filters.length; i++) {
    //             console.log('tentando descobrir se ',obj[filters[i][0]],'===',filters[i][1]);
    //             return (obj[filters[i][0]] === filters[i][1]);
    //         }
    //     }) || false;
    // }    

    create(model, obj) {

        let db = this.getDB();
        db[model] = [];

        this.setSchema(model, obj);

        return this.setDB(db);
    }


    // -- //
    getDB(model = null) {
        if (model !== null) {
            let db = this.jp(this.ls.getItem('shouldb'));
            return db[model] || [];
        }

        return this.jp(this.ls.getItem('shouldb'));
    }

    setDB(db) {
        return this.ls.setItem('shouldb', this.js(db));
    }

    getSchema(model) {

        let state = this.jp(this.ls.getItem('shouldb_schemas'));

        return (state[model]);
    }

    setSchema(model, schema, lastId = 0) {

        let state = this.jp(this.ls.getItem('shouldb_schemas'));

        state[model] = Object.assign({}, { schema, lastId });

        return this.ls.setItem('shouldb_schemas', this.js(state));
    }


    // -- //

    js(obj = {}) {
        return JSON.stringify(obj);
    }

    jp(obj = {}) {
        return JSON.parse(obj);
    }
}
