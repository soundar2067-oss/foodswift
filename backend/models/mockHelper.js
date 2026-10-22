import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve('data/mockDB.json');

// Helper to load/save JSON database
const loadDB = () => {
  if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
      dbPath,
      JSON.stringify(
        {
          users: [],
          restaurants: [],
          fooditems: [],
          reviews: [],
          orders: [],
        },
        null,
        2
      )
    );
  }
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (err) {
    return {
      users: [],
      restaurants: [],
      fooditems: [],
      reviews: [],
      orders: [],
    };
  }
};

const saveDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Generates hex string compatible with mongoose ObjectIds
const generateId = () => {
  return (
    Math.random().toString(16).substring(2, 10) +
    Math.random().toString(16).substring(2, 10) +
    Math.random().toString(16).substring(2, 10)
  );
};

const matchesQuery = (item, query) => {
  if (!query) return true;
  for (let key in query) {
    let qVal = query[key];
    let iVal = item[key];

    // Support regex search
    if (qVal && typeof qVal === 'object') {
      if (qVal.$regex !== undefined) {
        const regex = new RegExp(qVal.$regex, qVal.$options || '');
        if (!regex.test(iVal)) return false;
        continue;
      }
      if (qVal.$or !== undefined) {
        let anyMatch = false;
        for (let subQuery of qVal.$or) {
          if (matchesQuery(item, subQuery)) {
            anyMatch = true;
            break;
          }
        }
        if (!anyMatch) return false;
        continue;
      }
    }

    // Support $or at top level
    if (key === '$or' && Array.isArray(qVal)) {
      let anyMatch = false;
      for (let subQuery of qVal) {
        if (matchesQuery(item, subQuery)) {
          anyMatch = true;
          break;
        }
      }
      if (!anyMatch) return false;
      continue;
    }

    // Standard equality
    if (String(iVal) !== String(qVal)) {
      return false;
    }
  }
  return true;
};

const wrapInstance = (modelName, item) => {
  if (!item) return null;

  const instance = { ...item };

  instance.save = async function () {
    const db = loadDB();
    const collectionName = modelName.toLowerCase() + 's';
    const index = db[collectionName].findIndex((x) => String(x._id) === String(this._id));

    // Hash password if User model and password is not already hashed
    if (modelName === 'User' && this.password && !this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const dbItem = { ...this };
    delete dbItem.save;
    delete dbItem.deleteOne;
    delete dbItem.matchPassword;

    if (index >= 0) {
      db[collectionName][index] = dbItem;
    } else {
      db[collectionName].push(dbItem);
    }
    saveDB(db);
    return this;
  };

  instance.deleteOne = async function () {
    const db = loadDB();
    const collectionName = modelName.toLowerCase() + 's';
    db[collectionName] = db[collectionName].filter((x) => String(x._id) !== String(this._id));
    saveDB(db);
    return { deletedCount: 1 };
  };

  if (modelName === 'User') {
    instance.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  return instance;
};

class MockQuery {
  constructor(promise, modelName) {
    this.promise = promise;
    this.modelName = modelName;
    this.includePassword = false;
  }

  populate(pathName) {
    this.promise = this.promise.then((data) => {
      if (!data) return data;
      const db = loadDB();

      const populateSingle = (item) => {
        if (!item) return item;
        const populated = { ...item };

        if (pathName === 'user') {
          const userObj = db.users.find((u) => String(u._id) === String(populated.user));
          if (userObj) {
            populated.user = { _id: userObj._id, name: userObj.name };
          }
        } else if (pathName === 'restaurant') {
          const restObj = db.restaurants.find((r) => String(r._id) === String(populated.restaurant));
          if (restObj) {
            populated.restaurant = restObj;
          }
        }
        return populated;
      };

      if (Array.isArray(data)) {
        return data.map(populateSingle);
      }
      return populateSingle(data);
    });
    return this;
  }

  select(fields) {
    if (fields && fields.includes('password')) {
      this.includePassword = true;
    }
    return this;
  }

  sort(criteria) {
    this.promise = this.promise.then((data) => {
      if (!Array.isArray(data)) return data;
      const sorted = [...data];

      let key = 'createdAt';
      let isDesc = true;

      if (typeof criteria === 'object') {
        key = Object.keys(criteria)[0];
        isDesc = criteria[key] === -1;
      } else if (typeof criteria === 'string') {
        isDesc = criteria.startsWith('-');
        key = isDesc ? criteria.substring(1) : criteria;
      }

      sorted.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];
        if (key === 'createdAt' || key === 'updatedAt') {
          valA = new Date(valA);
          valB = new Date(valB);
        }
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
      return sorted;
    });
    return this;
  }

  then(onFulfilled, onRejected) {
    return this.promise
      .then((data) => {
        if (Array.isArray(data)) {
          return data.map((x) => {
            const wrapped = wrapInstance(this.modelName, x);
            if (this.modelName === 'User' && !this.includePassword && wrapped) {
              delete wrapped.password;
            }
            return wrapped;
          });
        } else if (data) {
          const wrapped = wrapInstance(this.modelName, data);
          if (this.modelName === 'User' && !this.includePassword && wrapped) {
            delete wrapped.password;
          }
          return wrapped;
        }
        return data;
      })
      .then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.promise.catch(onRejected);
  }
}

class MockModel {
  constructor(name, schema) {
    this.modelName = name;
    this.schema = schema;
    this.collectionName = name.toLowerCase() + 's';
    if (this.collectionName === 'fooditems') {
      this.collectionName = 'fooditems'; // keep matching format
    }
  }

  find(query) {
    const promise = Promise.resolve().then(() => {
      const db = loadDB();
      const items = db[this.collectionName] || [];
      return items.filter((item) => matchesQuery(item, query));
    });
    return new MockQuery(promise, this.modelName);
  }

  findOne(query) {
    const promise = Promise.resolve().then(() => {
      const db = loadDB();
      const items = db[this.collectionName] || [];
      return items.find((item) => matchesQuery(item, query)) || null;
    });
    return new MockQuery(promise, this.modelName);
  }

  findById(id) {
    const promise = Promise.resolve().then(() => {
      const db = loadDB();
      const items = db[this.collectionName] || [];
      return items.find((item) => String(item._id) === String(id)) || null;
    });
    return new MockQuery(promise, this.modelName);
  }

  countDocuments(query) {
    const promise = Promise.resolve().then(() => {
      const db = loadDB();
      const items = db[this.collectionName] || [];
      return items.filter((item) => matchesQuery(item, query)).length;
    });
    return new MockQuery(promise, this.modelName);
  }

  async create(data) {
    const db = loadDB();
    const newItem = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    if (this.modelName === 'User' && newItem.password) {
      const salt = await bcrypt.genSalt(10);
      newItem.password = await bcrypt.hash(newItem.password, salt);
    }

    db[this.collectionName].push(newItem);
    saveDB(db);
    return wrapInstance(this.modelName, newItem);
  }

  async findByIdAndUpdate(id, updateData, options) {
    const db = loadDB();
    const index = db[this.collectionName].findIndex((x) => String(x._id) === String(id));
    if (index === -1) return null;

    const updated = {
      ...db[this.collectionName][index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    db[this.collectionName][index] = updated;
    saveDB(db);
    return wrapInstance(this.modelName, updated);
  }

  async findByIdAndDelete(id) {
    const db = loadDB();
    db[this.collectionName] = db[this.collectionName].filter((x) => String(x._id) !== String(id));
    saveDB(db);
    return { deletedCount: 1 };
  }

  async deleteOne(query) {
    const db = loadDB();
    const index = db[this.collectionName].findIndex((item) => matchesQuery(item, query));
    if (index !== -1) {
      db[this.collectionName].splice(index, 1);
      saveDB(db);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

export const getModel = (name, schema) => {
  let realModel;
  try {
    realModel = mongoose.models[name] || mongoose.model(name, schema);
  } catch (e) {
    try {
      realModel = mongoose.model(name);
    } catch (err) {}
  }
  const mockModel = new MockModel(name, schema);

  return new Proxy(realModel || function () {}, {
    get(target, prop, receiver) {
      const useReal = mongoose.connection.readyState === 1 && !global.useMockDB;
      if (useReal && realModel) {
        const val = Reflect.get(realModel, prop);
        if (typeof val === 'function') {
          return val.bind(realModel);
        }
        return val;
      }
      const val = mockModel[prop];
      if (typeof val === 'function') {
        return val.bind(mockModel);
      }
      return val;
    },
    construct(target, args, newTarget) {
      const useReal = mongoose.connection.readyState === 1 && !global.useMockDB;
      if (useReal && realModel) {
        return Reflect.construct(realModel, args, realModel);
      }
      const newItem = {
        _id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...args[0],
      };
      return wrapInstance(name, newItem);
    },
    apply(target, thisArg, args) {
      const useReal = mongoose.connection.readyState === 1 && !global.useMockDB;
      if (useReal && realModel) {
        return Reflect.apply(realModel, realModel, args);
      }
      return mockModel(...args);
    },
  });
};
