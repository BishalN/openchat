So form submission error after data validation on ui;
Check for user auth and redirect if not for dashboard page;
Add avatar dropdown which gives options to logout, profile etc;

use tanstack query for client side data fetching;

all the spinners are not working for some reason; maybe cuz of the promptkit intervention, that is having its effects probably

fix the actions schema, to get types from both the schema and the ingest client;
They should all be composing each other and not be so isolated from each other that we have so much duplication problems;


and probably in retrain agents also use the use-source hook for state cuz that is super simple to use