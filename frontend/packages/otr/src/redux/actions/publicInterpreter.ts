import { SearchFilter } from 'enums/app';
import { PublicInterpreterFilter } from 'interfaces/publicInterpreter';
import {
  PUBLIC_INTERPRETER_ADD_FILTER_ERROR,
  PUBLIC_INTERPRETER_ADD_FILTERS,
  PUBLIC_INTERPRETER_ADD_SELECTED,
  PUBLIC_INTERPRETER_EMPTY_FILTERS,
  PUBLIC_INTERPRETER_EMPTY_SELECTIONS,
  PUBLIC_INTERPRETER_LOAD,
  PUBLIC_INTERPRETER_REMOVE_FILTER_ERROR,
  PUBLIC_INTERPRETER_REMOVE_SELECTED,
} from 'redux/actionTypes/publicInterpreter';

export const loadPublicInterpreters = {
  type: PUBLIC_INTERPRETER_LOAD,
};

export const addSelectedTranslator = (index: number) => ({
  type: PUBLIC_INTERPRETER_ADD_SELECTED,
  index,
});

export const removeSelectedTranslator = (index: number) => ({
  type: PUBLIC_INTERPRETER_REMOVE_SELECTED,
  index,
});

export const emptySelectedTranslators = {
  type: PUBLIC_INTERPRETER_EMPTY_SELECTIONS,
};

export const addPublicInterpreterFilter = (
  filters: PublicInterpreterFilter
) => ({
  type: PUBLIC_INTERPRETER_ADD_FILTERS,
  filters,
});

export const emptyPublicInterpreterFilters = {
  type: PUBLIC_INTERPRETER_EMPTY_FILTERS,
};

export const addPublicInterpreterFilterError = (
  filterErrorName: SearchFilter
) => ({
  type: PUBLIC_INTERPRETER_ADD_FILTER_ERROR,
  filterErrorName,
});

export const removePublicInterpreterFilterError = (
  filterErrorName: SearchFilter
) => ({
  type: PUBLIC_INTERPRETER_REMOVE_FILTER_ERROR,
  filterErrorName,
});
