import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "./header.css";

export default function Header() {
  return (
    <AppBar component="header" className="header" position="static">
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{
            color: "inherit",
          }}
        >
          CuP
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
