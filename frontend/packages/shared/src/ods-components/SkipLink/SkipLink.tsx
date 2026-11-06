import { OphLink } from '@opetushallitus/oph-design-system';

export const SkipLink = ({ text, href }: { text: string; href: string }) => (
  <OphLink
    href={href}
    sx={{
      position: 'fixed',
      top: '-8rem',
      left: '1.5rem',
      zIndex: 1501,
      backgroundColor: 'background.paper',
      color: 'primary.main',
      padding: '1rem',
      '&:focus': { top: '1.6rem' },
    }}
  >
    {text}
  </OphLink>
);
