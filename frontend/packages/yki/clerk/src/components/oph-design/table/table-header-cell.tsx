import { ExpandLess, ExpandMore, UnfoldMore } from '@mui/icons-material';
import { Button, TableCell, Typography } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { memo } from 'react';

import { styled } from 'components/oph-design/theme';

type SortDirection = 'asc' | 'desc';

const getSortParts = (sortStr?: string, colId?: string) => {
  const [orderBy, direction] = sortStr?.split(':') ?? [];

  if (
    (colId === undefined || colId === orderBy) &&
    (direction === 'asc' || direction === 'desc')
  ) {
    return { orderBy, direction } as {
      orderBy: string;
      direction: SortDirection;
    };
  }

  return {
    orderBy: undefined,
    direction: undefined,
  };
};

const SortIcon = ({
  sortValue,
  colId = '',
}: {
  sortValue?: string;
  colId?: string;
}) => {
  switch (sortValue) {
    case `${colId}:asc`:
      return <ExpandLess />;
    case `${colId}:desc`:
      return <ExpandMore />;
    default:
      return <UnfoldMore />;
  }
};

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0, 0, 0, 2),
  '&:last-child': {
    paddingRight: theme.spacing(2),
  },
  textAlign: 'left',
  'button:focus': {
    color: ophColors.blue2,
  },
}));

export const TableHeaderCell = memo(function TableHeaderCell({
  colId,
  title,
  style,
  sort,
  setSort,
  sortable,
}: {
  colId?: string;
  title?: React.ReactNode;
  style?: React.CSSProperties;
  sort?: string;
  setSort?: (sortDef: string) => void;
  sortable?: boolean;
}) {
  const { direction } = getSortParts(sort, colId);

  return (
    <StyledHeaderCell sx={style} sortDirection={direction}>
      {setSort && sortable ? (
        <Button
          sx={{
            color: ophColors.black,
            border: 0,
            padding: 0,
            margin: (theme) => theme.spacing(1, 0),
            lineHeight: 1.3,
          }}
          onClick={() => {
            let newSortValue = '';
            if (sort === `${colId}:asc`) {
              newSortValue = `${colId}:desc`;
            } else if (sort === `${colId}:desc`) {
              newSortValue = '';
            } else {
              newSortValue = `${colId}:asc`;
            }
            setSort(newSortValue);
          }}
          endIcon={<SortIcon sortValue={sort} colId={colId} />}
        >
          {title}
        </Button>
      ) : (
        <Typography style={{ fontWeight: 600 }}>{title}</Typography>
      )}
    </StyledHeaderCell>
  );
});
