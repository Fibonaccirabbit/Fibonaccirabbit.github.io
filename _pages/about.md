---
permalink: /
author_profile: true
stylesheets:
  - /assets/css/home.css
redirect_from:
  - /about/
  - /about.html
---
<h1 class="main-heading">Hi there <img src="images/Hi.gif" width="40px"> Welcome to my Homepage!</h1>

I am a M.S. student at [Shenzhen University](https://www.szu.edu.cn/), focusing on **Embodied AI**, **World Models**, **VLA/VLN**, and **Multimodal Decision-Making**. I have research experience in action world models, reinforcement learning, and large model training & fine-tuning.

Feel free to reach out if you are interested in collaboration or potential opportunities.

News
---------------
<div class="news-box">
  <ul class="news-list">

<li><span class="news-date"><em>2025.09</em></span> 🚀🚀 Started working on SLAW-Nav: world model-based counterfactual reasoning for VLN.</li>

<li><span class="news-date"><em>2025.07</em></span> 🎉🎉 Started my research internship at Huawei on World Models for Embodied AI.</li>

<!-- <li><span class="news-date"><em>2025.06</em></span> 🚀🚀 Started working on Foundation Pareto Flow Policy (FP2) for multi-objective RL.</li> -->

<li><span class="news-date"><em>2025.03</em></span> 🚀🚀 Started working on MAPF-World: Action World Model for Multi-Agent Path Finding.</li>

<li><span class="news-date"><em>2024.07</em></span> 🎉🎉 Started my M.S. studies at Shenzhen University.</li>

  </ul>
</div>

Experience
--------------

<div class="experience-container">

  <div class="experience-card">
      <img src="images/huawei.png" alt="Huawei logo" class="experience-logo">
      <div class="experience-info">
          <strong>Huawei Technologies Co., Ltd.</strong><br>
          <em>2025.07 - 2025.10</em><br>
          World Model Research Intern · Shenzhen, China<br>
          <span style="color:#888;">Research on predictive decision-making mechanisms of world models for embodied AI and VLA scenarios.</span>
      </div>
  </div>

  <div class="experience-card">
      <img src="images/szu.png" alt="SZU logo" class="experience-logo">
      <div class="experience-info">
          <strong>Shenzhen University</strong><br>
          <em>2024.07 - Present</em><br>
          M.S. in Computer Science · GPA: 3.5/4<br>
          <span style="color:#888;">Research interests: Embodied AI, World Models, VLA/VLN, Multimodal Decision-Making.</span>
      </div>
  </div>

  <div class="experience-card">
      <img src="images/sztu.png" alt="SZTU logo" class="experience-logo">
      <div class="experience-info">
          <strong>Shenzhen Technology University</strong><br>
          <em>2019.09 - 2023.06</em><br>
          B.E. · GPA: 4.0/4.5<br>
      </div>
  </div>
</div>


Publications
--------------
<button class="pub-button active" onclick="filterPublications(event, 'all')">Core Publications</button>
<button class="pub-button" onclick="filterPublications(event, 'list')">Full Publications List</button>

(* equal contribution · &dagger; corresponding author)

<div id="core-publications" class="publication-view" data-publication-view="core">
<div class="publication-card" data-category="all">
  <div style="display: flex; align-items: center;">
    <div class="pub-media-rotator" data-interval="4000" style="position: relative; width: 320px; height: 180px; margin-right: 20px; border-radius: 8px; overflow: hidden; flex: 0 0 auto;">
      <img src="images/cvan.png" alt="cVAN" style="width: 320px; height: 180px; object-fit: contain; display: block; margin: 0 auto;">
    </div>
    <div>
      <strong>cVAN: A Novel Sleep Staging Method via Cross-View Alignment Network</strong><br>
      <i style="font-size: 13px;">
        <strong>Z. Yang</strong> et al.
      </i><br>
      Published in IEEE Journal of Biomedical and Health Informatics (JBHI), vol. 29, no. 7, pp. 4659-4671, July 2025.
      <br>
      <b><i style="color:#83a1c7;">IEEE JBHI 2025 &nbsp;
      </i></b>
      <a href="https://doi.org/10.1109/JBHI.2024.3413081"><em>[paper]</em></a>
    </div>
  </div>
</div>

</div>


<div id="full-publications" class="publication-view" data-publication-view="list" hidden>
  <ul class="full-publication-list">
    <li>
      <span class="pub-list-badge">IEEE JBHI 2025</span>
      <span class="pub-list-title">cVAN: A Novel Sleep Staging Method via Cross-View Alignment Network</span><br>
      <span class="pub-list-authors">
        <strong>Z. Yang</strong> et al.
      </span>
      <span class="pub-list-links"><a href="https://doi.org/10.1109/JBHI.2024.3413081">[paper]</a></span>
    </li>
  </ul>
</div>

<script src="assets/js/show_publications.js"></script>
<script src="assets/js/pub_media_rotator.js"></script>


Projects
--------
<div class="project-card" data-category="project">
  <div style="display: flex; align-items: center;">
    <div class="pub-media-rotator" data-interval="4000" style="position: relative; width: 320px; height: 180px; margin-right: 20px; border-radius: 8px; overflow: hidden; flex: 0 0 auto;">
      <img src="images/slaw-nav.png" alt="SLAW-Nav" style="width: 320px; height: 180px; object-fit: contain; display: block; margin: 0 auto;">
    </div>
    <div>
      <strong>SLAW-Nav: Sparse Latent Action World Model for Vision-Language Navigation</strong><br>
      <i style="font-size: 13px;">2025.09 - Present</i><br>
      Proposed a world model-based counterfactual reasoning framework for VLN, enabling agents to imagine future outcomes around candidate actions. Designed skip-step sparse latent prediction with Qwen2.5-VL, achieving 62.0% SR / 56.0% SPL on R2R-CE.
      <br>
    </div>
  </div>
</div>

<!-- <div class="project-card" data-category="project">
  <div style="display: flex; align-items: center;">
    <div class="pub-media-rotator" data-interval="4000" style="position: relative; width: 320px; height: 180px; margin-right: 20px; border-radius: 8px; overflow: hidden; flex: 0 0 auto;">
      <img src="images/fp2.png" alt="FP2" style="width: 320px; height: 180px; object-fit: contain; display: block; margin: 0 auto;">
    </div>
    <div>
      <strong>FP2: Foundation Pareto Flow Policy for Multi-Objective Reinforcement Learning</strong><br>
      <i style="font-size: 13px;">2025.06 - Present</i><br>
      Co-designed the first Foundation Pareto Policy based on MMDiT + Rectified Flow, achieving stable improvements on D4MORL benchmarks across HV, SP, and PAS metrics.
      <br>
    </div>
  </div>
</div> -->

<div class="project-card" data-category="project">
  <div style="display: flex; align-items: center;">
    <div class="pub-media-rotator" data-interval="4000" style="position: relative; width: 320px; height: 180px; margin-right: 20px; border-radius: 8px; overflow: hidden; flex: 0 0 auto;">
      <img src="images/mapf.png" alt="MAPF-World" style="width: 320px; height: 180px; object-fit: contain; display: block; margin: 0 auto;">
    </div>
    <div>
      <strong>MAPF-World: Action World Model for Multi-Agent Path Finding</strong><br>
      <i style="font-size: 13px;">2025.03 - 2025.08</i><br>
      Co-designed an action world model unifying action generation and environment dynamics modeling via a Transformer-based fast-slow dual-system architecture with Spatial Relational Encoding (SRE).
      <br>
    </div>
  </div>
</div>


Awards
--------
- *2023*, First Prize, "Challenge Cup" National Competition — Fatigue Driving Recognition (Huawei Cloud Track).
- *2022*, National First Prize, China Undergraduate Mathematical Contest in Modeling (CUMCM).



Services
--------
- Reviewer: ICML.
