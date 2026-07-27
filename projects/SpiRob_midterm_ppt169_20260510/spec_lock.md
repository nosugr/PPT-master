# Execution Lock

> Machine-readable execution contract. Executor MUST `read_file` this before every SVG page.

## canvas
- viewBox: 0 0 1280 720
- format: PPT 16:9

## colors
- bg: #FFFFFF
- primary: #324274
- accent: #6096E6
- highlight: #F4C542
- text: #0D0D0D
- text_secondary: #404040
- text_tertiary: #6C7785
- border: #D8DEE8
- light_bg: #EAF1F8

## typography
- font_family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif
- body: 20
- title: 32
- subtitle: 26
- annotation: 14
- cover_title: 52
- chapter_title: 40

## icons
- library: tabler-outline
- stroke_width: 2
- inventory: robot, circuit-motor, cpu, target, eye, microphone, settings, layers, cube, bolt, tools, chart-bar, circle-check, flag, rocket, bulb, clipboard-list, users, arrow-right, plug

## images
- slide_05_image_05.jpg: images/slide_05_image_05.jpg
- slide_06_image_16.jpg: images/slide_06_image_16.jpg
- slide_06_image_17.jpg: images/slide_06_image_17.jpg
- slide_07_image_18.png: images/slide_07_image_18.png
- slide_12_image_28.png: images/slide_12_image_28.png
- slide_12_image_29.png: images/slide_12_image_29.png
- slide_12_image_30.jpg: images/slide_12_image_30.jpg
- slide_13_image_33.png: images/slide_13_image_33.png
- slide_17_image_41.jpg: images/slide_17_image_41.jpg
- slide_19_image_42.jpg: images/slide_19_image_42.jpg
- slide_19_image_43.jpg: images/slide_19_image_43.jpg
- slide_19_image_44.jpg: images/slide_19_image_44.jpg
- slide_20_image_45.jpg: images/slide_20_image_45.jpg
- slide_20_image_46.jpg: images/slide_20_image_46.jpg
- slide_20_image_47.jpg: images/slide_20_image_47.jpg
- slide_20_image_48.jpg: images/slide_20_image_48.jpg

## page_rhythm
- P01: anchor
- P02: anchor
- P03: anchor
- P04: dense
- P05: dense
- P06: breathing
- P07: dense
- P08: dense
- P09: anchor
- P10: dense
- P11: dense
- P12: dense
- P13: dense
- P14: anchor
- P15: dense
- P16: dense
- P17: dense
- P18: anchor
- P19: dense
- P20: dense
- P21: dense
- P22: anchor

## page_layouts
- P01: 001_cover
- P02: 002_toc
- P03: 003_chapter
- P09: 003_chapter
- P14: 003_chapter
- P18: 003_chapter
- P22: 019_ending

## page_charts
- P10: layered_architecture
- P11: consulting_table
- P21: timeline

## forbidden
- Mixing icon libraries
- rgba()
- `<style>`, `class`, `<foreignObject>`, `textPath`, `@font-face`, `<animate*>`, `<script>`, `<iframe>`, `<symbol>`+`<use>`
- `<g opacity>` (set opacity on each child element individually)
- HTML named entities in text
