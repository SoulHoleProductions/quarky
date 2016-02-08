# Refresh Token with on auth0-angular

This shows how to use refreshToken with Auth0-angular.

> **Warning**: Refresh tokens should really only be used in *mobile applications* (i.e. in Ionic) and not web apps. This is because with a stored `refreshToken` you'll always be able to get a usable `idToken` unless the `refreshToken` is revoked. This is not safe in a browser scenario since that browser could be running on a shared or public computer. See [this docs page](../../docs/refresh-token.md#using-refresh-tokens-in-mobile-applications) for more info the proper use of refresh tokens.

## Running the example

In order to run the example you need to just start a server. What we suggest is doing the following:

1. Install node
1. run npm install -g serve
1. run serve in the directory of this project.

Go to [http://localhost:3000](http://localhost:3000) and you'll see the app running :).
