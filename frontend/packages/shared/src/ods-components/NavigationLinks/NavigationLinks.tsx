import { Box } from '@mui/material';
import { OphLink } from '@opetushallitus/oph-design-system';
import { Link } from 'react-router';

import { useWindowProperties } from '../../hooks';

interface NavigationLinksProps {
  navigationAriaLabel: string;
  links: Array<{ active: boolean; href: string; label: string }>;
}

export const NavigationLinks = ({
  navigationAriaLabel,
  links,
}: NavigationLinksProps) => {
  const { isDesktopXS } = useWindowProperties();

  return (
    <Box component="nav" aria-label={navigationAriaLabel}>
      <Box
        component="ul"
        sx={{
          display: 'flex',
          flexDirection: isDesktopXS ? 'row' : 'column',
          flexWrap: 'wrap',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          gap: '2rem',
        }}
      >
        {links.map(({ active, href, label }) => (
          <Box
            component="li"
            key={href}
            sx={{
              paddingBottom: isDesktopXS ? '2rem' : 0,
              paddingLeft: isDesktopXS ? 0 : '1rem',
              borderBottom: isDesktopXS && active ? '2px solid' : undefined,
              borderLeft: !isDesktopXS && active ? '5px solid' : undefined,
              borderColor: 'primary.main',
            }}
          >
            <OphLink
              component={Link}
              to={href}
              aria-current={active ? 'page' : undefined}
              sx={{
                color: active ? 'primary.main' : 'text.primary',
                fontWeight: 400,
              }}
            >
              {label}
            </OphLink>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
