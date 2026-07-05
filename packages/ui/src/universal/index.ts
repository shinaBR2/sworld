/**
 * This should include all UI components for all workspaces
 */
import { FullWidthContainer } from './containers/full-width';
import { Header } from './header';
import { ResponsiveAvatar, ResponsiveCardMedia } from './images/image';
import LoadingBackdrop from './LoadingBackdrop';
import Logo from './logo';
import { Notification } from './notification';
import { UnsavedChangesDialog } from './unsavedChangesDialog';

export * as Dialogs from './dialogs';
export type { HeaderProps, SiteChoicesConfig } from './header';
export * as Minimalism from './minimalism';
export type { MuiStyledProps } from './types';
export {
  FullWidthContainer,
  Header,
  LoadingBackdrop,
  Logo,
  Notification,
  ResponsiveAvatar,
  ResponsiveCardMedia,
  UnsavedChangesDialog,
};
