---
slug: harness2-two-tier-agents
title: "Harness² is not recursive self-improvement: measuring a two-tier agent"
summary: "We integrated Google's open-source Harness² into Agent OS as its evolution engine, measured it on a robot-arm simulator and on LIBERO-Agent, and then removed it. This post explains why it is in essence a two-tier system, an outer agent with a stronger model optimising an inner agent with a weaker one, rather than recursive self-improvement, and what the experiments exposed."
date: "2026-10-22"
category: robotics
tags: [Agent OS, Self-Improvement, Experiment Analysis]
draft: false
---

One aim of Agent OS is a robot agent that keeps improving with use. In the previous phase we built our own improvement loop. A stronger model reads failure records and proposes rules, and simulator ground truth plus held-out tasks decide whether a rule is adopted. In this phase we tried Google's open-source Harness² ([paper](https://arxiv.org/abs/2610.14224), [code](https://github.com/google-research/harness2)) as the evolution engine. It improves results on all three professional benchmarks in its paper, and it is motivated as recursive self-improvement (RSI).

After integrating and measuring it, we removed it from the system. The scores did not improve, but the main reason is its structure. Harness² is in essence a two-tier agent: an outer agent, by default with a stronger model, optimises the harness of an inner agent. It is not a system improving itself.

## What Harness² does

Harness² leaves the model weights alone and edits the harness around the model: system prompt, guardrails, long-term memory, tool guidance, skills and scripts. It has two loops:

- **Within a task:** the current harness runs once. An outer editing agent reads the trajectory and proposes two kinds of edit, general practice and domain knowledge. Each edit is run once, and a final version is composed from the differences in behaviour. No answers or scores are seen at any point.
- **Across tasks:** after each task, the adopted harness and a short experience note are stored in that domain's library, which the editing agent consults on later tasks in the same domain.

## Why it is a two-tier agent, not RSI

The core of RSI is not doing a task better and better. It is that the gains improve the improving itself: each round makes the next round of improvement faster or larger. A recent survey ([arXiv 2607.07663](https://arxiv.org/abs/2607.07663)) separates bounded self-refinement, which converges, can be evaluated and is already standard industrial practice, from open-ended RSI. The [ICLR 2026 workshop on RSI](https://iclr.cc/virtual/2026/workshop/10000796) likewise asks for loops that actually get better and can show it. Measured against that, Harness² has three properties.

**First, the outer and inner agents are two roles, and in the default setup two models of different strength.** In the paper's default configuration, Claude Opus 4.8 edits the harness while the executors being optimised are Gemini 3.5 Flash and GLM-5. Our integration had the same shape: deepseek-v4-pro outside, deepseek-flash inside. This is closer to a strong model supervising a weak one through context. The outer model's judgement is transferred to the inner agent as harness text and scripts.

**Second, only the inner agent is improved; the outer one does not change.** What accumulates across tasks is a per-domain library that the outer editor consults the next time it works. The paper's appendix also describes the current improvement harness as a simple indexed library of adopted harnesses and experience, with consolidating and revising it left as future work. The outer agent's method, criteria and model stay the same, and no experiment shows the rate of improvement rising over later tasks.

**Third, quality is judged by the outer model, not checked against ground truth.** Selection rests on behavioural contrasts and model judgement. The paper's limitations section says as much: without ground-truth supervision, refinement relies on behavioural contrasts and model judgement and does not guarantee correctness. When the outer judgement is wrong, the system optimises confidently in the wrong direction.

To be fair: the paper also runs a setting where one model is both executor and editor, and all five models improve on every benchmark, so this is not simply a strong model teaching a weak one. Even then, the model plays two roles. The outer role spends several times more executions and reasoning, and reviews the inner trajectories from above. That converts extra test-time compute into a better harness. It is still not a system improving its own ability to improve.

## Our measurements

The executing agent runs on the open-source agent kernel [Pi](https://github.com/earendil-works/pi), and robot capabilities come through the robotics framework [dimOS](https://github.com/dimensionalOS/dimos). The simulator and the public benchmark use the same interface.

**Robot-arm simulator.** On the low-level control embodiment, where the agent itself positions the gripper tip and opens and closes the gripper, we took the one task family that failed consistently. The target object is wider than the gripper's maximum opening, and the correct behaviour is to leave it in place and explain why. Across four scenes, the original harness and the one Harness² adopted both scored 0/4. The outer agent concluded that an object too wide to grasp should be pushed into the area, and wrote a well-reasoned justification. It could not see the grading criteria, so it had no way to know this was unacceptable.

<video controls playsinline preload="metadata" style="aspect-ratio:1280/800" poster="/media/harness2-push-poster.jpg" aria-label="Under the harness Harness² adopted, the agent pushes an over-wide box into the target area">
  <source src="/media/harness2-push.mp4" type="video/mp4">
  <a href="/media/harness2-push.mp4">Download the video</a>
</video>

*A reproduced episode under the harness Harness² adopted (about 40 seconds). The instruction is "put the large white box into the green area", and the box is wider than the gripper opening. The agent closes the gripper and pushes the box into the area in several moves; the evaluation marks it as failed.*

**LIBERO-Agent.** We measured five hard long-horizon tasks of the public robot-arm agent benchmark LIBERO-Agent ([paper](https://arxiv.org/abs/2609.39507), [code](https://github.com/dzj441/Libero-Agent)), scored by sub-goal stages completed. The original harness completed 2 of 19 stages and the adopted harness 1 of 19. Neither fully solved any task. The outer editor was called 23 times at about 9.3 US dollars and 3.3 hours, plus 15 extra episodes of up to 30 minutes each.

From the data we identify four causes:

- **Self-assessment diverged from ground truth.** In a task that requires rotating three bowls in order without any bowl touching the table, the outer agent's experience note says the improved version "completed 3 to 4 moves". The evaluator scored it 0: none of the four ordered stages was completed.
- **At the smallest budget there is no real selection.** With one step per task, the composed version is the only remaining candidate and is always adopted. The one probe version that made progress (25 percent) was not chosen.
- **Proposals fitted single scenes.** The adopted skills were mostly named after specific tasks, such as turning on a stove or rotating bowls. They are recipes for one scene, not methods for the task family, and later tasks could hardly use them.
- **The signal was buried in noise.** These tasks are near the floor for the model used, and three runs of the same task can score 0, 25 and 100 percent. A comparison from single runs cannot tell improvement from luck.

<video controls playsinline preload="metadata" style="aspect-ratio:1024/512" poster="/media/harness2-libero-t25-poster.jpg" aria-label="An episode of the adopted harness on the LIBERO-Agent three-bowl rotation task">
  <source src="/media/harness2-libero-t25.mp4" type="video/mp4">
  <a href="/media/harness2-libero-t25.mp4">Download the video</a>
</video>

*An episode of the adopted harness on the LIBERO-Agent three-bowl rotation task (the benchmark's own recording, about 31 seconds; head camera left, wrist camera right). The bowls are moved several times, but none lands on its target plate in the required order. The outer agent summarised it as "completed 3 to 4 moves"; the evaluator recorded 0.*

## An unexpected gain

The first experiment failed, but it exposed a defect in the task itself. The agent was expected not to push objects, yet that rule appeared nowhere the agent could see. We added it to the common working method: never push, drag or nudge an object to get around a limit, unless the request asks for it or the object is built to move that way (a drawer, a door).

<video controls playsinline preload="metadata" style="aspect-ratio:1280/800" poster="/media/harness2-rule-decline-poster.jpg" aria-label="With the operating rule added, the agent leaves the over-wide box untouched and explains why">
  <source src="/media/harness2-rule-decline.mp4" type="video/mp4">
  <a href="/media/harness2-rule-decline.mp4">Download the video</a>
</video>

*The same scene after the operating rule was added (about 15 seconds). The agent measures the box, finds it wider than the gripper opening, never moves the arm, and explains that the request cannot be carried out; the evaluation passes it.*

Re-measured with the same model, the low-level embodiment reached 52/52 on both training and held-out tasks, up from 49/52 and 50/52. The high-level embodiment held at 39/40 on held-out tasks, and there were no safety events. This improvement came from evaluation with ground truth and human review, not from Harness².

## Decision and next steps

We removed Harness² and kept one idea from it: its proposals pinpoint the specific mistake in a trajectory before editing anything. We can use that to strengthen our own proposal step, while adoption is still decided by simulator ground truth, repeated runs and held-out tasks.

In robotics, the physical world and simulators provide signals that do not depend on a model's judgement. We think the sounder path is to make bounded, measurable, ground-truth-gated self-improvement work first, and then measure recursiveness experimentally: whether the rate of improvement itself rises from one generation to the next. Until there is evidence of that, the term RSI should be used with care.

Finally, the limits of this post. Our domain is robot manipulation, and our models, budget (one step per task) and sample sizes differ from the paper's. Our conclusions apply to our setting and to the method's structure; they do not dispute the results Harness² reports on its own benchmarks.

## References

- Harness²: Recursive Agent Harnessing for an Open World. [arXiv 2610.14224](https://arxiv.org/abs/2610.14224); code: [google-research/harness2](https://github.com/google-research/harness2)
- LIBERO-Agent: Evaluating General-Purpose Agents for Direct Embodied Manipulation. [arXiv 2609.39507](https://arxiv.org/abs/2609.39507); code: [dzj441/Libero-Agent](https://github.com/dzj441/Libero-Agent)
- Recursive Self-Improvement in AI: From Bounded Self-Refinement to Autonomous Research Loops. [arXiv 2607.07663](https://arxiv.org/abs/2607.07663)
- [ICLR 2026 Workshop on AI with Recursive Self-Improvement](https://iclr.cc/virtual/2026/workshop/10000796)
- Agent kernel: [earendil-works/pi](https://github.com/earendil-works/pi); robotics framework: [dimensionalOS/dimos](https://github.com/dimensionalOS/dimos)
