import { StyledLogo } from "./Styled";

const Logo = () => {
  return (
    <StyledLogo component="a" href="/">
      <img
        src="https://res.cloudinary.com/shinabr2/image/upload/v1670251329/Public/Images/sworld-logo-72x72.png"
        alt="logo"
        width="64"
        height="64"
      />
    </StyledLogo>
  );
};

export default Logo;
