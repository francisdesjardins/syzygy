import TranslateIcon from "@mui/icons-material/Translate";
import { IconButton } from "@mui/material";
import { memo } from "react";

import { useLanguage } from "../hooks/useLanguage";
import { handleMisusedPromise } from "../utils/handleMisusedPromise";

const LanguageSwitch = memo(() => {
  const { toggle } = useLanguage();

  const handleOnClick = handleMisusedPromise(toggle);

  return (
    <IconButton
      onClick={handleOnClick}
      color="inherit"
      aria-label="change language"
      sx={{ bgcolor: "background.default", "&:hover": { bgcolor: "action.hover" } }}
    >
      <TranslateIcon />
    </IconButton>
  );
});

LanguageSwitch.displayName = "LanguageSwitch";
export default LanguageSwitch;
