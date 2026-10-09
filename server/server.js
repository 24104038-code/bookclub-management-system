const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const seedDatabase = require('./utils/seed');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const libraryRoutes = require('./routes/library');
const reviewRoutes = require('./routes/reviews');
const groupRoutes = require('./routes/groups');
const eventRoutes = require('./routes/events');
const discussionRoutes = require('./routes/discussions');
const goalRoutes = require('./routes/goals');
const challengeRoutes = require('./routes/challenges');
const competitionRoutes = require('./routes/competitions');
const noteRoutes = require('./routes/notes');
const highlightRoutes = require('./routes/highlights');
const journalRoutes = require('./routes/journal');
const notificationRoutes = require('./routes/notifications');
const activityRoutes = require('./routes/activities');
const reportRoutes = require('./routes/reports');
const leaderboardRoutes = require('./routes/leaderboards');
const achievementRoutes = require('./routes/achievements');
const recommendationRoutes = require('./routes/recommendations');
const searchRoutes = require('./routes/search');
const certificateRoutes = require('./routes/certificates');
const messageRoutes = require('./routes/messages');
const aiRoutes = require('./routes/ai');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    database: 'connected',
    service: 'BOOK FORGE Management System Backend API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/reading-progress', libraryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Serve static frontend assets
const rootPath = path.join(__dirname, '..');
const reactDistPath = path.join(rootPath, 'frontend', 'dist');

// 1. Serve Vite React build assets
app.use('/assets', express.static(path.join(reactDistPath, 'assets')));

// 2. Serve public static assets (images, css, js) for index.html and React
app.use('/images', express.static(path.join(rootPath, 'images')));
app.use('/css', express.static(path.join(rootPath, 'css')));
app.use('/js', express.static(path.join(rootPath, 'js')));

// 3. Landing page: index.html is the only static HTML entry point
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(rootPath, 'index.html'));
});

// 404 Handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`
  });
});

// 4. All other application routes are served by the React SPA
app.use((req, res) => {
  res.sendFile(path.join(reactDistPath, 'index.html'));
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Automatically seed database if empty
    await seedDatabase();

    // 3. Start Express server
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  BOOK FORGE App running successfully on port ${PORT} `);
      console.log(`  👉 Landing Page: http://localhost:${PORT}/ (index.html)`);
      console.log(`  👉 React App:    http://localhost:${PORT}/dashboard `);
      console.log(`  👉 API Health:   http://localhost:${PORT}/api/health `);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
