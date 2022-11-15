import PropTypes from "prop-types";
import { NavLink as RouterLink } from "react-router-dom";
// @mui
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  ListItemText,
  Typography,
} from "@mui/material";
//
import { StyledNavItem, StyledNavItemIcon } from "./styles";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], ...other }) {
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <NavItem key={item.title} item={item} />
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item }) {
  const { title, path, icon, info, children = [] } = item;

  if (children && children.length) {
    return (
      <Accordion style={{ backgroundColor: "transparent" }}>
        <AccordionSummary
          expandIcon={
            <StyledNavItemIcon>{<ExpandMoreIcon />}</StyledNavItemIcon>
          }
          sx={{
            padding: 0,
            "&.active": {
              color: "text.primary",
              bgcolor: "action.selected",
              fontWeight: "fontWeightBold",
            },
          }}
        >
          {/* <StyledNavItem> */}
          <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>

          <ListItemText disableTypography primary={title} />
          {/* </StyledNavItem> */}
        </AccordionSummary>
        <AccordionDetails>
          {children.map((child) => (
            <StyledNavItem
              key={child.path}
              component={RouterLink}
              to={child.path}
              sx={{
                "&.active": {
                  color: "text.primary",
                  bgcolor: "action.selected",
                  fontWeight: "fontWeightBold",
                },
              }}
            >
              <StyledNavItemIcon>{child.icon && child.icon}</StyledNavItemIcon>

              <ListItemText disableTypography primary={child.title} />
            </StyledNavItem>
          ))}
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        "&.active": {
          color: "text.primary",
          bgcolor: "action.selected",
          fontWeight: "fontWeightBold",
        },
      }}
    >
      <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />

      {info && info}
    </StyledNavItem>
  );
}
