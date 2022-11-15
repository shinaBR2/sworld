import LibraryMusicTwoToneIcon from "@mui/icons-material/LibraryMusicTwoTone";
import HomeTwoToneIcon from "@mui/icons-material/HomeTwoTone";

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
    title: "Listen",
    path: "/dashboard/listen",
    icon: <LibraryMusicTwoToneIcon />,
    children: [
      {
        title: "Homepage config",
        path: "/dashboard/listen/home-page",
        icon: <HomeTwoToneIcon />,
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
  {
    title: "login",
    path: "/login",
    icon: icon("ic_lock"),
  },
  {
    title: "Not found",
    path: "/404",
    icon: icon("ic_disabled"),
  },
];

export default navConfig;
