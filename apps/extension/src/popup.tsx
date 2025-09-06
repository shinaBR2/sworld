import { getItems } from 'core/universal/extension/storage';
import React, { useEffect, useState } from 'react';
import { useCreateDeviceRequest } from './hooks/mutations/createDeviceRequest';

const Popup = () => {
  const [hasToken, setHasToken] = useState(false);
  const createDeviceRequest = useCreateDeviceRequest({
    getAccessToken: async () => {
      // const token = await getItems(['auth0Token']);
      // return token.auth0Token;
      return 'test';
    },
  });

  useEffect(() => {
    const getToken = async () => {
      const token = await getItems(['auth0Token']);
      setHasToken(!!token.auth0Token);
    };
    getToken();
  }, []);

  return (
    <div style={{ width: 300, padding: 16 }}>
      <h3>Extension Status</h3>
      <p>Authenticated: {hasToken ? '✅' : '❌'}</p>
      <button
        type="button"
        onClick={() => createDeviceRequest({ input: { deviceName: 'test' } })}
      >
        Create Device Request
      </button>
    </div>
  );
};

export default Popup;
