import { useEffect, useState } from 'react';

const Popup = () => {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['auth0Token'], result => {
      setHasToken(!!result.auth0Token);
    });
  }, []);

  return (
    <div style={{ width: 300, padding: 16 }}>
      <h3>Extension Status</h3>
      <p>Authenticated: {hasToken ? '✅' : '❌'}</p>
    </div>
  );
};

export default Popup;
