import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
        return res.status(401).json({ success: false, error: 'Authentication required' });

    const token = header.slice(7);
    try {
        req.jwtUser = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

export const requireAdmin = (req, res, next) => {
    requireAuth(req, res, () => {
        if (!['admin', 'superadmin'].includes(req.jwtUser?.role))
            return res.status(403).json({ success: false, error: 'Admin access required' });
        next();
    });
};

export const requireStaff = (req, res, next) => {
    requireAuth(req, res, () => {
        if (!['admin', 'superadmin', 'moderator'].includes(req.jwtUser?.role))
            return res.status(403).json({ success: false, error: 'Staff access required' });
        next();
    });
};

export const requireSuperAdmin = (req, res, next) => {
    requireAuth(req, res, () => {
        if (req.jwtUser?.role !== 'superadmin')
            return res.status(403).json({ success: false, error: 'SuperAdmin access required' });
        next();
    });
};
