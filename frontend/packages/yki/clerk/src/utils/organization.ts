import {
  ClerkOrganizerHierarchy,
  ClerkOrganizerHierarchyResponse,
} from 'interfaces/clerkOrganizer';

export const flattenOrganizationHierarchy = (
  orgChildrenResponse: Array<ClerkOrganizerHierarchyResponse>,
): Array<ClerkOrganizerHierarchy> => {
  const mapConcatOrgs = (
    orgs: Array<ClerkOrganizerHierarchyResponse>,
  ): Array<ClerkOrganizerHierarchy> => {
    return orgs.flatMap((o) =>
      [{ name: o.nimi, oid: o.oid } as ClerkOrganizerHierarchy].concat(
        mapConcatOrgs(o.children ?? []),
      ),
    );
  };

  return mapConcatOrgs(orgChildrenResponse);
};
