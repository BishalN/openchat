there is so much mess in the sources stuff in both while creating and during the retraining, we have different state management hooks and different types and so much duplication, i really need to first refactor this before anything is to be changed in this shit show;


plan start with the create agent stuff, create good lil abstraction and try to create abstraction such that it can accomodate the retrain parts of source as well, from ui to state management to making backend calls;

first lets get the websource to create agent place;

first the hooks for source are
in create agent its useSourceStore
in retrain its useSourcesStore

## The main question to answer here is how does the create agent handles state management ?

### How can we improve that, make it easy to understand