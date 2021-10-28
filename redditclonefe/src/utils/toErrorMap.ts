import { FieldError } from '../generated/graphql';

export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};
  errors.forEach(({ field, message }) => {
    console.log('field', field);
    errorMap[field] = message;
  });

  return errorMap;
};
