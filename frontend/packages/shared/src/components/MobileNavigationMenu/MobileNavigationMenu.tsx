import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { ClickAwayListener, Divider } from '@mui/material';
import { FocusTrap } from '@mui/base/FocusTrap';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Color } from '../../enums';
import { NavigationLinksProps } from '../NavigationLinks/NavigationLinks';
import { Text } from '../Text/Text';

import './MobileNavigationMenu.scss';

export const MobileNavigationMenuToggle = ({
  openStateLabel,
  openStateAriaLabel,
  closedStateLabel,
  closedStateAriaLabel,
  isOpen,
  setIsOpen,
}: {
  openStateLabel: string;
  openStateAriaLabel: string;
  closedStateLabel: string;
  closedStateAriaLabel: string;
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
}) => {
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <button
      tabIndex={0}
      className="navigation-menu-toggle rows align-items-center"
      onClick={handleClick}
    >
      {isOpen && (
        <>
          <CloseIcon
            color={Color.Secondary}
            fontSize="large"
            aria-hidden={true}
          />
          <Text aria-label={openStateAriaLabel} fontSize={12}>
            {openStateLabel}
          </Text>
        </>
      )}
      {!isOpen && (
        <>
          <MenuIcon
            color={Color.Secondary}
            fontSize="large"
            aria-hidden={true}
          />
          <Text aria-label={closedStateAriaLabel} fontSize={12}>
            {closedStateLabel}
          </Text>
        </>
      )}
    </button>
  );
};

interface MobileNavigationMenuProps extends NavigationLinksProps {
  closeMenu: () => void;
}

export const MobileNavigationMenuContents = ({
  navigationAriaLabel,
  links,
  closeMenu,
}: MobileNavigationMenuProps) => {
  // TODO
  // - positioning of menu
  // - border-shadow to bottom of element.. perhaps use a wrapper like Paper or something

  const handleClickAway = (e: MouseEvent | TouchEvent) => {
    // Prevent event default so that when user clicks on menu close button (outside actual menu contents),
    // the menu isn't immediately opened again.
    e.preventDefault();
    closeMenu();
  };

  const handleEsc = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  };

  return (
    <FocusTrap open={true}>
      <div onKeyDown={handleEsc} role="presentation">
        <nav
          className="navigation-menu-contents"
          aria-label={navigationAriaLabel}
          tabIndex={-1}
        >
          <ClickAwayListener onClickAway={handleClickAway}>
            <ul className="gapped-sm">
              {links.map((l, i) => (
                <Fragment key={i}>
                  {i > 0 && <Divider />}
                  <li key={i} className={l.active ? 'active' : undefined}>
                    <Link
                      to={l.href}
                      aria-current={l.active && 'page'}
                      onClick={closeMenu}
                    >
                      <Text>{l.label}</Text>
                    </Link>
                  </li>
                </Fragment>
              ))}
            </ul>
          </ClickAwayListener>
        </nav>
      </div>
    </FocusTrap>
  );
};
