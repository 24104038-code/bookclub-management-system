/**
 * Role-Based Access Control Middleware
 * Usage: roleMiddleware(['admin']) or roleMiddleware(['admin', 'organizer'])
 */
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before accessing this resource.'
      });
    }

    const userRole = (req.user.role || 'user').toLowerCase();
    
    // Normalize role synonyms: 'member' and 'user' are equivalent
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    if (normalizedAllowed.includes('member') && !normalizedAllowed.includes('user')) {
      normalizedAllowed.push('user');
    }
    if (normalizedAllowed.includes('user') && !normalizedAllowed.includes('member')) {
      normalizedAllowed.push('member');
    }

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
