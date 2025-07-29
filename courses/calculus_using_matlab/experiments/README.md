# Modular Experiment System

This system allows you to create new experiments by only changing the data, while keeping all functionality the same.

## How It Works

1. **Template Structure**: All experiments use the same HTML template (`experiment_viewer.html`)
2. **Data-Driven**: Each experiment is defined by a JSON file in the `data/` directory
3. **Reusable Code**: All functionality (slides, drawing, navigation) is in `common.js` and `common.css`

## Creating a New Experiment

### Manual Creation (Recommended)

1. Create a new JSON file in `data/` directory (e.g., `data/exp2.json`)
2. Use this template:

```json
{
  "title": "Your Experiment Title",
  "slides": [
    {
      "topic": "[1/X]:Step Title",
      "code": "% MATLAB code here",
      "output": "Expected output here",
      "explanation": [
        "Explanation point 1",
        "Explanation point 2"
      ]
    }
  ]
}
```

## Accessing Experiments

- **Experiment 1**: `experiment_viewer.html?exp=exp1`
- **Experiment 2**: `experiment_viewer.html?exp=exp2`
- **Experiment 3**: `experiment_viewer.html?exp=exp3`

## File Structure

```
experiments/
├── experiment_viewer.html    # Main viewer (template)
├── common.js                # Shared functionality
├── common.css               # Shared styles
├── data/                    # Experiment data files
│   ├── exp1.json
│   ├── exp2.json
│   └── exp3.json
└── README.md               # This file
```

## What You Only Need to Change

For each new experiment, you only need to:

1. **Create a JSON file** with your experiment data
2. **Update the title** in the JSON
3. **Add your slides** with code, output, and explanations

Everything else (navigation, drawing, styling, keyboard controls) stays the same!

## Example: Creating Experiment 2

1. Create `data/exp2.json` with your content
2. Access at: `experiment_viewer.html?exp=exp2`

## Benefits

- ✅ **Consistent UI**: All experiments look and behave the same
- ✅ **Easy Maintenance**: Update one file to fix all experiments
- ✅ **Quick Creation**: Only need to write the experiment data
- ✅ **Reusable**: All functionality works for any experiment
- ✅ **Scalable**: Add unlimited experiments easily 