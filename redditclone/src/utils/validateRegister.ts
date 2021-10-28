import { UsernamePassswordInput } from 'src/resolvers/UsernamePassswordInput';

export const validateRegister = (options: UsernamePassswordInput) => {
  if (options.username.length < 3) {
    return [
      {
        field: 'username',
        message: 'username must be more than 3 characthers long'
      }
    ];
  }
  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'username can not have @ sign'
      }
    ];
  }
  if (options.email.length < 3) {
    return [
      {
        field: 'username',
        message: 'username must be more than 3 characthers long'
      }
    ];
  }

  return null;
};
