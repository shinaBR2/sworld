import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface FontUsage {
  weight: number;
  components: Set<string>;
  count: number;
}

const FontWeightAnalyzer = () => {
  const [fontUsage, setFontUsage] = useState<Map<number, FontUsage>>(new Map());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const usage = new Map<number, FontUsage>();

      // Helper to add usage
      const addUsage = (weight: number, component: string) => {
        if (!usage.has(weight)) {
          usage.set(weight, { weight, components: new Set(), count: 0 });
        }
        const entry = usage.get(weight)!;
        entry.components.add(component);
        entry.count++;
      };

      // Analyze all elements
      document.querySelectorAll('*').forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const fontWeight = parseInt(computedStyle.fontWeight);

        if (!isNaN(fontWeight)) {
          // Get MUI component name from className
          const muiClass = Array.from(element.classList).find(className => className.startsWith('Mui'));

          if (muiClass) {
            const componentName = muiClass.replace('Mui-', '').replace('Mui', '');
            addUsage(fontWeight, componentName);
          }
        }
      });

      setFontUsage(usage);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Card className="max-w-2xl mx-auto mt-4">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Font Weight Usage Analysis
        </Typography>

        {Array.from(fontUsage.values()).map(({ weight, components, count }) => (
          <Box key={weight} className="mb-4">
            <Typography variant="h6" className="mb-2">
              Weight {weight} ({count} occurrences)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Used in: {Array.from(components).join(', ')}
            </Typography>
          </Box>
        ))}

        {fontUsage.size === 0 && (
          <Typography color="text.secondary">Analyzing font usage... Interact with your app to see results.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export { FontWeightAnalyzer };
