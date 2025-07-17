So form submission error after data validation on ui;
Check for user auth and redirect if not for dashboard page;
Add avatar dropdown which gives options to logout, profile etc;

use tanstack query for client side data fetching;

all the spinners are not working for some reason; maybe cuz of the promptkit intervention, that is having its effects probably

there is so much mess in the sources stuff in both while creating and during the retraining, we have different state management hooks and different types and so much duplication, i really need to first refactor this before anything is to be changed in this shit show;


plan start with the create agent stuff, create good lil abstraction and try to create abstraction such that it can accomodate the retrain parts of source as well, from ui to state management to making backend calls;

first lets get the websource to create agent place;