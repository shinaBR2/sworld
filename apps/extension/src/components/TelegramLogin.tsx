import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { requestLoginCode, submitLoginCode } from './telegramRequests';

interface TelegramLoginProps {
  // Called once a code is accepted, so the parent can switch to the picker.
  onAuthenticated: () => void;
}

/**
 * First-time, per-user Telegram login inside the popup (SWO-494/496). Step 1:
 * "Send login code" → `requestTelegramLoginCode`; Telegram delivers the code to
 * the user's own device. Step 2: enter it → `submitTelegramLoginCode`; on success
 * the parent swaps to the picker. Mirrors `AuthPanel`'s status/alert states plus
 * `ClipboardTab`'s input + button idiom.
 */
const TelegramLogin = ({ onAuthenticated }: TelegramLoginProps) => {
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    setBusy(true);
    setError(null);
    const res = await requestLoginCode();
    setBusy(false);
    if (res?.success) {
      setCodeSent(true);
    } else {
      setError(res?.message ?? 'Could not send the login code.');
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    const res = await submitLoginCode(code.trim());
    setBusy(false);
    if (res?.success) {
      onAuthenticated();
    } else {
      setError(res?.message ?? 'That code was not accepted.');
    }
  };

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
        </>
      )}
    </Box>
  );
};

export { TelegramLogin };
