import * as React from 'react';
import { Box, Link, Flex ,Button} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useMeQuery, useLogoutMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { isServer } from '../utils/isServer';
interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer()
  });
  const router = useRouter();
  let body = null
  const [, logout] = useLogoutMutation();

  if(fetching){
    <h1>loading</h1>
  }else if(!data?.me){
    body = ( 
        <>
        <NextLink href="/login">
        <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
        <Link>register</Link>
        </NextLink>
        </>
      )
  }else{
    body = (
     <Flex>
     <Box mr={2}>{data?.me.username}</Box>
        <Button variant='link' onClick={()=> {
            
            logout() } }>logout</Button>
     </Flex>
    )
  }

  return (
    <Flex bg="tomato" p={4}>
      <Box ml={'auto'}>
        {body}
      </Box>
    </Flex>
  );
};
export default Navbar;
