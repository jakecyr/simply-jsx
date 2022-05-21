# Simply JSX

A simple transpiler for JSX without React. Features include:

- Transpile JSX to JS
- Auto-reload browser on file change
- More coming soon!

## Installation

1. With npm, run `npm install simply-jsx`
2. Create a simply.json file in your root project folder (adjacent to your package.json)
3. Add the following to your simply.json file (changing the values as needed):

   ```json
   {
     "source": "src",
     "build": "dist",
     "staticFiles": "public"
   }
   ```
4. Create an index.html file in your staticFiles folder (folder specified in simply.json)
5. Add a script to your package.json file:

   ```json
   "scripts": {
     "start": "simply-jsx",
   }
   ```

6. Run `npm start`
