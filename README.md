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
