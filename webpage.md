# How do I go about implementing this webpage as source ?

User supplies the url, we scrape the content and store it in the db,
when the user decides to press train / retrain we chunk this thing and create embeddings like for other things

the problem is where in db do i put this content, initially we don't have an agent, so keeping it in source is a no go,

if i make the agent table null and add the user id there for association and later update this is a good idea;

now the problem with this is i need to get the scraping to work and then tying 

now final piece of the puzzle is managing the client side state which is kind of confused and in perilous state through different pages, types are outdated and its a complete shit show in train agent action and retrain agent, absolutely complex large files with no clear abstraction