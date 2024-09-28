import 'dotenv/config';
import qs from 'qs';

const CMS_URL = process.env.CMS_URL;

const CMS_TOKEN = process.env.CMS_TOKEN;

const RECIPES_POPULATE = ['categorias', 'imagens'];

type CMSData<Attributes> = {
  id: number;
  attributes: Attributes;
};

export type CMSDataArrayResponse<Attributes = Record<string, unknown>> = {
  data: CMSData<Attributes>[];
};

type ImageAttributes = {
  url: string;
  width: number;
  height: number;
  alt?: string;
};

type Image = ImageAttributes & {
  formats: {
    thumbnail?: ImageAttributes;
    small?: ImageAttributes;
    medium?: ImageAttributes;
    large?: ImageAttributes;
  };
};

type CMSImages = {
  data: CMSData<Image>[];
};

type RecipeAttributes = {
  nome: string;
  descricao: string;
  slug: string;
  receita: string;
  updatedAt: string;
  meta_descricao: string;
  keywords: string;
  imagens?: CMSImages;
  categorias?: {
    data: CMSData<{
      id: number;
      nome: string;
      slug: string;
    }>[];
  };
};

type CMSRecipesResponse = CMSDataArrayResponse<RecipeAttributes>;

const mapCMSData = <Attributes>(data: CMSData<Attributes>) => {
  return {
    id: data.id,
    ...data.attributes,
  };
};

const mapRecipe = (data: CMSRecipesResponse['data'][0]) => {
  const imagens = data.attributes.imagens?.data?.map(mapCMSData);
  const categorias = data.attributes.categorias?.data?.map(mapCMSData);
  return { ...mapCMSData(data), imagens, categorias };
};

export type Recipe = ReturnType<typeof mapRecipe>;

export const fetchRecipeByPath = async (path: string) => {
  const slug = path.replace(/^\/receitas\//, '');

  const query = qs.stringify({
    populate: RECIPES_POPULATE,
    filters: {
      slug: {
        $eq: slug,
      },
    },
  });

  const response = await fetch(
    `${CMS_URL}/api/lets-cozinha-receitas?${query}`,
    {
      headers: {
        Authorization: `Bearer ${CMS_TOKEN}`,
      },
    }
  ).then((res) => res.json() as Promise<CMSRecipesResponse>);

  console.log(response);

  return mapRecipe(response.data[0]);
};
