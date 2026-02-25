/**
 * Simple console.assert tests for ShoulDB v2.
 * Run: npm test or node src/shouldb.test.js
 *
 * In Node, localStorage is mocked so tests can run without a browser.
 */

if (typeof window === 'undefined') {
  const storage = {};
  global.localStorage = {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => { storage[key] = String(value); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { for (const k of Object.keys(storage)) delete storage[k]; },
    get length() { return Object.keys(storage).length; },
    key: (i) => Object.keys(storage)[i] ?? null,
  };
  global.window = { localStorage: global.localStorage };
}

const ShoulDB = require('./shouldb.js');

function run() {
  const db = new ShoulDB();

  const model = 'test_users_' + Date.now();
  const schema = { name: '', age: 0 };

  // 1. Schema creation
  db.create(model, schema);
  console.assert(db.getSchema(model), 'getSchema(model) after create');
  console.assert(Array.isArray(db.getDB(model)), 'getDB(model) is array');

  // 2. Insert via fluent API: .should(model).be(obj)
  const r1 = db.should(model).be({ name: 'A', age: 21 });
  console.assert(r1 && r1.__sdbKey === 1 && r1.name === 'A' && r1.age === 21, 'should(model).be(): __sdbKey 1, name A, age 21');

  // 3. Auto-increment: second insert has __sdbKey === 2
  const r2 = db.should(model).be({ name: 'B', age: 22 });
  console.assert(r2 && r2.__sdbKey === 2 && r2.name === 'B', 'second insert: __sdbKey 2');

  // 4. Find via fluent API: .should(model).find(filter)
  const found = db.should(model).find({ name: 'A' });
  console.assert(Array.isArray(found) && found.length >= 1 && found[0].name === 'A', 'should(model).find({ name: "A" }) returns matching record(s)');
  const none = db.should(model).find({ name: 'Z' });
  console.assert(Array.isArray(none) && none.length === 0, 'find with no match returns []');

  // 5. Select by id via fluent API: .should(model).have(id)
  const byId = db.should(model).have(1);
  console.assert(byId && byId.__sdbKey === 1, 'should(model).have(1) returns record with __sdbKey 1');
  const missing = db.should(model).have(999);
  console.assert(missing === null, 'should(model).have(999) returns null');

  // 6. clear() wipes DB
  db.clear();
  console.assert(Object.keys(db.getDB()).length === 0, 'clear(): getDB() is empty');
  console.assert(db.getSchema(model) === undefined, 'clear(): schemas wiped');

  console.log('PASS');
}

try {
  run();
} catch (e) {
  console.error('FAIL:', e.message);
  process.exit(1);
}
