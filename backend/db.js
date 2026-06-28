const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const net = require('net');

const DB_FILE = path.join(__dirname, 'db.json');
let isMock = false;
let mockData = { mobiles: [], customers: [], accessories: [], accessorySales: [] };

// Helper to check if a TCP port is open (to quickly check MongoDB availability)
function checkConnection(uri) {
  return new Promise((resolve) => {
    let host = '127.0.0.1';
    let port = 27017;
    try {
      const match = uri.match(/mongodb:\/\/(.*?)(?::(\d+))?(\/|$)/);
      if (match) {
        if (match[1]) host = match[1];
        if (match[2]) port = parseInt(match[2]);
      }
    } catch (e) {}

    const socket = new net.Socket();
    socket.setTimeout(800);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

function loadMockData() {
  if (fs.existsSync(DB_FILE)) {
    try {
      mockData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!mockData.mobiles) mockData.mobiles = [];
      if (!mockData.customers) mockData.customers = [];
      if (!mockData.accessories) mockData.accessories = [];
      if (!mockData.accessorySales) mockData.accessorySales = [];
    } catch (e) {
      console.error('Error reading db.json, resetting database.', e);
    }
  } else {
    saveMockData();
  }
}

function saveMockData() {
  fs.writeFileSync(DB_FILE, JSON.stringify(mockData, null, 2), 'utf8');
}

// Custom Mock Model base class to emulate Mongoose Document behavior
class MockModel {
  constructor(collectionName, data) {
    this._collectionName = collectionName;
    Object.assign(this, data);
    if (!this._id) {
      this._id = 'mock-' + Math.random().toString(36).substr(2, 9);
    }
    if (!this.createdAt) this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  async save() {
    const list = mockData[this._collectionName];
    const index = list.findIndex(item => item._id === this._id);
    this.updatedAt = new Date().toISOString();

    const plainObj = { ...this };
    delete plainObj._collectionName;

    if (index >= 0) {
      list[index] = plainObj;
    } else {
      list.unshift(plainObj);
    }
    saveMockData();
    return this;
  }

  static async insertMany(docs) {
    const instances = [];
    for (const doc of docs) {
      const inst = new this(doc);
      await inst.save();
      instances.push(inst);
    }
    return instances;
  }
}

// Mock Mobile Model
class MobileModel extends MockModel {
  constructor(data) {
    super('mobiles', data);
    if (!this.status) this.status = 'Available';
  }

  static async find() {
    const data = [...mockData.mobiles];
    return {
      sort: (criteria) => {
        if (criteria.createdAt === -1) {
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (criteria.updatedAt === -1) {
          data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
        return data;
      },
      then: (resolve) => resolve(data)
    };
  }

  static async findByIdAndUpdate(id, updates, options) {
    const list = mockData.mobiles;
    const index = list.findIndex(m => m._id === id);
    if (index === -1) return null;

    const item = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    list[index] = item;
    saveMockData();
    return new MobileModel(item);
  }

  static async deleteMany() {
    mockData.mobiles = [];
    saveMockData();
    return { deletedCount: 0 };
  }
}

// Mock Customer Model
class CustomerModel extends MockModel {
  constructor(data) {
    super('customers', data);
    if (this.balance === undefined) this.balance = 0;
    if (!this.transactions) this.transactions = [];
  }

  static async find() {
    const data = [...mockData.customers];
    return {
      sort: (criteria) => {
        if (criteria.updatedAt === -1) {
          data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
        return data;
      },
      then: (resolve) => resolve(data)
    };
  }

  static async findOne(query) {
    let item;
    if (query.name) {
      item = mockData.customers.find(c => c.name === query.name);
    }
    return item ? new CustomerModel(item) : null;
  }

  static async findById(id) {
    const item = mockData.customers.find(c => c._id === id);
    return item ? new CustomerModel(item) : null;
  }

  static async deleteMany() {
    mockData.customers = [];
    saveMockData();
    return { deletedCount: 0 };
  }
}

// Mock Accessory Model
class AccessoryModel extends MockModel {
  constructor(data) {
    super('accessories', data);
    if (this.stock === undefined) this.stock = 0;
  }

  static async find() {
    const data = [...mockData.accessories];
    return {
      sort: (criteria) => {
        if (criteria && criteria.createdAt === -1) {
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return data;
      },
      then: (resolve) => resolve(data)
    };
  }

  static async findByIdAndUpdate(id, updates, options) {
    const list = mockData.accessories;
    const index = list.findIndex(a => a._id === id);
    if (index === -1) return null;

    const item = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    list[index] = item;
    saveMockData();
    return new AccessoryModel(item);
  }

  static async findById(id) {
    const item = mockData.accessories.find(a => a._id === id);
    return item ? new AccessoryModel(item) : null;
  }

  static async deleteMany() {
    mockData.accessories = [];
    saveMockData();
    return { deletedCount: 0 };
  }
}

// Mock AccessorySale Model
class AccessorySaleModel extends MockModel {
  constructor(data) {
    super('accessorySales', data);
    if (!this.soldAt) this.soldAt = new Date().toISOString();
  }

  static async find() {
    const data = [...mockData.accessorySales];
    return {
      sort: (criteria) => {
        if (criteria && criteria.createdAt === -1) {
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return data;
      },
      then: (resolve) => resolve(data)
    };
  }

  static async deleteMany() {
    mockData.accessorySales = [];
    saveMockData();
    return { deletedCount: 0 };
  }
}

// Connect function to switch mode
async function connectDB(uri) {
  const isMongoAlive = await checkConnection(uri);
  if (isMongoAlive) {
    try {
      await mongoose.connect(uri);
      console.log('Connected to MongoDB.');
      isMock = false;
    } catch (err) {
      console.error('Failed to connect to MongoDB, falling back to local file database:', err.message);
      isMock = true;
      loadMockData();
    }
  } else {
    console.log('MongoDB server offline, using local file database (db.json) fallback.');
    isMock = true;
    loadMockData();
  }
}

// Real Mongoose schemas (deferred resolution)
const RealMobile = require('./models/Mobile');
const RealCustomer = require('./models/Customer');
const RealAccessory = require('./models/Accessory');
const RealAccessorySale = require('./models/AccessorySale');

class Mobile {
  constructor(data) {
    if (isMock) {
      return new MobileModel(data);
    } else {
      return new RealMobile(data);
    }
  }

  static find(...args) {
    return isMock ? MobileModel.find(...args) : RealMobile.find(...args);
  }

  static findOne(...args) {
    return isMock ? MobileModel.findOne(...args) : RealMobile.findOne(...args);
  }

  static findById(...args) {
    return isMock ? MobileModel.findById(...args) : RealMobile.findById(...args);
  }

  static findByIdAndUpdate(...args) {
    return isMock ? MobileModel.findByIdAndUpdate(...args) : RealMobile.findByIdAndUpdate(...args);
  }

  static deleteMany(...args) {
    return isMock ? MobileModel.deleteMany(...args) : RealMobile.deleteMany(...args);
  }

  static insertMany(...args) {
    return isMock ? MobileModel.insertMany(...args) : RealMobile.insertMany(...args);
  }
}

class Customer {
  constructor(data) {
    if (isMock) {
      return new CustomerModel(data);
    } else {
      return new RealCustomer(data);
    }
  }

  static find(...args) {
    return isMock ? CustomerModel.find(...args) : RealCustomer.find(...args);
  }

  static findOne(...args) {
    return isMock ? CustomerModel.findOne(...args) : RealCustomer.findOne(...args);
  }

  static findById(...args) {
    return isMock ? CustomerModel.findById(...args) : RealCustomer.findById(...args);
  }

  static deleteMany(...args) {
    return isMock ? CustomerModel.deleteMany(...args) : RealCustomer.deleteMany(...args);
  }

  static async insertMany(...args) {
    return isMock ? CustomerModel.insertMany(...args) : RealCustomer.insertMany(...args);
  }
}

class Accessory {
  constructor(data) {
    if (isMock) {
      return new AccessoryModel(data);
    } else {
      return new RealAccessory(data);
    }
  }

  static find(...args) {
    return isMock ? AccessoryModel.find(...args) : RealAccessory.find(...args);
  }

  static findById(...args) {
    return isMock ? AccessoryModel.findById(...args) : RealAccessory.findById(...args);
  }

  static findByIdAndUpdate(...args) {
    return isMock ? AccessoryModel.findByIdAndUpdate(...args) : RealAccessory.findByIdAndUpdate(...args);
  }

  static deleteMany(...args) {
    return isMock ? AccessoryModel.deleteMany(...args) : RealAccessory.deleteMany(...args);
  }

  static insertMany(...args) {
    return isMock ? AccessoryModel.insertMany(...args) : RealAccessory.insertMany(...args);
  }
}

class AccessorySale {
  constructor(data) {
    if (isMock) {
      return new AccessorySaleModel(data);
    } else {
      return new RealAccessorySale(data);
    }
  }

  static find(...args) {
    return isMock ? AccessorySaleModel.find(...args) : RealAccessorySale.find(...args);
  }

  static deleteMany(...args) {
    return isMock ? AccessorySaleModel.deleteMany(...args) : RealAccessorySale.deleteMany(...args);
  }

  static insertMany(...args) {
    return isMock ? AccessorySaleModel.insertMany(...args) : RealAccessorySale.insertMany(...args);
  }
}

const connection = {
  db: {
    collection: (name) => {
      return {
        deleteMany: async () => {
          if (isMock) {
            mockData[name] = [];
            saveMockData();
            return { deletedCount: 0 };
          } else {
            return mongoose.connection.db.collection(name).deleteMany({});
          }
        }
      };
    }
  }
};

module.exports = {
  connectDB,
  Mobile,
  Customer,
  Accessory,
  AccessorySale,
  connection,
  isMockDatabase: () => isMock
};
