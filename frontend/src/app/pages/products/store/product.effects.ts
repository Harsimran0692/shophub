import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import {
  loadCategorySpecs,
  loadCategorySpecsFailure,
  loadCategorySpecsSuccess,
} from './product.actions';

@Injectable()
export class CategorySpecEffects {
  constructor(
    private actions$: Actions,
    private categorySpecService: ProductService
  ) {}
  loadCategorySpecs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCategorySpecs),
      switchMap(() =>
        this.categorySpecService.getCategorySpecs().pipe(
          map((categorySpecs) => loadCategorySpecsSuccess({ categorySpecs })),
          catchError((err) =>
            of(loadCategorySpecsFailure({ error: err.message }))
          )
        )
      )
    )
  );
}
