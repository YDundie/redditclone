import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import {useRouter} from 'next/router';
import * as React from 'react';
import { useState } from 'react';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createURQLclient';
import { toErrorMap } from '../../utils/toErrorMap';

interface ChangePasswordProps {}

export const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const [, changePass] = useChangePasswordMutation();
  const router = useRouter()
  const [tokenError, setTokenError] = useState("")
  return (
    <Wrapper>
      <Formik
        initialValues={{ password: '' }}
        onSubmit={async (values, { setErrors }) => {
          console.log('values', values);
          const response = await changePass({
            token: token,
            password: values.password
          });
          if(response.data?.changePassword.errors){
            const errorMap = toErrorMap(response.data.changePassword.errors)
            if('token' in errorMap){
              setTokenError(errorMap.token)
            }
            setErrors(errorMap)
          }else if(response.data?.changePassword.user){
            router.push("/")
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="password" placeholder="Password" label="New password" type="password" />
            {tokenError? <Box color='red'>{tokenError}</Box>:null}
            <Button type="submit" colorScheme="teal" isLoading={isSubmitting} mt={4}>
              Reset
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string
  };
};

export default withUrqlClient(createUrqlClient,{ssr:false})(ChangePassword);
