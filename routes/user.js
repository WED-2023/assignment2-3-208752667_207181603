var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");


/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT username FROM users").then((users) => {
      if (users.find((x) => x.username === req.session.username)) {
        req.username = req.session.username;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req, res) => {
  try {
    const username = req.session.username;
    const id = req.body.id;
    const favoriteRecipes = await user_utils.getFavoriteRecipes(username);

    const recipeIDNumber = Number(id);

    const isFavorite = favoriteRecipes.some((recipe) => Number(recipe.id) === recipeIDNumber);

    if (isFavorite) {
      await user_utils.unMarkAsFavorite(id, username);
      res.status(200).send({ message: "The Recipe successfully removed from favorites", success: true });
    } else {
      await user_utils.markAsFavorite(id, username);
      res.status(200).send({ message: "The Recipe successfully saved as favorites", success: true });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Failed to toggle favorite mark of the recipe.", success: false });
  }
});


/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res) => {
  try{
    const username = req.session.username;
    const recipesID = await user_utils.getFavoriteRecipes(username);
    const recipesPreview = await recipe_utils.getRecipesPreview(recipesID.map((recipe) => recipe.id));
    res.status(200).send(recipesPreview);
  } catch(error){
    console.log(error);
    res.status(400).send({ message: "Failed to get favorite recipes.", success: false });
  }
});

/**
 * This path returns if a recipe is saved by the logged-in user
 */
router.get('/favorites/:id', async (req,res) => {
  try {
    const username = req.session.username;

    if (!username) {
      return res.status(400).send({ message: "User not logged in.", success: false });
    }

    const recipesID = await user_utils.getFavoriteRecipes(username);
    let inFavorites = false;

    const recipeId = parseInt(req.params.id, 10); // Ensure the ID is treated as a number
    if (recipesID.find((recipe) => recipe.id === recipeId)) {
      inFavorites = true;
    }
    res.status(200).send(inFavorites);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Failed to find the requested recipe.", success: false });
  }
});


router.post('/recipes', async (req, res) => {
  try {
    const username = req.session.username;
    const id = await user_utils.getNextRecipeID();
    const {image, title, readyInMinutes, servings, vegetarian, vegan, glutenFree, familyRecipe, summary, extendedIngredients, analyzedInstructions} = req.body;

    await user_utils.createRecipe(id, image, title, readyInMinutes, servings, vegetarian, vegan, glutenFree, summary, extendedIngredients, analyzedInstructions);

    await user_utils.addUserRecipe(id, username);

    if (familyRecipe === true) {
      await user_utils.addFamilyRecipe(id, username);
    }

    res.status(201).send({
      message: "Recipe created successfully", success: true});
  } catch (error) {
    console.log(error);
    res.status(400).send({error: "Failed to create recipe", success: false});
  }
});

router.get('/family', async (req, res) => {
  try {
    const username = req.session.username;
    const recipesID = await user_utils.getFamilyRecipe(username);
    const recipesPreview = await recipe_utils.getRecipesPreview(recipesID.map((recipe) => recipe.id));
    res.status(200).send(recipesPreview);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Failed to get family recipes.", success: false });
  }
});

router.get('/recipes', async (req, res) => {
  try {
    const username = req.session.username;
    const recipesID = await user_utils.getUserRecipe(username);
    const recipesPreview = await recipe_utils.getRecipesPreview(recipesID.map((recipe) => recipe.id));
    res.status(200).send(recipesPreview);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Failed to get the user's recipes.", success: false });
  }
});

module.exports = router;
