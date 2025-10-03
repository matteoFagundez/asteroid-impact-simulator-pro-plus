// src/components/DataVisualizer.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function DataVisualizer({ series = [] }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    const w = 340, h = 180, m = 30;
    const svg = d3.select(el)
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    const x = d3.scaleLinear()
      .domain(d3.extent(series, d => d.t))
      .range([m, w - m]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(series, d => d.v) || 1])
      .nice()
      .range([h - m, m]);

    const line = d3.line()
      .x(d => x(d.t))
      .y(d => y(d.v));

    svg.append("path")
      .datum(series)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#00f7ff")
      .attr("stroke-width", 2);

    svg.append("g")
      .attr("transform", `translate(0,${h - m})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr("color", "#94a3b8");

    svg.append("g")
      .attr("transform", `translate(${m},0)`)
      .call(d3.axisLeft(y).ticks(4))
      .attr("color", "#94a3b8");
  }, [series]);

  return (
    <div
      ref={ref}
      className="p-3 rounded shadow"
      style={{ backgroundColor: "#11151b", color: "#00f7ff", border: "1px solid #1e293b" }}
    />
  );
}
