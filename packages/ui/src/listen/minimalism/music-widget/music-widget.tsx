import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Controls from './Controls';
import Seeker from './Seeker';
import hooks, { SAudioPlayerAudioItem, SAudioPlayerLoopMode } from 'core';
import { Box, Grid, Slide, Theme, useMediaQuery } from '@mui/material';
import PlaylistButton from './PlaylistButton';
import { useRef, useState } from 'react';
import { StyledCard, StyledContent } from './Styled';
import PlayingList from './playing-list';
import { ResponsiveCardMedia } from '../../../universal';
import { defaultAudioThumbnailUrl } from '../../../universal/images/default-thumbnail';
const { useSAudioPlayer } = hooks;

export interface MusicWidgetProps {
  audioList: SAudioPlayerAudioItem[];
  hookResult: ReturnType<typeof useSAudioPlayer>;
  onItemSelect: (id: string) => void;
  index?: number;
  shuffle?: boolean;
  loopMode?: SAudioPlayerLoopMode;
}

const MusicWidget = (props: MusicWidgetProps) => {
  const { audioList, hookResult, onItemSelect } = props;
  const { getAudioProps, getSeekerProps, getControlsProps, playerState } =
    hookResult;
  const { isPlay, isShuffled, loopMode, audioItem } = playerState;
  const { onPlay, onPrev, onNext, onShuffle, onChangeLoopMode } =
    getControlsProps();
  const contentRef = useRef(null);
  const [showPlayinglist, setShowPlayinglist] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  if (!audioItem) {
    return null;
  }

  const { name, artistName, image } = audioItem;

  const onSelect = (id: string) => {
    onItemSelect(id);
    setShowPlayinglist(false);
  };

  const controlProps = {
    isPlay,
    shuffle: isShuffled,
    loopMode,
    handlePlay: onPlay,
    handlePrev: onPrev,
    handleNext: onNext,
    onShuffle,
    onChangeLoopMode,
  };

  return (
    <StyledCard>
      <ResponsiveCardMedia src={image || defaultAudioThumbnailUrl} alt={name} />
      <StyledContent ref={contentRef}>
        <CardContent>
          <Box
            component={Grid}
            container
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography gutterBottom variant="body2" component="p">
              {showPlayinglist ? 'Playing list' : 'Now playing'}
            </Typography>
            {isMobile && (
              <PlaylistButton
                onClick={() => setShowPlayinglist(!showPlayinglist)}
                sx={{
                  color: 'white',
                }}
              />
            )}
          </Box>
          <Typography
            gutterBottom
            variant="h4"
            sx={{
              display: '-webkit-Box',
              WebkitLineClamp: '1',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsisBox',
            }}
          >
            {name}
          </Typography>
          <Typography gutterBottom component="p">
            {artistName}
          </Typography>
        </CardContent>
        <CardContent>
          <Seeker {...getSeekerProps()} />
          <Controls {...controlProps} />
        </CardContent>
        {isMobile && (
          <Slide
            direction="up"
            in={showPlayinglist}
            container={contentRef.current}
          >
            <PlayingList
              audioList={audioList}
              onSelect={onSelect}
              currentId={audioItem.id}
            />
          </Slide>
        )}
        <audio {...getAudioProps()} />
      </StyledContent>
    </StyledCard>
  );
};

export default MusicWidget;
