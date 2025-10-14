import { styled as muiStyled } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';

const withTransientProps = (propName: string) =>
  // Emotion doesn't support transient props by default so add support manually
  shouldForwardProp(propName) && !propName.startsWith('$');

export const styled: typeof muiStyled = (
  tag: Parameters<typeof muiStyled>[0],
  options: Parameters<typeof muiStyled>[1] = {},
) => {
  return muiStyled(tag, {
    shouldForwardProp: (propName: string) =>
      (!options.shouldForwardProp || options.shouldForwardProp(propName)) &&
      withTransientProps(propName),
    ...options,
  });
};
