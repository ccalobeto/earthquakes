# Refactored Project Structure

```
earthquake-visualization/
├── .gitignore
├── README.md
├── package.json
├── index.html
├── vite.config.js
├── src/
│   ├── index.js                      # Main entry point
│   ├── config.js                     # Configuration settings
│   ├── components/
│   │   ├── MapVisualization.js       # Map visualization component
│   │   ├── TimelineChart.js          # Timeline chart component
│   │   ├── CircleLegend.js           # Circle legend component
│   │   ├── BarLegend.js              # Bar legend component
│   │   └── Annotations.js            # Annotations helper
│   ├── utils/
│   │   ├── formatters.js             # Date and number formatting utilities
│   │   ├── scales.js                 # Scale creation and management
│   │   ├── responsive.js             # Responsive visualization helpers
│   │   └── dataUtils.js              # Data processing utilities
│   ├── data/
│   │   ├── dataLoader.js             # Data loading functions
│   │   └── dataTransformers.js       # Data transformation functions
│   └── styles/
│       ├── base.css                  # Base stylesheet
│       └── visualization.css         # Visualization-specific styles
└── data/
    ├── input/
    │   └── peru-100k.json            # Geographic data
    └── output/
        └── output.csv                # Earthquake data
```

This structure reorganizes the project for better maintainability while preserving the core functionality. The separation into components, utilities, and data processing modules improves code organization and makes the codebase more modular.
