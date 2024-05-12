export default {
  name: 'default',
  type: 'postgres' as const,
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_POST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  dropSchema: false,
  logging: true,
  entities: ['src/**/*.entity.ts', 'dist/**/*.entity.ts'],
};
