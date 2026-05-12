import { usePublishedApp } from '../context';
import { DesktopShell } from './DesktopShell';
import { EmbedShell } from './EmbedShell';
import { MobileShell } from './MobileShell';
import { PwaStandaloneShell } from './PwaStandaloneShell';
import { TabletShell } from './TabletShell';
import type { PublishedAppShellProps } from './types';

export const PublishedAppShell = ({ children }: PublishedAppShellProps) => {
  const { isEmbed, isMobile, isPwaStandalone, isTablet } = usePublishedApp();

  if (isEmbed) {
    return <EmbedShell>{children}</EmbedShell>;
  }

  if (isPwaStandalone) {
    return <PwaStandaloneShell>{children}</PwaStandaloneShell>;
  }

  if (isMobile) {
    return <MobileShell>{children}</MobileShell>;
  }

  if (isTablet) {
    return <TabletShell>{children}</TabletShell>;
  }

  return <DesktopShell>{children}</DesktopShell>;
};
