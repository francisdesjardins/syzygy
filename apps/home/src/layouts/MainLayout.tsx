import { Box, styled } from "@mui/material";
import type { ReactNode, ReactElement } from "react";

import LanguageSwitch from "../components/LanguageSwitch";
import ThemeSwitch from "../components/ThemeSwitch";

const LeftControl = styled("div")(({ theme }) => ({
  position: "fixed",
  top: theme.spacing(1),
  left: theme.spacing(1),
  zIndex: theme.zIndex.appBar,
}));

const RightControl = styled("div")(({ theme }) => ({
  position: "fixed",
  top: theme.spacing(1),
  right: theme.spacing(1),
  zIndex: theme.zIndex.appBar,
}));

export function MainLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <LeftControl>
        <LanguageSwitch />
      </LeftControl>
      <RightControl>
        <ThemeSwitch />
      </RightControl>
      {children}
    </Box>
  );
}
