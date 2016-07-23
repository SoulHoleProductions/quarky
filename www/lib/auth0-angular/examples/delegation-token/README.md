# Token Delegation Example

This example show Angularjs client side authentication + server side authentication to two different APIs. A delegation token is requested in order to communicate with the secondary API.
To learn more about delegation tokens go to: https://auth0.com/docs/tokens/delegation

In order to run the example, in this current folder and run:
```sh
npm install
```
Next, make sure to have created two Apps under your Auth0 Dashboard.
Also, set your two apps Domain, ClientID (or Audience) and Client Secret in the `server.js` and the `client/scripts/myApp.js` files.
After doing that, start the server by doing:
```sh
node server.js
```

Open your browser at [http://localhost:3000/](http://localhost:3000).

