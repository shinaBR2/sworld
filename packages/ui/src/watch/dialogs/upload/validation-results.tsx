import React from 'react';
import { Alert, Box, Fade } from '@mui/material';
import { texts } from './texts';
import { StyledResultsStack } from './styled';

interface ValidationResult {
  url: string;
  isValid: boolean;
}

const ValidationResults: React.FC<{ results: ValidationResult[] }> = ({ results }) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <Fade in>
      <StyledResultsStack spacing={1} role="list" aria-label="Validation results">
        {results.map((result, index) => (
          <Alert
            data-key={`result-${result.url}-${index}`}
            key={`result-${result.url}-${index}`}
            severity={result.isValid ? 'success' : 'error'}
            role="listitem"
            aria-label={result.isValid ? texts.validation.valid.ariaLabel : texts.validation.invalid.ariaLabel}
          >
            <Box data-testid={`validation-result-url-${index}`} sx={{ wordBreak: 'break-all' }}>
              {result.url}
            </Box>
            <Box data-testid={`validation-result-status-${index}`} sx={{ fontSize: '0.75rem', mt: 0.5 }}>
              {result.isValid ? texts.validation.valid.status : texts.validation.invalid.status}
            </Box>
          </Alert>
        ))}
      </StyledResultsStack>
    </Fade>
  );
};

export { type ValidationResult, ValidationResults };
