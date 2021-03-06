import * as React from 'react';
import { Box } from '@chakra-ui/react';

interface WrapperProps {
  variant?: 'small' | 'regular';
}

export const Wrapper: React.FC<WrapperProps> = ({ children, variant = 'regular' }) => {
  return (
    <Box maxW={variant === 'regular' ? '800px' : '400px'} mt={8} w="100%" mx="auto">
      {children}
    </Box>
  );
};
export default Wrapper;
