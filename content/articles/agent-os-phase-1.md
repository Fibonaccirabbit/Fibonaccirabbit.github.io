---
slug: agent-os-phase-1
title: "Agent OS progress report: evaluation, reproducible replay, and a self-improvement loop"
summary: "Two weeks after Day 1: choosing and benchmarking the agent foundation, a simulated evaluation environment for robot-arm agents, results on a public benchmark, failure analysis from complete trajectories, and first experiments with a self-improvement loop."
date: "2026-10-15"
category: robotics
tags: [Agent OS, Progress Report]
draft: false
---

Day 1 showed that a real robot arm can locate an object and move above it from a natural-language instruction. The two weeks since were organised around three questions: how to measure the agent's capability quantitatively, how to identify the causes of failures, and how to make the system improve with use.

The goal of Agent OS is unchanged: an agent layer that can be connected to robots of different embodiments, with real robots and simulators behind the same interface; a system that accumulates experience during operation and turns failures into reusable improvements, without reducing safety in the process.

## Choosing the agent foundation

Three foundations were compared: an agent loop implemented in-house, a general-purpose coding agent with robot capabilities connected directly, and an open-source agent core extended through plugins. All three were evaluated on the same public benchmark with the same model.

Changing the foundation alone changed the benchmark score by nearly a factor of two. The main cause is the overhead and latency added to every decision step: under a thirty-minute limit per episode, this overhead turns directly into unfinished tasks.

The open-source, actively maintained agent core with plugin support was adopted and is used unmodified. Robot-specific capabilities, such as approval before actions and the description and experience of each embodiment, are provided as plugins and embodiment knowledge packs. Improvements to the foundation are inherited directly, and the research effort stays on the robot-specific part.

## A simulated evaluation environment

Experiments on real hardware are costly and slow, and unsuitable for systematic evaluation. We therefore built an independent simulated evaluation environment: a six-axis arm with a two-finger gripper, blocks and marked areas on a table, and a camera observing from the opposite side. The environment is not a digital mirror of the real robot; it is a benchmark environment designed to evaluate agent capability.

Tasks are organised in ten levels, covering hovering, picking, placing, stacking, sorting, swapping positions, dismantling towers, and manipulation based on relations between objects. One group of tasks tests whether the agent recognises instructions it should not execute: the target is out of reach, the object is wider than the gripper's maximum opening, the requested object does not exist, or the instruction is ambiguous. The correct behaviour in these cases is to stop and explain, or to ask for clarification.

The simulator and the real robot are connected through the same interface; the agent does not need to distinguish between them.

## Results on a public benchmark

We evaluated on LIBERO-Agent, a public benchmark for robot-arm agents (30 tasks, 3 runs each, out of 100), with the same smaller model for all three approaches:

- In-house agent loop: 42 of 90 runs succeeded, total score 16.8 – 19.3.
- General-purpose coding agent: 36 of 90 runs, total score 10.0 – 13.0.
- Current approach: 52 of 90 runs, total score 20.5 – 21.5.

The best score reported in the benchmark paper is 19.3, from a commercial coding agent with a flagship model. Totals are given as ranges because one measure cannot be computed from the released data. Our evaluation followed the official procedure on a local machine whose environment differs from the paper's, so the comparison is indicative only.

By category, perception tasks perform well; long-horizon, multi-step tasks and harder manipulation remain the main weaknesses, and most failures are episodes not completed within the time limit. Compared with the first implementation, the current approach uses less than half of the computation.

In our own simulated environment, the current approach completes 39 of 40 tasks.

## Failure analysis from complete trajectories

A total score does not explain why an episode fails. Every episode is recorded as a complete trajectory: the agent's decisions and reasoning at each step, the actions it invoked, and the true state of the simulation. These records are sufficient to reproduce the episode in the same scene for step-by-step analysis.

<video controls playsinline preload="metadata" style="aspect-ratio:1280/800" poster="/media/agent-os-phase1-replay-poster.jpg" aria-label="Agent OS failure case replay: an object wider than the gripper opening">
  <source src="/media/agent-os-phase1-replay.mp4" type="video/mp4">
  <a href="/media/agent-os-phase1-replay.mp4">Download the replay</a>
</video>

*A reproduced replay of a failure case (about 45 seconds). The instruction was to put the large white box into the green area; the object is wider than the gripper's maximum opening, so the correct behaviour is to report that the task cannot be done. Only the scene and the execution state are shown.*

In this case the agent measured early on that the object was wider than the gripper opening, and its reasoning concluded that it was "probably not graspable". It nevertheless kept trying: it re-grasped from a new position, picked up a neighbouring small block to check the gripper, and finally made several offset grasps in a row, moving the target by a few centimetres. The episode was judged a failure.

The reproduction also exposed a problem in the evaluation environment itself: after a failed grasp, the environment's hint was "locate it again and retry". For an object that is too wide this hint is inappropriate and encourages repeated attempts, so part of this failure should be attributed to the environment's design rather than to the agent's decisions alone.

## A self-improvement loop

Every episode is stored in an experience log together with the version of the knowledge pack it used, so versions can be compared directly.

The self-improvement procedure is as follows. A stronger model reads the failures on the training tasks and summarises them into a small number of general rules, written into the embodiment's knowledge pack. Rules may not contain specific values, colours or task identifiers, to prevent overfitting to the training scenes. A new version is then tested on scenes the agent has never seen and is adopted only if its success rate does not drop and its safety does not degrade. Safety-related parts, including approvals, motion limits and the grading criteria, are outside the scope of modification.

In the first baseline experiment, the training tasks were all solved in both passes, and only two tasks failed on unseen scenes. The current environment is therefore close to saturation for the current approach: there are too few failures to learn from, and the effect of any improvement would be hard to measure.

Further work proceeds in two directions: increasing the difficulty of the environment with longer multi-step tasks, denser table layouts and situations requiring adjustment during execution; and addressing the two weaknesses identified on the public benchmark, long-horizon tasks and harder manipulation. Efficiency, meaning equal success with less time and fewer redundant actions, will also be an improvement target: in the case above, the agent's final answer was correct, but it took almost five minutes to get there.

## Status and limitations

Completed:

- An architecture based on an open-source agent core, with robot capabilities provided as plugins and embodiment knowledge packs.
- An independent simulated evaluation environment with a graded task set, sharing its interface with the real robot.
- A public-benchmark score clearly above the first implementation, at the level of the best result reported in the paper (different environment; indicative only).
- Complete, reproducible replay of every episode, including the agent's reasoning.
- A versioned experience log, together with the self-improvement loop and its validation procedure.

Not yet:

- Performance on long-horizon, multi-step tasks remains weak.
- Self-improvement has not yet produced a verified improvement.
- Only one model has been used, and evaluation ran on a single machine.
- On the real robot, only moving above an object has been validated; grasping has not been tested on hardware.

The goal of the next phase is a first verified self-improvement.
