# Architectual decisions / guidelines

## Frontend

### CSS

CSS files (SASS) for each project can be found in `src/styles` -folder of each project which encompasses all styling related definitions. This includes the `shared` folder. As the project does not currently have module scoped styles, [BEM](https://en.bem.info/methodology/naming-convention/) naming convention is used to mitigate the risk of style definitions leaking outside their intended usage target.
