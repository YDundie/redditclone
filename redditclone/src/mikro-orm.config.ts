import { Post } from './entities/Post';
import { __prod__ } from './constants';
import path from 'path';
import { User } from './entities/User';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/ // regex pattern for the migration files
  },
  entities: [Post, User],
  dbName: 'redditclone',
  user: 'postgres',
  password: 'root',
  type: 'postgresql',
  debug: !__prod__
} as any;
