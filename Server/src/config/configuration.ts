export const configuration = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
  },
  cookie: {
    name: 'session',
    keys: [
      process.env.COOKIE_KEY_ONE || 'key-one',
      process.env.COOKIE_KEY_TWO || 'key-two',
    ],
    maxAge: 24 * 7 * 3600000, // 7 days
    secure: process.env.NODE_ENV !== 'development',
  },
}); 