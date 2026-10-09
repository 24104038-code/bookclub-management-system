const Event = require('../models/Event');

// GET /api/events
exports.getAllEvents = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    let query = {};

    if (type && type !== 'all' && type !== 'All Events') {
      query.type = { $regex: `^${type}$`, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { bookTitle: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query).sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const event = await Event.findOne(query);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const { title, type, date, time, location, bookTitle, maxSeats, description } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ success: false, message: 'Title, date, and time are required.' });
    }

    const lastEvt = await Event.findOne().sort({ id: -1 });
    const nextId = (lastEvt && lastEvt.id) ? lastEvt.id + 1 : 1;

    const newEvent = new Event({
      id: nextId,
      title: title.trim(),
      type: type || 'Discussion',
      date,
      time,
      location: location || 'Online via Zoom',
      bookTitle: bookTitle || '',
      maxSeats: maxSeats ? Number(maxSeats) : 30,
      participants: 1,
      description: description || '',
      organizer: {
        name: req.user.name,
        role: req.user.role === 'admin' ? 'Club Administrator' : 'Event Host'
      },
      rsvps: [{
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email
      }]
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: newEvent
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const updated = await Event.findOneAndUpdate(query, { $set: req.body }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.json({
      success: true,
      message: 'Event updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/events/:id/rsvp
exports.toggleRSVP = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const event = await Event.findOne(query);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const rsvpIdx = event.rsvps.findIndex(r => r.userId === userId);
    let isRsvpd = false;

    if (rsvpIdx !== -1) {
      // Cancel RSVP
      event.rsvps.splice(rsvpIdx, 1);
      event.participants = Math.max(0, event.participants - 1);
      event.rsvpd = false;
      isRsvpd = false;
    } else {
      // Check seat capacity
      if (event.participants >= event.maxSeats) {
        return res.status(400).json({ success: false, message: 'Sorry, this event is already full.' });
      }
      event.rsvps.push({
        userId,
        name: req.user.name,
        email: req.user.email
      });
      event.participants += 1;
      event.rsvpd = true;
      isRsvpd = true;
    }

    await event.save();

    res.json({
      success: true,
      message: isRsvpd ? 'RSVP confirmed! See you there.' : 'RSVP cancelled.',
      data: {
        rsvpd: isRsvpd,
        participants: event.participants,
        maxSeats: event.maxSeats
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/events/:id/track
exports.trackEvent = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const event = await Event.findOne(query);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const { method, contact, email, phone } = req.body;
    const userEmail = email || contact || (req.user ? req.user.email : 'reader@bookclub.com');
    const userPhone = phone || (req.user ? req.user.phone : '');

    const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BookForge//BookClub Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:event-${event.id || 1}-${Date.now()}@bookclub.internal`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${nowStr}`,
      `SUMMARY:${(event.title || 'Event').replace(/[\r\n]+/g, ' ')}`,
      `DESCRIPTION:${(event.description || '').replace(/[\r\n]+/g, ' ')}\\nDate: ${event.date || ''}\\nTime: ${event.time || ''}`,
      `LOCATION:${(event.location || 'Online Salon').replace(/[\r\n]+/g, ' ')}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: Upcoming BookClub Event: ${event.title}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    try {
      const Notification = require('../models/Notification');
      if (req.user && req.user.userId) {
        const lastNotif = await Notification.findOne().sort({ id: -1 });
        const nextNotifId = (lastNotif && lastNotif.id) ? lastNotif.id + 1 : Date.now();
        await Notification.create({
          id: nextNotifId,
          userId: req.user.userId,
          title: `Event Tracking: ${event.title}`,
          message: method === 'whatsapp'
            ? `Event details for "${event.title}" synced to WhatsApp.`
            : `Event details for "${event.title}" sent to ${userEmail}. Calendar invite ready.`,
          type: 'event',
          icon: method === 'whatsapp' ? '📲' : '✉️',
          isRead: false,
          link: `event-details.html?id=${event.id}`
        });
      }
    } catch (notifErr) {
      console.warn('Event tracking notification log error:', notifErr.message);
    }

    res.json({
      success: true,
      message: method === 'whatsapp'
        ? `Tracking activated! WhatsApp alert ready for ${event.title}.`
        : `Tracking activated! Event details and calendar invite sent to ${userEmail}.`,
      data: {
        eventId: event.id,
        eventTitle: event.title,
        method: method || 'email',
        contact: method === 'whatsapp' ? userPhone : userEmail,
        date: event.date,
        time: event.time,
        location: event.location,
        icsData
      }
    });
  } catch (error) {
    next(error);
  }
};

