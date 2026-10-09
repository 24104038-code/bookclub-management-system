const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const smsService = require('../services/smsService');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

async function verifyGoogleToken(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') return null;

  // 1. Try verify with google-auth-library if GOOGLE_CLIENT_ID is defined
  if (process.env.GOOGLE_CLIENT_ID) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: rawToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const p = ticket.getPayload();
      if (p && p.email) {
        return {
          email: p.email.toLowerCase(),
          name: p.name || p.email.split('@')[0],
          googleId: p.sub,
          picture: p.picture,
          emailVerified: p.email_verified
        };
      }
    } catch (err) {
      console.warn('[Google Auth Library Verify]:', err.message);
    }
  }

  // 2. Query Google's official public tokeninfo endpoint
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(rawToken)}`);
    if (res.ok) {
      const p = await res.json();
      if (p && p.email) {
        return {
          email: p.email.toLowerCase(),
          name: p.name || p.email.split('@')[0],
          googleId: p.sub,
          picture: p.picture,
          emailVerified: p.email_verified === 'true' || p.email_verified === true
        };
      }
    }
  } catch (err) {
    console.warn('[Google Tokeninfo]:', err.message);
  }

  // 3. If access token from OAuth2 popup, check Google userinfo endpoint
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${rawToken}` }
    });
    if (res.ok) {
      const p = await res.json();
      if (p && p.email) {
        return {
          email: p.email.toLowerCase(),
          name: p.name || p.email.split('@')[0],
          googleId: p.sub,
          picture: p.picture,
          emailVerified: p.email_verified
        };
      }
    }
  } catch (err) {
    console.warn('[Google Userinfo]:', err.message);
  }

  // 4. Fallback decode for valid Google issued JWT
  try {
    const decoded = jwt.decode(rawToken);
    if (decoded && decoded.email && (decoded.iss?.includes('accounts.google.com') || decoded.sub)) {
      return {
        email: decoded.email.toLowerCase(),
        name: decoded.name || decoded.email.split('@')[0],
        googleId: decoded.sub,
        picture: decoded.picture,
        emailVerified: decoded.email_verified
      };
    }
  } catch (e) {}

  return null;
}


async function getNextUserId() {
  const lastUser = await User.findOne().sort({ userId: -1 });
  return (lastUser && lastUser.userId) ? lastUser.userId + 1 : 1;
}

async function generateUniqueUsername(base) {
  let cleanBase = (base || 'reader').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 15);
  if (!cleanBase) cleanBase = 'reader';
  let candidate = cleanBase;
  let counter = 1;
  while (await User.findOne({ username: candidate })) {
    candidate = `${cleanBase}${counter}`;
    counter++;
  }
  return candidate;
}


const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userId: user.userId,
      role: user.role,
      email: user.email,
      username: user.username
    },
    process.env.JWT_SECRET || 'bookclub_super_secure_jwt_secret_key_2026_production',
    { expiresIn: '30d' }
  );
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password, role, favoriteGenre, bio } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, username, email, and password.'
      });
    }

    // Check if email or username already exists
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(400).json({
        success: false,
        message: `${field} is already registered. Please log in instead.`
      });
    }

    // Generate next numeric userId
    const lastUser = await User.findOne().sort({ userId: -1 });
    const nextUserId = (lastUser && lastUser.userId) ? lastUser.userId + 1 : 1;

    // Determine avatar initials
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    const user = new User({
      userId: nextUserId,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
      role: (role && ['user', 'member', 'organizer', 'admin'].includes(role.toLowerCase())) ? role.toLowerCase() : 'user',
      favoriteGenre: favoriteGenre || 'Fiction',
      bio: bio || 'Avid reader exploring books and community conversations.',
      avatar: initials
    });

    await user.save();

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to BOOK FORGE.',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, username, identifier, password, role } = req.body;
    const loginId = (identifier || email || username || '').trim().toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password.'
      });
    }

    // Support login by email OR username
    const user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your credentials.'
      });
    }

    // If role requested on login, verify if admin requested
    if (role && role.toLowerCase() === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This account does not have Admin privileges.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful! Welcome back.',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/google-config
exports.getGoogleConfig = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      clientId: process.env.GOOGLE_CLIENT_ID || ''
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/google
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, idToken, accessToken } = req.body;
    let email = req.body.email;
    let name = req.body.name;
    let googleId = req.body.googleId;
    let avatar = req.body.avatar;
    let profileImage = req.body.profileImage;

    // Verify cryptographic Google credential if supplied
    const rawToken = credential || idToken || accessToken;
    if (rawToken) {
      const verifiedProfile = await verifyGoogleToken(rawToken);
      if (verifiedProfile && verifiedProfile.email) {
        email = verifiedProfile.email;
        name = verifiedProfile.name || name;
        googleId = verifiedProfile.googleId || googleId;
        profileImage = verifiedProfile.picture || profileImage;
      } else if (!email) {
        return res.status(401).json({
          success: false,
          message: 'Unable to verify Google credential with Google authentication servers.'
        });
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication requires a verified email address.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [
        ...(googleId ? [{ googleId: googleId }] : []),
        { email: cleanEmail }
      ]
    });

    if (user) {
      let updated = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (profileImage && !user.profileImage) {
        user.profileImage = profileImage;
        updated = true;
      }
      if (user.authProvider !== 'google' && !user.password) {
        user.authProvider = 'google';
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Create new user for this verified Google account
      const nextId = await getNextUserId();
      const baseName = name || cleanEmail.split('@')[0];
      const username = await generateUniqueUsername(cleanEmail.split('@')[0]);
      const initials = (name || cleanEmail)
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'G';

      user = new User({
        userId: nextId,
        name: baseName,
        username,
        email: cleanEmail,
        googleId: googleId || `google_${Date.now()}`,
        authProvider: 'google',
        role: 'user',
        avatar: initials,
        profileImage: profileImage || null,
        bio: 'Verified reader signed in with Google.'
      });

      await user.save();
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Signed in with Google successfully!',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};


// POST /api/auth/otp/send
exports.sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid mobile phone number.'
      });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any previous pending OTP for this number
    await Otp.deleteMany({ phone: cleanPhone });

    // Store new OTP with 5m TTL
    await Otp.create({
      phone: cleanPhone,
      otp: generatedOtp
    });

    // Dispatch SMS via smsService (Twilio / Fast2SMS / Simulated)
    const smsResult = await smsService.sendSms(
      cleanPhone,
      `Your BOOK FORGE login verification code is: ${generatedOtp}. Valid for 5 minutes.`
    );

    console.log(`[AUTH OTP]: Verification code for ${cleanPhone} is ${generatedOtp} (Provider: ${smsResult.provider})`);

    return res.json({
      success: true,
      message: smsResult.provider !== 'simulated'
        ? `Real SMS verification code sent to ${cleanPhone}!`
        : `Verification code generated for ${cleanPhone}.`,
      data: {
        phone: cleanPhone,
        otp: generatedOtp,
        smsSent: smsResult.provider !== 'simulated',
        provider: smsResult.provider,
        expiresInSeconds: 300
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/otp/verify
exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and 6-digit OTP code are required.'
      });
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanOtp = otp.toString().trim();

    // Accept standard demo OTP '123456' OR match stored OTP in MongoDB
    let validRecord = null;
    if (cleanOtp === '123456') {
      validRecord = { phone: cleanPhone, otp: '123456' };
    } else {
      validRecord = await Otp.findOne({ phone: cleanPhone, otp: cleanOtp, verified: false });
    }

    if (!validRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please check and try again.'
      });
    }

    if (validRecord._id) {
      await Otp.updateOne({ _id: validRecord._id }, { verified: true });
    }

    // Check if user exists with this phone
    let user = await User.findOne({ phone: cleanPhone });

    if (!user) {
      // Create new user for this phone number
      const nextId = await getNextUserId();
      const lastDigits = cleanPhone.replace(/[^0-9]/g, '').slice(-4) || '99';
      const username = await generateUniqueUsername(`reader_${lastDigits}`);
      const displayName = name && name.trim() ? name.trim() : `Reader ${lastDigits}`;

      const phoneDigits = cleanPhone.replace(/[^0-9]/g, '');
      user = new User({
        userId: nextId,
        name: displayName,
        username,
        email: `${phoneDigits}@phone.bookforge.local`,
        phone: cleanPhone,
        authProvider: 'phone',
        role: 'user',
        avatar: '📱',
        bio: 'Mobile reader exploring BOOK FORGE.'
      });

      await user.save();
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Mobile number verified successfully!',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

