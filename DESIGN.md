# Design direction

**Identity.** The personal site of Gading Aditya Perdana: a generalist who builds iOS and macOS
apps and AI systems, deepest in machine learning and software engineering, who also does UI and
UX design and research. Computer Science at BINUS University, Apple Developer Academy scholar,
from Jakarta.

**Audience.** General: friends, recruiters, clients, collaborators, admissions, peers. It doubles
as a UI, frontend and motion showcase.

**Personality.** Precise, heavy, risk taker.

**Concept: built in layers.** Everything is a physical layered object in one space. Scrolling
pulls layers apart along depth to show how a thing is made, then puts it back.

**Mood.** Near-black workspace, blue to cyan light bending slowly behind it, sharp type, small
mono labels pinned to the layers they name.

**Palette.** Dark default: bg `#0a0b0d`, elevated `#141518`, sunken `#060708`; ink at 95, 62 and
50 percent; hairline 10 percent. Light: `#fbfbfd`, `#ffffff`, `#f1f1f4`; ink at 92, 62 and 55
percent. Accent blue `#3b82f6` dark and `#2563eb` light; filled buttons `#2563eb`; secondary cyan
`#22d3ee` dark and `#0891b2` light.

**Typography.** Sora for display (600 to 800), DM Sans for body, JetBrains Mono 500 for dates
and labels. Hero name `clamp(3.5rem, 10vw, 10rem)`.

**Approved techniques and what each is for.**
- Glass on the controls layer only (navbar, secondary buttons, dialogs, menu sheet): separates
  controls from content, per Apple's Human Interface Guidelines. Never on content cards.
- One gradient text, the hero name: it is the page's single signature mark.
- The ColorBends background: the site's original identity, drawn only when something changes.
- Layer tags on exploded stacks: they name the parts.
- The cursor label: tells you what a non-obvious target does (Drag, Open, DOI, Copy, View).

**Depth.** One perspective container per scene around one `preserve-3d` stage; layers step 120
to 240px in z; anything you read ends flat; three shadow tiers; never blur for depth.

**Computer-vision visuals.** Real model outputs only, drawn as returned: Apple Vision
segmentation, boxes and landmarks today, plus a depth estimate after this pass. No captions on
them. Nothing hand-placed that could pass for inference.

**Motion.** Storytelling motion is scrubbed by scroll, on desktop and on phones. Interactive
motion is short. Nothing moves while the visitor is idle.

**Dials.** ENERGY 4 of 5, RHYTHM 4 of 5, MOTION 5 of 5.

**Not this.** Glass content cards, a second gradient text, an academic CV, an industry pitch,
decoration that pretends to be evidence, sound, a preloader, looping animation.
