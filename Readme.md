# About the project
This project makes charts of earthquakes in Perú using d3.js, css and HTML. 
Also prepares data for that charts.

## How to update the dataset?
- Clone the repo.
- Download the data from [IGP](https://ultimosismo.igp.gob.pe/descargar-datos-sismicos)
and move your new files to ./data/*.csv. Keep the names of the files.
- Up your local server.
- Wait a few seconds until the page shows **Click to Download** (it processes more than +24k rows) and then download the file.
- Use this dataset to your own analysis and visualizations.

## What does the Technical process?
- Format the dataset to be used with geo libraries like d3.geo and turf.
- The dataset delivered by IGP *doesn't have references like the name of city or district of the location of the earthquake*. Therefore in case the coordinates point of an earthquake is in the sea, the script computes the district which is closer to the point. For that it computes the centroid of each polygon and select the id district which is the closest to that point.

## Application
- See a visualization in this [link](https://ccalobeto.github.io/earthquakes/).

