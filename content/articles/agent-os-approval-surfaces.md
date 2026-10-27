---
slug: agent-os-approval-surfaces
title: 'Agent OS: approval as one abstraction, with a pocket hardware surface'
summary: Every action a robot agent takes can be previewed first and approved by a person. We made approval a single layer shared by simulation and real robots, which a web page, a terminal or an open-source pocket device can answer. One page shows the arm, the agent's reasoning and each action's future as it happens, and becomes a replayable record afterwards.
date: '2026-10-27'
category: robotics
tags:
  - Agent OS
  - Human in the loop
  - Hardware
draft: false
---

When an agent drives a robot, the moment a person most needs to be involved is just before an action runs: where the arm will go, what space it will sweep through, and whether it should happen now. In the previous stage, Agent OS could already complete multi-step manipulation tasks in simulation and grade them against the simulator's ground truth. This stage adds the human in the loop. Each action is previewed before it runs and approved on any one of several surfaces, and the whole run can be watched live or replayed step by step afterwards.

The video below is real footage. The agent sorts every red block on the table into the white area in simulation; the screen shows the live digital twin, and the hand holds a pocket device. Before each pick and place, an orange "ghost" arm flies the planned path on screen while the device asks for approval. Only after the device's button is held for 1.2 seconds does the arm in the simulation follow.

<video controls playsinline preload="metadata" style="aspect-ratio:1280/720" poster="/media/agent-os-passport-real-poster.jpg" aria-label="Real footage: the digital twin shows the ghost preview while the AI Passport in hand shows the approval request">
  <source src="/media/agent-os-passport-real.mp4" type="video/mp4">
  Your browser cannot play this video.
</video>

## Approval is a layer, not a feature of one interface

Approval does not live in any single interface. It sits between the agent and the robot:

- **When approval is needed** is set by the robot's embodiment definition. Simulation runs actions automatically by default and real robots ask for each one; a simulated run can be switched to ask as well.
- **Approval requests** are filed by an extension in the agent kernel with a local approval hub. The terminal, the web page and the pocket device are all surfaces of that hub. **The first answer wins**, and the other surfaces are told at once and close their prompts.
- **Simulation and real robots take the same path.** The only difference is a flag: a real-robot request is marked "REAL ROBOT" in red on every surface.

Adding another surface, such as a phone or a watch, therefore needs no change to the agent or the robot, only a connection to the same hub. The hardware emergency stop remains a separate physical channel outside this software.

## See the future first: a preview before each action

To approve an action, a person has to understand it. Arguments alone ("pick (-0.446, 0.043, 0.049)") are not enough; they need to see how the motion will happen.

Before an action is filed for approval, the simulator runs it in full on a copy of the current physical state, records the trajectory, and restores the world exactly. The page draws a ghost arm from it, with afterimages along the way and the path of the gripper tip. Because the physics is deterministic, the preview is the real future: when the action then runs, the end position matches the preview's to the millimetre. The preview interface is offered to approval surfaces only, not to the agent, so the agent's tools and the evaluation results are unchanged.

<figure>
<img src="/media/agent-os-passport-twin.jpg" alt="The digital twin page: the agent's reasoning and tool calls on the left, the ghost preview of a pick in the middle, the preview card on the right" loading="lazy">
<figcaption>One page: the agent loop on the left (reasoning, scripts, every tool call with its result), the preview of the pick about to run in the middle, and a summary of that action on the right.</figcaption>
</figure>

## One page, live and replay

The digital twin page serves both live viewing and replay:

- **Live:** the simulator streams each frame's joint angles, gripper opening and object poses, and the page plays them as they arrive. The simulator runs much faster than real time, so the page speeds up and catches up within seconds, keeping the motion smooth without falling behind the agent.
- **The agent loop:** the left side shows, as a conversation, the agent's reasoning as it streams, what it says, every tool call with its result, and who answered each approval.
- **Replay:** once the run is graded, the same page loads the full record and becomes a replay you can scrub. At any moment the left side shows the reasoning and calls up to that step and marks the current one.
- **Starting runs:** the page itself can pick a task, edit the instruction, choose whether each action needs approval, and start. Runs with an edited instruction are not graded automatically, because the checker only knows the original task's goal.

## An approval surface in the pocket: AI Passport

For the hardware surface we used FoloToy's AI Passport, an open-source ESP32-C3 pocket device ([firmware repository](https://github.com/folotoy/ai-passport), MIT licence) with a 240×320 screen, three buttons, a speaker and a battery, over USB or Bluetooth Low Energy. We wrote new application firmware for it in the digital twin's visual language:

- **Live page:** a 9×9 dot-matrix state glyph (thinking, looking, acting, waiting for approval, done), the current instruction and the step count.
- **Approval page:** shown on top whenever an action is waiting. Hold the confirm button for 1.2 seconds to approve, press down to deny; real-robot requests have a red frame. A short press does nothing, to avoid accidental approvals.
- **Scores and pet pages:** recent evaluation results and verdicts, and a pixel robot whose mood follows the recent success rate and which "levels up" with each new generation of the knowledge pack.

The device only parses simple text commands. Chinese and other text is rendered into small images on the computer and sent over, so the device needs no Chinese font. It works over USB or wirelessly over Bluetooth.

## Results

We ran a real agent (a DeepSeek model) in simulation with approval required for every action:

- **Sorting** (put every red block into the white area): the agent requested 12 actions, all approved on the pocket device. One place failed; the agent looked again and retried on its own. The run took about 3 minutes and passed the ground-truth check, without touching other objects or hitting the table. The replay matched the simulator's recorded final positions to within 1 millimetre.
- **Stacking:** several runs, all passed. One ran with the device connected over Bluetooth throughout: approval requests and text reached the device over the air and its state followed the task. In that run the approvals were given on the web page.

## Engineering fixes along the way

Moving the system from demo to usable meant fixing several problems:

- **Observing no longer moves the arm needlessly.** The simulator used to move the arm out of view before every picture and back again afterwards. It now checks whether the arm actually hides an object or a marked area, moves it only then, and brings it back only when its pose is part of the task (for example, while holding an object). Replaying one sorting run, the arm's travel during observations fell from 41 m to 8 m, with the same verdict.
- **The device's animations had saturated its processor.** The graphics library extends the redraw region of a scaled image symmetrically on every side, so each animation frame redrew most of the screen. Placing each scaled image in a container of exactly its size bounds the redraw, and Bluetooth start-up went from several seconds to under one.
- **The data link needed flow control.** The device's USB driver drops incoming data when its buffer is full. Images are now sent in chunks, each acknowledged before the next, and back-to-back transfers no longer fail; Bluetooth uses the same mechanism.
- **Opening the serial port reset the device.** The order in which macOS sets the control lines when opening a port happened to form the chip's reset signal. With the order changed, connecting no longer reboots the device, and the computer reconnects automatically if the link drops.
- **Bluetooth bandwidth.** Text images are now 4-bit alpha, coloured on the device, a quarter of the previous size. Together with larger link-layer packets and a shorter connection interval, sending one text image went from about 1.8 s to about 0.35 s.

## Limitations

- The arm in the video is simulated, and the preview relies on the simulator replaying an action deterministically. Previews for a real robot need its own planner to be connected, which is not done yet.
- The Bluetooth link is not encrypted yet. The computer connects only to the device it first paired with, so a device with the same name cannot pose as the approval surface, but the link itself should move to encrypted pairing before it is used to approve real-robot actions.
- The device's battery life has not been measured.
- In the video the device is connected over USB. Bluetooth has been verified on the same tasks, but not in this recording.
