Bugs:

* API calls are very slow, and as a result I need to set a timeout on the controller to reset the stocks array in 5 seconds after pageload. VERY hacky. I no like.

* Still need to write a DELETE and/or edit GUI for the stocks.

* ui-router: assigning controller in the router config doesn't seem to work. I seem to need to attach the controller in the template as well.
