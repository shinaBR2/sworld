import { getItems } from 'core/universal/extension/storage';
import React, { useEffect, useState } from 'react';

const Popup = () => {
  const [hasToken, setHasToken] = useState(false);

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
    </div>
  );
};

export default Popup;
