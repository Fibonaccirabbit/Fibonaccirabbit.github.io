---
slug: wnm3d-navigation-failures
title: "WNM-3D navigation failure analysis: blockage, early stops, and missed endings"
summary: "A review of 5,000 navigation tasks: where execution gets stuck, why low motion is not the same as task completion, and what local interventions do and do not establish."
date: "2026-10-17"
category: robotics
tags: [World Models, Vision-Language Navigation, Failure Analysis]
draft: false
---

This is a record of a WNM-3D navigation failure analysis, based on the October 16 report and its October 17 updates. The model uses language and visual observations to generate future images and actions. I compared those predictions with what actually happened in the simulated environment.

Several different problems can look like the same failure in a video: the agent keeps trying to move but cannot, stops before reaching the destination, or reaches the goal region without ending the task. I started by separating these outcomes, then used individual cases to investigate what was happening.

## What the 5,000 tasks show

Of 5,000 tasks in unseen scenes, 2,402 succeeded and 2,598 failed. The failures fall into four mutually exclusive groups:

| Final outcome | Tasks | Share |
| --- | ---: | ---: |
| Never reached the goal region; sustained blockage and budget exhausted | 971 | 37.4% |
| Stopped before ever reaching the goal region | 952 | 36.6% |
| Reached the goal region but did not stop successfully | 672 | 25.9% |
| Other collision failures | 3 | 0.1% |
| Total | 2,598 | 100.0% |

The percentages use the 2,598 failures as their denominator. A task that reached the goal region and later became blocked stays in the third group; local blockage can occur in more than one outcome category.

**These are results under a diagnostic protocol, not a reproduction score for the complete official system.** This run enabled low-motion stopping and did not use external blockage recovery, unlike the recommended official configuration. Each task had an execution budget of up to 500 actions, and the goal region used a 3 m distance threshold.

## Blockage: recovery can be slow and temporary

In six selected examples, the previous action block had already failed to move the agent. After receiving a new real observation, the model still generated actions that were blocked again. All 48 actions in the six reviewed blocks collided, with no actual translation.

<video controls playsinline preload="metadata" style="aspect-ratio:1280/690" poster="/media/wnm3d-navigation-failures/blocked-poster.jpg" aria-label="Saved prediction and actual execution during a blocked navigation segment">
  <source src="/media/wnm3d-navigation-failures/blocked-prediction-vs-execution.mp4" type="video/mp4">
  <a href="/media/wnm3d-navigation-failures/blocked-prediction-vs-execution.mp4">Open the comparison video</a>
</video>

*Left: the saved prediction. Right: actual execution of the same first eight actions from the same query. The real camera can turn without the agent changing position. This is a local segment, not the complete task.*

These examples do not mean the model never recovers. Across all 971 failed tasks in this category, 691 recovered locally at least once: **71.2%**. Of those 691, 646 later experienced another sustained blockage: **93.5%**.

Among the tasks that recovered, the median wait from the first blockage onset to the start of a qualifying recovery block was 74 executed actions; the 90th percentile was 301 actions. These are action counts, not seconds or model queries. Unrecovered tasks are excluded from that waiting-time distribution.

[![Recovery outcomes for all 971 blocked failures and the waiting-time distribution among the 691 tasks with observed local recovery.](/media/wnm3d-navigation-failures/recovery-counts-and-delay.png)](/media/wnm3d-navigation-failures/recovery-counts-and-delay.png)

*The upper panel covers all 971 tasks. The lower panel covers only the 691 with observed recovery. Recovery means a qualifying eight-action execution block with collision-free movement; it does not mean the route became correct or the task succeeded.*

The issue is therefore not simply an absence of recovery actions. Recovery is often delayed, and it is difficult to sustain useful progress afterwards. The remaining 280 tasks had no qualifying recovery within the recorded budget; that is not a claim that recovery would be impossible with unlimited time.

## Early stopping: low motion is not task completion

Another 952 tasks stopped before entering the goal region. In the six reviewed examples, the agent was still outside the region when it returned a low-motion action block. The diagnostic stopping rule decoded that output as STOP.

<video controls playsinline preload="metadata" style="aspect-ratio:960/382" poster="/media/wnm3d-navigation-failures/early-stop-poster.jpg" aria-label="A fixed real observation next to the predicted video at an early stopping query">
  <source src="/media/wnm3d-navigation-failures/early-stop-forecast.mp4" type="video/mp4">
  <a href="/media/wnm3d-navigation-failures/early-stop-forecast.mp4">Open the early-stop example</a>
</video>

*Left: a fixed real observation at the stopping query. Right: the generated prediction. The left panel is not a recording of execution after STOP; no such continuation is shown.*

The distinction matters: the threshold explains how a low-motion output becomes a stop, but not why the model generated low motion. Image textures can also drift or deform without representing meaningful camera movement.

In one controlled example, removing the final goal clause while keeping the route instructions changed STOP into movement towards the goal. In several other examples, the same edit did not remove the low-motion output. This is evidence of a local conditioning effect, not a common explanation for all premature stops.

Changing visual history could also remove many incorrect stops, but it simultaneously removed many correct stops. Forcing the agent to continue moving is therefore not a sufficient fix. The requirement is to distinguish unfinished instructions from tasks that should genuinely end.

## Reaching the goal region without ending

The third group contains 672 tasks. In 660 of them, the model received another observation and made a new decision while inside the goal region. Arrival opportunities were present, but they did not reliably become successful termination.

In the example below, the agent repeatedly came very close to the destination and kept acting. It later became blocked, but describing the entire episode as a blockage failure would hide the earlier missed endings.

[![A recorded task repeatedly approaches the goal but never stops; requested translation remains nonzero while actual translation is often zero.](/media/wnm3d-navigation-failures/goal-and-motion-timeline.png)](/media/wnm3d-navigation-failures/goal-and-motion-timeline.png)

*Upper panel: distance to the goal over executed actions. Lower panel: requested and actual translation. Proximity and reference-route coverage are external geometric measurements, not proof that the model internally recognised the destination or understood that the instruction was complete.*

There are two separate questions here: why the agent did not end when appropriate, and why later actions were not executable. The fact that it received fresh observations does not establish whether it recognised the problem or failed to use what it recognised.

## Local recovery is not the same as finishing

I also compared two training stages on eight fixed tasks, starting each run from the original task beginning and allowing a complete closed loop. Both stages recovered after the first sustained blockage in six of the eight tasks. The earlier stage completed one task; the later stage completed none.

**The tasks were selected from failures of the later stage. This is a diagnostic sample, not an overall ranking of the two models.** Their paths and blockage locations also diverged, so the comparison does not isolate recovery from an identical blocked state.

It does establish a useful boundary: local recovery was already present in the earlier stage. Fewer blockage events, lower recurrence, or a short collision-free segment cannot individually stand in for task completion. An agent can escape and continue along the wrong route; another can become blocked again and still eventually succeed.

## Changing a prediction does not establish a working fix

At selected saved states, replacing the generated future-video representation could switch an action output from STOP to MOVE, and in the reverse direction from MOVE to STOP, without directly replacing the action tensor. This supports a causal influence of the future-video representation on action generation. It does not establish improved execution or general navigation performance.

A separate full closed-loop test examined a single future-video replacement in the goal-region example. Both the original run and the replacement run exhausted the task budget without a correct stop. The original model later recovered locally; the replacement run did not recover after the intervention.

<video controls playsinline preload="metadata" style="aspect-ratio:640/440" poster="/media/wnm3d-navigation-failures/recovery-control-poster.jpg" aria-label="Original and intervention runs with predicted and actual observations around local recovery">
  <source src="/media/wnm3d-navigation-failures/recovery-control-comparison.mp4" type="video/mp4">
  <a href="/media/wnm3d-navigation-failures/recovery-control-comparison.mp4">Open the recovery comparison</a>
</video>

*Upper row: predictions. Lower row: actual execution. Left: the original model. Right: the replacement run. Only two aligned query windows around recovery are shown, not the complete task. The full-episode outcomes above were checked separately.*

The intervention changed the actions and camera heading, which changed the real observations entering later decisions. That is evidence of an effect on the closed loop, but it was not an effective recovery or stopping method in this test. Ending closer to the goal would also be misleading here: the replacement run was already near the goal and then failed to translate.

These additional controls are separate from the original 5,000-task statistics. The generation-path interventions remain local evidence; they do not identify a single semantic or neural cause for every failure.

## What remains to be tested

The analysis separates three requirements: recovering from blocked execution, continuing while instructions remain unfinished, and ending reliably after arrival. Making the model move more, or making its generated video look different, does not automatically satisfy any of them.

The next checks should measure recovery delay together with later route progress and final success, and evaluate stopping on both unfinished and correctly completed tasks. Candidate changes need full closed-loop evaluation under a fixed protocol, not just a favourable short segment.

This is a failure-diagnosis record. It is not a report of a validated repair, and it does not establish that the model has no task-progress representation, that every case shares the same cause, or that a particular architecture change will solve the problem.
