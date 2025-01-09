export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  swagger: {
    title: 'MorphLink Backend',
    description: 'The MorphLink Backend API description',
    version: '1.0',
    path: 'api',
  }
});
