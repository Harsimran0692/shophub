import { createReducer, on } from '@ngrx/store';
import {
  loadCategorySpecs,
  loadCategorySpecsFailure,
  loadCategorySpecsSuccess,
} from './product.actions';
import { CategorySpec, SpecField } from '../../../models/product.interface';

export interface CategorySpecState {
  categorySpecs: CategorySpec[];
  loading: boolean;
  error: string | null;
}

export const initialState: CategorySpecState = {
  categorySpecs: [],
  loading: false,
  error: null,
};

export const categorySpecReducer = createReducer(
  initialState,
  on(loadCategorySpecs, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(loadCategorySpecsSuccess, (state, { categorySpecs }) => ({
    ...state,
    categorySpecs,
    loading: false,
    error: null,
  })),
  on(loadCategorySpecsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  }))
);
