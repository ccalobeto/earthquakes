This script prepares the dataset to be used for showing the earthquakes in Perú.

What it does?
- Format the dataset to be used with geo libraries like d3.geo and turf.
- The dataset delivered by IGP *doesn't have references like the name of city or district of the location of the earthquake*. Therefore in case the coordinates point of an earthquake is in the sea, the script computes the district which is closer to the point. For that it computes the centroid of each polygon and select the id district which is the closest to that point.

How to update the dataset?
- Clone the repo.
- Download the data from [IGP](https://ultimosismo.igp.gob.pe/descargar-datos-sismicos)
and move your new files to ./data/*.csv. Keep the names of the files.
- Up your local server.
- Wait a few seconds until the page shows **Click to Download** (it processes more than +24k rows) and then download the file.
- Use this dataset to your own analysis and visualizations.

Application
- To see a visualization using this dataset go to [Terremotos en el Perú.](https://ccalobeto.github.io/earthquakes/)

