const DButils = require("./DButils");

async function markAsFavorite(recipeID, username){
    await DButils.execQuery(`INSERT into favoriteRecipes values (${recipeID},'${username}')`);
}

async function unMarkAsFavorite(recipeID, username){
    await DButils.execQuery(`DELETE from favoriteRecipes WHERE recipeID=${recipeID} AND username='${username}'`);
}

async function getFavoriteRecipes(username){
    const recipesId = await DButils.execQuery(`SELECT recipeID from favoriteRecipes where username='${username}'`);
    return recipesId;
}

async function getNextRecipeID() {
    const result = await DButils.execQuery(`SELECT COALESCE(MIN(recipeID), 0) AS minRecipeID FROM recipes`);
    const minRecipeID = result[0].minRecipeID;
    const newID = minRecipeID === 0 ? -1 : minRecipeID - 1;
    return newID;
}

async function createRecipe(recipeID, image, title, readyInMinutes, servings, vegetarian, vegan, glutenFree, summary, ingredients, instructions) {
    const query = `INSERT INTO recipes (recipeID, image, title, readyInMinutes, dishes, vegetarian, vegan, glutenFree, summary, ingredients, instructions) VALUES (${recipeID}, '${image}', '${title}', ${readyInMinutes}, ${servings}, ${vegetarian ? 1 : 0}, ${vegan ? 1 : 0}, ${glutenFree ? 1 : 0}, '${summary}', '${JSON.stringify(ingredients)}', '${JSON.stringify(instructions)}')`;

    await DButils.execQuery(query);
}

async function addFamilyRecipe(recipeID, username) {
    await DButils.execQuery(`INSERT into familyRecipes values (${recipeID},'${username}')`);
}

async function addUserRecipe(recipeID, username) {
    await DButils.execQuery(`INSERT into userRecipes values (${recipeID},'${username}')`);
}

async function getFamilyRecipe(username) {
    const recipesID = await DButils.execQuery(`SELECT recipeID from familyRecipes where username='${username}'`);
    return recipesID;
}

async function getUserRecipe(username) {
    const recipesID = await DButils.execQuery(`SELECT recipeID from userRecipes where username='${username}'`);
    return recipesID;
}


exports.markAsFavorite = markAsFavorite;
exports.unMarkAsFavorite = unMarkAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.createRecipe = createRecipe;
exports.getNextRecipeID = getNextRecipeID;
exports.addUserRecipe = addUserRecipe;
exports.addFamilyRecipe = addFamilyRecipe;
exports.getFamilyRecipe = getFamilyRecipe;
exports.getUserRecipe = getUserRecipe;