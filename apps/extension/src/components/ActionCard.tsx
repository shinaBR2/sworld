import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
  Box,
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
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Typography variant="subtitle2" fontWeight="bold" noWrap>
          {title}
        </Typography>
        <Chip label={typeLabel} size="small" variant="outlined" />
      </Box>
      {description && (
        <Typography variant="body2" color="text.secondary" mb={1}>
          {description}
        </Typography>
      )}
      <Typography variant="caption" color="text.disabled" noWrap>
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
