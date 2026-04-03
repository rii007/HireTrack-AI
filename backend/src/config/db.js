const mongoose = require("mongoose");

module.exports = async function connectDb(uri) {
  if (!uri) throw new Error("MONGO_URI is required");

  const options = { autoIndex: true, serverSelectionTimeoutMS: 10000 };
  const fallback = process.env.FALLBACK_MONGO_URI;

  try {
    await mongoose.connect(uri, options);
    console.log("MongoDB connected to primary URI");
    return;
  } catch (primaryError) {
    console.error("Primary MongoDB connection failed:", primaryError.message);

    if (fallback && fallback !== uri) {
      console.log("Attempting fallback MongoDB URI...");
      try {
        await mongoose.connect(fallback, options);
        console.log("MongoDB connected to fallback URI");
        return;
      } catch (fallbackError) {
        console.error("Fallback MongoDB connection failed:", fallbackError.message);
        throw new Error(`MongoDB connection failed (primary + fallback): ${primaryError.message}; ${fallbackError.message}`);
      }
    }

    throw primaryError;
  }
};
