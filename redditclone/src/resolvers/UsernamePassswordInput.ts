import { InputType, Field } from 'type-graphql';

@InputType()
export class UsernamePassswordInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
