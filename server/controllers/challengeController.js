const Challenge = require('../models/Challenge');

// GET /api/challenges
exports.getAllChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find().sort({ daysRemaining: 1 });
    res.json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/challenges/:id
exports.getChallengeById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const challenge = await Challenge.findOne(query);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    res.json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
};

// POST /api/challenges/:id/join
exports.toggleJoinChallenge = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const challenge = await Challenge.findOne(query);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    const participantIdx = challenge.participants.findIndex(p => p.userId === userId);
    let joined = false;

    if (participantIdx !== -1) {
      challenge.participants.splice(participantIdx, 1);
      challenge.participantsCount = Math.max(0, challenge.participantsCount - 1);
      challenge.joined = false;
      joined = false;
    } else {
      challenge.participants.push({
        userId,
        name: req.user.name,
        progress: 0,
        status: 'In Progress'
      });
      challenge.participantsCount += 1;
      challenge.joined = true;
      joined = true;
    }

    await challenge.save();

    res.json({
      success: true,
      message: joined ? 'Challenge accepted!' : 'Left challenge.',
      data: {
        joined,
        participantsCount: challenge.participantsCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/challenges/:id/progress
exports.updateChallengeProgress = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const { progress, increment } = req.body;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const challenge = await Challenge.findOne(query);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    if (!challenge.participants) {
      challenge.participants = [];
    }

    let participant = challenge.participants.find(p => p.userId === userId);
    if (!participant) {
      participant = {
        userId,
        name: req.user.name,
        progress: 0,
        status: 'In Progress'
      };
      challenge.participants.push(participant);
      challenge.participantsCount += 1;
      challenge.joined = true;
    }

    if (typeof progress === 'number') {
      participant.progress = Math.max(0, progress);
    } else if (typeof increment === 'number') {
      participant.progress = Math.max(0, (participant.progress || 0) + increment);
    } else {
      participant.progress = (participant.progress || 0) + 1;
    }

    challenge.progress = participant.progress;

    if (participant.progress >= challenge.target) {
      participant.status = 'Completed';
    } else {
      participant.status = 'In Progress';
    }

    await challenge.save();

    res.json({
      success: true,
      message: 'Challenge progress updated successfully!',
      data: {
        progress: participant.progress,
        target: challenge.target,
        unit: challenge.unit,
        status: participant.status,
        isCompleted: participant.progress >= challenge.target
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/challenges/:id/complete
exports.completeChallenge = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const challenge = await Challenge.findOne(query);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    if (!challenge.participants) {
      challenge.participants = [];
    }

    let participant = challenge.participants.find(p => p.userId === userId);
    if (!participant) {
      participant = {
        userId,
        name: req.user.name,
        progress: challenge.target,
        status: 'Completed'
      };
      challenge.participants.push(participant);
      challenge.participantsCount += 1;
      challenge.joined = true;
    } else {
      participant.progress = challenge.target;
      participant.status = 'Completed';
    }

    challenge.progress = challenge.target;
    if (challenge.timeline && challenge.timeline.length > 0) {
      challenge.timeline.forEach(t => t.completed = true);
    }

    await challenge.save();

    res.json({
      success: true,
      message: 'Congratulations! You completed the challenge!',
      data: {
        progress: challenge.target,
        target: challenge.target,
        unit: challenge.unit,
        status: 'Completed',
        isCompleted: true
      }
    });
  } catch (error) {
    next(error);
  }
};

