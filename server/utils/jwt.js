import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET || 'quizard_super_secret_jwt_key_2026_production_grade',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};
