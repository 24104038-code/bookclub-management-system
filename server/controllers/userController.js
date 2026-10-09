const User = require('../models/User');

// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, bio, favoriteGenre, avatar, profileImage, userId, email, username, _id } = req.body;
    let user = null;

    if (req.user && req.user._id) {
      user = await User.findById(req.user._id);
    }

    if (!user && (userId || req.query.userId)) {
      const uId = Number(userId || req.query.userId);
      if (!isNaN(uId)) {
        user = await User.findOne({ userId: uId });
      }
    }

    if (!user && req.params && req.params.id) {
      const idParam = req.params.id;
      if (!isNaN(idParam)) {
        user = await User.findOne({ userId: Number(idParam) });
      } else if (idParam.length === 24) {
        user = await User.findById(idParam);
      } else {
        user = await User.findOne({ username: idParam.toLowerCase() });
      }
    }

    if (!user && _id) {
      user = await User.findById(_id);
    }

    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user && username) {
      user = await User.findOne({ username: username.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) {
      user.name = name.trim();
      if (!avatar) {
        const initials = name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
        if (initials) user.avatar = initials;
      }
    }
    if (bio !== undefined) user.bio = bio;
    if (favoriteGenre) user.favoriteGenre = favoriteGenre;
    if (avatar) user.avatar = avatar;
    if (profileImage !== undefined) {
      user.profileImage = (profileImage && typeof profileImage === 'string' && profileImage.trim()) ? profileImage.trim() : null;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully in database',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role.toLowerCase();
    }

    let sortOption = { level: -1, xp: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const users = await User.find(query).sort(sortOption);
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const idParam = req.params.id;
    let query;

    if (!isNaN(idParam)) {
      query = { userId: Number(idParam) };
    } else if (idParam.length === 24) {
      query = { _id: idParam };
    } else {
      query = { username: idParam.toLowerCase() };
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
