import { Helmet } from "react-helmet";
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
} from "@mui/material";
import hooks, { SAudioPlayerAudioItem } from "core";
import { useState } from "react";
import MusicWidget from "../music-widget";
const { useSAudioPlayer } = hooks;

interface HomeContainerProps {
  audioList: SAudioPlayerAudioItem[];
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
      {audioList.map((a) => {
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

const HomeContainer = (props: HomeContainerProps) => {
  const { audioList } = props;
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const [index, setIndex] = useState(0);
  const hookResult = useSAudioPlayer({
    audioList,
    index,
  });
  const { getControlsProps, playerState } = hookResult;
  const { isPlay, currentIndex } = playerState;
  const { onPlay } = getControlsProps();

  const onItemSelect = (id: string) => {
    const index = audioList.findIndex((a) => a.id === id);
    setIndex(index);

    if (!isPlay) {
      onPlay();
    }
  };

  return (
    <Container maxWidth="xl">
      <Helmet>
        <title>{`Listen - ${audioList[currentIndex].name}`}</title>
      </Helmet>

      <Box my={4}>
        <Typography variant="h3" component="h1" fontWeight={700}>
          Just listen
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} my={2}>
        <Chip label="Default" color="primary" onClick={() => {}} />
        {/* <Chip label="Sad" />
        <Chip label="Heroic" /> */}
      </Stack>
      <Box display="flex" my={4}>
        <Grid container spacing={2}>
          {!hidden && (
            <Grid item md={8} sm={6} xs={0}>
              <Card
                sx={{ height: "100%", maxHeight: "600px", overflowY: "auto" }}
              >
                <PlayingList
                  audioList={audioList}
                  onItemSelect={onItemSelect}
                  currentId={audioList[currentIndex].id}
                />
              </Card>
            </Grid>
          )}
          <Grid item md={4} sm={6} xs={12} container justifyContent="center">
            <MusicWidget
              audioList={audioList}
              hookResult={hookResult}
              onItemSelect={onItemSelect}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomeContainer;
