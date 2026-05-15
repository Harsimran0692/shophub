import { createAction, props } from '@ngrx/store';
import { CategorySpec } from '../../../models/product.interface';

export const loadCategorySpecs = createAction(
  '[CategorySpec] Load Category Specs'
);

export const loadCategorySpecsSuccess = createAction(
  '[CategorySpec] Load Category Specs Success',
  props<{ categorySpecs: CategorySpec[] }>()
);

export const loadCategorySpecsFailure = createAction(
  '[CategorySpec] Load Category Specs Failure',
  props<{ error: string }>()
);
