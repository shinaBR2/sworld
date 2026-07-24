import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import {
  getItems,
  removeItems,
  setItem,
} from 'core/universal/extension/storage';
import { useEffect, useState } from 'react';
import { requestLoginCode, submitLoginCode } from './telegramRequests';

interface TelegramLoginProps {
  // Called once a code is accepted, so the parent can switch to the picker.
  onAuthenticated: () => void;
}

// A Chrome popup is destroyed the instant it loses focus — which is exactly what
// happens when the user leaves to read the code Telegram sent. Persisting "a code
// has been sent" in chrome.storage lets the reopened popup return straight to the
// code-entry step instead of the send button, so the still-valid pending login
// (held server-side in telegram_credentials) can actually be completed. Cleared
// once login succeeds or the user asks for a fresh code (SWO-604).
const CODE_SENT_KEY = 'telegramLoginCodeSent';

/**
 * First-time, per-user Telegram login inside the popup (SWO-494/496). Step 1:
 * "Send login code" → `requestTelegramLoginCode`; Telegram delivers the code to
 * the user's own device. Step 2: enter it → `submitTelegramLoginCode`; on success
 * the parent swaps to the picker. Mirrors `AuthPanel`'s status/alert states plus
 * `ClipboardTab`'s input + button idiom.
 *
 * The current step survives the popup closing (SWO-604): `requestLoginCode` has
 * already persisted the pending session server-side, so on reopen we restore the
 * code-entry step from chrome.storage rather than dropping back to "Send login
 * code" — where re-sending would waste that pending session and risk FLOOD_WAIT.
 */
const TelegramLogin = ({ onAuthenticated }: TelegramLoginProps) => {
  // Gate the first paint on the async storage read so a persisted "code sent"
  // doesn't flash the send-code step before it's restored.
  const [hydrated, setHydrated] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getItems([CODE_SENT_KEY]).then((items) => {
      if (!active) return;
      setCodeSent(items[CODE_SENT_KEY] === 'true');
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSendCode = async () => {
    setBusy(true);
    setError(null);
    const res = await requestLoginCode();
    setBusy(false);
    if (res?.success) {
      setCodeSent(true);
      await setItem(CODE_SENT_KEY, 'true');
    } else {
      setError(res?.message ?? 'Could not send the login code.');
    }
  };

  // Escape hatch back to step 1. The persisted step can outlive the pending login
  // (e.g. the code expired), which would otherwise trap the user on a code field
  // that only rejects — this lets them request a fresh code.
  const handleResend = async () => {
    setError(null);
    setCode('');
    setCodeSent(false);
    await removeItems([CODE_SENT_KEY]);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    const res = await submitLoginCode(code.trim());
    setBusy(false);
    if (res?.success) {
      await removeItems([CODE_SENT_KEY]);
      onAuthenticated();
    } else {
      setError(res?.message ?? 'That code was not accepted.');
    }
  };

  if (!hydrated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Connect your Telegram
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {codeSent
          ? 'Enter the login code Telegram just sent to your device.'
          : 'Send a login code to your Telegram account to import its videos.'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!codeSent ? (
        <Button
          variant="contained"
          fullWidth
          onClick={handleSendCode}
          disabled={busy}
        >
          Send login code
        </Button>
      ) : (
        <>
          <TextField
            fullWidth
            label="Login code"
            placeholder="12345"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={busy}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={busy || !code.trim()}
            sx={{ mt: 1 }}
          >
            Submit
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              type="button"
              underline="hover"
              disabled={busy}
              onClick={handleResend}
            >
              Send a new code
            </Link>
          </Typography>
        </>
      )}
    </Box>
  );
};

export { TelegramLogin };
