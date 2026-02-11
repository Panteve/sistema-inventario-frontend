import { inject } from "@angular/core";
import { ProductService } from "../app/services/product.service";
import type { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { ProductInterface } from "../app/interfaces/product.interface";

export const productResolver: ResolveFn<ProductInterface> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const productService = inject(ProductService);
  return productService.productSelected();
};