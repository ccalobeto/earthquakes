# 🌋 Earthquakes in Peru Visualization Project

Hey there! Welcome to my earthquake visualization project for Perú. This interactive tool helps you explore seismic activity throughout Perú using the power of d3.js, CSS, and HTML.

>[!WARNING]
> We edited dates of last 5 rows in `IGP_datos_sismicos-historical.csv` to fix formatting issues.

## 🚀 Quick Start

Want to clone and run this project? Just follow these simple steps:

```sh
# Clone the repo
git clone [repository-url]
cd earthquakes

# Install dependencies
npm install

# Start the visualization
npm run dev
```

## 🔍 Stages of the Project

### Stage 1: Data Preparation

Getting fresh earthquake data? No problem!

1. Download the latest data from [IGP (Instituto Geofísico del Perú)](https://ultimosismo.igp.gob.pe/descargar-datos-sismicos)
2. Move the CSV files to the `./data/` directory (keep the original filenames)
3. Run our data processing script:
   ```sh
   npm run prepare-data
   ```

### Stage 2: Data Transformation 

Behind the scenes, our code is doing some cool stuff:

- Converting geographical coordinates into formats compatible with d3.geo and turf
- Finding the nearest district for earthquakes located in the sea (since the IGP data doesn't include city/district names)
- Calculating distances between earthquake locations and district centroids
- Merging historical and recent earthquake data for a complete timeline

### Stage 3: Visualization Components

Our visualization features:

- Interactive map of Peru showing earthquake locations
- Timeline visualization of seismic activity
- Filtering options by magnitude and time periods
- Color-coded representation of earthquake intensity

To view the visualization:
- Or check out the live version at [our GitHub Pages site](https://ccalobeto.github.io/earthquakes/)

## 🔢 Understanding Earthquake Magnitude

Curious about those numbers? Here's what they mean:

- **Magnitude**: Measured on the Richter scale, it tells us the energy released by an earthquake
- **< 4.0**: Minor shaking, rarely causes damage
- **4.0-5.9**: Can cause moderate damage to vulnerable structures
- **6.0-6.9**: Can be destructive in populated areas
- **7.0+**: Major earthquake causing serious damage across large areas
- **8.0+**: Great earthquake that can totally destroy communities near the epicenter

Our visualization uses color coding to help you quickly identify the severity of each earthquake event.

---

Made with ❤️ by earthquake data enthusiasts. Feel free to contribute!

