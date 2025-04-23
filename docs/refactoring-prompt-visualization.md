# Custom Instructions for Earthquake Visualization Refactoring

## Project Context
You're helping me refactor a visualization project for earthquake data in Peru. The project uses D3.js for data visualization, displays historical and instrumental earthquake data on maps and timelines, and needs modernization while maintaining core functionality.

## Refactoring Goals
1. **Partial Refactory** - The refactor is partially done. Complete the scripts if neccesary. 
2. **Modernize the codebase** - Update to latest D3.js practices and modern JavaScript patterns.
3. **Improve code organization** - Better structure, component separation, and module system
4. **Enhance performance** - Optimize rendering and data processing
5. **Improve maintainability** - Better documentation, consistent style, and reduced redundancy
6. **Ensure accessibility** - Make visualizations more accessible following WCAG guidelines

## Specific Instructions

### Code Structure
- Convert to ES modules consistently throughout the codebase
- Organize code into logical directories:
  * `src/components/` - Reusable visualization components
  * `src/utils/` - Helper functions and utilities
  * `src/data/` - Data processing and transformation
  * `src/styles/` - CSS and styling
- Implement proper import patterns

### D3.js Best Practices
- Use the latest D3.js patterns, particularly for data binding and transitions
- Implement proper enter, update and exit pattern for data visualization
- Use D3's built-in scales and axes consistently
- Follow D3 module imports rather than importing the entire library

### Data Processing
- Improve data loading and processing pipelines
- Implement better error handling for data loading
- Create reusable data transformation functions
- Don't update code in src/js folder

### Visualization Enhancements
- Ensure responsive design works consistently across devices
- Enhance map and timeline visualizations with smoother interactions
- Improve accessibility features (ARIA attributes, keyboard navigation)
- Standardize color schemes and make them accessible
- Avoid tooltip functions

### JavaScript Modernization
- Use modern JavaScript features (async/await, destructuring, template literals)
- Apply consistent error handling patterns
- Use proper event handling and cleanup
- Implement performance optimizations

### Documentation Requirements
- Add JSDoc comments for all functions and components
- Include comments for complex visualization logic
- Document data requirements and formats

## Implementation Notes
- Please provide complete code for all files when implementing changes
- Maintain the core visualization features while improving them
- When refactoring, consider backward compatibility with existing data formats
- Test all visualizations with various screen sizes and data sets

## Example Outputs Needed
1. Complete project structure with all required files
2. Updated package.json with modern dependencies
3. Fully refactored visualization components
4. Improved data processing utilities
5. Enhanced documentation

When providing code, please include the entire file contents to ensure I can directly implement your suggestions. For complex files, add detailed comments explaining your refactoring decisions.
