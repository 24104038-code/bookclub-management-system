const Group = require('../models/Group');

// GET /api/groups
exports.getAllGroups = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'all' && category !== 'All Categories') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { currentBookTitle: { $regex: search, $options: 'i' } }
      ];
    }

    const groups = await Group.find(query).sort({ memberCount: -1 });

    res.json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/groups/:id
exports.getGroupById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const group = await Group.findOne(query);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Reading group not found.' });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

// POST /api/groups
exports.createGroup = async (req, res, next) => {
  try {
    const { name, description, category, meetingSchedule, location, currentBookTitle, currentBookAuthor } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and Category are required.' });
    }

    const lastGroup = await Group.findOne().sort({ id: -1 });
    const nextId = (lastGroup && lastGroup.id) ? lastGroup.id + 1 : 1;

    const newGroup = new Group({
      id: nextId,
      name: name.trim(),
      description: description || '',
      category,
      meetingSchedule: meetingSchedule || 'Bi-weekly on Sundays',
      location: location || 'Online via Zoom',
      currentBookTitle: currentBookTitle || 'TBD',
      currentBookAuthor: currentBookAuthor || '',
      memberCount: 1,
      organizer: {
        name: req.user.name,
        role: req.user.role === 'admin' ? 'Club Administrator' : 'Group Organizer'
      },
      members: [{
        userId: req.user.userId,
        name: req.user.name,
        role: 'Organizer',
        avatar: req.user.avatar || 'U'
      }]
    });

    await newGroup.save();

    res.status(201).json({
      success: true,
      message: 'Reading group created successfully.',
      data: newGroup
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/groups/:id
exports.updateGroup = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const updated = await Group.findOneAndUpdate(query, { $set: req.body }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    res.json({
      success: true,
      message: 'Group updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/groups/:id/join
exports.toggleJoinGroup = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const group = await Group.findOne(query);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    const memberIdx = group.members.findIndex(m => m.userId === userId);
    let joined = false;

    if (memberIdx !== -1) {
      // Leave
      group.members.splice(memberIdx, 1);
      group.memberCount = Math.max(0, group.memberCount - 1);
      group.joined = false;
      joined = false;
    } else {
      // Join
      group.members.push({
        userId,
        name: req.user.name,
        role: 'Member',
        avatar: req.user.avatar || 'U'
      });
      group.memberCount += 1;
      group.joined = true;
      joined = true;
    }

    await group.save();

    res.json({
      success: true,
      message: joined ? 'Joined group successfully.' : 'Left group.',
      data: {
        joined,
        memberCount: group.memberCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/groups/:id/poll/vote
exports.votePoll = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const { optionIndex } = req.body;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    if (optionIndex === undefined) {
      return res.status(400).json({ success: false, message: 'optionIndex is required.' });
    }

    const group = await Group.findOne(query);
    if (!group || !group.poll || !group.poll.options) {
      return res.status(404).json({ success: false, message: 'Group poll not found.' });
    }

    const optIdx = Number(optionIndex);
    if (optIdx < 0 || optIdx >= group.poll.options.length) {
      return res.status(400).json({ success: false, message: 'Invalid option index.' });
    }

    group.poll.options[optIdx].votes = (group.poll.options[optIdx].votes || 0) + 1;
    group.poll.totalVotes = (group.poll.totalVotes || 0) + 1;

    await group.save();

    res.json({
      success: true,
      message: 'Vote recorded!',
      data: group.poll
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/groups/:id/track-event
exports.trackGroupEvent = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const group = await Group.findOne(query);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Reading group not found.' });
    }

    const { method, contact, email, phone, eventDetails } = req.body;
    const userEmail = email || contact || (req.user ? req.user.email : 'reader@bookclub.com');
    const userPhone = phone || (req.user ? req.user.phone : '');

    const title = (eventDetails && eventDetails.title) || `${group.name} - Gathering`;
    const schedule = (eventDetails && eventDetails.schedule) || group.meetingSchedule || 'Weekly Gathering';
    const location = (eventDetails && eventDetails.location) || group.location || 'Community Salon & Online';
    const milestone = (eventDetails && eventDetails.milestone) || 'Chapters 12–15 before Saturday session';

    // Format clean iCalendar (.ics) format
    const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BookForge//BookClub Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:group-${group.id || 1}-${Date.now()}@bookclub.internal`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${nowStr}`,
      `SUMMARY:${title.replace(/[\r\n]+/g, ' ')}`,
      `DESCRIPTION:${group.name} - Reading Salon\\nSchedule: ${schedule}\\nLocation: ${location}\\nMilestone: ${milestone}`,
      `LOCATION:${location.replace(/[\r\n]+/g, ' ')}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: Upcoming BookClub Gathering for ${group.name}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    // Create system notification for logged-in user if available
    try {
      const Notification = require('../models/Notification');
      if (req.user && req.user.userId) {
        const lastNotif = await Notification.findOne().sort({ id: -1 });
        const nextNotifId = (lastNotif && lastNotif.id) ? lastNotif.id + 1 : Date.now();
        await Notification.create({
          id: nextNotifId,
          userId: req.user.userId,
          title: `Gathering Tracking: ${group.name}`,
          message: method === 'whatsapp'
            ? `Gathering details for "${group.name}" are synced to WhatsApp.`
            : `Gathering details for "${group.name}" sent to ${userEmail}. Calendar invite ready.`,
          type: 'event',
          icon: method === 'whatsapp' ? '📲' : '✉️',
          isRead: false,
          link: `group-details.html?id=${group.id}`
        });
      }
    } catch (notifErr) {
      console.warn('Notification log error (non-fatal):', notifErr.message);
    }

    res.json({
      success: true,
      message: method === 'whatsapp'
        ? `Tracking activated! WhatsApp alert ready for ${group.name}.`
        : `Tracking activated! Gathering details and calendar invitation sent to ${userEmail}.`,
      data: {
        groupId: group.id,
        groupName: group.name,
        method: method || 'email',
        contact: method === 'whatsapp' ? userPhone : userEmail,
        title,
        schedule,
        location,
        milestone,
        icsData
      }
    });
  } catch (error) {
    next(error);
  }
};

