import React, { useEffect, useState } from 'react';
import { Button, Flex, FormControl, Heading, HStack, Img, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider as Provider, web3, Wallet } from '@project-serum/anchor';
import Layout from './components/Layout';
import idl from './idl.json';
import kp from '../keypair.json';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const { SystemProgram } = web3;
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts: { preflightCommitment: web3.Commitment } = {
  preflightCommitment: 'processed',
};

type PhantomEvent = 'disconnect' | 'connect' | 'accountChanged';

type ConnectOpts = {
  onlyIfTrusted: boolean;
};

type PhantomProvider = {
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: web3.PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, callback: (args: any) => void) => void;
  isPhantom: boolean;
};

type WindowWithSolana = Window & {
  solana?: PhantomProvider & Wallet;
};

const App = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState<{ gifLink: string; userAddress: string }[] | null>([]);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const { solana } = window as WindowWithSolana;

    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(connection, solana as Wallet, { preflightCommitment: opts.preflightCommitment });
    return provider;
  };

  const sendGif = async () => {
    if (inputValue.length > 0) {
      try {
        const provider = getProvider();
        // @ts-ignore
        const program = new Program(idl, programID, provider);

        await program.methods
          .addGif(inputValue)
          .accounts({ baseAccount: baseAccount.publicKey, user: provider.wallet.publicKey })
          .rpc();

        console.log('GIF succesfully sent to program', inputValue);
        getGifList();
      } catch (e) {
        console.log('Error sending Gif', e);
      }
      setInputValue('');
    } else {
      console.log('Empty input. Try again.');
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window as WindowWithSolana;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log('Connected with Public Key:', response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      // @ts-ignore
      const program = new Program(idl, programID, provider);

      await program.methods
        .startStuffOff()
        .accounts({
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([baseAccount])
        .rpc();

      console.log('Created a new BaseAccount w/ address:', baseAccount.publicKey.toString());
      await getGifList();
    } catch (error) {
      console.log('Error creating BaseAccount account:', error);
    }
  };

  const getGifList = async () => {
    try {
      console.log('getGifList');
      const provider = getProvider();
      //  @ts-ignore
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      setGifList(account.gifList);
    } catch (error) {
      console.log('Error in getGifList: ', error);
      setGifList(null);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      getGifList();
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    const { solana } = window as WindowWithSolana;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  return (
    <Layout>
      <Stack align="center" spacing={6} pt={30}>
        <Heading>GIF Portal</Heading>
        <Heading size="sm">View your GIF collection in the metaverse ✨</Heading>

        {walletAddress && gifList !== null ? (
          <>
            <FormControl
              as="form"
              onSubmit={(event) => {
                event.preventDefault();
                sendGif();
              }}
            >
              <HStack>
                <Input type="text" placeholder="GIF link" value={inputValue} onChange={onInputChange} />
                <Button type="submit">Submit</Button>
              </HStack>
            </FormControl>
            <SimpleGrid columns={4} spacing={10} maxW={1300}>
              {gifList?.map((item, idx) => (
                <Stack key={idx}>
                  <Img src={item.gifLink} alt={item.gifLink} />
                  <Text fontSize="xs">
                    Owner: 0x{item.userAddress.toString().slice(0, 4)}...{item.userAddress.toString().slice(40)}
                  </Text>
                </Stack>
              ))}
            </SimpleGrid>
          </>
        ) : (
          <Button onClick={gifList === null ? createGifAccount : connectWallet}>
            {gifList === null ? 'Initialize' : 'Connect'}
          </Button>
        )}
      </Stack>
    </Layout>
  );
};

export default App;
