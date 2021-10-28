import { withUrqlClient } from 'next-urql';
import { Navbar } from '../components/Navbar';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createURQLclient';

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Navbar></Navbar>
      <div>Hello World</div>
      <br></br>
      {!data ? null : data.posts.map(e => <p>{e.title}</p>)}
    </>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
