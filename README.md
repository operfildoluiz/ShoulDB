# ShoulDB

Use **localStorage** as a small database with schemas, auto-increment IDs, and a fluent API. Works in the browser and in Node (with a storage mock). Safe when `localStorage` is missing (e.g. SSR).

- **Node:** `>=18.0.0`

## Install

```bash
npm install shouldb
```

## Quick start

```javascript
const ShoulDB = require('shouldb');  // or: import ShoulDB from 'shouldb'
const db = new ShoulDB();

// 1. Define a model (schema = default fields for new records)
db.create('users', { name: '', age: 0, role: 'user' });

// 2. Fluent API: insert, get by id, find by filter
db.should('users').be({ name: 'Alice', age: 30 });   // insert → { __sdbKey: 1, name: 'Alice', age: 30, role: 'user' }
db.should('users').be({ name: 'Bob', role: 'admin' }); // insert → { __sdbKey: 2, name: 'Bob', age: 0, role: 'admin' }

db.should('users').have(1);                          // get by id → { __sdbKey: 1, name: 'Alice', ... }
db.should('users').find({ role: 'admin' });         // filter → [ { __sdbKey: 2, name: 'Bob', role: 'admin', ... } ]

// 3. Direct API (same thing)
db.insert('users', { name: 'Carol' });
db.select('users', 3);
db.find('users', { role: 'user' });

// 4. Wipe everything
db.clear();
```

## API

| Method | Description |
|--------|-------------|
| `create(model, schemaObj)` | Define a model and default field values for new records. |
| `should(model)` | Fluent API: returns `{ be(obj), have(id), find(filter) }`. |
| `insert(model, obj)` | Insert a record; merges with schema defaults and assigns `__sdbKey`. |
| `select(model, id)` | Get one record by `__sdbKey`; returns `null` if not found. |
| `find(model, filter)` | Get all records where every `filter` key matches the record. |
| `clear()` | Wipe the database and all schemas. |
| `getDB(model?)` | Raw DB object or one model’s array. |
| `getSchema(model)` | Get `{ schema, lastId }` for a model. |

Records always get an auto-increment **`__sdbKey`**. Schema defaults are applied on insert; you can override or omit fields.

## Tests

```bash
npm test
```

Uses a simple `console.assert` test suite; in Node, `localStorage` is mocked so tests run without a browser.

## License

MIT
