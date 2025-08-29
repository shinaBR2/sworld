import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import hooks, {
  type SAudioPlayerAudioItem,
  type SAudioPlayerLoopMode,
} from 'core';
import { useRef, useState } from 'react';
import { ResponsiveCardMedia } from '../../../universal';
import { defaultAudioThumbnailUrl } from '../../../universal/images/default-thumbnail';
import { useIsMobile } from '../../../universal/responsive';
import Controls from './Controls';
import PlaylistButton from './PlaylistButton';
import PlayingList from './playing-list';
import Seeker from './Seeker';
import { StyledCard, StyledContent } from './Styled';

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
  const isMobile = useIsMobile();

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
    <StyledCard role="region" aria-label="music widget">
      <ResponsiveCardMedia
        aria-label="audio thumbnail"
        src={image || defaultAudioThumbnailUrl}
        alt={name}
      />
      <StyledContent ref={contentRef}>
        <CardContent>
          <Box
            component={Grid}
            container
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography
              role="text"
              aria-label="now playing"
              gutterBottom
              variant="body2"
              component="p"
            >
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
            aria-label="audio title"
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
          <Typography aria-label="audio artist" gutterBottom component="p">
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
