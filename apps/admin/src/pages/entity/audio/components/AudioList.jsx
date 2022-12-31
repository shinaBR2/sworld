import { Grid } from "@mui/material";
import AudioCard from "../../../listen/components/AudioCard";

const AudioList = (props) => {
  const { data: audioList, onClickEdit } = props;

  return (
    <Grid container spacing={3}>
      {audioList &&
        audioList.map((audio, index) => (
          <AudioCard
            onEdit={onClickEdit}
            key={audio.id}
            audio={audio}
            index={index}
          />
        ))}
    </Grid>
  );
};

export default AudioList;
