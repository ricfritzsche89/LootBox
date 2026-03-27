```markdown
# Design System Strategy: The Hero’s Ledger

## 1. Overview & Creative North Star
**Creative North Star: "The Tactical Commander"**

This design system moves away from the "soft and playful" clichés of children's apps. Instead, it adopts the high-octane, high-fidelity aesthetic of modern AAA game interfaces (Call of Duty, Destiny 2). We are treating household chores not as "to-dos," but as **Critical Missions**. 

The UI breaks the traditional flat grid through **Aggressive Layering** and **Kinetic Depth**. We utilize asymmetric layouts, leaning heavily into "Heroic" UI elements—large-scale typography, high-contrast action zones, and metallic textures that make every interaction feel like unlocking a legendary achievement. This is an editorial-grade gaming experience brought to the domestic sphere.

---

## 2. Colors: High-Voltage Energy
The palette is rooted in a deep, void-like foundation (`surface`) to allow the electric accents to "pop" with cinematic intensity.

### The "No-Line" Rule
**Borders are prohibited for structural sectioning.** We do not use 1px solid lines to separate content. Instead, boundaries are defined by shifting between `surface-container-low` and `surface-container-high`. For example, a mission briefing area should sit as a raised `surface-container-highest` block against the `surface` background.

### Surface Hierarchy & Nesting
- **Level 0 (The Void):** `surface` (#0c0e17) – The base canvas.
- **Level 1 (The Deck):** `surface-container-low` (#11131d) – For large background regions.
- **Level 2 (The Module):** `surface-container-high` (#1c1f2b) – For primary content cards.
- **Level 3 (The Tactical Overlay):** `surface-container-highest` (#222532) – For active states or nested information.

### Signature Textures & The "Glass" Rule
- **The Metallic Shift:** For primary CTAs, use a linear gradient: `primary` (#97a9ff) to `primary-dim` (#3e65ff) at a 135-degree angle. This simulates a brushed-aluminum light reflection.
- **Glassmorphism:** Use `surface-variant` at 60% opacity with a `20px` backdrop-blur for floating HUD elements. This ensures the "dynamic particle backgrounds" remain visible, creating a sense of environmental depth.

---

## 3. Typography: The Futuristic Command
We pair the technical precision of **Space Grotesk** with the readability of **Manrope**.

- **Display (Space Grotesk):** Used for "Mission Titles" (e.g., "CLEAN THE QUARTERS"). Use `display-lg` (3.5rem) with `-0.05em` letter spacing to create a dense, authoritative "Heroic" feel.
- **Headlines (Space Grotesk):** Use `headline-md` for sub-tasks. Always uppercase when using `secondary` (#c67eff) colors to denote "Urgent Objectives."
- **Body (Manrope):** Use `body-lg` for descriptions. Manrope’s geometric nature maintains the tech aesthetic while ensuring kids can read instructions clearly.
- **Labels (Space Grotesk):** `label-md` is reserved for "XP Gains" and "Reward Tiers," paired with `tertiary` (Gold) colors to trigger the dopamine hit of a game reward.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "web-standard." We use **Ambient Glows**.

- **The Layering Principle:** Achieve lift by stacking. A `surface-container-highest` card on a `surface` background creates a natural 3D "slab" effect without a single shadow.
- **The Neon Underglow:** For floating "Legendary" items, use an ambient shadow: `blur: 40px`, `spread: -10px`, using the `primary` color at 15% opacity. This mimics a LED strip glowing beneath the UI component.
- **The Ghost Border Fallback:** If a separator is required for extreme density, use `outline-variant` (#464752) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: The Tactical Kit

### Buttons (The "Actuators")
- **Primary (Mission Start):** Gradient from `primary` to `primary-container`. Use `DEFAULT` (0.25rem) roundedness for a sharp, military-tech look. Add a `1px` inner-glow (top-down) using `on-primary` at 30% opacity.
- **Secondary (The Reward):** `tertiary` (#ffe792) background with `on-tertiary` text. Use this exclusively for "Claim Reward" actions.

### Mission Cards
Forbid divider lines. Separate the "Task Name" from the "XP Value" using a wide `spacing-8` gap or a background shift to `surface-bright`.
- **Active State:** Apply a `primary` outer glow and a subtle `0.5rem` scale-up transform on hover/touch.

### Progress HUDs (Gauges)
Instead of standard progress bars, use segmented blocks. Each segment should be a `surface-container-highest` box, filling with `secondary` (#c67eff) as tasks are completed.

### Dynamic Particles
Backgrounds should feature slow-moving, low-opacity particles using `primary-fixed-dim`. These shouldn't be interactive, but they provide the "living UI" feel found in modern PC game lobbies.

---

## 6. Do’s and Don’ts

### Do:
- **Use Intentional Asymmetry:** Align some headers to the left and reward badges to the far right with overlapping edges to break the "webpage" feel.
- **Embrace "Space":** Use `spacing-12` and `spacing-16` to let "Hero" elements breathe. High-end games never feel cramped.
- **Color-Code by Tier:** Use `primary` for standard tasks, `secondary` for daily streaks, and `tertiary` (gold) for ultimate rewards.

### Don't:
- **Never use pure white (#FFFFFF):** It breaks the cinematic immersion. Use `on-background` (#f0f0fd) for text.
- **Avoid 100% Opaque Borders:** This is the quickest way to make the design system look "cheap" or "standard."
- **No Circular Buttons:** Keep roundedness to `md` (0.375rem) or `lg` (0.5rem). Full circles feel "toy-like"; chamfered/slightly rounded corners feel like "hardware."

---

## 7. Interactive Feedback
Every interaction must have a visual "reaction." When a checkbox (The "Mission Toggle") is tapped, it shouldn't just show a checkmark—it should trigger a brief `primary` color flash and a `1.05x` scale pulse to signify "Objective Secured." Use the `error` (#ff6e84) palette only for "Mission Failed" or "Critical Overdue" warnings.```