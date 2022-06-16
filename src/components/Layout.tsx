import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <Flex direction="column" align="center" minH="100%">
      <Flex flex="1 0 auto" direction="column" align="center">
        {children}
      </Flex>
      <Flex justify="center" as="footer" mb={50}>
        <Text>
          Made by
          <Text as="span" fontWeight="bold">
            {` Laurent`}
          </Text>
        </Text>
      </Flex>
    </Flex>
  );
};

export default Layout;
