# Execution Lock

> Machine-readable execution contract. Executor MUST `read_file` this before every SVG page.

## canvas
- viewBox: 0 0 1280 720
- format: PPT 16:9

## colors
- bg: #FFFFFF
- secondary_bg: #F8FAFC
- primary: #2563EB
- accent: #3B82F6
- secondary_accent: #DBEAFE
- text: #1F2937
- text_secondary: #6B7280
- text_tertiary: #9CA3AF
- border: #E5E7EB

## typography
- font_family: "Microsoft YaHei", Arial, sans-serif
- title_family: "Microsoft YaHei", Arial, sans-serif
- body_family: "Microsoft YaHei", Arial, sans-serif
- code_family: Consolas, "Courier New", monospace
- body: 22
- title: 40
- cover_title: 66
- subtitle: 28
- annotation: 16
- page_number: 12

## icons
- library: tabler-outline
- inventory: file-text, settings, arrow-right, layout, check, download

## page_rhythm
- P01: anchor
- P02: dense
- P03: dense
- P04: breathing

## page_layouts

## page_charts

## forbidden
- Mixing icon libraries
- rgba()
- `<style>`, `class`, `<foreignObject>`, `textPath`, `@font-face`, `<animate*>`, `<script>`, `<iframe>`, `<symbol>`+`<use>`
- `<g opacity>` (set opacity on each child element individually)
- HTML named entities in text
