const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
    };
}

async function getRecipesPreview(recipes_info) {
    let recipesDetailsPromises = recipes_info.map(async recipe_id => await getRecipeDetails(recipe_id));
    let recipesDetails = await Promise.all(recipesDetailsPromises);
    return recipesDetails;
}


async function searchRecipe(recipeName, cuisine, diet, intolerance, number) {
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: recipeName,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerance,
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return getRecipesPreview(response.data.results.map((element) => element.id));
}

async function getRandomRecipes(number) {
    try {
        const response = await axios.get(`${api_domain}/random`, {
            params: {
                number: number,
                apiKey: process.env.spooncular_apiKey
            }
        });

        // Assuming the correct property is response.data.recipes
        if (response.data && response.data.recipes) {
            return response.data;
        } else {
            throw new Error("Invalid response structure");
        }
    } catch (error) {
        console.error("Error fetching random recipes:", error);
        throw error;
    }
}

exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipe = searchRecipe;
exports.getRandomRecipes = getRandomRecipes;
exports.getRecipesPreview = getRecipesPreview;

