import { Helmet } from "react-helmet-async";
// @mui
import { Grid, Button, Container, Stack, Typography } from "@mui/material";
// components
import Iconify from "../../components/iconify";
import {
  BlogPostCard,
  BlogPostsSort,
  BlogPostsSearch,
} from "../../sections/@dashboard/blog";
// mock
import POSTS from "../../_mock/blog";
import { ListenCore } from "core";
import db from "../../providers/firestore";
import AudioCard from "./components/AudioCard";

const { useGetHomeAudioList } = ListenCore;
// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "oldest", label: "Oldest" },
];

// ----------------------------------------------------------------------

export default function ListenHomeConfig() {
  const { values: audioList, loading } = useGetHomeAudioList(db);

  return (
    <>
      <Helmet>
        <title> Listen: Home page configuration </title>
      </Helmet>

      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
        >
          <Typography variant="h4" gutterBottom>
            Blog
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New Post
          </Button>
        </Stack>

        <Stack
          mb={5}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <BlogPostsSearch posts={POSTS} />
          <BlogPostsSort options={SORT_OPTIONS} />
        </Stack>

        <Grid container spacing={3}>
          {audioList &&
            audioList.map((audio, index) => (
              <AudioCard key={audio.id} audio={audio} index={index} />
            ))}
        </Grid>
      </Container>
    </>
  );
}
