import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { ClickAwayListener, Divider, Paper } from '@mui/material';
import { FocusTrap } from 'focus-trap-react';
import { ForwardedRef, forwardRef, Fragment, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';

import { Color } from '../../enums';
import { NavigationLinksProps } from '../NavigationLinks/NavigationLinks';
import { Text } from '../Text/Text';

import './MobileNavigationMenu.scss';

const handleEsc = (e: React.KeyboardEvent, onMenuClose: () => void) => {
  if (e.key === 'Escape') {
    onMenuClose();
  }
};

const MobileNavigationMenuToggleWrapper = forwardRef(
  function MobileNavigationMenuToggle(
    {
      openStateLabel,
      openStateAriaLabel,
      closedStateLabel,
      closedStateAriaLabel,
      isOpen,
      toggleMenu,
      closeMenu,
    }: {
      openStateLabel: string;
      openStateAriaLabel: string;
      closedStateLabel: string;
      closedStateAriaLabel: string;
      isOpen: boolean;
      toggleMenu: () => void;
      closeMenu: () => void;
    },
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    return (
      <div ref={ref}>
        <button
          tabIndex={0}
          className="navigation-menu-toggle rows align-items-center"
          onClick={toggleMenu}
          onKeyDown={(e) => handleEsc(e, closeMenu)}
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
      </div>
    );
  },
);

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

  return (
    <Paper
      onKeyDown={(e) => handleEsc(e, closeMenu)}
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
                {i > 0 && <Divider aria-hidden={true} />}
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
  isMenuOpen,
  setIsMenuOpen,
}: {
  openStateLabel: string;
  openStateAriaLabel: string;
  closedStateLabel: string;
  closedStateAriaLabel: string;
  portalContainer: HTMLElement;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
} & NavigationLinksProps) => {
  const [toggleElement, setToggleElement] = useState<HTMLDivElement | null>(
    null,
  );

  const containerElements = toggleElement
    ? [toggleElement, portalContainer]
    : [portalContainer];

  return (
    <>
      {isMenuOpen && (
        <FocusTrap containerElements={containerElements}>
          <div />
        </FocusTrap>
      )}

      <MobileNavigationMenuToggleWrapper
        openStateAriaLabel={openStateAriaLabel}
        openStateLabel={openStateLabel}
        closedStateAriaLabel={closedStateAriaLabel}
        closedStateLabel={closedStateLabel}
        isOpen={isMenuOpen}
        closeMenu={() => setIsMenuOpen(false)}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        ref={setToggleElement}
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
