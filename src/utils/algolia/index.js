const algolia = require("algoliasearch");

class Algolia {
  constructor(index, api_id, api_key) {
    this._index = index;
    this._apiId = api_id;
    this._apiKey = api_key;

    this.connect();
  }

  get apiId() {
    return this._apiId;
  }

  set apiId(api_id) {
    this._apiId = api_id;
    this.connect();
  }

  get apiKey() {
    return this._apiKey;
  }

  set apiKey(api_key) {
    this._apiKey = api_key;
    this.connect();
  }

  get index() {
    return this._index;
  }

  set index(index) {
    this._index = index;
    this.connect();
  }

  connect() {
    this._client = algolia(this._apiId, this._apiKey);
    this._algoliaIndex = this._client.initIndex(this._index);
    return this;
  }

  get(objectID, attrs = undefined) {
    return new Promise((resolve, reject) => {
      this._algoliaIndex.getObject(objectID, attrs, (error, content) => {
        if (error) reject(error);
        else resolve(content, this);
      });
    });
  }

  find(objectIDS) {
    return new Promise((resolve, reject) => {
      this._algoliaIndex.getObjects(objectIDS, (error, content) => {
        if (error) reject(error);
        else resolve(content, this);
      });
    });
  }

  create(objectData) {
    const data = Object.assign({}, objectData);
    return new Promise((resolve, reject) => {
      this._algoliaIndex.saveObject(data, (error, content) => {
        if (error) reject(error);
        else resolve(content, this);
      });
    });
  }

  save(objectData) {
    const data = Object.assign({}, objectData);
    return new Promise((resolve, reject) => {
      this._algoliaIndex.partialUpdateObject(
        data,
        { createIfNotExists: true },
        (error, content) => {
          if (error) reject(error);
          else resolve(content, this);
        }
      );
    });
  }

  update_all(objectData) {
    return new Promise((resolve, reject) => {
      this._algoliaIndex.saveObjects(objectData, (error, content) => {
        if (error) reject(error);
        else resolve(content, this);
      });
    });
  }

  patch(objectData) {
    return new Promise((resolve, reject) => {
      this._algoliaIndex.partialUpdateObject(
        objectData,
        false,
        (error, content) => {
          if (error) reject(error);
          else resolve(content, this);
        }
      );
    });
  }

  patchAll(objectsData) {
    return this._algoliaIndex.partialUpdateObjects(objectsData)
  }

  remove(objectID) {
    return new Promise((resolve, reject) => {
      this._algoliaIndex.deleteObject(objectID, (error, content) => {
        if (error) reject(error);
        else resolve(content, this);
      });
    });
  }
}

module.exports = Algolia;
