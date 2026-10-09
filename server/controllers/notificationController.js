const Notification = require('../models/Notification');

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam), userId } : { _id: idParam, userId };

    const notif = await Notification.findOneAndUpdate(
      query,
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read.',
      data: notif
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/mark-all-read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam), userId } : { _id: idParam, userId };

    const deleted = await Notification.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({
      success: true,
      message: 'Notification deleted.',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
};
