import { SearchFilter } from 'enums/app';
import { PublicTranslatorFilter } from 'interfaces/publicTranslator';
import {
  PUBLIC_TRANSLATOR_ADD_FILTER_ERROR,
  PUBLIC_TRANSLATOR_ADD_FILTERS,
  PUBLIC_TRANSLATOR_ADD_SELECTED,
  PUBLIC_TRANSLATOR_EMPTY_FILTERS,
  PUBLIC_TRANSLATOR_EMPTY_SELECTIONS,
  PUBLIC_TRANSLATOR_LOAD,
  PUBLIC_TRANSLATOR_REMOVE_FILTER_ERROR,
  PUBLIC_TRANSLATOR_REMOVE_SELECTED,
} from 'redux/actionTypes/publicTranslator';

export const loadPublicTranslators = {
  type: PUBLIC_TRANSLATOR_LOAD,
};

export const addSelectedTranslator = (index: number) => ({
  type: PUBLIC_TRANSLATOR_ADD_SELECTED,
  index,
});

export const removeSelectedTranslator = (index: number) => ({
  type: PUBLIC_TRANSLATOR_REMOVE_SELECTED,
  index,
});

export const emptySelectedTranslators = {
  type: PUBLIC_TRANSLATOR_EMPTY_SELECTIONS,
};

export const addPublicTranslatorFilter = (filters: PublicTranslatorFilter) => ({
  type: PUBLIC_TRANSLATOR_ADD_FILTERS,
  filters,
});

export const emptyPublicTranslatorFilters = {
  type: PUBLIC_TRANSLATOR_EMPTY_FILTERS,
};

export const addPublicTranslatorFilterError = (
  filterErrorName: SearchFilter
) => ({
  type: PUBLIC_TRANSLATOR_ADD_FILTER_ERROR,
  filterErrorName,
});

export const removePublicTranslatorFilterError = (
  filterErrorName: SearchFilter
) => ({
  type: PUBLIC_TRANSLATOR_REMOVE_FILTER_ERROR,
  filterErrorName,
});
