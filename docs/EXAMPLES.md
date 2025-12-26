# Examples

## Bar Chart

```ts
import { scaleBand, scaleLinear } from '@ochairo/scales';

const data = [
  { label: 'A', value: 30 },
  { label: 'B', value: 80 },
  { label: 'C', value: 45 },
  { label: 'D', value: 60 },
];

const xScale = scaleBand(
  data.map(d => d.label),
  [0, 400]
).padding(0.1);

const yScale = scaleLinear([0, 100], [300, 0]);

data.forEach(d => {
  const x = xScale(d.label);
  const y = yScale(d.value);
  const width = xScale.bandwidth();
  const height = 300 - y;

  console.log(`Bar ${d.label}: x=${x}, y=${y}, w=${width}, h=${height}`);
});
```

---

## Line Chart

```ts
import { scaleLinear } from '@ochairo/scales';

const data = [10, 25, 40, 35, 60, 45];

const xScale = scaleLinear([0, data.length - 1], [0, 400]);
const yScale = scaleLinear([0, 100], [300, 0]);

const points = data.map((value, i) => ({
  x: xScale(i),
  y: yScale(value)
}));

console.log('Line points:', points);
```

---

## Scatter Plot

```ts
import { scaleLinear } from '@ochairo/scales';

const data = [
  { x: 10, y: 20 },
  { x: 25, y: 45 },
  { x: 40, y: 30 },
];

const xScale = scaleLinear([0, 50], [0, 400]);
const yScale = scaleLinear([0, 50], [300, 0]);

const points = data.map(d => ({
  x: xScale(d.x),
  y: yScale(d.y)
}));

console.log('Scatter points:', points);
```

---

## Timeline

```ts
import { scaleTime } from '@ochairo/scales';

const events = [
  { date: new Date('2024-01-15'), label: 'Project Start' },
  { date: new Date('2024-03-20'), label: 'Milestone 1' },
  { date: new Date('2024-06-30'), label: 'Midpoint' },
  { date: new Date('2024-09-15'), label: 'Milestone 2' },
  { date: new Date('2024-12-15'), label: 'Project End' },
];

const scale = scaleTime(
  [new Date('2024-01-01'), new Date('2024-12-31')],
  [0, 800]
);

events.forEach(event => {
  const x = scale(event.date);
  console.log(`${event.label}: x=${x}`);
});
```

---

## Heatmap

```ts
import { scaleBand, scaleLinear } from '@ochairo/scales';

const data = [
  { row: 'A', col: '1', value: 10 },
  { row: 'A', col: '2', value: 30 },
  { row: 'B', col: '1', value: 50 },
  { row: 'B', col: '2', value: 80 },
];

const rows = ['A', 'B'];
const cols = ['1', '2'];

const xScale = scaleBand(cols, [0, 200]);
const yScale = scaleBand(rows, [0, 200]);
const colorScale = scaleLinear([0, 100], [0, 255]);

data.forEach(d => {
  const x = xScale(d.col);
  const y = yScale(d.row);
  const size = xScale.bandwidth();
  const color = colorScale(d.value);

  console.log(`Cell (${d.row},${d.col}): x=${x}, y=${y}, color=${color}`);
});
```

---

## Stacked Bar Chart

```ts
import { scaleBand, scaleLinear } from '@ochairo/scales';

const data = [
  { label: 'A', values: [30, 20, 10] },
  { label: 'B', values: [40, 25, 15] },
  { label: 'C', values: [35, 30, 5] },
];

const xScale = scaleBand(
  data.map(d => d.label),
  [0, 400]
).padding(0.1);

const maxTotal = Math.max(...data.map(d =>
  d.values.reduce((sum, v) => sum + v, 0)
));

const yScale = scaleLinear([0, maxTotal], [300, 0]);

data.forEach(d => {
  let y = 300;
  d.values.forEach(value => {
    const height = 300 - yScale(value);
    y -= height;
    console.log(`Stack ${d.label}: y=${y}, height=${height}`);
  });
});
```

---

## Gantt Chart

```ts
import { scaleTime, scaleBand } from '@ochairo/scales';

const tasks = [
  {
    name: 'Design',
    start: new Date('2024-01-01'),
    end: new Date('2024-02-15')
  },
  {
    name: 'Development',
    start: new Date('2024-02-01'),
    end: new Date('2024-05-01')
  },
  {
    name: 'Testing',
    start: new Date('2024-04-15'),
    end: new Date('2024-06-01')
  },
];

const timeScale = scaleTime(
  [new Date('2024-01-01'), new Date('2024-06-30')],
  [0, 800]
);

const taskScale = scaleBand(
  tasks.map(t => t.name),
  [0, 150]
).padding(0.2);

tasks.forEach(task => {
  const x = timeScale(task.start);
  const width = timeScale(task.end) - x;
  const y = taskScale(task.name);
  const height = taskScale.bandwidth();

  console.log(`Task ${task.name}: x=${x}, y=${y}, w=${width}, h=${height}`);
});
```
