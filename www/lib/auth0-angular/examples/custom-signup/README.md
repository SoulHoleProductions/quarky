# Custom Signup Example

Create a new user and store extra data fields.

### Running the example
#### Node.js Backend
In order to run the example, go to the `nodejs` folder and run:
```sh
npm install
```
Replace your Auth0 Domain and a valid APIv2 token with user:create scope in the `nodejs/app.js` file.
Replace your Auth0 Domain and a ClientID in the `client/scripts/myApp.js` file.
After doing that, start the server by doing:
```sh
node app.js
```
Finally, serve the frontend by going to the `client` folder and run:
```sh
npm install -g serve
serve
```

and point your browser to [http://localhost:3000/](http://localhost:3000).
