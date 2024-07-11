const axios = require("axios");
const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";
const apiKey = "5a4b29bb8f6646e5939b6489479feb97"


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    console.log(process.env.spooncular_apiKey);
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            // apiKey: process.env.spooncular_apiKey
            apiKey: apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, servings, image, aggregateLikes, vegan, vegetarian, glutenFree, summary } = recipe_info.data;

    let plainSummary = summary.replace(/<\/?[^>]+(>|$)/g, "");

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        servings: servings,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        summary: plainSummary
    };
}

async function getRecipesPreview(recipes_info) {
    let recipesDetailsPromises = recipes_info.map(async recipe_id => await getRecipeDetails(recipe_id));
    let recipesDetails = await Promise.all(recipesDetailsPromises);
    return recipesDetails;
}

async function getRecipesPreviewFromDB(recipeIDs) {
    if (!Array.isArray(recipeIDs) || recipeIDs.length === 0) {
        return [];
    }

    try {
        const query = `
      SELECT recipeID, image, title, readyInMinutes, dishes, vegetarian, vegan, glutenFree, summary, ingredients, instructions FROM recipes WHERE recipeID IN (${recipeIDs.join(",")})`;
        const recipes = await DButils.execQuery(query);
        return recipes.map(recipe => ({
            recipeID: recipe.recipeID,
            image: recipe.image,
            title: recipe.title,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.dishes,
            vegetarian: recipe.vegetarian,
            vegan: recipe.vegan,
            glutenFree: recipe.glutenFree,
            summary: recipe.summary,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions
        }));
    } catch (error) {
        console.error('Error retrieving recipes preview:', error);
        throw error;
    }
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
                // apiKey: process.env.spooncular_apiKey
                apiKey: apiKey
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
exports.getRecipesPreviewFromDB = getRecipesPreviewFromDB;