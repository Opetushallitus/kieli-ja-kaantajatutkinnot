import { QuestionMark } from '@mui/icons-material';
import { IconButton, IconButtonProps } from '@mui/material';
import { FC, forwardRef } from 'react';

const CustomIconButton: FC<IconButtonProps> = forwardRef(
  (props: IconButtonProps, ref) => {
    return (
      <IconButton ref={ref} {...props} aria-disabled={props.disabled}>
        {props.children ?? <QuestionMark />}
      </IconButton>
    );
  }
);

CustomIconButton.displayName = 'CustomIconButton';
export { CustomIconButton };
