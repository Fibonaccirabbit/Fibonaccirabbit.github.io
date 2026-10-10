---
slug: agent-os-day1
title: "Agent OS Day 1: Moving a robot arm with natural-language instructions"
summary: "A first day of testing Agent OS on a real robot arm: from fixed motions to live localization. Two hover cases worked, with several failures and fixes along the way."
date: "2026-10-05"
category: robotics
tags: [Agent OS, Experiment Log]
draft: false
---

This is a record of the experiment on October 2. The main task for the first day was simple: enter "move above the box" in a webpage, let the agent find the box in the camera view, and have the robot arm plan and execute the motion.

Agent OS is intended to provide a common interface for operating robots. After switching robots, the user should still be able to view camera feeds, send tasks, and inspect execution feedback from the same webpage. This round tested the robot arm only; the other robots were not revalidated.

## Video

<video controls playsinline preload="metadata" style="aspect-ratio:3024/1496" poster="/media/agent-os-day1-workstation-poster.jpg" aria-label="Agent OS Day 1 full workstation recording">
  <source src="/media/agent-os-day1-workstation.mp4" type="video/mp4">
  <a href="/media/agent-os-day1-workstation.mp4">Download the video</a>
</video>

*This is the successful black-box case from later in the session, about 53 seconds long. The instruction was to move above the black box with a white label. The full workstation recording includes both the camera feed and Agent interaction. This was a hover, not a grasp.*

## First, complete one motion

We did not start with object recognition. We first used a known target position and a prepared path to check whether the robot arm could execute a complete motion.

Even this required some setup. The driver and control program were not running. After restoring the connection and starting the control program on the teach pendant, the arm moved above the white box in a little over twenty seconds. We then reset it, repeated the motion, and recorded the camera feed.

Both runs completed. The gripper appeared to stop above the box, but we did not measure its exact alignment or clearance.

## Connecting the agent is not enough

Next, we connected reset and motion to the agent so that it could read the robot state and choose actions from natural-language instructions.

That version still relied on the prepared target and path. A sentence could start the motion, but moving the box would invalidate it. We therefore added live camera localization and planning from the arm's current position.

The first attempt on the white box failed: the visual results were inconsistent, and the system stopped without moving. After adjustments, the agent found the box, planned a new path, and executed it. The final camera view showed the gripper above the box, although it was still offset by several centimeters.

The case no longer needed a saved box position or trajectory. That did not mean localization was accurate enough; the calibration was still rough.

## Several failures with the black box

Changing the target exposed several different problems.

One attempt failed because the color and depth data did not correspond correctly. Another timed out while waiting for the vision model. We addressed data synchronization and request latency separately.

A small black box farther away could be located, but it was outside the arm's reachable area. Planning was rejected, and no motion was executed.

The black box with a white label was a different case. The vision system identified the correct object, but its measurement region mixed the top surface, side surface, and background. The consistency check kept rejecting the result. A more detailed object description did not fix it, because the problem was in the subsequent geometric processing rather than the name of the object.

After adjusting that step, localization passed. We sent the instruction again from the webpage, and the arm completed the hover shown in the video.

Both the white box and the labeled black box worked by the end of the day. There were failures and repairs between them, and we had not yet run enough consecutive trials to estimate reliability.

## The webpage and recording also needed work

The webpage initially kept waiting for the robot even though the robot service was connected. The problem was browser support for the real-time connection. Switching to a supported browser restored the camera view and agent interaction.

The recording also initially looked like a still image in the player. The video content was present, but the saved format was not compatible with the player. Converting it to a compatible format restored playback.

Neither issue changed the arm's execution result, but both affected operation and review. These parts still need to be made more reliable.

## What worked, and what remains

Web instructions, live localization, planning, and real-arm execution were connected in these few cases. Reset was also tested. Localization accuracy and repeated success rate were not systematically evaluated.

The next steps are to improve calibration, measure the stopping position and clearance, and test different objects and placements over consecutive runs. Successes, failures, and rejected motions should all be recorded.

Grasping has not been tested. Motion still requires on-site supervision, and scene checks are incomplete. Day 1 was about getting the move-above-an-object task working; the rest remains to be tested.
