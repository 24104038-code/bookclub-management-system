const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const Challenge = require('../models/Challenge');

// Ensure legacy non-partial index is dropped so null eventId/challengeId never conflict
if (Certificate && Certificate.collection) {
  Certificate.collection.dropIndex('userId_1_eventId_1').catch(() => {});
}

// Standard default participation tasks for any event
const DEFAULT_TASKS = [
  { id: 'rsvp', title: 'RSVP & Confirm Attendance', description: 'Reserve your seat for the event.', required: true },
  { id: 'agenda', title: 'Review Event Agenda & Guidelines', description: 'Review the discussion schedule and salon guidelines.', required: true },
  { id: 'participate', title: 'Active Discussion Participation', description: 'Participate in the live breakdown and complete discussion activities.', required: true }
];

function getEventTasks(event) {
  if (event && event.tasks && event.tasks.length > 0) {
    return event.tasks;
  }
  return DEFAULT_TASKS;
}

// POST /api/events/:eventId/certificate
exports.generateEventCertificate = async (req, res, next) => {
  try {
    const eventIdParam = req.params.eventId;
    const userId = req.user.userId;

    // 1. Verify Event Exists
    const query = !isNaN(eventIdParam) ? { id: Number(eventIdParam) } : { _id: eventIdParam };
    const event = await Event.findOne(query);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // 2. Verify User is registered/participating in event
    const isRegistered = (event.rsvps || []).some(r => r.userId === userId);
    if (!isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You must RSVP and register for this event before generating a certificate.'
      });
    }

    // 3. Verify all required event tasks are completed
    const tasks = getEventTasks(event);
    const requiredTasks = tasks.filter(t => t.required !== false);

    const completedTaskIds = new Set(
      (event.taskCompletions || [])
        .filter(tc => tc.userId === userId)
        .map(tc => tc.taskId)
    );
    // 'rsvp' task is automatically completed if user is registered
    if (isRegistered) {
      completedTaskIds.add('rsvp');
    }

    const uncompletedTasks = requiredTasks.filter(t => !completedTaskIds.has(t.id));
    if (uncompletedTasks.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Complete all required event tasks before generating your certificate.',
        data: {
          totalRequired: requiredTasks.length,
          completedCount: requiredTasks.length - uncompletedTasks.length,
          remainingTasks: uncompletedTasks.map(t => t.title)
        }
      });
    }

    // 4. Check if certificate has already been generated
    const existingCert = await Certificate.findOne({
      userId,
      eventId: event.id
    });
    if (existingCert) {
      return res.status(400).json({
        success: false,
        message: 'A certificate has already been generated for this event.',
        data: existingCert
      });
    }

    // 5. Generate unique Certificate ID (e.g. BC-EVT-2026-000124)
    const year = new Date().getFullYear();
    const count = await Certificate.countDocuments({ type: 'event' });
    const seq = String(count + 1).padStart(6, '0');
    let certificateId = `BC-EVT-${year}-${seq}`;

    // Collision protection
    let collision = await Certificate.findOne({ certificateId });
    let offset = 1;
    while (collision) {
      const altSeq = String(count + 1 + offset).padStart(6, '0');
      certificateId = `BC-EVT-${year}-${altSeq}`;
      collision = await Certificate.findOne({ certificateId });
      offset++;
    }

    // Unique secure verification code
    const verificationCode = crypto.randomBytes(8).toString('hex').toUpperCase();

    // Map completed task milestones
    const tasksCompletedList = requiredTasks.map(t => ({
      taskId: t.id,
      taskTitle: t.title,
      completedAt: new Date()
    }));

    // 6. Save Certificate to MongoDB
    const certificate = new Certificate({
      certificateId,
      userId,
      user: req.user._id,
      type: 'event',
      eventId: event.id,
      event: event._id,
      participantName: req.user.name,
      participantEmail: req.user.email,
      eventName: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      organizerName: event.organizer || 'Aditi Krishnan',
      organizerRole: event.organizerRole || 'Lead Event Organizer',
      issueDate: new Date(),
      verificationCode,
      status: 'valid',
      certificateStatement: `For successfully attending and completing all discussion milestones and reading participation in "${event.title}".`,
      tasksCompleted: tasksCompletedList
    });

    await certificate.save();

    return res.status(201).json({
      success: true,
      message: 'Certificate generated successfully!',
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:eventId/certificate-status
exports.getEventCertificateStatus = async (req, res, next) => {
  try {
    const eventIdParam = req.params.eventId;
    const userId = req.user.userId;

    const query = !isNaN(eventIdParam) ? { id: Number(eventIdParam) } : { _id: eventIdParam };
    const event = await Event.findOne(query);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const isRegistered = (event.rsvps || []).some(r => r.userId === userId);
    const existingCert = await Certificate.findOne({ userId, eventId: event.id });

    const allTasks = getEventTasks(event);
    const completedSet = new Set(
      (event.taskCompletions || [])
        .filter(tc => tc.userId === userId)
        .map(tc => tc.taskId)
    );
    if (isRegistered) {
      completedSet.add('rsvp');
    }

    const tasksStatus = allTasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      required: t.required !== false,
      completed: completedSet.has(t.id)
    }));

    const requiredTasks = tasksStatus.filter(t => t.required);
    const allRequiredCompleted = isRegistered && requiredTasks.every(t => t.completed);

    res.json({
      success: true,
      data: {
        isRsvpd: isRegistered,
        allTasksCompleted: allRequiredCompleted,
        eligible: allRequiredCompleted && !existingCert,
        hasCertificate: !!existingCert,
        certificate: existingCert,
        tasks: tasksStatus,
        totalTasks: requiredTasks.length,
        completedTasks: requiredTasks.filter(t => t.completed).length
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/events/:eventId/tasks/:taskId/complete
exports.completeEventTask = async (req, res, next) => {
  try {
    const { eventId, taskId } = req.params;
    const userId = req.user.userId;

    const query = !isNaN(eventId) ? { id: Number(eventId) } : { _id: eventId };
    const event = await Event.findOne(query);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const isRegistered = (event.rsvps || []).some(r => r.userId === userId);
    if (!isRegistered && taskId !== 'rsvp') {
      return res.status(400).json({
        success: false,
        message: 'You must RSVP for this event before completing participation tasks.'
      });
    }

    if (!event.taskCompletions) {
      event.taskCompletions = [];
    }

    const existingIdx = event.taskCompletions.findIndex(tc => tc.userId === userId && tc.taskId === taskId);
    if (existingIdx === -1) {
      event.taskCompletions.push({
        userId,
        taskId,
        completedAt: new Date()
      });
      await event.save();
    }

    res.json({
      success: true,
      message: `Task "${taskId}" completed successfully!`,
      data: {
        taskId,
        completed: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/challenges/:challengeId/certificate
exports.generateChallengeCertificate = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.userId;

    // 1. Verify Challenge exists
    const query = !isNaN(challengeId) ? { id: Number(challengeId) } : { _id: challengeId };
    const challenge = await Challenge.findOne(query);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.'
      });
    }

    // 2. Check participant record or progress
    let participant = (challenge.participants || []).find(p => p.userId === userId);
    const userProgress = participant ? participant.progress : (challenge.joined ? challenge.progress : 0);
    const target = challenge.target || 1;
    const isCompleted = userProgress >= target || (participant && participant.status === 'Completed');

    if (!isCompleted) {
      return res.status(400).json({
        success: false,
        message: `Challenge not yet completed! Progress: ${userProgress}/${target} ${challenge.unit}. Complete the target to unlock your certificate.`,
        data: {
          currentProgress: userProgress,
          target,
          unit: challenge.unit,
          remaining: Math.max(0, target - userProgress)
        }
      });
    }

    // 3. Check if certificate already exists
    const existingCert = await Certificate.findOne({
      userId,
      challengeId: challenge.id
    });
    if (existingCert) {
      return res.status(400).json({
        success: false,
        message: 'A certificate has already been generated for this challenge.',
        data: existingCert
      });
    }

    // 4. Generate unique Certificate ID (e.g. BC-CHG-2026-000001)
    const year = new Date().getFullYear();
    const count = await Certificate.countDocuments({ type: 'challenge' });
    const seq = String(count + 1).padStart(6, '0');
    let certificateId = `BC-CHG-${year}-${seq}`;

    // Collision protection
    let collision = await Certificate.findOne({ certificateId });
    let offset = 1;
    while (collision) {
      const altSeq = String(count + 1 + offset).padStart(6, '0');
      certificateId = `BC-CHG-${year}-${altSeq}`;
      collision = await Certificate.findOne({ certificateId });
      offset++;
    }

    // Unique secure verification code
    const verificationCode = crypto.randomBytes(8).toString('hex').toUpperCase();

    // Map completed milestones from timeline
    const tasksCompletedList = (challenge.timeline && challenge.timeline.length > 0)
      ? challenge.timeline.map(t => ({
          taskId: t.step,
          taskTitle: t.desc,
          completedAt: new Date()
        }))
      : [{
          taskId: 'target_complete',
          taskTitle: `Completed ${challenge.target} ${challenge.unit}`,
          completedAt: new Date()
        }];

    // 5. Create Certificate document
    const certificate = new Certificate({
      certificateId,
      userId,
      user: req.user._id,
      type: 'challenge',
      challengeId: challenge.id,
      challenge: challenge._id,
      participantName: req.user.name,
      participantEmail: req.user.email,
      challengeTitle: challenge.title,
      targetRequirement: `${challenge.target} ${challenge.unit}`,
      badgeName: challenge.badgeName || 'Challenge Finisher',
      badgeIcon: challenge.badgeIcon || '⚡',
      rewardXp: challenge.rewardXp || 500,
      eventName: challenge.title,
      eventDate: `Target: ${challenge.target} ${challenge.unit}`,
      eventLocation: 'BOOK FORGE Reading Quest',
      organizerName: 'Sarah Jenkins',
      organizerRole: 'Challenge Curator & Reading Lead',
      issueDate: new Date(),
      verificationCode,
      status: 'valid',
      certificateStatement: `For outstanding reading dedication and successfully completing the "${challenge.title}" challenge (${challenge.target} ${challenge.unit}) and earning the ${challenge.badgeName || 'Challenge Finisher'} badge.`,
      tasksCompleted: tasksCompletedList
    });

    await certificate.save();

    return res.status(201).json({
      success: true,
      message: 'Challenge certificate generated successfully! 🎉',
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/challenges/:challengeId/certificate-status
exports.getChallengeCertificateStatus = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.userId;

    const query = !isNaN(challengeId) ? { id: Number(challengeId) } : { _id: challengeId };
    const challenge = await Challenge.findOne(query);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    const participant = (challenge.participants || []).find(p => p.userId === userId);
    const isJoined = !!participant || challenge.joined;
    const userProgress = participant ? participant.progress : (challenge.joined ? challenge.progress : 0);
    const target = challenge.target || 1;
    const isCompleted = userProgress >= target || (participant && participant.status === 'Completed');
    const existingCert = await Certificate.findOne({ userId, challengeId: challenge.id });

    const pct = Math.min(100, Math.round((userProgress / target) * 100));

    res.json({
      success: true,
      data: {
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        isJoined,
        progress: userProgress,
        target,
        unit: challenge.unit,
        percentage: pct,
        isCompleted,
        eligible: isCompleted && !existingCert,
        hasCertificate: !!existingCert,
        certificate: existingCert || null,
        badgeName: challenge.badgeName,
        badgeIcon: challenge.badgeIcon,
        rewardXp: challenge.rewardXp,
        timeline: challenge.timeline || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/certificates
exports.getMyCertificates = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const certificates = await Certificate.find({ userId }).sort({ issueDate: -1 });

    res.json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/certificates/:certificateId
exports.getCertificateById = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({
      $or: [
        { certificateId: certificateId.trim() },
        { _id: (certificateId.length === 24) ? certificateId : null }
      ]
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.'
      });
    }

    res.json({
      success: true,
      data: cert
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/certificates/verify/:certificateId
exports.verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({
      certificateId: certificateId.trim().toUpperCase()
    });

    if (!cert || cert.status !== 'valid') {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate is invalid, expired, or does not exist.',
        data: null
      });
    }

    return res.json({
      success: true,
      valid: true,
      message: 'Certificate verified as authentic and valid.',
      data: {
        certificateId: cert.certificateId,
        type: cert.type || 'event',
        participantName: cert.participantName,
        eventName: cert.eventName,
        eventDate: cert.eventDate,
        eventLocation: cert.eventLocation,
        challengeTitle: cert.challengeTitle || cert.eventName,
        targetRequirement: cert.targetRequirement,
        badgeName: cert.badgeName,
        badgeIcon: cert.badgeIcon,
        rewardXp: cert.rewardXp,
        issueDate: cert.issueDate,
        organizerName: cert.organizerName,
        organizerRole: cert.organizerRole,
        verificationCode: cert.verificationCode,
        status: cert.status,
        statement: cert.certificateStatement
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/certificates/:certificateId/pdf
exports.downloadCertificatePDF = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({
      certificateId: certificateId.trim().toUpperCase()
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.'
      });
    }

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate-${cert.certificateId}.pdf"`);

    doc.pipe(res);

    // Dimensions: A4 Landscape is 841.89 x 595.28
    const width = doc.page.width;
    const height = doc.page.height;
    const isChallenge = cert.type === 'challenge';

    // 1. Background Tint
    doc.rect(0, 0, width, height).fill('#FAF7F2');

    // 2. Decorative Outer Border (Double Gold/Green lines)
    doc.lineWidth(4).strokeColor('#2D4A3E').rect(25, 25, width - 50, height - 50).stroke();
    doc.lineWidth(1.5).strokeColor('#C5A059').rect(32, 32, width - 64, height - 64).stroke();

    // 3. Corner Accents
    const drawCorner = (x, y) => {
      doc.save();
      doc.lineWidth(2).strokeColor('#C5A059');
      doc.moveTo(x - 12, y).lineTo(x + 12, y).stroke();
      doc.moveTo(x, y - 12).lineTo(x, y + 12).stroke();
      doc.circle(x, y, 4).fillAndStroke('#C5A059', '#2D4A3E');
      doc.restore();
    };
    drawCorner(32, 32);
    drawCorner(width - 32, 32);
    drawCorner(32, height - 32);
    drawCorner(width - 32, height - 32);

    // 4. Header & Branding
    doc.fillColor('#2D4A3E')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('BOOK FORGE COMMUNITY SALON', 0, 65, { align: 'center', characterSpacing: 2 });

    doc.fillColor('#7A4E2D')
       .fontSize(9)
       .font('Helvetica')
       .text(
         isChallenge
           ? 'READING QUEST & LITERARY ACHIEVEMENT'
           : 'LITERARY EXCELLENCE & ACTIVE READING COMMUNITY',
         0, 88, { align: 'center', characterSpacing: 1.5 }
       );

    // 5. Main Certificate Title
    doc.fillColor('#1F3027')
       .fontSize(28)
       .font('Times-Bold')
       .text(
         isChallenge ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION',
         0, 115, { align: 'center' }
       );

    doc.lineWidth(1).strokeColor('#C5A059').moveTo(220, 155).lineTo(width - 220, 155).stroke();

    // 6. Presentation Line
    doc.fillColor('#555555')
       .fontSize(11)
       .font('Times-Italic')
       .text('This is proudly presented to', 0, 172, { align: 'center' });

    // 7. Participant Name (Prominent & Elegant)
    doc.fillColor('#16291F')
       .fontSize(28)
       .font('Times-BoldItalic')
       .text(cert.participantName, 0, 195, { align: 'center' });

    doc.lineWidth(0.5).strokeColor('#7A4E2D').moveTo(260, 230).lineTo(width - 260, 230).stroke();

    // 8. Statement
    doc.fillColor('#444444')
       .fontSize(12)
       .font('Times-Roman')
       .text(
         isChallenge
           ? 'for outstanding dedication and successfully achieving all milestones in the reading challenge'
           : 'for successfully completing all discussion milestones and active reading participation in',
         0, 245, { align: 'center' }
       );

    // 9. Challenge / Event Title
    doc.fillColor('#7A4E2D')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(`"${cert.challengeTitle || cert.eventName}"`, 0, 268, { align: 'center' });

    // 10. Details (Target & Badge or Date & Location)
    doc.fillColor('#666666')
       .fontSize(11)
       .font('Helvetica')
       .text(
         isChallenge
           ? `Target Achieved: ${cert.targetRequirement || '100%'}  |  Earned Badge: ${cert.badgeName || 'Finisher'}  |  Award: +${cert.rewardXp || 500} XP`
           : `Held on ${cert.eventDate}  |  ${cert.eventLocation || 'BOOK FORGE Virtual Salon'}`,
         0, 298, { align: 'center' }
       );

    // 11. Signatures and Seal Section
    const sigY = 410;

    // Left Signature: Organizer / Challenge Curator
    const leadName = cert.organizerName || (isChallenge ? 'Sarah Jenkins' : 'Aditi Krishnan');
    const leadRole = cert.organizerRole || (isChallenge ? 'Lead Challenge Curator' : 'Lead Event Organizer');

    doc.lineWidth(1).strokeColor('#444444').moveTo(120, sigY).lineTo(300, sigY).stroke();
    doc.fillColor('#2D4A3E').fontSize(14).font('Times-Italic').text(leadName, 120, sigY - 24, { width: 180, align: 'center' });
    doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold').text(leadName, 120, sigY + 6, { width: 180, align: 'center' });
    doc.fillColor('#777777').fontSize(9).font('Helvetica').text(leadRole, 120, sigY + 20, { width: 180, align: 'center' });

    // Center Gold Seal
    doc.circle(width / 2, sigY - 5, 34).fillAndStroke('#F4E8C1', '#C5A059');
    doc.circle(width / 2, sigY - 5, 28).lineWidth(1).strokeColor('#C5A059').stroke();
    doc.fillColor('#7A4E2D').fontSize(8).font('Helvetica-Bold').text('VERIFIED', width / 2 - 30, sigY - 14, { width: 60, align: 'center' });
    doc.fillColor('#2D4A3E').fontSize(14).font('Helvetica-Bold').text('★', width / 2 - 30, sigY - 4, { width: 60, align: 'center' });
    doc.fillColor('#7A4E2D').fontSize(7).font('Helvetica-Bold').text('BOOK FORGE', width / 2 - 35, sigY + 12, { width: 70, align: 'center' });

    // Right Signature: Platform Director / Administrator
    doc.lineWidth(1).strokeColor('#444444').moveTo(width - 300, sigY).lineTo(width - 120, sigY).stroke();
    doc.fillColor('#2D4A3E').fontSize(14).font('Times-Italic').text('Elena Vance', width - 300, sigY - 24, { width: 180, align: 'center' });
    doc.fillColor('#333333').fontSize(10).font('Helvetica-Bold').text('Elena Vance', width - 300, sigY + 6, { width: 180, align: 'center' });
    doc.fillColor('#777777').fontSize(9).font('Helvetica').text('Platform Director', width - 300, sigY + 20, { width: 180, align: 'center' });

    // 12. Bottom Security & Verification Strip
    const footerY = height - 60;
    const formattedIssueDate = new Date(cert.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.fillColor('#888888')
       .fontSize(8.5)
       .font('Courier')
       .text(`CERTIFICATE ID: ${cert.certificateId}   |   ISSUED: ${formattedIssueDate}   |   SECURITY CODE: ${cert.verificationCode}`, 0, footerY, { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

