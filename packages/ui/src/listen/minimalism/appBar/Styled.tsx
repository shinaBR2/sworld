import {
  AppBar,
  AppBarProps,
  Box,
  BoxProps,
  Card,
  CardActions,
  CardActionsProps,
  CardMedia,
  CardMediaProps,
  CardProps,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

const StyledAppBar = styled(AppBar)<AppBarProps>(({ theme }) => {
  return {
    backgroundColor: alpha(theme.palette.common.white, 0.8),
  };
}) as typeof AppBar;

const StyledLogo = styled(Box)<BoxProps>(({ theme }) => {
  return {
    width: theme.spacing(8),
    height: theme.spacing(8),
    "& > img": {
      width: "100%",
    },
  };
}) as typeof Box;

export { StyledAppBar, StyledLogo };
