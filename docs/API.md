# API Reference

## scaleLinear

### Constructor

```ts
scaleLinear(domain: [number, number], range: [number, number]): ScaleFunction
```

Create linear scale mapping continuous domain to continuous range.

---

### Methods

#### Scale Function

```ts
(value: number): number
```

Map domain value to range value.

#### `.invert(value)`

```ts
invert(value: number): number
```

Map range value back to domain value.

#### `.clamp(enable)`

```ts
clamp(enable: boolean): ScaleFunction
```

Enable/disable clamping to range bounds.

#### `.domain()` / `.range()`

```ts
domain(): [number, number]
range(): [number, number]
```

Get current domain/range.

---

## scaleBand

### Constructor

```ts
scaleBand(domain: string[], range: [number, number]): BandScaleFunction
```

Create band scale for discrete domain values.

---

### Methods

#### Scale Function

```ts
(value: string): number
```

Get band start position.

#### `.bandwidth()`

```ts
bandwidth(): number
```

Get width of each band.

#### `.step()`

```ts
step(): number
```

Get step size (bandwidth + padding).

#### `.padding(value)`

```ts
padding(value: number): BandScaleFunction
```

Set padding between bands (0-1).

#### `.domain()` / `.range()`

```ts
domain(): string[]
range(): [number, number]
```

---

## scaleTime

### Constructor

```ts
scaleTime(domain: [Date, Date], range: [number, number]): ScaleFunction
```

Create time scale mapping dates to continuous range.

---

### Methods

#### Scale Function

```ts
(value: Date): number
```

Map date to range value.

#### `.invert(value)`

```ts
invert(value: number): Date
```

Map range value back to date.

#### `.clamp(enable)`

```ts
clamp(enable: boolean): ScaleFunction
```

#### `.domain()` / `.range()`

```ts
domain(): [Date, Date]
range(): [number, number]
```
