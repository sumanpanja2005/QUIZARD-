import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongodInstance = null;

/**
 * Normalizes MongoDB URI to ensure database name is set to 'quizard'
 */
const normalizeMongoUri = (uri) => {
  if (!uri) return '';
  let cleanUri = uri.trim();

  // If URI ends with .mongodb.net/ or .mongodb.net without database name, append 'quizard'
  if (cleanUri.includes('.mongodb.net')) {
    const urlParts = cleanUri.split('?');
    let base = urlParts[0];
    const query = urlParts[1] ? `?${urlParts[1]}` : '?retryWrites=true&w=majority';

    if (base.endsWith('.mongodb.net/')) {
      base = base + 'quizard';
    } else if (base.endsWith('.mongodb.net')) {
      base = base + '/quizard';
    } else if (base.endsWith('.mongodb.net/test')) {
      base = base.replace(/\/test$/, '/quizard');
    }
    return base + query;
  }

  return cleanUri;
};

export const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI?.trim();

  // 1. Try Remote MongoDB Atlas if configured
  if (rawUri && (rawUri.startsWith('mongodb+srv://') || (rawUri.startsWith('mongodb://') && !rawUri.includes('127.0.0.1') && !rawUri.includes('localhost')))) {
    const atlasUri = normalizeMongoUri(rawUri);
    try {
      console.log('🔄 Attempting connection to MongoDB Atlas Cluster...');
      console.log(`🌐 Target: ${atlasUri.replace(/:([^:@]{3,})@/, ':****@')}`);

      const conn = await mongoose.connect(atlasUri, {
        dbName: 'quizard',
        serverSelectionTimeoutMS: 5000,
      });

      console.log('==============================================================');
      console.log(`✅ [MongoDB Atlas] Connected Successfully!`);
      console.log(`🌐 Host: ${conn.connection.host}`);
      console.log(`📁 Database Name: ${conn.connection.name}`);
      console.log(`💾 All registered students and quiz data will be saved to Atlas.`);
      console.log('==============================================================');
      return conn;
    } catch (err) {
      console.warn('\n==============================================================');
      console.warn(`⚠️ [MongoDB Atlas Connection Notice] Could not connect to Atlas:`);
      console.warn(`   Error: ${err.message}`);
      console.warn('\n💡 To fix Atlas connectivity:');
      console.warn('   1. Check your Atlas cluster URL in server/.env (ensure no typos).');
      console.warn('   2. In MongoDB Atlas Dashboard -> Network Access, add IP "0.0.0.0/0" (Allow from Anywhere).');
      console.warn('   3. Ensure database username and password in .env are correct.');
      console.warn('🔄 Switching to Local MongoDB (Port 27017) so you can view data in MongoDB Compass...');
      console.warn('==============================================================\n');
    }
  }

  // 2. Try connecting to an already running Local MongoDB on 27017 (e.g. MongoDB Community Service)
  const localDefaultUri = 'mongodb://127.0.0.1:27017/quizard';
  try {
    const conn = await mongoose.connect(localDefaultUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log('==============================================================');
    console.log(`✅ [Local MongoDB Service] Connected to existing MongoDB on Port 27017!`);
    console.log(`📁 Database: ${conn.connection.name}`);
    console.log(`🧭 [MongoDB Compass] Connect with: mongodb://localhost:27017`);
    console.log('==============================================================');
    return conn;
  } catch {
    // Port 27017 is not running as a Windows service, start embedded server on 27017
  }

  // 3. Start local MongoDB on port 27017 with persistent WiredTiger disk storage
  const dbDir = path.resolve(__dirname, '../data/db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  try {
    console.log('🔄 Launching persistent Local MongoDB Server on Port 27017 for MongoDB Compass...');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'quizard',
        dbPath: dbDir,
        storageEngine: 'wiredTiger',
      },
    });

    const localUri = mongodInstance.getUri();
    const conn = await mongoose.connect(localUri, {
      dbName: 'quizard',
    });

    console.log('==============================================================');
    console.log(`✅ [Local MongoDB] Server Running on Port 27017!`);
    console.log(`🧭 [MongoDB Compass Connection]`);
    console.log(`👉 Open MongoDB Compass and connect to:  mongodb://localhost:27017`);
    console.log(`📁 Database Name: quizard`);
    console.log(`💾 Disk Persistence: ${dbDir}`);
    console.log(`🎉 New registered students and quiz data are permanently saved on disk!`);
    console.log('==============================================================');
    return conn;
  } catch (embeddedErr) {
    // If port 27017 is held by another process without allowing connection, fallback to dynamic port
    console.warn(`⚠️ Port 27017 busy (${embeddedErr.message}). Launching on available port...`);
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'quizard',
      },
    });

    const fallbackUri = mongodInstance.getUri();
    const conn = await mongoose.connect(fallbackUri, {
      dbName: 'quizard',
    });

    console.log(`✅ MongoDB Connected at: ${fallbackUri}`);
    console.log(`🧭 Compass URI: ${fallbackUri}`);
    return conn;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop(false);
    }
  } catch (err) {
    console.error('Error during database disconnect:', err.message);
  }
};
