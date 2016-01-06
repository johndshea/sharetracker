Todo:

* need to do styling - think custom CSS

* Still need to write a DELETE GUI for the stocks. I'm kinda halfway through - I have a button but don't know how to hook it up to the API (needs the id of the object to make the API call).

* Test that AUTH works on DELETE

* reset the "secret" to something more, well, secret.


Bugs:

* I think the app has a problem - I'm setting currentUser manually and it causes login/logout issues when the server restarts. I think I should be using Passport's built-in user object instead but I can't figure out how to use it. 

* ui-router: assigning controller in the router config doesn't seem to work. I seem to need to attach the controller in the template as well.
