import * as React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
// @ts-ignore
import { createLazyFileRoute } from '@tanstack/react-router';
import { Auth } from 'core';
import { GameUI } from 'ui';
import pw from 'a-promise-wrapper';
import { useState } from 'react';
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/types';
import { callable } from '../firebase';

const { Containers } = GameUI.Minimalism;
const { HomeContainer } = Containers;

const isWebAuthnSupported = () => {
  return window?.PublicKeyCredential !== undefined;
};

const Home = () => {
  const authContext = Auth.useAuthContext();
  const { signIn, signOut } = authContext;

  console.log('auth context', authContext);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const gameList = [
    {
      id: '1',
      url: '/bobble-dungeon',
      name: 'Bobble dungeon',
      slug: 'bobble-dungeon',
      description: 'Ride the Dungeons with just a bubble shooter.',
      imageUrl: '/assets/bobble-dungeon/bobble_dungeon_intro.png',
    },
    {
      id: '2',
      url: '/evil-minds',
      name: 'Evil Minds',
      slug: 'evil-minds',
      description: 'Who is the next victim?',
      imageUrl: '/assets/evil-minds/intro.png',
    },
  ];

  const { mutateAsync: registerMutate } = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data: response, error } = await pw(
        callable('auth-generatePasskeyRegistrationOptions', {
          userId,
        })
      );

      console.log('registerMutate', response, error);

      if (error) {
        throw new Error('Network response was not ok');
      }
      return response.data as PublicKeyCredentialCreationOptionsJSON;
    },
  });
  const { mutateAsync: verifyRegisterMutate } = useMutation({
    mutationFn: async ({
      userId,
      credential,
    }: {
      userId: string;
      credential: any;
    }) => {
      const { data: response, error } = await pw(
        callable('auth-verifyPasskeyRegistration', {
          userId,
          credential,
        })
      );

      if (error) {
        throw new Error('Network response was not ok');
      }
      return response.data;
    },
  });
  const { mutateAsync: authenMutate } = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data: response, error } = await pw(
        callable('auth-generatePasskeyAuthenticationOptions', {
          userId,
        })
      );

      if (error) {
        throw new Error('Network response was not ok');
      }
      return response.data as PublicKeyCredentialRequestOptionsJSON;
    },
  });
  const { mutateAsync: verifyAuthenMutate } = useMutation({
    mutationFn: async ({
      userId,
      credential,
    }: {
      userId: string;
      credential: any;
    }) => {
      const { data: response, error } = await pw(
        callable('auth-verifyPasskeyAuthentication', {
          userId,
          credential,
        })
      );

      if (error) {
        throw new Error('Network response was not ok');
      }
      return response.data;
    },
  });

  const registerPasskey = async () => {
    try {
      setStatus('Starting registration...');
      setError('');
      const resp = await registerMutate({ userId: 'master' });
      console.log('resp', resp);

      let attResp;
      try {
        // Pass the options to the authenticator and wait for a response
        attResp = await startRegistration({ optionsJSON: resp });
      } catch (error) {
        console.log('error', error);

        throw error;
      }
      console.log('attResp', attResp);

      const verifyResp = await verifyRegisterMutate({
        userId: 'master',
        credential: attResp,
      });

      console.log('verifyResp', verifyResp);

      setStatus('Registration successful!');
    } catch (err) {
      setError(`Registration failed: ${err.message}`);
    }
  };

  const authenticatePasskey = async () => {
    try {
      setStatus('Starting authentication...');
      setError('');
      const resp = await authenMutate({ userId: 'master' });
      console.log('resp', resp);

      let attResp;
      try {
        // Pass the options to the authenticator and wait for a response
        attResp = await startAuthentication({ optionsJSON: resp });
      } catch (error) {
        console.log('error', error);

        throw error;
      }
      console.log('attResp', attResp);

      const verifyResp = await verifyAuthenMutate({
        userId: 'master',
        credential: attResp,
      });

      console.log('verifyResp', verifyResp);

      setStatus('Registration successful!');
    } catch (err) {
      setError(`Registration failed: ${err.message}`);
    }
  };

  return (
    <>
      <HomeContainer gameList={gameList} />
      <div>
        <div className="space-y-2">
          <button onClick={signIn} className="w-full">
            Login
          </button>
          <button
            onClick={registerPasskey}
            disabled={!isWebAuthnSupported()}
            className="w-full"
          >
            Register Passkey
          </button>

          <button
            onClick={authenticatePasskey}
            disabled={!isWebAuthnSupported()}
            className="w-full"
          >
            Authenticate with Passkey
          </button>
          <button onClick={signOut} className="w-full">
            Sign out
          </button>
        </div>
      </div>
      <div>
        <div>Status: {status}</div>
      </div>
    </>
  );
};

export const Route = createLazyFileRoute('/')({
  component: Home,
});
