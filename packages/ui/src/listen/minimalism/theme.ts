import { createTheme, responsiveFontSizes } from "@mui/material";
import baseTheme from "../../sui-base/baseTheme";

const theme = createTheme({
  ...baseTheme,
});

export default responsiveFontSizes(theme);
