import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategorySpecState } from './product.reducer';

export const selectCategorySpecState =
  createFeatureSelector<CategorySpecState>('categorySpecs');

// All specs
export const selectAllCategorySpecs = createSelector(
  selectCategorySpecState,
  (state) => state.categorySpecs
);

// Loading flag
export const selectCategorySpecsLoading = createSelector(
  selectCategorySpecState,
  (state) => state.loading
);

// Error
export const selectCategorySpecsError = createSelector(
  selectCategorySpecState,
  (state) => state.error
);

// Select a single spec by category name
export const selectCategorySpecByName = (category: string) =>
  createSelector(
    selectAllCategorySpecs,
    (specs) => specs.find((spec) => spec.category === category) ?? null
  );

// Select only the specFields for a given category
export const selectSpecFieldsByCategory = (category: string) =>
  createSelector(
    selectCategorySpecByName(category),
    (spec) => spec?.specField ?? []
  );
