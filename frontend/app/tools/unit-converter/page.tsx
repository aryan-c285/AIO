"use client";

import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Conversion definitions
// ---------------------------------------------------------------------------
type ConversionCategory = {
  name: string;
  units: { label: string; value: string }[];
  /** Convert from `fromUnit` to `toUnit`. Both keys are the `value` strings. */
  convert: (value: number, from: string, to: string) => number;
};

const CATEGORIES: ConversionCategory[] = [
  {
    name: "Length",
    units: [
      { label: "Meters", value: "m" },
      { label: "Kilometers", value: "km" },
      { label: "Centimeters", value: "cm" },
      { label: "Millimeters", value: "mm" },
      { label: "Miles", value: "mi" },
      { label: "Yards", value: "yd" },
      { label: "Feet", value: "ft" },
      { label: "Inches", value: "in" },
    ],
    convert: (v, from, to) => {
      const toMeters: Record<string, number> = {
        m: 1, km: 1000, cm: 0.01, mm: 0.001,
        mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254,
      };
      return (v * toMeters[from]) / toMeters[to];
    },
  },
  {
    name: "Weight",
    units: [
      { label: "Kilograms", value: "kg" },
      { label: "Grams", value: "g" },
      { label: "Milligrams", value: "mg" },
      { label: "Pounds", value: "lb" },
      { label: "Ounces", value: "oz" },
      { label: "Tonnes", value: "t" },
    ],
    convert: (v, from, to) => {
      const toKg: Record<string, number> = {
        kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, t: 1000,
      };
      return (v * toKg[from]) / toKg[to];
    },
  },
  {
    name: "Temperature",
    units: [
      { label: "Celsius", value: "C" },
      { label: "Fahrenheit", value: "F" },
      { label: "Kelvin", value: "K" },
    ],
    convert: (v, from, to) => {
      // Convert to Celsius first
      let c = v;
      if (from === "F") c = (v - 32) * (5 / 9);
      else if (from === "K") c = v - 273.15;
      // Convert from Celsius to target
      if (to === "C") return c;
      if (to === "F") return c * (9 / 5) + 32;
      return c + 273.15; // K
    },
  },
  {
    name: "Speed",
    units: [
      { label: "m/s", value: "ms" },
      { label: "km/h", value: "kmh" },
      { label: "mph", value: "mph" },
      { label: "Knots", value: "kn" },
    ],
    convert: (v, from, to) => {
      const toMs: Record<string, number> = {
        ms: 1, kmh: 1 / 3.6, mph: 0.44704, kn: 0.514444,
      };
      return (v * toMs[from]) / toMs[to];
    },
  },
  {
    name: "Data",
    units: [
      { label: "Bytes", value: "B" },
      { label: "Kilobytes", value: "KB" },
      { label: "Megabytes", value: "MB" },
      { label: "Gigabytes", value: "GB" },
      { label: "Terabytes", value: "TB" },
    ],
    convert: (v, from, to) => {
      const toBytes: Record<string, number> = {
        B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4,
      };
      return (v * toBytes[from]) / toBytes[to];
    },
  },
];

export default function UnitConverterPage() {
  const [catIdx, setCatIdx] = useState(0);
  const [inputValue, setInputValue] = useState("1");
  const [fromUnit, setFromUnit] = useState(CATEGORIES[0].units[0].value);
  const [toUnit, setToUnit] = useState(CATEGORIES[0].units[1].value);

  const category = CATEGORIES[catIdx];

  const result = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return "";
    return category.convert(num, fromUnit, toUnit).toLocaleString(undefined, {
      maximumFractionDigits: 8,
    });
  }, [inputValue, fromUnit, toUnit, category]);

  const handleCategoryChange = (idx: number) => {
    setCatIdx(idx);
    setFromUnit(CATEGORIES[idx].units[0].value);
    setToUnit(CATEGORIES[idx].units[1].value);
    setInputValue("1");
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white">⚡ Unit Converter</h1>
        <p className="mt-2 text-neutral-400">
          Instantly convert between length, weight, temperature, speed, and data
          units.
        </p>
      </div>

      <div className="mt-8 space-y-6 animate-fade-in">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategoryChange(idx)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                ${
                  catIdx === idx
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Conversion UI */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          {/* From */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-neutral-500">
              From
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5
                           text-sm text-white outline-none transition-colors
                           focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5
                           text-sm text-white outline-none transition-colors
                           focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {category.units.map((u) => (
                  <option key={u.value} value={u.value} className="bg-neutral-900">
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-400
                         transition-all hover:bg-white/10 hover:text-white active:scale-90"
              aria-label="Swap units"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-neutral-500">
              To
            </label>
            <div className="flex gap-3">
              <div
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5
                            text-sm text-emerald-400 font-mono min-h-[42px] flex items-center"
              >
                {result || "—"}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5
                           text-sm text-white outline-none transition-colors
                           focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {category.units.map((u) => (
                  <option key={u.value} value={u.value} className="bg-neutral-900">
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
