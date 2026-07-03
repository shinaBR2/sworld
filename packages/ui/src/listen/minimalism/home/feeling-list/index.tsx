import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { FeelingListSkeleton } from './skeleton';

interface Feeling {
  id: string;
  name: string;
}

interface FeelingListProps {
  activeId: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  feelings: Feeling[];
  isLoading: boolean;
}

const FeelingList = (props: FeelingListProps) => {
  const { activeId, onSelect, feelings, isLoading } = props;

  if (isLoading) {
    return <FeelingListSkeleton />;
  }

  return (
    <Stack
      role="radiogroup"
      aria-label="feeling list"
      direction="row"
      spacing={1}
      sx={{ overflowX: 'auto' }}
    >
      <Chip
        label="Default"
        color={!activeId ? 'primary' : 'default'}
        aria-pressed={!activeId}
        role="button"
        onClick={() => onSelect('')}
      />
      {feelings.map((f) => {
        const isActive = !!activeId && f.id === activeId;
        const color = isActive ? 'primary' : 'default';

        return (
          <Chip
            key={f.id}
            label={f.name}
            color={color}
            aria-pressed={isActive}
            role="button"
            onClick={() => onSelect(f.id)}
          />
        );
      })}
    </Stack>
  );
};

export { FeelingList };
export type { Feeling };
