import { fetchRecipeByPath, updateRecipe } from '../cms';
import { getRecipeSeoMetadata } from '../getSeoMetadata';
import { parse } from 'csv-parse';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const updateDescriptions = async () => {
  const csvPath = path.resolve(__dirname, 'Tabela.csv');

  const parser = parse({ delimiter: ',' });

  const stream = fs.createReadStream(csvPath).pipe(parser);

  for await (const record of stream) {
    const [url] = record as [string, string];

    if (url.startsWith('https://www.letscozinha.com.br/receitas/')) {
      if (!url.endsWith('/og')) {
        const path = url.replace('https://www.letscozinha.com.br', '');

        console.log('\n\nBuscando receita por path:', path);

        const recipe = await fetchRecipeByPath(path);

        const seoMetadata = await getRecipeSeoMetadata(recipe);

        await updateRecipe(recipe.id, {
          descricao: seoMetadata.descricao,
          keywords: seoMetadata.keywords,
          meta_descricao: seoMetadata.meta_descricao,
        });

        console.log('Descrição atualizada de: ', recipe.nome);
        console.log('Antiga descrição:', recipe.descricao);
        console.log('Nova descrição:', seoMetadata.descricao);
        console.log('Antiga meta descrição:', recipe.meta_descricao);
        console.log('Nova meta descrição:', seoMetadata.meta_descricao);
      }
    }
  }
};
