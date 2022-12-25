import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  let history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [loginStatus, setLoginStatus] = useState(true);
  const [localStorageItems, setLocalStorageItems] = useState({});

  useEffect(() => {
    if (
      !localStorage.getItem("token") &&
      !localStorage.getItem("username") &&
      !localStorage.getItem("balance")
    ) {
      setLoginStatus(false);
    } else {
      setLocalStorageItems((prevState) => ({
        ...prevState,
        token: localStorage.getItem("token"),
        username: localStorage.getItem("username"),
        balance: localStorage.getItem("balance"),
      }));
    }
  }, [loginStatus]);

  const handleBackToExploreButton = () => {
    history.push("/");
  };

  const handleRegisterButton = () => {
    history.push("/register");
  };

  const handleLoginButton = () => {
    history.push("/login");
  };

  const handleLogoutButton = () => {
    localStorage.clear();
    setLoginStatus(false);
    setLocalStorageItems({});
    history.push("/");
    window.location.reload();
    enqueueSnackbar("Logged Out Successfully", { variant: "success" });
  };

  const handleLogoClick = () => {
    history.push("/");
  };

  return (
    <Box className="header">
      <Box className="header-title" onClick={handleLogoClick}>
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {children}
      {hasHiddenAuthButtons && (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={handleBackToExploreButton}
        >
          Back to explore
        </Button>
      )}
      {!hasHiddenAuthButtons && (
        <Box>
          {loginStatus && (
            <Stack direction="row" spacing={2}>
              <Avatar alt={localStorageItems.username} src="avatar.png" />
              <div className="username-text">{localStorageItems.username}</div>
              <Button onClick={handleLogoutButton}>LOGOUT</Button>
            </Stack>
          )}
          {!loginStatus && (
            <Stack direction="row" spacing={2}>
              <Button onClick={handleLoginButton}>LOGIN</Button>
              <Button variant="contained" onClick={handleRegisterButton}>
                REGISTER
              </Button>
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Header;
