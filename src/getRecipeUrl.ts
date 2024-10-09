import type { Recipe } from './cms';

const BASE_URL = 'https://www.letscozinha.com.br';

export const getRecipeUrl = (recipe: Recipe) => {
  return `${BASE_URL}/receitas/${recipe.slug}`;
};
