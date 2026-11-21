import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, '../data/db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('🔄 Launching Dedicated Local MongoDB Server for MongoDB Compass...');

const mongod = await MongoMemoryServer.create({
  instance: {
    port: 27017,
    dbName: 'quizard',
    dbPath: dbDir,
    storageEngine: 'wiredTiger',
  },
});

console.log('\n==============================================================');
console.log('✅ Local MongoDB Daemon is Running on Port 27017!');
console.log('🧭 MongoDB Compass Connection String:');
console.log('   👉  mongodb://localhost:27017  (or mongodb://127.0.0.1:27017)');
console.log('📁 Database Name: quizard');
console.log(`💾 Disk Storage Directory: ${dbDir}`);
console.log('\n📌 In MongoDB Compass:');
console.log('   1. Open MongoDB Compass.');
console.log('   2. Paste: mongodb://localhost:27017');
console.log('   3. Click "Connect".');
console.log('   4. View collections: "users", "quizzes", "questions", "quizattempts".');
console.log('==============================================================');
console.log('Press Ctrl+C to stop the local database.\n');

// Keep process alive
process.on('SIGINT', async () => {
  console.log('\n🛑 Stopping MongoDB daemon gracefully...');
  await mongod.stop(false);
  process.exit(0);
});
