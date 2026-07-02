import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { FeelingListSkeleton } from './skeleton';

interface Feeling {
  id: string;
  name: string;
}

// Structural: any audios query (signed-in or public) that carries feeling tags.
interface FeelingQueryRs {
  isLoading: boolean;
  data?: { tags?: Feeling[] } | null;
}

interface FeelingListProps {
  activeId: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  queryRs: FeelingQueryRs;
}

const FeelingList = (props: FeelingListProps) => {
  const { activeId, onSelect, queryRs } = props;
  const { isLoading, data } = queryRs;

  if (isLoading) {
    return <FeelingListSkeleton />;
  }

  const feelings = data?.tags ?? [];

  return (
    <Stack
      role="radiogroup"
      aria-label="feeling list"
      direction="row"
      spacing={1}
      my={2}
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
export type { FeelingQueryRs };
