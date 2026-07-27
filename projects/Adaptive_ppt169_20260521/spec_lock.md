# Adaptive Multimode Process Monitoring - Execution Lock

> Machine-readable execution contract. Executor MUST re-read before every page.

## project
name: "Adaptive Multimode Process Monitoring (JMSDL)"
canvas: "PPT 16:9"
viewBox: "0 0 1280 720"
page_count: 15

## colors
primary: "#1565C0"
secondary: "#455A64"
accent: "#FF6F00"
background: "#FFFFFF"
secondary_bg: "#F5F7FA"
body_text: "#333333"
secondary_text: "#666666"
tertiary_text: "#999999"
border: "#E0E0E0"
success: "#2E7D32"
warning: "#C62828"

## typography
title_family: "Arial, \"Microsoft YaHei\", \"PingFang SC\", sans-serif"
body_family: "Arial, \"Microsoft YaHei\", \"PingFang SC\", sans-serif"
code_family: "Consolas, \"Courier New\", monospace"
body: 18
title: 32
subtitle: 23
annotation: 14
footnote: 11

## icons
library: "tabler-filled"
stroke_width: 2
inventory:
  - "tabler-filled/building-factory"
  - "tabler-filled/database"
  - "tabler-filled/brain"
  - "tabler-filled/settings"
  - "tabler-filled/chart-bar"
  - "tabler-filled/circle-check"
  - "tabler-filled/alert-triangle"
  - "tabler-filled/lightbulb"
  - "tabler-filled/users"
  - "tabler-filled/home"
  - "tabler-filled/list"

## images
- file: "cover_bg.png"
  acquire: "ai"
  status: "Pending"
  reference: "Abstract blue circuit-board pattern with data flow lines, deep navy (#0D47A1) to tech blue (#1565C0) gradient, clean center area for title overlay"
- file: "catastrophic_forgetting.png"
  acquire: "ai"
  status: "Pending"
  reference: "A split-screen diagram: Left side shows a model 'brain' happily representing Mode 1 data; right side shows the same brain with data from Mode 1, 2, 3 falling out of its head (forgetting), with a red 'X' and a memory graph showing a sharp drop. Style: clean flat vector, blue/orange color scheme."
- file: "jmsdl_framework.png"
  acquire: "ai"
  status: "Pending"
  reference: "A flowchart showing: 'Old Dictionary Do' + 'New Mode Data Xn' → 'JMSDL Optimization' → 'New Dictionary Dn'. Two branches from Dn: 'Mode Matching (low reconstruction error)' and 'Similarity Preserving (high ds)'. Style: flat diagram, blue (#1565C0) and grey (#455A64) nodes, orange (#FF6F00) highlights."
- file: "roasting_plant.jpg"
  acquire: "web"
  status: "Pending"
  reference: "A professional editorial photograph of a zinc smelting plant's roasting furnace area, showing large industrial equipment, pipes, and control panels, clean composition, natural industrial lighting."

## page_rhythm
P01: anchor
P02: dense
P03: dense
P04: dense
P05: breathing
P06: dense
P07: dense
P08: dense
P09: dense
P10: breathing
P11: dense
P12: dense
P13: dense
P14: anchor

## page_layouts
(No template SVGs used; all pages are free design.)

## page_charts
P08: grouped_bar_chart
P09: grouped_bar_chart
P10: grouped_bar_chart
P11: comparison_table