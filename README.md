# Mr. Rate It All

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# What?

Mr. Rate It All is a chrome/firefox extension that allows you to rate anything you can select on a webpage. Specifically I made this so I could rate individual dishes on online ordering sites such as Grubhub. Because, if we're honest, the idea that "this is a good place" is insufficient. They're really only good at a handful of the items on their menu, and I want to remember:

* What item's I've already tried
* Which ones were good or not so good
* Want to be able to rate things without affecting their overall rating in the system just because I disagreed or had a bad experience with a particular dish

As such all the ratings are kept locally on your browser and never transmitted anywhere else for "sharing" or spying of any kind.

## Build and develop locally

This extension is written in TypeScript and React (because it's what I know). Thus it needs to be compiled into javascript in order to work.

    git pull https://github.com/xatter/rateitall
    cd rateitall
    npm build

Once built, you can do

On Firefox:

`about:debugging#/runtime/this-firefox`

Click `Load Temporary Add-on`
Navigate to `rateitall/build/static/manifest.json`


On Chrome:

...


## Available Scripts

In the project directory, you can run:

### `npm build`

This builds the typescript and puts the compiled extension into `build/static` so it can be loaded in the browser for debugging. Currently only "production builds" are supported (minimized JS which is difficult to debug.)

### `npm test`

When there are tests this will run them.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
