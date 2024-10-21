# Lets Cozinha - Social Media Poster

![Lets Cozinha](https://www.letscozinha.com.br/logo-texto.png)

This project is an application that posts to [Lets Cozinha social media platforms](https://www.letscozinha.com.br/contato) automatically.

Currently, the application posts to the following social media platforms:

- [Facebook](https://www.facebook.com/letscozinha)

## How it works

1. It retrieves the most visited recipes from the website using Google Analytics API.
1. It retrieves already published recipes from CMS.
1. It compares the most visited recipes with the already published recipes and selects the most visited recipes that are not published yet.
1. It uses OpenAI API to generate the post content.
1. It posts the content to the social media platforms.

## Scripts

### `pnpm run update-descriptions`

This script updates the descriptions of the recipes in the CMS. We've created this script because Google Search was removing some recipes from the search results. We believe that the descriptions were not good enough, so we decided to update them.

1. Export the affected recipes from Google Search Console.
1. Save `Tabela.csv` to the `src/google` folder.
1. Run the `pnpm run update-descriptions` script.
