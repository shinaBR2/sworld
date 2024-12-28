import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { listenQueryHooks } from 'core';
import { FeelingListSkeleton } from './skeleton';

interface FeelingListProps {
  activeId: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  queryRs: ReturnType<typeof listenQueryHooks.useLoadAudios>;
}

const FeelingList = (props: FeelingListProps) => {
  const { activeId, onSelect, queryRs } = props;
  const { isLoading, data } = queryRs;

  if (isLoading) {
    return <FeelingListSkeleton />;
  }

  // @ts-ignore
  const { tags: feelings } = data;

  return (
    <Stack direction="row" spacing={1} my={2} sx={{ overflowX: 'auto' }}>
      <Chip
        label="Default"
        color={!activeId ? 'primary' : 'default'}
        aria-pressed={!activeId}
        role="button"
        onClick={() => onSelect('')}
      />
      {feelings.map((f: any) => {
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
