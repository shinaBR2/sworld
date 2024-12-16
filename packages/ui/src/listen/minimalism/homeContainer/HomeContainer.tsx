import { Helmet } from 'react-helmet';
import {
  Box,
  Card,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import hooks, { SAudioPlayerAudioItem } from 'core';
import { useEffect, useState } from 'react';
import MusicWidget from '../music-widget';
const { useSAudioPlayer } = hooks;

interface HomeContainerProps {
  audioList: SAudioPlayerAudioItem[];
  feelingList: any[];
}

interface PlayingListItemProps {
  audioList: SAudioPlayerAudioItem[];
  currentId: string;
  onItemSelect: (id: string) => void;
}

const PlayingList = (props: PlayingListItemProps) => {
  const { audioList, currentId, onItemSelect } = props;
  const onClick = (id: string) => () => onItemSelect(id);

  return (
    <List>
      {audioList.map(a => {
        const { id, name, artistName } = a;

        return (
          <ListItem key={id}>
            <ListItemButton selected={id === currentId} onClick={onClick(id)}>
              <ListItemText primary={name} secondary={artistName} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

const NoItem = () => {
  return <Typography variant="body2">No audios found</Typography>;
};

const HomeContainer = (props: HomeContainerProps) => {
  const { audioList, feelingList } = props;
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  const [index, setIndex] = useState(0);
  const [activeFeeling, setActiveFeeling] = useState('');
  const [list, setList] = useState(audioList);
  const hookResult = useSAudioPlayer({
    audioList: list,
    index,
  });
  const { getControlsProps, playerState } = hookResult;
  const { isPlay, currentIndex } = playerState;
  const { onPlay } = getControlsProps();

  useEffect(() => {
    setList(audioList);
  }, [audioList]);

  const onItemSelect = (id: string) => {
    const index = list.findIndex(a => a.id === id);
    setIndex(index);

    if (!isPlay) {
      onPlay();
    }
  };

  const onSelectFeeling = (id: string) => () => {
    if (!id) {
      return;
    }

    const filtered = audioList.filter(a => {
      // @ts-ignore
      if (a.feelingMap && !!a.feelingMap[id]) {
        return true;
      }

      return false;
    });
    setActiveFeeling(id);
    setIndex(0);
    setList(filtered);
  };
  const clearFeeling = () => {
    setActiveFeeling('');
    setIndex(0);
    setList(audioList);
  };

  const currentAudio = list[currentIndex || 0];
  const htmlTitle = currentAudio ? `Listen - ${currentAudio.name}` : 'Listen';
  const hasNoItem = list.length === 0;
  const showPlayingList = !isMobile && !hasNoItem && !!currentAudio;

  return (
    <Container maxWidth="xl">
      <Helmet>
        <title>{htmlTitle}</title>
      </Helmet>

      <Box my={4}>
        <Typography variant="h3" component="h1" fontWeight={700}>
          Just listen
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} my={2}>
        <Chip
          label="Default"
          color={!activeFeeling ? 'primary' : 'default'}
          onClick={clearFeeling}
        />
        {feelingList.map(f => {
          const isActive = !!activeFeeling && f.id === activeFeeling;
          const color = isActive ? 'primary' : 'default';

          return (
            <Chip
              key={f.id}
              label={f.value}
              color={color}
              onClick={onSelectFeeling(f.id)}
            />
          );
        })}
      </Stack>
      <Box display="flex" my={4}>
        {hasNoItem ? (
          <NoItem />
        ) : (
          <Grid container spacing={2}>
            {showPlayingList && (
              <Grid item md={8} sm={6} xs={0}>
                <Card
                  sx={{ height: '100%', maxHeight: '600px', overflowY: 'auto' }}
                >
                  <PlayingList
                    audioList={list}
                    onItemSelect={onItemSelect}
                    currentId={currentAudio.id}
                  />
                </Card>
              </Grid>
            )}
            <Grid item md={4} sm={6} xs={12} container justifyContent="center">
              <MusicWidget
                audioList={list}
                hookResult={hookResult}
                onItemSelect={onItemSelect}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default HomeContainer;
