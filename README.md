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

- [API Reference](./docs/API.md)
