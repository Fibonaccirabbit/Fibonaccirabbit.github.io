---
id: envpilot-tosem-2026
title: "EnvPilot: Systematic Design and Evaluation of an Experience-Augmented Agent for Software Environment Setup"
authors: [Hanwu Chen, Hanyu Lin, Zhanjiang Yang, Linhao Zhang, Aoyan Li, Jinxi Li, Meng Li, Yin Chen, Daoguang Zan]
venue: ACM TOSEM
venueType: journal
year: 2026
month: September
status: accepted
keywords: [Agents, Software Environment Setup, Experience Reuse]
summary: "An environment-setup agent that retrieves reusable experience from earlier attempts, then installs dependencies and checks the project in a container."
featuredImage: /media/publications/envpilot.webp
featuredImageFull: /media/publications/envpilot.png
featuredImageAlt: "EnvPilot workflow connecting a codebase, trajectory-derived memory, context-aware retrieval, a container environment, and automatic evaluation."
featuredImageCaption: "Retrieve past setup experience, execute commands, and verify the environment."
links:
  arxiv: https://arxiv.org/abs/2609.07357
  scholar: https://scholar.google.com/citations?view_op=view_citation&hl=en&user=4PaJ4SkAAAAJ&citation_for_view=4PaJ4SkAAAAJ:Y0pCki6q_DkC
---

Preparing a software environment often requires more than installing a fixed list of dependencies. EnvPilot gives an agent reusable experience from earlier setup attempts, organized as trajectory-derived memory. The agent retrieves relevant records for the current repository, executes setup commands in a container, and checks whether the project builds and its tests run. This creates a loop of acting, inspecting feedback, and reusing validated strategies. The paper evaluates the system on AES-Bench across multiple programming languages and analyzes the contributions of structured memory, retrieval, and failure handling.
