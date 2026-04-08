import { ClerkQuarantineMatch } from 'interfaces/clerkQuarantine';

type ClerkQuarantineListingProps = {
  matches: ClerkQuarantineMatch[];
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  activeTab: 'pending' | 'previous' | 'active';
};

export const ClerkQuarantineListing = ({
  matches,
}: ClerkQuarantineListingProps) => {
  return <pre>{JSON.stringify(matches, null, 2)}</pre>;
};
