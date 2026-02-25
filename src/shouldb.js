/**
 * ShoulDB v2 – localStorage as a small database with schemas and fluent API.
 * Requires Node >= 18 or a browser with localStorage.
 */

/**
 * @typedef {Object} FluentAPI
 * @property {(obj: Object) => (Object|null)} be - Insert a record (alias for insert).
 * @property {(id: number) => (Object|null)} have - Get a record by id (alias for select).
 * @property {(filter: Object) => Array} find - Get records matching filter.
 */

class ShoulDB {
  /**
   * Create a ShoulDB instance. Safe in SSR/Node if localStorage is missing (no-op storage).
   */
  constructor() {
    this.ls = typeof window !== 'undefined' ? window.localStorage : null;
    if (!this.ls) {
      console.warn('ShoulDB: Storage not supported.');
      return;
    }
    if (!this.ls.getItem('shouldb')) this.setDB({});
    if (!this.ls.getItem('shouldb_schemas')) this.ls.setItem('shouldb_schemas', JSON.stringify({}));
  }

  /**
   * Fluent API for a model: .should(model).be(obj) | .have(id) | .find(filter).
   * @param {string} model - Model/table name.
   * @returns {FluentAPI}
   */
  should(model) {
    return {
      be: (obj) => this.insert(model, obj),
      have: (id) => this.select(model, id),
      find: (filter) => this.find(model, filter),
    };
  }

  /**
   * Insert a record; merges with schema defaults and assigns __sdbKey.
   * @param {string} model - Model name.
   * @param {Object} obj - Record fields (overrides schema defaults).
   * @returns {(Object|false)} Inserted record with __sdbKey, or false if schema missing or no storage.
   */
  insert(model, obj) {
    if (!this.ls) return false;
    const schema = this.getSchema(model);
    if (!schema) return false;

    const db = this.getDB();
    const nextId = (schema.lastId || 0) + 1;
    const record = { ...schema.schema, ...obj, __sdbKey: nextId };
    db[model] = db[model] || [];
    db[model].push(record);

    this.setDB(db);
    this.setSchema(model, schema.schema, nextId);
    return record;
  }

  /**
   * Get one record by __sdbKey id.
   * @param {string} model - Model name.
   * @param {number} id - __sdbKey value.
   * @returns {(Object|null)} Record or null if not found or no storage.
   */
  select(model, id) {
    if (!this.ls) return null;
    const data = this.getDB(model);
    return data.find((obj) => obj.__sdbKey === id) ?? null;
  }

  /**
   * Get all records where every filter key matches the record value.
   * @param {string} model - Model name.
   * @param {Object} filter - Key-value pairs to match.
   * @returns {Array} Matching records (empty array if no storage).
   */
  find(model, filter) {
    if (!this.ls) return [];
    const data = this.getDB(model);
    return data.filter((obj) =>
      Object.keys(filter).every((key) => obj[key] === filter[key])
    );
  }

  /**
   * Define a model and its default schema (field defaults for new records).
   * @param {string} model - Model name.
   * @param {Object} schemaObj - Default keys and values for records.
   * @returns {boolean} True if storage is available and create ran.
   */
  create(model, schemaObj) {
    if (!this.ls) return false;
    const db = this.getDB();
    db[model] = db[model] || [];
    this.setSchema(model, schemaObj);
    this.setDB(db);
    return true;
  }

  /**
   * Wipe the database and all schemas. No-op if storage is not available.
   * @returns {boolean} True if storage was cleared.
   */
  clear() {
    if (!this.ls) return false;
    this.ls.setItem('shouldb', JSON.stringify({}));
    this.ls.setItem('shouldb_schemas', JSON.stringify({}));
    return true;
  }

  /**
   * Get raw DB (all models) or one model's array. Uses safe parse to avoid "undefined" string errors.
   * @param {string|null} [model=null] - If set, return that model's array; otherwise full DB.
   * @returns {(Object|Array)} Full db object or model's record array.
   */
  getDB(model = null) {
    if (!this.ls) return model ? [] : {};
    const data = JSON.parse(this.ls.getItem('shouldb') || '{}');
    return model ? (data[model] || []) : data;
  }

  /**
   * Persist the full DB object.
   * @param {Object} db - Full database object keyed by model name.
   */
  setDB(db) {
    if (!this.ls) return;
    this.ls.setItem('shouldb', JSON.stringify(db));
  }

  /**
   * Get schema and lastId for a model. Safe parse.
   * @param {string} model - Model name.
   * @returns {({ schema: Object, lastId: number }|undefined)}
   */
  getSchema(model) {
    if (!this.ls) return undefined;
    const schemas = JSON.parse(this.ls.getItem('shouldb_schemas') || '{}');
    return schemas[model];
  }

  /**
   * Store schema and optional lastId for a model.
   * @param {string} model - Model name.
   * @param {Object} schema - Default record shape.
   * @param {number} [lastId=0] - Last assigned __sdbKey.
   */
  setSchema(model, schema, lastId = 0) {
    if (!this.ls) return;
    const schemas = JSON.parse(this.ls.getItem('shouldb_schemas') || '{}');
    schemas[model] = { schema, lastId };
    this.ls.setItem('shouldb_schemas', JSON.stringify(schemas));
  }
}

module.exports = ShoulDB;
