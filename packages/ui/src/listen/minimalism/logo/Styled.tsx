import { Box, BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledLogo = styled(Box)<BoxProps>(({ theme }) => {
  return {
    width: theme.spacing(8),
    height: theme.spacing(8),
    "& > img": {
      width: "100%",
    },
  };
}) as any;

export { StyledLogo };
