import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import router from 'next/router';
import * as React from 'react';
import { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createURQLclient';

interface ForgotpasswordProps {

}

export const Forgotpassword: React.FC<ForgotpasswordProps> = ({ }) => {
    const [, forgotPassword] = useForgotPasswordMutation();
    const [modal, setModal] = useState(false)
    return (
        <Wrapper>
            <Modal isOpen={modal} onClose={() => { }}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Please check your email.</ModalHeader>
                    <ModalBody>
                        <p>Please check your email for the reset password link.</p>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="teal" mr={3} onClick={() => router.push('/')}>
                            👍
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Formik
                initialValues={{ email: '' }}
                onSubmit={async (values, { setErrors }) => {
                    if (!values.email.includes('@')) {
                        setErrors({ email: 'Bad email' })
                    } else {
                        await forgotPassword(values);
                        setModal(true)
                    }

                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Box mt={4}>
                            <InputField name="email" placeholder="Email" label="Email" type='text' />
                        </Box>

                        <Button type="submit" colorScheme="teal" isLoading={isSubmitting} mt={4}>
                            Reset password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper >

    );
}
export default withUrqlClient(createUrqlClient)(Forgotpassword)


