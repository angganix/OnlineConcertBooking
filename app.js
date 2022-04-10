require("dotenv").config();

const express = require("express");
const app = express();
const { APP_HOST, APP_PORT } = process.env;
const cookieParser = require("cookie-parser");
const cors = require("cors");

/**
 * Express middleware
 */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

/**
 * CORS Middleware
 */
const whiteList = [
  "http://localhost:3000",
  "http://192.168.14.155:3000",
  "http://teknix.my.id:3000",
];
const corsConfig = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Restricted access!"));
    }
  },
  credentials: true,
};

if (process.env !== "production") {
  app.use(cors(corsConfig));
}

/**
 * App routes
 */
const authRoutes = require("./routes/auth");
const concertRoutes = require("./routes/concert");
const hallRoutes = require("./routes/hall");
const ticketRoutes = require("./routes/ticket");
const checkoutRoutes = require("./routes/checkout");
const userRoutes = require("./routes/user");

app.use("/api/auth", authRoutes);
app.use("/api/concert", concertRoutes);
app.use("/api/hall", hallRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/user", userRoutes);
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
