import { registerAs } from '@nestjs/config';
// import { sequelizeConfig } from '../database/typeorm/typeorm-config';

const databaseConfig = registerAs('database', () => ({}));

export { databaseConfig };
