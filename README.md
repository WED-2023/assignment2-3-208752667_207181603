Yoav Zelinger - 208752667
Itzik Elbazis - 207181603

Changes in API:

editing all response messages schemes to be more responsive
editing schemes names to be more intuitive
editing parameters name to match code in frontend and backend.
creating schems for ingredients and instructions to be more intuitive.
removing the need to pass confirm password for user registration due to irrelevant

creating recipe:
	moving it to users route due to being created by a specific user (and connected to his recipes)
	created different scheme for it due to not passing the aggregated likes (created with zero)
	adding 401 response due to trying to create a recipe without being connected

register and login:
	moving outside of the users route because they are relevant to the auth and not the users route.
	
adding forgotten logout endpoint

favorites:
	replacing the {userId}/favorites with favorites/all (not passing parameters because the user ID is saved in the session.
	adding 401 response due to trying to retrieve favorite recipes without being connected

family:
	removing userId for the same reason as favorites removal of userId
