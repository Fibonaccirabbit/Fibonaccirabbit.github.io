---
id: slaw-nav-icann-2026
title: "Sparse Latent Action World Model for Vision-Language Navigation"
authors: [Zhanjiang Yang, Yueming Li, Meng Li, Lijun Sun]
venue: ICANN
venueType: conference
year: 2026
month: September
status: published
isFirstAuthor: true
keywords: [World Models, Vision-Language Navigation, Embodied AI]
summary: "A navigation agent that compares predicted outcomes of candidate moves before acting, using sparse future-state prediction rather than long step-by-step rollouts."
featuredImage: /media/publications/slaw-nav.webp
featuredImageFull: /media/publications/slaw-nav.png
featuredImageAlt: "SLAW navigation pipeline linking RGB observations, candidate-action future predictions, and a language-conditioned navigation policy."
featuredImageCaption: "Candidate moves are compared through predicted future states before execution."
links:
  paper: https://doi.org/10.1007/978-3-032-38404-1_13
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:eQOLeE2rZwMC
---

Vision-language navigation requires an agent to follow an instruction through an unfamiliar environment. SLAW adds foresight to this process: an action-conditioned world model predicts the future states associated with candidate moves, and a multimodal language-model policy uses those predictions to choose an action. Instead of repeatedly predicting every intermediate step, the world model jumps several steps ahead in latent space. This reduces redundant computation and accumulated prediction errors. The paper evaluates RGB-based instruction following on navigation benchmarks and studies how sparse prediction and counterfactual comparisons affect the resulting behavior.
