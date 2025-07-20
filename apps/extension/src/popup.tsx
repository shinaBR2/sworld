// import { getItems } from 'core/universal/extension/storage';
import React, { useEffect, useState } from 'react';

const Popup = () => {
  console.log(`fuckign piopup loaded`);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      // const token = await getItems(['auth0Token']);
      // The import from core module doesn't work
      const token = await chrome.storage.local.get(['auth0Token']);

      console.log(`token in extension`, token);
      setHasToken(!!token.auth0Token);
    };
    getToken();
  }, []);

  console.log(`has token`, hasToken);

  return (
    <div style={{ width: 300, padding: 16 }}>
      <h3>Extension Status</h3>
      <p>Authenticated: {hasToken ? '✅' : '❌'}</p>
    </div>
  );
};

export default Popup;
