# About the project
This project prepares data and makes charts of earthquakes in Perú using d3.js, css and HTML.
>[!WARNING]
> Edited dates of last 5 rows in `IGP_datos_sismicos-historical.csv`. 

## How to update the dataset?
- Download the data from [IGP](https://ultimosismo.igp.gob.pe/descargar-datos-sismicos) and move them to ./data/*.csv. Keep the names of the files.

- Edit the dates.

- Execute this command
```sh
npm run prepare-data
```

## What does the Technical process?
- Format the data to be used with geo libraries like d3.geo and turf.

- The dataset delivered by IGP *doesn't have references like the name of city or district of the location of the earthquake*. Therefore in case the coordinates point of an earthquake is in the sea, the script computes the district which is closer to the point. For that it computes the centroid of each polygon and select the id district which is the closest to that point.

## Visualization
- To reproduce it locally, install vscode extension *Live Server* and click **Go Live** present in the bottom of the IDE window.

- See the viz in this [link](https://ccalobeto.github.io/earthquakes/).

