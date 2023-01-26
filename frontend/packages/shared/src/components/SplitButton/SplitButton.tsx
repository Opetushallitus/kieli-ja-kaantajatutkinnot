import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ButtonGroup, ButtonGroupProps } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import React, { FC, ReactNode } from 'react';

import { CustomButton } from '../../components';

type SplitButtonOption = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
};

type SplitButtonProps = {
  options: SplitButtonOption[];
  ariaLabelOpen: string;
} & ButtonGroupProps;

export const SplitButton: FC<SplitButtonProps> = ({ ...props }) => {
  const options: SplitButtonOption[] = props.options;
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleClick = () => {
    options[selectedIndex].onClick();
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup
        {...props}
        ref={anchorRef}
        aria-disabled={props.disabled}
      >
        <CustomButton onClick={handleClick}>
          {options[selectedIndex].label}
        </CustomButton>
        <CustomButton
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label={props.ariaLabelOpen}
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </CustomButton>
      </ButtonGroup>
      <Popper
        sx={{
          zIndex: 2,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option: SplitButtonOption, index: number) => (
                    <MenuItem
                      key={`split-button-option-${index}`}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                      disabled={option.disabled}
                      data-testid={`split-button-option-${index}`}
                    >
                      <ListItemIcon>{option.icon}</ListItemIcon>
                      <ListItemText>{option.label}</ListItemText>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};
