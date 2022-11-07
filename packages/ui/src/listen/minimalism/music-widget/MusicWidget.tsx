import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import Controls from "./Controls";
import Seeker from "./Seeker";
import { playAudio, seek } from "./utils/actions";

interface AudioItem {
  src: string;
  name: string;
  artistName: string;
  image: string;
}

interface Props {
  audioList: AudioItem[];
  index: number;
  setIndex: (index: number) => void;
}

const MusicWidget = (props: Props) => {
  const { audioList, index, setIndex } = props;
  const ref = useRef<HTMLAudioElement>(null);
  const [isPlay, setPlay] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioItem = audioList[index];
  const { src, name, artistName, image } = audioItem;

  const onLoaded = () => {
    if (!ref.current) {
      return;
    }

    setDuration(Math.ceil(ref.current.duration));
    if (isPlay) {
      ref.current.play();
    }
  };

  const onTimeUpdate = () => {
    if (!ref.current) {
      return;
    }

    setCurrentTime(ref.current.currentTime);
  };

  const onSeek = (position: number) => {
    if (!ref.current) {
      return;
    }

    setCurrentTime(ref.current.currentTime);
    seek(ref.current, position);
  };

  const onEnded = () => {
    setPlay(false);
  };

  const handlePlay = () => {
    if (!ref.current) {
      return;
    }

    setPlay(!isPlay);

    playAudio(ref.current);
  };

  const handlePrev = () => {
    if (index <= 0) {
      return;
    }

    setIndex(index - 1);
  };

  const handleNext = () => {
    if (index === audioList.length - 1) {
      return;
    }

    setIndex(index + 1);
  };

  // https://mui.com/material-ui/react-slider/#music-player
  const formatDuration = (value: number) => {
    const minute = Math.floor(value / 60);
    const secondLeft = Math.floor(value - minute * 60);
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia component="img" alt={name} height="300" image={image} />
      <CardContent>
        <Typography gutterBottom variant="body2" component="p">
          Now playing
        </Typography>
        <Typography gutterBottom variant="h4" component="strong">
          {artistName}
        </Typography>
        <Typography gutterBottom variant="h5" component="p">
          {name}
        </Typography>
        <Seeker
          max={duration}
          position={currentTime}
          setPosition={onSeek}
          formatDuration={formatDuration}
        />
      </CardContent>
      <CardActions style={{ display: "block" }}>
        <Controls
          isPlay={isPlay}
          handlePlay={handlePlay}
          handlePrev={handlePrev}
          handleNext={handleNext}
        />
      </CardActions>
      <audio
        ref={ref}
        src={src}
        onLoadedData={onLoaded}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />
    </Card>
  );
};

export default MusicWidget;
