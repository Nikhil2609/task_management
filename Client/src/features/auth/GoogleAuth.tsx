import React from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { googleAuth } from "../../redux/slices/authSlice";
import { AppDispatch } from "../../redux/store";
import { Button } from "@mui/material";
import axios from "axios";

interface GoogleSignupButtonProps {
  buttonText?: string;
}

const GoogleSignupButton: React.FC<GoogleSignupButtonProps> = ({
  buttonText,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;

      await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      dispatch(googleAuth({ accessToken }));
    },
    onError: () => {
      console.error("Login Failed");
    },
  });

  return (
    <Button variant="contained" onClick={() => login()}>
      {buttonText}
    </Button>
  );
};

const GoogleAuth: React.FC<GoogleSignupButtonProps> = ({ buttonText }) => {
  return (
    <GoogleOAuthProvider
      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID ?? ""}
    >
      <GoogleSignupButton buttonText={buttonText} />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
