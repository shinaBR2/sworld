import { Backdrop } from "@mui/material";
import React from "react";

export interface SBackdropProps {
  open: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// https://mui.com/material-ui/react-backdrop/
const SBackdrop = (props: SBackdropProps) => {
  const { open, onClick, children } = props;

  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
      onClick={onClick}
    >
      {children}
    </Backdrop>
  );
};

export default SBackdrop;
