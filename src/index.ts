import { getMostVisitedRecipes } from './getMostVisitedPages';
import { fetchRecipeByPath } from './cms';
import { postOnFacebook } from './postOnFacebook';

const paths = await getMostVisitedRecipes();

const recipe = await fetchRecipeByPath(paths[0].path);

postOnFacebook(recipe).then((data) => {
  console.log(data);
});
