const axios = require("axios");
const DButils = require("./DButils");
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

async function getAmountLikes(recipe_id) {
    const query = `SELECT COUNT(id) AS count FROM favoriterecipes WHERE id = ${recipe_id}`;
    const result = await DButils.execQuery(query);
    return result[0].count;
}

async function getRecipeDetails(recipe_id) {
    let recipe_info;
    if(recipe_id >= 0){
        recipe_info = (await getRecipeInformation(recipe_id)).data;   
    }
    else{
        let nestedRecipe = await getRecipesPreviewFromDB([recipe_id]);
        recipe_info = nestedRecipe[0];
        
    }
    let {id, title, readyInMinutes, servings, image, aggregateLikes, vegan, vegetarian, glutenFree, summary, extendedIngredients, analyzedInstructions} = recipe_info;
    aggregateLikes = aggregateLikes + (await getAmountLikes(id));

    let plainSummary = summary.replace(/<\/?[^>]+(>|$)/g, "");

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        servings: servings,
        image: image,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        summary: plainSummary,
        extendedIngredients: extendedIngredients,
        analyzedInstructions: analyzedInstructions
    };
}

async function getRecipesPreview(recipes_info) {
    let recipesDetailsPromises = recipes_info.map(async id => await getRecipeDetails(id));
    let recipesDetails = await Promise.all(recipesDetailsPromises);
    return recipesDetails;
}

async function getRecipesPreviewFromDB(recipeIDs) {
    if (!Array.isArray(recipeIDs) || recipeIDs.length === 0) {
        return [];
    }

    try {
        const query = `
      SELECT id, image, title, readyInMinutes, servings, vegetarian, vegan, glutenFree, summary, extendedIngredients, analyzedInstructions FROM recipes WHERE id IN (${recipeIDs.join(",")})`;
        const recipes = await DButils.execQuery(query);
        return recipes.map(recipe => ({
            id: recipe.id,
            image: recipe.image,
            aggregateLikes: 0,
            title: recipe.title,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            vegetarian: (recipe.vegetarian === 1),
            vegan: (recipe.vegan === 1),
            glutenFree: (recipe.glutenFree === 1),
            summary: recipe.summary,
            extendedIngredients: recipe.extendedIngredients,
            analyzedInstructions: recipe.analyzedInstructions
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
exports.getRecipesPreviewFromDB = getRecipesPreviewFromDB;