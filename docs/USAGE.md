# Usage Guide

## Linear Scales

Map continuous numeric domain to continuous range.

### Basic Usage

```ts
import { scaleLinear } from '@ochairo/scales';

const scale = scaleLinear([0, 100], [0, 500]);

scale(0);    // 0
scale(50);   // 250
scale(100);  // 500
```

### Clamping

Prevent output outside range:

```ts
const scale = scaleLinear([0, 100], [0, 500]).clamp(true);

scale(150);  // 500 (clamped)
scale(-50);  // 0 (clamped)
```

### Inverting

Map back from range to domain:

```ts
const scale = scaleLinear([0, 100], [0, 500]);

scale.invert(250);  // 50
scale.invert(500);  // 100
```

**Use cases:**

- Line charts
- Scatter plots
- Axes
- Heatmaps

---

## Band Scales

Map discrete values to continuous range bands.

### Basic Usage

```ts
import { scaleBand } from '@ochairo/scales';

const scale = scaleBand(['A', 'B', 'C'], [0, 300]);

scale('A');  // 0
scale('B');  // 100
scale('C');  // 200

scale.bandwidth();  // 100
```

### Padding

Add spacing between bands:

```ts
const scale = scaleBand(['A', 'B', 'C'], [0, 300])
  .padding(0.1);

scale.bandwidth();  // ~90 (less than 100 due to padding)
scale.step();       // 100 (includes padding)
```

**Use cases:**

- Bar charts
- Categorical axes
- Group layouts

---

## Time Scales

Map dates to continuous range.

### Basic Usage

```ts
import { scaleTime } from '@ochairo/scales';

const scale = scaleTime(
  [new Date('2024-01-01'), new Date('2024-12-31')],
  [0, 500]
);

scale(new Date('2024-06-30'));  // ~250
```

### Inverting

```ts
const scale = scaleTime(
  [new Date('2024-01-01'), new Date('2024-12-31')],
  [0, 500]
);

scale.invert(250);  // Date ~ 2024-07-01
```

**Use cases:**

- Timelines
- Time-series charts
- Gantt charts

---

## Best Practices

### ✅ Do

- Use linear for continuous numeric data
- Use band for categorical/discrete data
- Use time for dates and temporal data
- Enable clamping when needed
- Reuse scales across related visualizations

### ❌ Don't

- Mix scale types inappropriately
- Forget to handle edge cases
- Create new scales on every render
- Use band scales for continuous data
