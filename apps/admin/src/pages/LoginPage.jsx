import { Helmet } from "react-helmet-async";
// @mui
import { styled } from "@mui/material/styles";
import {
  Container,
  Typography,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
// hooks
import useResponsive from "../hooks/useResponsive";
// components
import Logo from "../components/logo";
import Iconify from "../components/iconify";
// sections
import { useAuthContext } from "../providers/auth";
import { useNavigate, Navigate, useLocation } from "react-router-dom";

// ----------------------------------------------------------------------

const StyledRoot = styled("div")(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    display: "flex",
  },
}));

const StyledSection = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: 480,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled("div")(({ theme }) => ({
  maxWidth: 480,
  margin: "auto",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  const mdUp = useResponsive("up", "md");
  const { signIn, isSignedIn, isLoading } = useAuthContext();
  const location = useLocation();

  if (isSignedIn) {
    const origin = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={origin} replace state={{ from: location }} />;
  }

  return (
    <>
      <Helmet>
        <title> Login </title>
      </Helmet>

      <StyledRoot>
        <Logo
          sx={{
            position: "fixed",
            top: { xs: 16, sm: 24, md: 40 },
            left: { xs: 16, sm: 24, md: 40 },
          }}
        />

        {mdUp && isLoading && (
          <StyledSection>
            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
              Hi, Welcome Back
            </Typography>
            <img
              src="/assets/illustrations/illustration_login.png"
              alt="login"
            />
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            {isLoading && <CircularProgress />}
            {!isLoading && (
              <Typography variant="h4" gutterBottom textAlign="center">
                Sign in
              </Typography>
            )}

            {!isLoading && (
              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  size="large"
                  color="inherit"
                  variant="outlined"
                  onClick={signIn}
                >
                  <Iconify
                    icon="eva:google-fill"
                    color="#DF3E30"
                    width={22}
                    height={22}
                  />
                </Button>
              </Stack>
            )}
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
