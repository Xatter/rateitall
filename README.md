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

    git clone https://github.com/xatter/rateitall
    cd rateitall
    npm install
    ./build.sh

The build script reads the version from `public/manifest.json`, compiles the extension into the `build/` directory, and creates a `rate-it-all-v<version>.zip` ready for distribution.

Once built, you can load the extension:

On Firefox:

`about:debugging#/runtime/this-firefox`

Click `Load Temporary Add-on`
Navigate to `rateitall/build/manifest.json`


On Chrome:

Navigate to `chrome://extensions`, enable Developer Mode, and click `Load unpacked`. Select the `build/` folder.


## Available Scripts

### `./build.sh`

Builds the TypeScript and puts the compiled extension into `build/` so it can be loaded in the browser for debugging. Also produces a `.zip` file for distribution.

### `npm test`

When there are tests this will run them.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
