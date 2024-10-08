import { FocusTrap } from '@mui/base/FocusTrap';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { ClickAwayListener, Divider, Paper } from '@mui/material';
import { Fragment, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

import { Color } from '../../enums';
import { NavigationLinksProps } from '../NavigationLinks/NavigationLinks';
import { Text } from '../Text/Text';

import './MobileNavigationMenu.scss';

const MobileNavigationMenuToggle = ({
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
      <Paper
        onKeyDown={handleEsc}
        role="presentation"
        tabIndex={-1}
        elevation={3}
      >
        <nav
          className="navigation-menu-contents"
          aria-label={navigationAriaLabel}
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
      </Paper>
    </FocusTrap>
  );
};

export const MobileNavigationMenuWithPortal = ({
  navigationAriaLabel,
  openStateLabel,
  openStateAriaLabel,
  closedStateLabel,
  closedStateAriaLabel,
  links,
  portalContainer,
}: {
  openStateLabel: string;
  openStateAriaLabel: string;
  closedStateLabel: string;
  closedStateAriaLabel: string;
  portalContainer: HTMLElement;
} & NavigationLinksProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <MobileNavigationMenuToggle
        openStateAriaLabel={openStateAriaLabel}
        openStateLabel={openStateLabel}
        closedStateAriaLabel={closedStateAriaLabel}
        closedStateLabel={closedStateLabel}
        isOpen={isMenuOpen}
        setIsOpen={() => setIsMenuOpen(true)}
      />
      {isMenuOpen &&
        createPortal(
          <MobileNavigationMenuContents
            navigationAriaLabel={navigationAriaLabel}
            links={links}
            closeMenu={() => setIsMenuOpen(false)}
          />,
          portalContainer,
        )}
    </>
  );
};
