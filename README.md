# Just JSX

A simple transpiler for JSX without React. Features include:

* Transpile JSX to JS
* Auto-reload browser on file change
* More coming soon!

## Installation

1. With npm, run `npm install just-jsx`
2. Create a just.json file in your root project folder (adjacent to your package.json)
3. Add the following to your just.json file (changing the values as needed):

    ```json
    {
      "source": "src",
      "build": "dist",
      "staticFiles": "public"
    }
    ```

4. Add a script to your package.json file:

    ```json
    "scripts": {
      "start": "just-jsx",
    }
    ```

5. Run `npm start`
