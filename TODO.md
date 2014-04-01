TODO
====
* unspecified jade files don't take parameters in the query string
  for example:
    http://localhost:5000/?title=MyApp
    the url above should render index.jade with the title "MyApp"
    instead it does not. The following url however:
    http://localhost:5000/index.jade?title=MyApp
    does work. I have no idea why, but I'll look at it when I get time
