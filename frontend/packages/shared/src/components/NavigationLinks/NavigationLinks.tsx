import { Link } from 'react-router-dom';

import { Text } from '../Text/Text';
import './NavigationLinks.scss';

interface NavigationLinksProps {
  navigationAriaLabel: string;
  links: Array<NavigationLink>;
}

interface NavigationLink {
  active: boolean;
  href: string;
  label: string;
}

export const NavigationLinks = ({
  navigationAriaLabel,
  links,
}: NavigationLinksProps) => {
  return (
    <nav className="navigation-links" aria-label={navigationAriaLabel}>
      <ul>
        {links.map((l, i) => (
          <li key={i} className={l.active ? 'active' : undefined}>
            <Link to={l.href} aria-current={l.active && 'page'}>
              <Text>{l.label}</Text>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
