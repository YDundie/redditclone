import { Resolver, Query, Ctx, Arg, Int, Mutation } from 'type-graphql';
import { Post } from '../entities/Post';
import { MyContext } from 'src/types';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, id);
  }

  @Mutation(() => Post)
  async createPost(@Arg('title', () => String) title: String, @Ctx() { em }: MyContext): Promise<Post | null> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(@Arg('id', () => Int) id: number, @Arg('title', () => String) title: string, @Ctx() { em }: MyContext): Promise<Post | null | String> {
    if (title === '' || title === null) throw new Error('Please provide title');

    const post = await em.findOne(Post, id);
    if (post === null) {
      throw new Error(`Post with id ${id} could not be fetched`);
    }
    post.title = title;
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id', () => Int) id: number, @Ctx() { em }: MyContext): Promise<boolean> {
    try {
      await em.nativeDelete(Post, id);
      return true;
    } catch (err) {
      throw new Error(err);
    }
  }
}
