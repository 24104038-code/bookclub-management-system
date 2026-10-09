const Report = require('../models/Report');

// GET /api/reports (Admin / Organizer only)
exports.getAllReports = async (req, res, next) => {
  try {
    const { status, targetType } = req.query;
    let query = {};

    if (status && status !== 'all') query.status = status;
    if (targetType) query.targetType = targetType;

    const reports = await Report.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/reports (Any authenticated user)
exports.createReport = async (req, res, next) => {
  try {
    const { targetType, targetTitle, reportedItemSnippet, reportedAuthor, reason, description } = req.body;

    if (!targetType || !targetTitle || !reason) {
      return res.status(400).json({
        success: false,
        message: 'targetType, targetTitle, and reason are required.'
      });
    }

    const lastRep = await Report.findOne().sort({ id: -1 });
    const nextId = (lastRep && lastRep.id) ? lastRep.id + 1 : 1;

    const newReport = new Report({
      id: nextId,
      targetType,
      targetTitle: targetTitle.trim(),
      reportedItemSnippet: reportedItemSnippet || '',
      reportedAuthor: reportedAuthor || 'Unknown',
      reportedBy: req.user.name,
      reportedById: req.user.userId,
      date: new Date().toISOString().split('T')[0],
      reason,
      description: description || '',
      status: 'Pending'
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will inspect the item promptly.',
      data: newReport
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/reports/:id (Admin / Organizer only)
exports.updateReport = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };
    const { status, resolution } = req.body;

    const report = await Report.findOne(query);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    if (status) report.status = status;
    if (resolution !== undefined) report.resolution = resolution;

    await report.save();

    res.json({
      success: true,
      message: `Report marked as ${report.status}.`,
      data: report
    });
  } catch (error) {
    next(error);
  }
};
