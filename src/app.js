const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { rateLimiter } = require("./middleware/rateLimiter");
const { errorHandler } = require("./middleware/errorHandler");
const { notFound } = require("./middleware/notFound");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const addictionRoutes = require("./routes/addiction.routes");
const planRoutes = require("./routes/plan.routes");
const journalRoutes = require("./routes/journal.routes");
const checkinRoutes = require("./routes/checkin.routes");
const urgeRoutes = require("./routes/urge.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (origin.startsWith('http://localhost')) return callback(null, true)
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/api/", rateLimiter);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    app: "Freedom Journey",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addictions", addictionRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/urges", urgeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
