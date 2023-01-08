import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import { StyledAppBar } from "./Styled";
import React from "react";

interface Props {
  children: React.ReactNode;
}

// Source: https://mui.com/material-ui/react-app-bar/#app-bar-with-responsive-menu
const ResponsiveAppBar = (props: Props) => {
  const { children } = props;

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>{children}</Toolbar>
      </Container>
    </StyledAppBar>
  );
};
export default ResponsiveAppBar;
