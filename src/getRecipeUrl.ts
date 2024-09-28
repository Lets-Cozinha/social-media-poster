import type { Recipe } from './cms';

const BASE_URL = 'https://letscozinha.com.br';

export function getRecipeUrl(recipe: Recipe) {
  return `${BASE_URL}/receitas/${recipe.slug}`;
}
