const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Build MongoDB URI from separated, encrypted environment variables
    let mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      const user = process.env.MONGODB_USER;
      const passEnc = process.env.MONGODB_PASS_ENC;
      const host = process.env.MONGODB_HOST;
      const db = process.env.MONGODB_DB;

      if (!user || !passEnc || !host || !db) {
        throw new Error('Missing MongoDB credentials. Set MONGODB_URI or individual MONGODB_USER, MONGODB_PASS_ENC, MONGODB_HOST, MONGODB_DB env vars.');
      }

      // Decode the Base64-encrypted password at runtime and URI-encode for safe interpolation
      const password = encodeURIComponent(Buffer.from(passEnc, 'base64').toString('utf-8'));
      mongoURI = `mongodb+srv://${encodeURIComponent(user)}:${password}@${host}/${db}?appName=Cluster0`;
    }

    await mongoose.connect(mongoURI);
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.error('\n⚠️  MongoDB connection warning:', err.message);
    console.error('👉 The server is still running, but database features (login/signup) will fail.');
    console.error('👉 Please make sure local MongoDB is running or configure your MONGODB_URI env variable.\n');
  }
};

module.exports = connectDB;
