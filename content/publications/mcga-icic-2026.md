---
id: mcga-icic-2026
title: "MCGA: Mixture of Codebooks Hyperspectral Reconstruction via Grayscale-Aware Attention"
authors: [Zhanjiang Yang, Lijun Sun, Jiawei Dong, Xiaoxin An, Yang Liu, Yu Lu, Meng Li]
venue: ICIC
venueType: conference
year: 2026
month: July
status: published
isFirstAuthor: true
keywords: [Hyperspectral Reconstruction, Mixture of Codebooks, Grayscale-Aware Attention]
isCoFirst: true
coFirstAuthors: ["Zhanjiang Yang","Lijun Sun"]
summary: "Reconstructing hyperspectral images from RGB inputs by combining learned spectral codebooks with grayscale-aware alignment and adaptation to changing illumination."
featuredImage: /media/publications/mcga.webp
featuredImageFull: /media/publications/mcga.png
featuredImageAlt: "MCGA overview showing spectral codebook learning, RGB feature alignment, and test-time adaptation."
featuredImageCaption: "Learn spectral priors first, then align them with RGB observations."
links:
  paper: https://doi.org/10.1007/978-981-92-3513-1_23
  arxiv: https://arxiv.org/abs/2507.09885
  projectPage: https://github.com/Fibonaccirabbit/MCGA
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:zYLM7Y9cAGgC
---

An RGB image contains far fewer spectral measurements than a hyperspectral image, making reconstruction an underdetermined problem. MCGA uses learned spectral priors rather than relying only on a direct RGB-to-spectrum mapping. A mixture of codebooks represents those priors, while grayscale-aware attention aligns them with RGB features. The framework also includes an adaptation step for distribution changes at inference time. The paper compares reconstructed spectral bands on two datasets, examines computational efficiency, and tests how the method behaves under changes in illumination.
