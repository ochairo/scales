<!-- markdownlint-disable MD033 MD041 -->

<div align="center">

# scales

Scale functions for data visualization.<br>
_Map data to pixels with zero dependencies._

[![npm version](https://img.shields.io/npm/v/@ochairo/scales)](https://www.npmjs.com/package/@ochairo/scales)
[![npm downloads](https://img.shields.io/npm/dm/@ochairo/scales)](https://www.npmjs.com/package/@ochairo/scales)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@ochairo/scales)](https://bundlephobia.com/package/@ochairo/scales)
![CI](https://github.com/ochairo/scales/workflows/CI/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

## Features

- 📦 **Tiny**: ~1.7KB minified
- ⚡ **Fast**: Direct computation, zero overhead
- 🌲 **Tree-shakeable**: Use only what you need
- 🔧 **Universal**: Works with any framework

## Install

```bash
pnpm add @ochairo/scales
```

## Upgrading to 2.0.0

Node.js consumers now require Node 24.22.1 or later within the 24.x line, or
Node 26.12.1 or later. Tick generation validates current domains, logarithm bases,
and counts, and throws `RangeError` for invalid inputs or excessive candidate
work. Handle that error or narrow the domain; see the limits below. Extreme
domains no longer produce infinite or duplicate logarithmic ticks.

## Quick Start

```ts
import { scaleLinear, scaleBand, scaleTime } from '@ochairo/scales';

// Linear: continuous → continuous
scaleLinear([0, 100], [0, 500])(50);  // 250

// Band: discrete → continuous
scaleBand(['A', 'B', 'C'], [0, 300])('B');  // 100

// Time: dates → continuous
scaleTime([new Date('2024-01-01'), new Date('2024-12-31')], [0, 500]);
```

## Documentation

Linear, logarithmic, and time ticks require finite domain endpoints and a finite
positive count of at most 10,000. Logarithmic domains must stay on one side of
zero; the base must be finite, positive, and different from one. These conditions
are checked when generating ticks, including after changing a domain.

Tick generation examines at most 10,000 candidates per call and throws
`RangeError` if that budget is exceeded. The count is a target, not a guarantee:
large calendar ranges can exceed the budget even with a small requested count.
No partial result is returned on budget exhaustion. Narrow the domain or handle
the error. Invalid dates and non-finite numeric endpoints also throw `RangeError`.

- [API Reference](./docs/API.md)
