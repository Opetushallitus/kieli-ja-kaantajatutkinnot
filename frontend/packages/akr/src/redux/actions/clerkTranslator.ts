import { ClerkTranslatorFilter } from 'interfaces/clerkTranslator';
import {
  CLERK_TRANSLATOR_ADD_FILTER,
  CLERK_TRANSLATOR_DESELECT,
  CLERK_TRANSLATOR_DESELECT_ALL,
  CLERK_TRANSLATOR_LOAD,
  CLERK_TRANSLATOR_RESET_FILTERS,
  CLERK_TRANSLATOR_SELECT,
  CLERK_TRANSLATOR_SELECT_ALL_FILTERED,
} from 'redux/actionTypes/clerkTranslators';

export const loadClerkTranslators = {
  type: CLERK_TRANSLATOR_LOAD,
};

export const selectClerkTranslator = (index: number) => ({
  type: CLERK_TRANSLATOR_SELECT,
  index,
});

export const deselectClerkTranslator = (index: number) => ({
  type: CLERK_TRANSLATOR_DESELECT,
  index,
});

export const selectAllFilteredTranslators = {
  type: CLERK_TRANSLATOR_SELECT_ALL_FILTERED,
};

export const deselectAllTranslators = {
  type: CLERK_TRANSLATOR_DESELECT_ALL,
};

export const setClerkTranslatorFilters = (
  filters: Partial<ClerkTranslatorFilter>
) => ({
  type: CLERK_TRANSLATOR_ADD_FILTER,
  filters,
});

export const resetClerkTranslatorFilters = {
  type: CLERK_TRANSLATOR_RESET_FILTERS,
};
