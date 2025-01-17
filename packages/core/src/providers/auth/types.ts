interface LogRocketConfig {
  appId: string;
  rootHostname: string;
}

interface CustomUser {
  id: string;
  email?: string | undefined;
  name?: string | undefined;
  picture?: string | undefined;
}

export { type LogRocketConfig, type CustomUser };
