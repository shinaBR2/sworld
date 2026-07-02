import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
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
      <StyledContent ref={contentRef}>
        <CardContent sx={{ pt: 3 }}>
          {isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <PlaylistButton
                onClick={() => setShowPlayinglist(!showPlayinglist)}
              />
            </Box>
          )}
          <Box
            sx={{
              width: 200,
              maxWidth: '70%',
              aspectRatio: '1 / 1',
              mx: 'auto',
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 3,
            }}
          >
            <ResponsiveCardMedia
              aria-label="audio thumbnail"
              src={image || defaultAudioThumbnailUrl}
              alt={name}
              sx={{
                width: '100%',
                height: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography
            aria-label="audio title"
            variant="h6"
            align="center"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: '1',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {name}
          </Typography>
          <Typography
            aria-label="audio artist"
            variant="body2"
            align="center"
            color="text.secondary"
            gutterBottom
          >
            {artistName}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Seeker {...getSeekerProps()} />
            <Controls {...controlProps} />
          </Box>
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
