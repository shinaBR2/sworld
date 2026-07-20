import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';

interface ActionCardProps {
  title: string;
  description?: string;
  url: string;
  typeLabel: string;
  onImport: () => void;
  importButtonLabel: string;
  disabled?: boolean;
}

const ActionCard = ({
  title,
  description,
  url,
  typeLabel,
  onImport,
  importButtonLabel,
  disabled,
}: ActionCardProps) => (
  <Card variant="outlined">
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} noWrap>
          {title}
        </Typography>
        <Chip label={typeLabel} size="small" variant="outlined" />
      </Box>
      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {description}
        </Typography>
      )}
      <Typography variant="caption" noWrap sx={{ color: 'text.disabled' }}>
        {url}
      </Typography>
    </CardContent>
    <CardActions>
      <Button
        variant="contained"
        size="small"
        onClick={onImport}
        disabled={disabled}
        fullWidth
      >
        {importButtonLabel}
      </Button>
    </CardActions>
  </Card>
);

export { ActionCard };
