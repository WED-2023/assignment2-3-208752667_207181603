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



exports.markAsFavorite = markAsFavorite;
exports.unMarkAsFavorite = unMarkAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
