const Competition = require('../models/Competition');

// GET /api/competitions
exports.getAllCompetitions = async (req, res, next) => {
  try {
    const comps = await Competition.find().sort({ daysRemaining: 1 });
    res.json({
      success: true,
      count: comps.length,
      data: comps
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/competitions/:id
exports.getCompetitionById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const comp = await Competition.findOne(query);
    if (!comp) {
      return res.status(404).json({ success: false, message: 'Competition not found.' });
    }

    res.json({ success: true, data: comp });
  } catch (error) {
    next(error);
  }
};

// POST /api/competitions/:id/join
exports.toggleJoinCompetition = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const userId = req.user.userId;
    const query = !isNaN(idParam) ? { id: Number(idParam) } : { _id: idParam };

    const comp = await Competition.findOne(query);
    if (!comp) {
      return res.status(404).json({ success: false, message: 'Competition not found.' });
    }

    const participantIdx = comp.participantsList.findIndex(p => p.userId === userId);
    let joined = false;

    if (participantIdx !== -1) {
      comp.participantsList.splice(participantIdx, 1);
      comp.participants = Math.max(0, comp.participants - 1);
      comp.joined = false;
      joined = false;
    } else {
      comp.participantsList.push({
        userId,
        name: req.user.name,
        progress: 0,
        rank: comp.participants + 1
      });
      comp.participants += 1;
      comp.joined = true;
      joined = true;
    }

    await comp.save();

    res.json({
      success: true,
      message: joined ? 'Entered tournament!' : 'Withdrew from tournament.',
      data: {
        joined,
        participants: comp.participants
      }
    });
  } catch (error) {
    next(error);
  }
};
