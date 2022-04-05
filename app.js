require("dotenv").config();

const express = require("express");
const app = express();
const { APP_HOST, APP_PORT } = process.env;

/**
 * Express middleware
 */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * App routes
 */
const concertRoutes = require("./routes/concert");
const hallRoutes = require("./routes/hall");

app.use("/api/concert", concertRoutes);
app.use("/api/hall", hallRoutes);

/**
 * Error middleware
 */
app.use((err, req, res, next) => {
  return res.status(400).json({
    status: false,
    error: err.message,
  });
});

/**
 * Running App
 */
app.listen(APP_PORT, () => {
  console.log(`App running on http://${APP_HOST}:${APP_PORT}`);
});
