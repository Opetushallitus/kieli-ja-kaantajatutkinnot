import { PublicInterpreterFilter } from 'interfaces/publicInterpreter';
import {
  PUBLIC_INTERPRETER_ADD_FILTERS,
  PUBLIC_INTERPRETER_EMPTY_FILTERS,
  PUBLIC_INTERPRETER_LOAD,
} from 'redux/actionTypes/publicInterpreter';

export const loadPublicInterpreters = {
  type: PUBLIC_INTERPRETER_LOAD,
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
