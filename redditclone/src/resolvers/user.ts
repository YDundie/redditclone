import { Resolver, Arg, Mutation, Field, Ctx, ObjectType, Query } from 'type-graphql';
import { MyContext } from '../types';
import { User } from '../entities/User';
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';
import { cookieName, FORGET_PASSWORD_PREFIX } from '../constants';
import { UsernamePassswordInput } from './UsernamePassswordInput';
import { validateRegister } from '../utils//validateRegister';
import { v4 } from 'uuid';
import { sendEmail } from '../utils/sendEmail';

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() { em, redis }: MyContext) {
    const user: any = await em.findOne(User, { email });

    if (!user) {
      return true;
    } else {
      const token = v4();
      await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3);
      const anchor = `<a href="http://localhost:3000/change-pasword/${token}">Reset password</a>`;
      sendEmail(email, anchor);

      return true;
    }
  }

  @Mutation(() => UserResponse)
  async changePassword(@Arg('password') password: string, @Arg('token') token: string, @Ctx() { em, redis, req }: MyContext): Promise<UserResponse> {
    if (password.length < 2) {
      return {
        errors: [{ field: 'password', message: 'lenght of the password must be more than 2 characthers' }]
      };
    }
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);
    if (!userId) {
      return {
        errors: [{ field: 'token', message: 'token expired' }]
      };
    }

    const user = await em.findOne(User, { id: parseInt(userId) });

    if (!user) {
      return {
        errors: [{ field: 'token', message: 'user no longer exists' }]
      };
    }

    user.password = await argon2.hash(password);
    await em.persistAndFlush(user);

    req.session.userId = user.id;

    return { user };
  }

  @Query(() => [User], { nullable: true })
  async getall(@Ctx() { em }: MyContext) {
    const user = await em.find(User, {});
    return user;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const idObject = { id: req.session.userId };
    const user = await em.findOne(User, idObject);
    return user;
  }

  @Mutation(() => UserResponse)
  async register(@Arg('options') options: UsernamePassswordInput, @Ctx() { em, req }: MyContext) {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);

    const user = em.create(User, { username: options.username, email: options.email, password: hashedPassword });
    try {
      (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          email: options.email,
          password: options.password,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');
      await em.persistAndFlush(user);
    } catch (err) {
      if (err.detail.includes('already exists'))
        //|| err.detail.includes('exists'))
        return {
          errors: [
            {
              field: 'username',
              message: 'username is taken'
            }
          ]
        };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(@Arg('usernameOrEmail') usernameOrEmail: string, @Arg('password') password: string, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
    const emailOrUsername = usernameOrEmail.includes('@');
    const user = await em.findOne(User, usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail });
    if (!user) {
      if (emailOrUsername) {
        return {
          errors: [
            {
              field: 'email',
              message: 'That email does not exist'
            }
          ]
        };
      } else {
        return {
          errors: [
            {
              field: 'username',
              message: 'That username does not exist'
            }
          ]
        };
      }
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Incorrect password'
          }
        ]
      };
    }
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    res.clearCookie(cookieName, { domain: 'localhost', path: '/' });
    return new Promise(resolve => {
      req.session.destroy(err => {
        if (err) {
          console.log('error :>> ', err);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }
}
