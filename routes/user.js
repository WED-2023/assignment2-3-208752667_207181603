var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

// router.get("/", (req, res) => res.send("I'm alive"));

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
    const recipeID = req.body.recipeID;
    const favoriteRecipes = await user_utils.getFavoriteRecipes(username);

    const recipeIDNumber = Number(recipeID);

    const isFavorite = favoriteRecipes.some((recipe) => Number(recipe.recipeID) === recipeIDNumber);

    if (isFavorite) {
      await user_utils.unMarkAsFavorite(recipeID, username);
      res.status(200).send({ message: "The Recipe successfully removed from favorites", success: true });
    } else {
      await user_utils.markAsFavorite(recipeID, username);
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
    const recipesPreview = await recipe_utils.getRecipesPreview(recipesID.map((recipe) => recipe.recipeID));
    res.status(200).send(recipesPreview);
  } catch(error){
    console.log(error);
    res.status(400).send({ message: "Failed to get favorite recipes.", success: false });
  }
});


router.post('/recipes', async (req, res) => {
  try {
    const username = req.session.username;
    const recipeID = await user_utils.getNextRecipeID();

    const {image, title, readyInMinutes, servings, vegetarian, vegan, glutenFree, familyRecipe, summary, ingredients, instructions} = req.body;

    await user_utils.createRecipe(recipeID, image, title, readyInMinutes, servings, vegetarian, vegan, glutenFree, summary, ingredients, instructions);

    await user_utils.addUserRecipe(recipeID, username);

    if (familyRecipe === true) {
      await user_utils.addFamilyRecipe(recipeID, username);
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
    const recipesPreview = await recipe_utils.getRecipesPreviewFromDB(recipesID.map((recipe) => recipe.recipeID));
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
    const recipesPreview = await recipe_utils.getRecipesPreviewFromDB(recipesID.map((recipe) => recipe.recipeID));
    res.status(200).send(recipesPreview);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Failed to get the user's recipes.", success: false });
  }
});

module.exports = router;
