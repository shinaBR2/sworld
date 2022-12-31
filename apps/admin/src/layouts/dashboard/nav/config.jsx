import LibraryMusicTwoToneIcon from "@mui/icons-material/LibraryMusicTwoTone";
import HomeTwoToneIcon from "@mui/icons-material/HomeTwoTone";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

// component
import SvgColor from "../../../components/svg-color";

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1 }}
  />
);

const navConfig = [
  {
    title: "dashboard",
    path: "/dashboard/app",
    icon: icon("ic_analytics"),
  },
  {
    title: "Listen Homepage",
    path: "/dashboard/listen",
    icon: <LibraryMusicTwoToneIcon />,
    children: [
      {
        title: "Audio list",
        path: "/dashboard/listen/homepage-audio-list",
        icon: <HomeTwoToneIcon />,
      },
      {
        title: "Feeling list",
        path: "/dashboard/listen/homepage-feeling-list",
        icon: <HomeTwoToneIcon />,
      },
    ],
  },
  {
    title: "entity",
    path: "/dashboard/entity",
    icon: <AssignmentIcon />,
    children: [
      {
        title: "Audio",
        path: "/dashboard/entity/audio",
        icon: <AudiotrackIcon />,
      },
      {
        title: "Feeling list",
        path: "/dashboard/entity/feeling",
        icon: <EmojiEmotionsIcon />,
      },
    ],
  },
  {
    title: "user",
    path: "/dashboard/user",
    icon: icon("ic_user"),
  },
  {
    title: "product",
    path: "/dashboard/products",
    icon: icon("ic_cart"),
  },
  {
    title: "blog",
    path: "/dashboard/blog",
    icon: icon("ic_blog"),
  },
];

export default navConfig;
