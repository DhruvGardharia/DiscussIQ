export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) return res.status(403).json({ message: 'Not authenticated' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
