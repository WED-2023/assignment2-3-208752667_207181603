var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("I'm alive"));

/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res) => {
  try {
    const recipeName = req.query.recipeName;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerance = req.query.intolerance;
    const number = req.query.number;
    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Failed to search the recipe with the given details.", success: false });
  }
});

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.status(200).send(recipe);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Failed to retrive the recipe with the given details.", success: false });
  }
});

router.get("/random/:number", async (req, res) => {
  try {
    const recipes = await recipes_utils.getRandomRecipes(req.params.number);
    res.status(200).send(recipes);
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Failed retrive the requested amount of random recipes.", success: false });
  }
});

module.exports = router;
