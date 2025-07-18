So form submission error after data validation on ui;
Check for user auth and redirect if not for dashboard page;
Add avatar dropdown which gives options to logout, profile etc;

use tanstack query for client side data fetching;

all the spinners are not working for some reason; maybe cuz of the promptkit intervention, that is having its effects probably

fix the actions schema, to get types from both the schema and the ingest client;
They should all be composing each other and not be so isolated from each other that we have so much duplication problems;


and probably in retrain agents also use the use-source hook for state cuz that is super simple to use



## Make the sources and retrain part in-accessible for now cuz there are too many bugs there
### during showcase just don't show those things needs lots of work there;


TODO: fix the custom action latency problem
TODO: Test custom action with user identity, by doing sth like updating the user subscriptions, for this create a simple environment and verify that this works


TODO: fix the name / logo / color / design of the chat bubble i.e make settings page better

TODO: fix the playground page ui and also there only allow selection of google models and use the system prompt and everything given by user in chat-route; maybe modify sth in system prompt everything else use the customers choice
TODO: add some tests 

TODO: loading spinners and toast are not working probably cuz of prompt kit fix that

TODO: create a algorithm for documentation
TODO: read the documentation and make it ready

TODO: make this project hostable in a docker container