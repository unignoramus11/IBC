/**
 * worlds.config.ts
 * ----------------
 * Contains the detailed configuration data for all interactive fiction worlds
 * used in the IBC Terminal functional fixedness research platform.
 */

// --- STRUCTURE DEFINITIONS (Repeat for clarity, or import from a shared types file) ---

export interface Item {
  name: string;
  description: string; // How it looks, feels, smells, and its typical function in this world.
}

export interface CharacterProfile {
  name: string;
  titleOrRole: string;
  appearance: string; // Detailed visual description, including clothing, gear, notable features.
  personalityTraits: string; // Core aspects: brave, cynical, meticulous, scatterbrained?
  quirksAndHabits: string; // Unique behaviors: humming, tapping, collecting specific things, chewing synth-gum?
  backstorySummary: string; // Condensed relevant history, motivations, secrets.
  likesDislikes: string; // What drives them and repulses them within their world.
  catchphrasesOrCurses: string[]; // Signature expressions reflecting their personality and world.
}

export interface Location {
  name: string; // e.g., "Neon Alleyways," "Great Hall," "Server Racks"
  description: string; // Multi-sensory description: sights, sounds, smells, textures, atmosphere.
}

export interface Puzzle {
  id: string;
  name: string; // More thematic name
  sceneDescription: string; // Vivid description of the puzzle's immediate surroundings and presentation. Set the stage.
  objective: string; // Clear goal for the puzzle itself.
  fixedFunctionObject: Item; // The object intended for unconventional use, fully described.
  solutionNarrative: string; // Describe the *act* of solving creatively, fitting the world's tone. How does it feel/look/sound?
  controlVariantHint: string; // Standard hint, embedded naturally within the narration's tone.
  experimentalVariantHint: string; // Priming hint, subtly woven into the scene description or character thought, fitting the tone.
  narrativeJustification: string; // Why solving this matters *right now* in the story, escalating stakes, matching tone.
}

export interface WorldDefinition {
  // Exporting the interface
  id: number;
  name: string;
  worldSetting: string; // Grand overview of the world's concept, history, and feel.
  atmosphere: string; // Dominant mood: oppressive, wondrous, decaying, chaotic?
  toneOfNarration: string; // Guidance for narrator: voice, pacing, emotional weight.
  character: CharacterProfile;
  startingInventory: Item[];
  mainObjectives: string[]; // High-level goals.
  plotPoints: string[]; // Key narrative beats, richer descriptions.
  keyLocations: Location[];
  puzzles: Puzzle[];
  controlVariantIntro: string; // Evocative opening narration for the control group.
  experimentalVariantIntro: string; // Evocative opening for the experimental group (can be same as control, priming is in puzzles).
}

// --- THE COMPLETE LIST OF 11 WORLD DEFINITIONS ---

export const worldDefinitions: WorldDefinition[] = [
  // Exporting the data array

  // --- World 0: Neo-Tokyo 2099 ---
  {
    id: 0,
    name: "Neo-Tokyo 2099",
    worldSetting:
      "A city drowning in its own neon glow, where chrome towers scrape a perpetually rain-slicked sky and tech integration is both salvation and curse. Megacorporations cast long shadows over crowded undercity streets, automated systems hum with unreliable life, and data flows like polluted water. Everything is connected, everything is vulnerable.",
    atmosphere:
      "Oppressive, technologically saturated, rain-soaked melancholy, flickering danger.",
    toneOfNarration:
      "Gritty Cyberpunk Noir. Narrator is world-weary, cynical but sharp. Pacing is tense, clipped during action, reflective during exposition. Emphasize the rain, the neon, the grime.",
    character: {
      name: 'Kai "Glitch" Tanaka',
      titleOrRole: "Freelance Infiltration Specialist / Ghost in the Machine",
      appearance:
        "Mid-30s, indeterminate age masked by cybernetics and shadows. Favors high collars hiding synth-skin grafts, low brims obscuring sharp eyes – one organic, one a faint amethyst cybernetic replacement that glows brighter when processing or annoyed. Moves with a predator's learned silence through urban clutter. Clad in dark, weather-resistant fabrics that blend into wet asphalt and dim alleys.",
      personalityTraits:
        "Hyper-observant, cautious, adaptable, deeply cynical about authority and corporations, tech-savvy but distrustful of overly complex systems. Resourceful under pressure.",
      quirksAndHabits:
        "Constantly scans surroundings (people, tech, exits). Chews synth-gum with intense focus. Fiddles endlessly with the interface of their datapad. Mutters technical curses under breath. Prefers synth-coffee, strong and stale.",
      backstorySummary:
        "Former corporate security auditor who uncovered unethical projects (possibly related to neural interfaces). Burned bridges, went underground, now survives job-to-job in the shadows, leaving subtle digital 'glitches' as a calling card. Operates on a code of professionalism but little personal loyalty.",
      likesDislikes:
        "Likes: Rooftop views at dawn, working tech (rare), anonymity, real ramen (rarer). Dislikes: Corporate suits, malfunctioning systems, unexpected surveillance, crowds, bright sunlight.",
      catchphrasesOrCurses: [
        "Scrap code!",
        "Oh, for the love of binary...",
        "System friction.",
        "Another glitch in the pattern.",
        "Just data rot.",
      ],
    },
    startingInventory: [
      {
        name: "Personal Datapad",
        description:
          "A worn, customized handheld interface. Cracked screen, augmented processor. Used for comms, hacking, data storage - your lifeline.",
      },
      {
        name: "ID Chip",
        description:
          "A sleek, metallic sliver containing your (currently flagged) identity. Essential for navigating basic checkpoints... usually.",
      },
      {
        name: "Credstick",
        description:
          "Standard currency device, thin black plastic. Reads 'Insufficient Funds'. A familiar state.",
      },
    ],
    mainObjectives: [
      "Breach the high-security perimeter of the TechCorp R&D tower.",
      "Acquire the prototype neural interface from the lab.",
      "Exfiltrate Neo-Tokyo before corporate security initiates a city-wide lockdown.",
      "Decide the fate of the prototype and the information surrounding it.",
    ],
    plotPoints: [
      "You're Kai 'Glitch' Tanaka, shadow operative. An anonymous client hires you via encrypted channels: snatch a neural prototype from TechCorp.",
      "Client claims TechCorp plans mass surveillance, mind control. The tech must see the light of day.",
      "Your insertion plan fizzles. Networked police drones flag your forged credentials mid-approach. Back to the drawing board, fast.",
      "Fixer Riku buzzes your datapad: try the maintenance corridors. Lower levels, less glam, maybe less scrutiny.",
      "While navigating TechCorp's digital entrails, fragmented data suggests your client's ties to BlackSun, infamous corp-terrorists.",
      "Security logs show recent failed intrusion attempts. You're not the only one hunting this prototype.",
      "Deep dive into project files reveals the prototype's intended purpose: therapeutic, restoring motor functions for neuro-degenerative conditions.",
      "Personal logs of the lead scientist express ethical concerns, pressure from higher-ups to explore 'alternative applications'.",
      "Your presence trips a silent alarm. Internal security begins systematic sweeps. The clock is ticking louder.",
      "The prototype itself is more advanced than briefed: contains an integrated tracker, dormant until removed from containment.",
      "Building lockdown protocol initiated. Magnetic locks slam shut on all standard exits. The walls close in.",
      "The dilemma crystallizes: deliver the potentially life-saving tech to potentially destructive hands, or expose BlackSun's interest to TechCorp, risking everything?",
    ],
    keyLocations: [
      {
        name: "Neo-Tokyo Undercity Streets",
        description:
          "A chaotic torrent of humanity and drones beneath towering arcologies. Neon signs bleed onto wet pavement, reflecting holographic ads. Air thick with rain, exhaust fumes, and a thousand competing broadcasts.",
      },
      {
        name: "TechCorp Maintenance Corridors",
        description:
          "Dimly lit tunnels snaking through the building's guts. Exposed pipes drip condensation, ventilation fans hum monotonously. Smells of ozone, lubricant, and stale air. Utilitarian and unwelcoming.",
      },
      {
        name: "TechCorp R&D Lab",
        description:
          "Sterile white environment, humming with latent technology. Containment fields glow softly. Robotic arms hang dormant. The air is cold, filtered, smelling faintly antiseptic. The prize is near.",
      },
      {
        name: "Corporate Lobby",
        description:
          "Vast, minimalist space designed to intimidate. Polished chrome reflects sterile lighting. Security drones patrol with silent efficiency. Every footstep echoes unnaturally loud.",
      },
    ],
    puzzles: [
      {
        id: "sliding-door",
        name: "The Impatient Portal",
        sceneDescription:
          "Ahead, a heavy maintenance corridor security door slides shut with pneumatic finality, far too quickly to slip through. Emergency lights cast flickering shadows on the greasy metal.",
        objective: "Keep the sliding door open long enough to pass through.",
        fixedFunctionObject: {
          name: "Personal Datapad",
          description:
            "Your worn handheld interface, typically used for hacking, communication, and data access.",
        },
        solutionNarrative:
          "No time for elegance. With a grunt, you ram the solid edge of your datapad into the closing door's track. Metal scrapes, the mechanism groans in protest, but it holds. A crude, effective wedge.",
        controlVariantHint:
          "The datapad chimes – low battery. Doesn't help that this door is faster than a street scammer.",
        experimentalVariantHint:
          "Down a side passage, you glimpse another door propped open... with a thin smartpad jammed underneath. Interesting technique. Your own datapad flashes low battery as the door ahead slams shut again.",
        narrativeJustification:
          "This corridor is the only unguarded route to the upper R&D levels. The door's rapid closure is a basic security feature. Fail here, and you face the main entrance – biometric scanners, armed guards, mission over.",
      },
      {
        id: "electric-panel",
        name: "The Dead Lift",
        sceneDescription:
          "The service elevator panel is dark, lifeless. Nearby, an electrical junction box hangs open, revealing a mess of disconnected circuits and scorch marks. The air smells faintly of burnt insulation.",
        objective: "Restore power to the service elevator.",
        fixedFunctionObject: {
          name: "ID Chip",
          description:
            "Your personal identification chip, metallic sliver normally slotted into readers for access.",
        },
        solutionNarrative:
          "You pinch the metallic ID chip between thumb and forefinger. Carefully aligning its exposed contacts with two specific terminals in the panel, you bridge the gap. A brief spark, a hum, and the elevator panel flickers to life.",
        controlVariantHint:
          "The elevator's dead. That open panel looks like the problem. Your ID chip glints under the emergency lights.",
        experimentalVariantHint:
          "Elevator offline. Open panel nearby. Across the hall, a maintenance worker uses the metal contacts on their own ID card to test continuity between two wires. Your ID chip feels metallic.",
        narrativeJustification:
          "The silent alarm disabled the main elevators. This service lift is off-network, but its power feed was recently damaged. Stairwells are now patrolled. This lift is the only viable path to the lab level without certain detection.",
      },
      {
        id: "biometric-scanner",
        name: "The Fingerprint Gate",
        sceneDescription:
          "The lab vault door is seamless, broken only by a biometric fingerprint scanner glowing expectantly. No keypad, no card slot. High security.",
        objective: "Bypass the fingerprint scanner without authorized prints.",
        fixedFunctionObject: {
          name: "Adhesive Bandage",
          description:
            "A common sterile bandage from a first-aid kit, sticky on one side, padded on the other. Meant for minor injuries.",
        },
        solutionNarrative:
          "Recalling the clear print you spotted on Dr. Nakamura's discarded coffee bulb, you peel an adhesive bandage from its wrapper. Pressing the sticky side firmly onto the print, you carefully lift it. Then, aligning it precisely, you apply the bandage to the scanner. The light flashes green.",
        controlVariantHint:
          "Fingerprint access only. A first-aid kit on the wall holds supplies, including bandages. The scanner surface shows faint smudges from previous use.",
        experimentalVariantHint:
          "The door needs a print. A security feed playing on a nearby monitor shows archival footage of a classic espionage technique: lifting prints from a glass using adhesive tape. A first-aid kit with bandages hangs nearby. The scanner is smudged.",
        narrativeJustification:
          "The prototype is inside this vault. Lockdown protocols demand physical biometric access – Dr. Nakamura's print. You found a sample, but need to transfer it. No print, no prototype, mission failure.",
      },
    ],
    controlVariantIntro:
      "Neo-Tokyo embraces you in its cold, wet, neon hug. Rain slicks the streets as you melt into the undercity shadows. TechCorp tower looms. Your mission begins now. Tools: basic. Wits: sharp. Luck: hopefully present.",
    experimentalVariantIntro:
      "Neo-Tokyo embraces you in its cold, wet, neon hug. Rain slicks the streets as you melt into the undercity shadows. TechCorp tower looms. Your mission begins now. Tools: basic. Wits: sharp. Luck: hopefully present.",
  },

  // --- World 1: Forgotten Castle ---
  {
    id: 1,
    name: "Forgotten Castle",
    worldSetting:
      "A skeletal stone fortress clinging to a windswept peak, swallowed by time and ivy. Centuries of legends whisper through its drafty halls, speaking of lost kings, forbidden magic, and treasures guarded by more than just crumbling walls. Fading enchantments pulse weakly, making reality here feel thin and haunted.",
    atmosphere:
      "Gothic, mysterious, melancholic, adventurous decay, tinged with faint magic.",
    toneOfNarration:
      "Gothic Fantasy Adventure. Narrator's voice is slightly hushed, respectful of the castle's age, but with an undercurrent of excitement for discovery and danger. Pacing allows for suspense and wonder.",
    character: {
      name: 'Ronan "Rusty" Thorne',
      titleOrRole: "Treasure Hunter / Relic Liberator",
      appearance:
        "Sturdy build, early 30s. Clad in worn leather armor over practical travelling clothes – functional, but clearly second-hand and meticulously patched. Perpetually messy brown hair escapes its bindings. A faded scar arcs across one cheekbone. Carries himself with a slightly reckless, optimistic stride.",
      personalityTraits:
        "Brave (bordering on foolhardy), optimistic, easily swayed by promises of riches, surprisingly resilient. Possesses a rough charm but lacks sophisticated graces. Generally good-natured but driven by the lure of treasure.",
      quirksAndHabits:
        "Whistles terribly off-key when nervous or concentrating. Taps the pommel of his dagger ('Pointy') for reassurance. Prone to exclaiming 'Shiny!' at valuable objects. Pokes suspicious things with Pointy first. Collects interesting-looking rocks.",
      backstorySummary:
        "Grew up on tales of the Forgotten Castle and its legendary crown. Eschewed traditional apprenticeships for the 'more practical' life of adventuring and treasure hunting. Seeks the Big Score to fund further expeditions (and perhaps settle down, maybe). Has a history of minor scrapes with cursed items ('Rusty' nickname origin).",
      likesDislikes:
        "Likes: Gold, gems, ancient artifacts, maps, campfire stories, meat pies. Dislikes: Ghosts (claims he's not scared, just 'respectful'), complex traps, magic users (unpredictable), being told what to do, vegetables.",
      catchphrasesOrCurses: [
        "Shiny!",
        "By the King's moldy boots!",
        "Pointy thinks this looks dodgy.",
        "Just a bit of dust...",
        "Did that gargoyle just blink?",
      ],
    },
    startingInventory: [
      {
        name: "Unlit Torch",
        description:
          "A sturdy wooden shaft topped with oil-soaked rags. Essential for dark places, currently dormant.",
      },
      {
        name: "Small Dagger ('Pointy')",
        description:
          "A well-maintained but plain dagger. Sharp edge, star-patterned carving on the hilt. More tool than weapon for Ronan.",
      },
      {
        name: "Empty Waterskin",
        description:
          "A dusty leather pouch, smells faintly of old water. Currently useless but represents hope for hydration.",
      },
    ],
    mainObjectives: [
      "Discover the location of the lost Crown of King Valerius.",
      "Uncover the truth behind the castle's sudden abandonment centuries ago.",
      "Find a means of escaping the castle before ancient magical barriers seal it permanently.",
      "Retrieve the crown (and survive the experience).",
    ],
    plotPoints: [
      "You're Ronan Thorne, drawn by legends of a magical crown hidden within these ruins. Locals warned you away, especially after sunset. You saw that as encouragement.",
      "Inside, decaying tapestries and journals hint at forbidden magic practiced by the last royal family.",
      "As twilight paints the sky purple, ancient sigils on the walls hum to life. Ethereal barriers shimmer into existence, sealing the exits. Trapped.",
      "Journal fragments speak of King Valerius's obsession: an immortality ritual centered on a rare gem set within his crown.",
      "The ritual went catastrophically wrong. The royals weren't killed, but trapped in a state between life and unlife, bound to the castle.",
      "Spectral remnants of guards and servants drift through the halls, performing mundane tasks, oblivious to their state or the passage of centuries.",
      "The magical barriers pulse with growing strength. Ancient wards are failing, soon the containment will be absolute, trapping you forever.",
      "The crown's gem appears to be the focal point of the failed ritual and the key to dissolving the barriers.",
      "A hidden passage beneath the throne reveals the horrifying truth: King Valerius, conscious but paralyzed in magical stasis.",
      "The crown presents a choice: complete the ritual (granting the king twisted immortality?) or unravel it, freeing the trapped souls but perhaps losing the treasure.",
      "Ancient magical guardians, constructs of stone and sorcery, animate to protect the ritual site, perceiving you as a threat.",
    ],
    keyLocations: [
      {
        name: "The Crumbling Courtyard",
        description:
          "Overgrown with thorny vines and weeds. Fallen statues lie half-buried in earth. Wind whistles through broken battlements. The air smells of damp stone and decay.",
      },
      {
        name: "The Great Hall",
        description:
          "Vast and echoing. Dust motes dance in shafts of light piercing the collapsed roof. Tattered banners hang like ancient ghosts. A massive fireplace stands cold and dark.",
      },
      {
        name: "The Royal Library",
        description:
          "Floor-to-ceiling shelves laden with rotting books and scrolls. Cobwebs drape everything. The air is thick with the scent of decaying paper and forgotten knowledge.",
      },
      {
        name: "The Hidden Ritual Chamber",
        description:
          "Located deep beneath the castle. Carved with disturbing arcane symbols. The air crackles with residual magic. A palpable sense of wrongness lingers here.",
      },
    ],
    puzzles: [
      {
        id: "ancient-lock",
        name: "The Star-Sealed Door",
        sceneDescription:
          "A heavy oak door bars the way to the library. It bears no conventional keyhole, only a deep, star-shaped indentation in the wood, intricately carved.",
        objective: "Open the door with the star-shaped lock.",
        fixedFunctionObject: {
          name: "Small Dagger ('Pointy')",
          description:
            "Your trusty sidekick, useful for cutting ropes, spreading butter, and occasional defense. Has a distinct star pattern carved into its hilt.",
        },
        solutionNarrative:
          "Looking closely, you realize the star pattern on Pointy's hilt perfectly matches the door's indentation. Inserting the hilt carefully, you feel tumblers shift. With a gentle twist, a soft *click* echoes in the hall. The door creaks open.",
        controlVariantHint:
          "That's no ordinary keyhole. Star-shaped... Pointy feels solid in its sheath, the hilt familiar in your hand.",
        experimentalVariantHint:
          "Star-shaped lock. On a nearby writing desk, an abandoned letter opener has an ornate star-shaped handle, clearly used to press a wax seal. Pointy's hilt has a similar, if simpler, star design...",
        narrativeJustification:
          "This door guards the Royal Library, containing King Valerius's journals detailing the ritual and the crown's hidden location. The unique lock was designed for security. No entry, no clues, no escape.",
      },
      {
        id: "broken-bridge",
        name: "The Chasm of Regret",
        sceneDescription:
          "The stone bridge crossing to the Eastern Tower has collapsed mid-span, leaving a three-foot gap over a deep, dark crevasse lined with jagged rocks below. The air is cold rising from the depths.",
        objective: "Cross the collapsed bridge safely.",
        fixedFunctionObject: {
          name: "Discarded Shield",
          description:
            "A large, circular metal shield leaning against the wall, dented and dusty. Typically used for deflecting blows.",
        },
        solutionNarrative:
          "Hefting the surprisingly heavy shield, you carefully position it flat across the gap. The metal groans but holds, creating a narrow, precarious bridge. Taking a deep breath, you shuffle across, trying not to look down.",
        controlVariantHint:
          "That drop looks final. The gap's maybe three feet... A discarded shield leans against the nearby wall.",
        experimentalVariantHint:
          "Nasty drop. In the Great Hall earlier, you saw a ghostly servant using a large, flat serving tray as a makeshift platform to carry spectral goblets between two tables. A shield leans against the wall here.",
        narrativeJustification:
          "The Eastern Tower houses the King's old laboratory and the Focusing Crystal needed to handle the crown's volatile magic safely. Trying to use the crown without it could be... explosive. This bridge is the only way.",
      },
      {
        id: "sealed-room",
        name: "The Airless Archive",
        sceneDescription:
          "This chamber door is seamless stone, no handle, no hinges visible. It feels unnaturally cool to the touch, and the air around it is completely still. Scrolls are visible through a small quartz window.",
        objective: "Find a way to open the magically sealed chamber.",
        fixedFunctionObject: {
          name: "Unlit Torch",
          description:
            "A standard adventurer's torch, currently unlit. Useful for providing light and warmth, or setting things on fire.",
        },
        solutionNarrative:
          "Striking flint and steel, you light the torch. Holding it near the door's edges, you watch the smoke. It doesn't dissipate evenly but is drawn towards almost invisible seams near the top and bottom – hidden air vents! Blocking and unblocking them in sequence causes a low hum, and a section of the wall silently slides open.",
        controlVariantHint:
          "No way in... sealed tight. Feels cool. Your torch could provide light, maybe more?",
        experimentalVariantHint:
          "Seamless door. In an adjacent chapel, smoke from incense burners drifts towards tiny, near-invisible ceiling vents, revealing hidden air currents. Your torch could make smoke...",
        narrativeJustification:
          "This archive contains the Court Magician's notes on *reversing* the immortality ritual safely. The room was sealed with an air-circulation system to preserve the delicate scrolls. Without these instructions, meddling with the crown could trap you alongside the royals.",
      },
    ],
    controlVariantIntro:
      "The Forgotten Castle looms, a silhouette against the dying light. Legends of treasure beckon you past the crumbling gate. Armed with little more than hope and your dagger Pointy, you step into the chilling silence.",
    experimentalVariantIntro:
      "The Forgotten Castle looms, a silhouette against the dying light. Legends of treasure beckon you past the crumbling gate. Armed with little more than hope and your dagger Pointy, you step into the chilling silence.",
  },

  // --- World 2: Chronos Station ---
  {
    id: 2,
    name: "Chronos Station",
    worldSetting:
      "A state-of-the-art deep space research station, now derelict and adrift in the void. Its advanced systems are failing, plunging corridors into emergency lighting. Worse, localized temporal anomalies ripple through its structure, causing time to dilate, contract, and fracture unpredictably.",
    atmosphere:
      "Tense, eerie, isolated, claustrophobic, unsettling temporal instability.",
    toneOfNarration:
      "Tense Sci-Fi Mystery/Thriller. Narrator's voice is calm but strained, reflecting the character's technical mindset battling growing unease and temporal weirdness. Pacing is deliberate, punctuated by sudden crises.",
    character: {
      name: "Dr. Aris Thorne",
      titleOrRole: "Freelance Salvage Engineer",
      appearance:
        "Late 30s/early 40s (hard to tell with the time distortions). Wears a practical, stained engineering jumpsuit over insulated layers. Sensible short haircut, pragmatic glasses that sometimes flicker in temporal fields. Looks competent but perpetually sleep-deprived.",
      personalityTraits:
        "Logical, methodical, calm under pressure (usually). Prefers problems solvable with tools and diagnostics. Highly skilled in systems engineering but deeply uncomfortable with the inexplicable temporal phenomena.",
      quirksAndHabits:
        "Taps impatiently on unresponsive consoles. Talks aloud to malfunctioning equipment ('Come on, you heap of circuits...'). Hums old Earth pop tunes ('Stayin' Alive' is a favorite) when stressed. Meticulously updates personal log on multitool.",
      backstorySummary:
        "Left corporate engineering after witnessing safety protocols bypassed for profit. Now takes independent salvage contracts. Has a reputation for meticulous work. Took the Chronos job for the challenge and the payout, unaware of the temporal experiments. Carries a holographic picture of a cat named Schrödinger.",
      likesDislikes:
        "Likes: Stable systems, clear diagnostics, working tools, real coffee (a rarity), quiet efficiency. Dislikes: Unexplained phenomena, temporal paradoxes, flickering lights, failing life support, corporate jargon.",
      catchphrasesOrCurses: [
        "Frak!",
        "Temporal shear...",
        "Diagnostics inconclusive.",
        "That's not in the manual.",
        "Okay, deep breath, analyze.",
      ],
    },
    startingInventory: [
      {
        name: "Emergency Beacon",
        description:
          "A handheld device designed to signal for rescue. Its status light is stubbornly dark. Currently inactive.",
      },
      {
        name: "Multitool",
        description:
          "A complex handheld device with various scanning, diagnostic, and manipulation attachments. Aris's most trusted possession.",
      },
      {
        name: "Oxygen Tank",
        description:
          "A standard-issue O2 tank, strapped to the suit. The gauge needle hovers worryingly near 'half-empty'.",
      },
    ],
    mainObjectives: [
      "Restore primary power to essential station systems.",
      "Investigate the fate of the station's crew.",
      "Secure a functional escape pod.",
      "Retrieve the valuable research data on temporal physics.",
      "Escape Chronos Station before its orbit decays completely or the temporal anomalies cause catastrophic failure.",
    ],
    plotPoints: [
      "You're Aris Thorne, salvage specialist. Your contract: retrieve research data from Chronos Station, which fell silent three months ago.",
      "Docking reveals the station is running on emergency power, and worse: localized time distortions warp sections of the interior.",
      "Orbital trajectory is decaying rapidly. You have hours, maybe days, before atmospheric entry.",
      "Ship's logs detail classified experiments in quantum entanglement and temporal physics, pushing theoretical boundaries.",
      "A cascading power failure during an experiment breached containment, unleashing unstable temporal fields.",
      "Disturbing evidence: some crew members seemingly aged decades in moments, others regressed to childhood. Time is broken here.",
      "Signs point to sabotage: a rogue research faction may have intentionally disabled safety protocols.",
      "The station's experimental quantum core is fluctuating dangerously, threatening a station-wide temporal collapse.",
      "You encounter unsettling sights: crew members frozen mid-action, trapped in localized time dilation bubbles.",
      "The station's AI is fragmented, its consciousness scattered across different temporal states, offering contradictory or nonsensical advice.",
      "The research data you seek contains breakthroughs in controlled temporal manipulation – revolutionary, if it can be recovered.",
      "Your path to escape: stabilize the core (partially), retrieve the data, find a viable escape pod, and navigate the worsening temporal maze.",
    ],
    keyLocations: [
      {
        name: "Central Hub",
        description:
          "The nexus connecting the station's main modules. Emergency lights cast long, flickering shadows. Status displays flash critical errors. Some corridors are sealed by crackling temporal barriers.",
      },
      {
        name: "Crew Quarters",
        description:
          "Personal spaces frozen in mid-panic. Belongings scattered, meals half-eaten. A disturbing tableau of interrupted lives. Some doors are warped shut by temporal stress.",
      },
      {
        name: "Quantum Physics Lab",
        description:
          "Filled with exotic equipment, much of it damaged or sparking erratically. Data slates litter the floor. The air hums with latent energy and the smell of ozone. Ground zero for the incident.",
      },
      {
        name: "Escape Pod Bay",
        description:
          "Rows of escape pods, most showing error lights or damage. Access requires navigating failing systems and potentially distorted time zones.",
      },
    ],
    puzzles: [
      {
        id: "radiation-barrier",
        name: "The Sizzling Corridor",
        sceneDescription:
          "A focused beam of intense, shimmering radiation cuts across the corridor ahead, originating from a cracked containment unit. Warning klaxons blare weakly, paint blisters on the walls near the beam.",
        objective: "Bypass the lethal radiation beam.",
        fixedFunctionObject: {
          name: "Metal Food Tray",
          description:
            "A standard-issue, slightly greasy metal tray from the galley. Used for carrying synth-meals.",
        },
        solutionNarrative:
          "Grabbing a discarded food tray from the galley, you hold it angled before you. Its metallic surface reflects the harsh emergency lights. Approaching the beam cautiously, you use the tray's reflective bottom to deflect the sizzling energy upwards, creating a momentary safe path underneath.",
        controlVariantHint:
          "That beam looks instantly lethal. A galley nearby contains standard equipment, including metal food trays.",
        experimentalVariantHint:
          "Lethal radiation beam. In an adjacent lab, a data screen displays simulations of using polished parabolic surfaces to redirect particle beams for experiments. The galley nearby has shiny metal trays.",
        narrativeJustification:
          "This corridor is the only route to the Quantum Physics Lab holding the primary research data cores. The beam is composed of exotic particles from the damaged temporal experiment; direct exposure is fatal. No data, no understanding the core, no escape.",
      },
      {
        id: "sealed-airlock",
        name: "The Lockdown Airlock",
        sceneDescription:
          "The airlock leading to the central hub is sealed tight, its control panel flashing a red 'QUARANTINE' alert. Nearby, a small maintenance access panel is flush with the wall, seemingly impossible to open without tools.",
        objective:
          "Open the maintenance panel to access the airlock's manual override.",
        fixedFunctionObject: {
          name: "Access Card",
          description:
            "A standard plastic station access card. Useless on the main electronic lock in this emergency state.",
        },
        solutionNarrative:
          "The card reader ignores your access card. Glancing at the tightly sealed maintenance panel, you try a different approach. You wedge the thin, stiff edge of the plastic access card into the panel's nearly invisible seam. Applying careful pressure, you use it as a makeshift pry bar, popping the panel cover loose.",
        controlVariantHint:
          "Airlock sealed, controls dead. That small panel nearby might hide an override, but it's shut tight. Your access card seems useless electronically.",
        experimentalVariantHint:
          "Airlock locked down. Nearby, a maintenance droid's log mentions using 'shim stock or equivalent flat plastic' to pop open stubborn access panels. Your plastic access card feels thin and rigid.",
        narrativeJustification:
          "This airlock connects to the station's central systems hub – essential for redirecting power to the escape pods and accessing navigation. Quarantine protocols sealed it due to the temporal anomalies. No access here, no escape possible.",
      },
      {
        id: "quantum-lock",
        name: "The Entangled Lock",
        sceneDescription:
          "The escape pod bay door is secured by a sophisticated quantum entanglement lock. The designated authentication device next to it is shattered, wires sparking feebly.",
        objective: "Bypass the quantum lock without the proper authenticator.",
        fixedFunctionObject: {
          name: "Portable Holographic Display",
          description:
            "A handheld device used for viewing schematics and station layouts. Currently functional, projecting a faint station map.",
        },
        solutionNarrative:
          "The authenticator is useless. Spotting a functional holographic display nearby, an idea sparks. Accessing the display's core functions, you attempt to reprogram its quantum projection system, feeding it algorithms derived from the lock's visible energy signature, trying to simulate the required entangled authentication pattern. The lock chirps... and disengages.",
        controlVariantHint:
          "Quantum lock, busted authenticator. A working holographic display sits on a nearby console.",
        experimentalVariantHint:
          "Quantum lock seals the door, authenticator fried. A nearby research note discusses the shared quantum principles between the station's holographic projectors and its advanced security systems. A functional holographic display rests nearby.",
        narrativeJustification:
          "This door protects the only viable escape pods. The quantum lock prevents unauthorized use, requiring a specific quantum state match. Temporal flux destroyed the opener. Simulate the handshake or remain trapped as the station falls.",
      },
    ],
    controlVariantIntro:
      "The airlock cycles shut, sealing you within the tomb-like silence of Chronos Station. Emergency lights cast a weak, flickering glow on corridors that hum with wrongness. Your mission: salvage data. Your new priority: survive.",
    experimentalVariantIntro:
      "The airlock cycles shut, sealing you within the tomb-like silence of Chronos Station. Emergency lights cast a weak, flickering glow on corridors that hum with wrongness. Your mission: salvage data. Your new priority: survive.",
  },

  // --- World 3: Subterranean Nexus ---
  {
    id: 3,
    name: "Subterranean Nexus",
    worldSetting:
      "A vast, interconnected network of colossal caverns deep beneath the Earth's surface, hiding the breathtaking ruins of a technologically advanced, long-lost civilization. Natural cave formations intertwine with megalithic architecture, crystal-based technology lies dormant, and the air hums with ancient, forgotten power.",
    atmosphere:
      "Awe-inspiring, mysterious, ancient, slightly claustrophobic, discovery-focused.",
    toneOfNarration:
      "Archaeological Adventure/Wonder. Narrator's voice conveys a sense of academic excitement mixed with caution and reverence for the ancient civilization. Pacing reflects careful exploration and sudden discoveries or dangers.",
    character: {
      name: "Professor Elara Vance",
      titleOrRole: "Archaeologist / Accidental Spelunker",
      appearance:
        "Early 40s, dressed in practical but slightly mud-stained expedition gear over a sensible tweed vest. Spectacles perpetually sliding down her nose. Hair escaping a practical bun. Carries a worn leather satchel overflowing with notebooks and tools.",
      personalityTraits:
        "Intensely curious, passionate about history, meticulous documentarian, slightly absent-minded regarding immediate physical danger. Prone to excited academic rambling. Fundamentally brave despite lack of survival training.",
      quirksAndHabits:
        "Sketches constantly in her notebook. Talks to herself while analyzing findings ('Remarkable harmonic resonance!'). Taps potential artifacts gently before touching. Adjusts glasses frequently. Occasionally forgets to eat or sleep when engrossed.",
      backstorySummary:
        "A dedicated archaeologist often ridiculed by peers for her 'fringe' theories about advanced prehistoric civilizations. Stumbled upon the Nexus entrance during a solo expedition, seeking validation. The subsequent cave-in trapped her, turning a research trip into a survival challenge.",
      likesDislikes:
        "Likes: Undiscovered ruins, decipherable glyphs, historical accuracy, lukewarm tea, quiet contemplation. Dislikes: Skeptical colleagues, cave-ins, bats (startling!), poor preservation conditions, guesswork.",
      catchphrasesOrCurses: [
        "Fascinating!",
        "By the Ancients!",
        "This requires documentation!",
        "Oh dear, structurally unsound?",
        "Must cross-reference this!",
      ],
    },
    startingInventory: [
      {
        name: "Rechargeable Lantern",
        description:
          "A modern LED lantern, sturdy casing. Its battery indicator is flashing a worrying amber light – low power.",
      },
      {
        name: "Coil of Rope",
        description:
          "About 50 feet of sturdy climbing rope, professionally coiled. Essential for exploration, hopefully.",
      },
      {
        name: "Energy Bar",
        description:
          "A foil-wrapped bar of compressed nutrients and dubious flavor. Marked 'Emergency Ration - Last One'.",
      },
    ],
    mainObjectives: [
      "Reactivate the dormant ancient transportation network within the Nexus.",
      "Locate and access the central archive containing the civilization's historical records and maps.",
      "Discover a viable exit route back to the surface.",
      "Escape the Subterranean Nexus before increasing geological instability causes a total collapse.",
    ],
    plotPoints: [
      "You're Professor Vance, archaeologist. You found it – a hidden entrance! Moments after descending, a tremor seals the way back. Trapped.",
      "The caverns reveal wonders: ruins of a civilization far advanced beyond ancient surface dwellers. They retreated underground millennia ago.",
      "Their technology seems alien: crystal power, sonic manipulation, harmonic resonance. Nothing like modern science.",
      "Evidence suggests a vast, dormant transportation network connects distant parts of the Nexus – potentially leading to other exits.",
      "Intricate glyphs and murals depict the civilization's history, their retreat, and hints of their ultimate fate.",
      "The technology lies dormant but seems responsive. Reactivation sequences might be hidden in the architecture or records.",
      "Deeper exploration uncovers startling research: experiments in interdimensional travel, perhaps an escape from their subterranean world.",
      "Journal fragments, preserved by the stable environment, suggest successful travel. Did they die out, or simply... leave?",
      "A central archive chamber is rumored to hold their complete history, technological knowledge, and – crucially – maps of all surface access points.",
      "Periodic, worsening tremors shake the caverns. Passages crumble. The entire Nexus is becoming unstable.",
      "Your path is clear: activate the transport, reach the archive, find an exit map, and get out before you become a permanent exhibit.",
    ],
    keyLocations: [
      {
        name: "The Great Cavern",
        description:
          "An immense natural cavern adapted by the ancient civilization. Stalactites drip onto sculpted plazas. Bioluminescent fungi cast an ethereal glow on structures blending seamlessly with stone.",
      },
      {
        name: "The Silent City",
        description:
          "Buildings carved from bedrock and assembled from unknown metal alloys. Wide avenues stand empty. Strange geometric symbols adorn walls. Dormant machinery waits in public squares.",
      },
      {
        name: "The Crystal Gardens",
        description:
          "Caverns filled with colossal, luminous crystals of various hues. Some appear naturally grown, others cultivated into intricate patterns. They emit soft hums and react subtly to light and sound.",
      },
      {
        name: "The Central Archive (location)",
        description:
          "Said to be the Nexus's heart, protected by ancient technology. Believed to hold records etched into indestructible crystal shards.",
      },
    ],
    puzzles: [
      {
        id: "crystal-lock",
        name: "The Light Harmonizing Lock",
        sceneDescription:
          "A massive stone door blocks entry to the Transport Control Room. It has no handle, only a series of crystalline receptors embedded in its surface, currently dark and inert.",
        objective:
          "Activate the door mechanism using specific light wavelengths.",
        fixedFunctionObject: {
          name: "Empty Water Bottle",
          description:
            "A standard plastic water bottle, currently empty and lightweight. Used for hydration.",
        },
        solutionNarrative:
          "Finding a dripping stalactite, you fill the empty water bottle. Holding it in the beam of your failing lantern, you carefully angle it. The water acts as a lens, splitting the light into a faint spectrum. By adjusting the angle, you direct specific colors onto the crystalline receptors. They glow in sequence, and the stone door grinds open.",
        controlVariantHint:
          "The door seems light-activated, but your lantern beam alone isn't enough. Crystals... water... Your water bottle is empty.",
        experimentalVariantHint:
          "The door's crystals seem to want specific light. Nearby, water trickling over a quartz vein catches the ambient fungi-light, splitting it into faint rainbows on the wall. Your empty water bottle could hold water...",
        narrativeJustification:
          "This door guards the Transport Control Room. Their security used light harmonics, not keys. Accessing these controls is the only way to activate the transport platforms – your sole means of reaching distant chambers and potential exits before collapse.",
      },
      {
        id: "sound-canyon",
        name: "The Resonant Chasm",
        sceneDescription:
          "A chasm too wide to leap cuts across the passage. Strange, pillar-like rock formations line the walls, seeming to hum faintly. Across the chasm lies the entrance to the Historical Archives.",
        objective: "Activate the hidden sonic bridge to cross the chasm.",
        fixedFunctionObject: {
          name: "Empty Metal Container",
          description:
            "A small, cylindrical metal container, perhaps once held food or samples. Lightweight but resonant.",
        },
        solutionNarrative:
          "Recalling glyphs depicting sonic manipulation, you tap the empty metal container against various rock formations. Different tones echo. Striking a specific pillar produces a pure, ringing note. Across the chasm, shimmering lines of force solidify into a translucent bridge of sound.",
        controlVariantHint:
          "Deep chasm. Those rocks look... weird. Almost musical. An empty metal container lies near your feet.",
        experimentalVariantHint:
          "Wide chasm. Nearby, water dripping onto differently shaped stalactites creates distinct musical pitches. Some tones cause faint shimmering in the air above the chasm. An empty metal container rests nearby.",
        narrativeJustification:
          "The chasm separates you from the Historical Archives containing transport activation codes and surface maps. The sound-bridge requires specific resonant frequencies, common knowledge to the builders. Create the right tune or remain stranded.",
      },
      {
        id: "pressure-plates",
        name: "The Synchronized Floor",
        sceneDescription:
          "The entrance to the Power Core chamber is blocked by a heavy door. Before it, the floor has several large, smooth stone plates that depress when stepped on, but immediately rise again when weight is removed.",
        objective:
          "Activate all pressure plates simultaneously to open the door.",
        fixedFunctionObject: {
          name: "Thick Leather-Bound Journal",
          description:
            "Your archaeological journal, filled with notes and sketches. Its pages are numerous and stiff.",
        },
        solutionNarrative:
          "You need to weigh down all plates at once. Tearing several pages from your precious journal (a painful sacrifice!), you quickly fold them into dense, rigid bundles. Placing one folded bundle carefully onto each pressure plate holds them down simultaneously. A mechanism clicks, and the Power Core door rumbles open.",
        controlVariantHint:
          "These floor plates need simultaneous weight. Stepping off one lets it rise. Your backpack contains your thick journal.",
        experimentalVariantHint:
          "Plates need simultaneous pressure. In a side chamber, you saw delicate artifacts propped up on complexly folded pieces of ancient, stiff parchment used as stands. Your journal has many stiff pages...",
        narrativeJustification:
          "This mechanism guards the Power Core chamber, the energy source for the entire Nexus. It was designed for multiple authorized personnel. You need to redirect power to the transport system. Activate all plates or stay powerless and trapped.",
      },
      {
        id: "revealing-hidden-glyphs", // Renamed ID slightly for uniqueness
        name: "The Water-Activated Glyphs",
        sceneDescription:
          "A smooth stone wall displays a complex star chart, likely navigational. Faint lines suggest additional glyphs, almost invisible, perhaps revealing exit coordinates. The air here is exceptionally dry.",
        objective: "Reveal hidden glyphs on the star chart wall.",
        fixedFunctionObject: {
          name: "Empty Canteen",
          description:
            "Your standard-issue canteen, currently empty after potential previous water use.",
        },
        solutionNarrative:
          "Remembering how water interacted with carvings before, you find a source to refill your canteen. Carefully, you splash water across the smooth stone wall. As the water darkens the porous stone, previously invisible glyphs, carved shallower than the main chart, absorb the water differently and stand out clearly, revealing coordinates.",
        controlVariantHint:
          "More glyphs seem hidden on this wall chart. They're almost invisible. The air is very dry. Your canteen is empty.",
        experimentalVariantHint:
          "Faint glyphs hide on the wall. You recall ancient desert cultures used water to reveal subtle messages carved in sun-baked clay. Your canteen could hold water...",
        narrativeJustification:
          "This star chart, once fully revealed, shows the precise alignment needed to activate the final transport sequence leading to a known surface exit. Without these hidden coordinates, you might activate the transport but end up in an unexplored (and likely collapsed) section of the Nexus.",
      },
    ],
    controlVariantIntro:
      "The tunnel collapses behind you. Before you stretches a vast, silent cavern lit by glowing fungi, revealing structures no human hand built for millennia. Your lantern beam cuts through the ancient dark. You are trapped, yet on the verge of the discovery of a lifetime.",
    experimentalVariantIntro:
      "The tunnel collapses behind you. Before you stretches a vast, silent cavern lit by glowing fungi, revealing structures no human hand built for millennia. Your lantern beam cuts through the ancient dark. You are trapped, yet on the verge of the discovery of a lifetime.",
  },

  // --- World 4: Ethereal Planes ---
  {
    id: 4,
    name: "Ethereal Planes",
    worldSetting:
      "A non-physical dimension formed from the collective unconscious, where thoughts manifest, emotions paint the landscape, and the laws of physics are mere suggestions. It's a shifting dreamscape, beautiful and terrifying, existing at the intersection of all minds.",
    atmosphere:
      "Surreal, dreamlike, unstable, mentally taxing, potentially wondrous or horrifying.",
    toneOfNarration:
      "Existential Surrealism. Narrator's voice is slightly detached, reflecting the character's struggle to maintain coherence. Pacing is fluid, sometimes disorienting, mirroring the shifting reality. Emphasize sensory confusion and internal thought processes.",
    character: {
      name: "Dr. Evelyn Reed (formerly Subject 7)",
      titleOrRole: "Consciousness Researcher / Accidental Mind-Traveler",
      appearance:
        "Late 30s. Her form shimmers subtly, physical appearance wavering based on mental state. Often defaults to a lab coat over simple clothes, but details blur and reform. Eyes reflect the swirling energies of the plane. Looks intensely focused, borderline frantic.",
      personalityTraits:
        "Highly analytical, driven, intelligent, relies heavily on logic. Now struggling to apply logic to a fundamentally illogical realm. Prone to existential anxiety but possesses strong willpower.",
      quirksAndHabits:
        "Clutches her Reality Anchor talisman constantly. Pinches herself (with inconsistent results). Scribbles frantic notes on phantom paper that dissipates. Takes deep, deliberate breaths to center herself. Mutters scientific principles like mantras.",
      backstorySummary:
        "Lead researcher on an experimental consciousness-transfer project. A power surge during a test unexpectedly projected her mind into the Ethereal Planes, leaving her physical body comatose in the lab. Driven by scientific curiosity, possibly also seeking something personal within the nature of consciousness.",
      likesDislikes:
        "Likes: Order, data, verifiable results, logic, stable environments, silence. Dislikes: Chaos, uncertainty, paradoxes, intrusive thoughts (especially others'), losing control, the feeling of dissolution.",
      catchphrasesOrCurses: [
        "Focus, Evelyn!",
        "Logically... illogical!",
        "Quantify the subjective...",
        "Maintain coherence.",
        "Get out of my head!",
      ],
    },
    startingInventory: [
      {
        name: "Reality Anchor",
        description:
          "A small, multifaceted crystalline device designed to help maintain mental cohesion in unstable dimensions. It pulses with a weak, flickering light – power dwindling.",
      },
      {
        name: "Memory Crystal",
        description:
          "A smooth, warm crystal shard containing a vital piece of personal memory, crucial for maintaining self-identity. Feels important.",
      },
      {
        name: "Emotion Vial",
        description:
          "A small, empty glass vial stoppered with psionically conductive material. Designed to capture and hold raw emotional essence.",
      },
    ],
    mainObjectives: [
      "Stabilize her mental presence against the plane's dissolving influence.",
      "Locate the Nexus of Consciousness, a theoretical focal point within the Ethereal Planes.",
      "Discover a method to safely return her consciousness to her physical body.",
      "Achieve return before her mind fully merges with the collective mindscape or her body expires.",
    ],
    plotPoints: [
      "You are Dr. Evelyn Reed. Your consciousness-transfer experiment went sideways. Your mind is now adrift in the Ethereal Plane; your body lies inert back in the lab.",
      "This realm is woven from thought. Reality shifts with emotion and intent. Your own mind is both your vessel and your prison.",
      "Time flows like syrup here, inconsistently. Hours might be seconds, or vice versa. Prolonged disconnection risks permanent severance from your body.",
      "The plane reacts to your mental state. Fear manifests obstacles; focused will can sometimes reshape your surroundings, briefly.",
      "Other entities drift here: fellow travelers, native thought-constructs, spectral predators, and lost souls who've forgotten their origins.",
      "Fragments of your own memories take tangible, sometimes distorted, form around you. Familiar faces whisper forgotten words.",
      "Whispers speak of ancient beings, the Thought Architects, who supposedly maintain the structure of this chaotic realm.",
      "You feel your sense of self fraying. Memories blur, core personality traits become harder to grasp. Dissolution looms.",
      "Legends among the lost souls mention a Nexus of Consciousness – a potential exit point, or perhaps the plane's control center.",
      "Your coherent, anchored consciousness is like a beacon, attracting entities. Some are curious, some hungry, some seek to hijack your connection back to the physical.",
      "Your Reality Anchor helps maintain your identity, but its power fades with every psychic ripple.",
      "Navigate this labyrinth of pure mind, confront manifested fears, conserve your anchor's power, and reach the Nexus before 'Evelyn Reed' ceases to exist.",
    ],
    keyLocations: [
      {
        name: "The Memory Fields",
        description:
          "Vast plains where memory fragments drift like luminous pollen. Landscapes subtly shift, reflecting dominant recollections – yours and others'. Smells faintly of nostalgia or regret.",
      },
      {
        name: "The Forest of Dreams",
        description:
          "Towering trees formed of crystallized dreams grow in impossible, shifting geometries. Branches phase into other realities. Creatures born of collective subconscious flit between shimmering trunks.",
      },
      {
        name: "The Sea of Emotion",
        description:
          "An endless ocean of swirling psychic energy. Its colors and viscosity change constantly with the ebb and flow of collective feeling – shifting from tranquil blue calm to stormy crimson rage.",
      },
      {
        name: "The Nexus of Consciousness (Goal)",
        description:
          "A theoretical point of immense psychic convergence, possibly a stable gateway or the plane's core. Its nature is unknown, described only in fractured whispers.",
      },
    ],
    puzzles: [
      {
        id: "thought-barrier",
        name: "The Bulwark of Doubt",
        sceneDescription:
          "A churning, semi-tangible wall of swirling grey and black energy blocks the path forward. It seems to pulse in time with your own anxieties, growing darker and more solid when you feel fear or uncertainty.",
        objective: "Dissipate the barrier formed from negative emotions.",
        fixedFunctionObject: {
          name: "Small Hand Mirror",
          description:
            "A simple polished object, typically used for viewing one's reflection.",
        },
        solutionNarrative:
          "Recognizing the barrier feeds on projected negativity, you hold up the small mirror. Angling it carefully, you reflect the churning wall of doubt back onto itself. The barrier shimmers, falters, seemingly confused by its own reflection, and rapidly dissipates into harmless mist.",
        controlVariantHint:
          "This wall feels... personal. Like it's made of your own fears. It strengthens when you doubt. You have a mirror in your pocket.",
        experimentalVariantHint:
          "The wall of doubt pulses. Nearby, a pool of still psychic energy reflects a similar, smaller wisp of negativity, causing the wisp to ripple and dissolve. Your mirror is reflective.",
        narrativeJustification:
          "This barrier, manifested from your own subconscious, blocks the path to the Memory Sanctum where vital fragments of your identity are stored. These fragments are dissolving; retrieving them is essential to maintaining coherence. The barrier actively resists direct mental assault.",
      },
      {
        id: "dream-lock",
        name: "The Lock of Lost Memories",
        sceneDescription:
          "An ornate doorway seems woven from solidified memories, shimmering and shifting. In its center is a receptacle that pulses softly, expectantly. Wisps of memory float through the air like dust motes.",
        objective: "Unlock the door using ambient memory fragments.",
        fixedFunctionObject: {
          name: "Empty Emotion Vial",
          description:
            "A glass vial designed to capture and hold psychic or emotional essence. Currently empty.",
        },
        solutionNarrative:
          "Uncorking the empty vial, you gently wave it through the air, concentrating. The floating memory fragments are drawn towards it, coalescing inside as a swirling mist of light. Once filled, you carefully pour the captured essence into the door's receptacle. It absorbs the memories with a soft chime, and the doorway dissolves.",
        controlVariantHint:
          "This door seems locked by memory itself. Fragments drift nearby. Your empty vial feels like it could hold... something intangible.",
        experimentalVariantHint:
          "Memory-woven door. Nearby, a serene thought-form uses a shimmering net woven of light to gently capture floating memory motes, later releasing them into patterned receptacles on a wall. Your empty vial seems designed for capture.",
        narrativeJustification:
          "This door protects the Anchor Forge, a place where you can potentially recharge your fading Reality Anchor. Strengthening the anchor is critical to prevent complete dissolution. The lock requires demonstrating basic manipulation of the plane's memory essence.",
      },
      {
        id: "reality-flux",
        name: "The Chasm of Unbeing",
        sceneDescription:
          "The pathway ahead abruptly ends, fractured by a chasm filled with swirling, non-Euclidean geometry and patches of pure void. The chasm's width constantly expands and contracts unpredictably.",
        objective: "Stabilize the shifting chasm long enough to cross.",
        fixedFunctionObject: {
          name: "Reality Anchor",
          description:
            "Your crystalline device used to maintain personal mental stability against the plane's chaotic influence.",
        },
        solutionNarrative:
          "Normally you'd hold the Anchor close for stability. Instead, focusing your will, you carefully place the Anchor directly onto the fractured edge of the pathway *itself*. The device hums, projecting its stabilizing field onto the chasm, forcing the immediate area into a fixed, stable state for a precious few moments – long enough to dash across.",
        controlVariantHint:
          "The path ahead keeps breaking into a reality-bending chasm. Your Anchor usually helps keep *you* stable, but maybe it can affect the environment too?",
        experimentalVariantHint:
          "The path fractures into chaos. In another region, you observed a fellow traveler place a similar anchoring device not on themselves, but onto a piece of shifting debris, causing the debris to momentarily solidify. Your Anchor pulses weakly.",
        narrativeJustification:
          "This chaotic rift separates you from the region where whispers say the Nexus of Consciousness resides. Crossing it is impossible while it remains unstable. Reaching the Nexus is your only hope for finding a way back before your physical body fails.",
      },
    ],
    controlVariantIntro:
      "You coalesce into... something. Colors bleed, shapes flow, the ground is suggestion. Welcome to the Ethereal Planes. Your thoughts echo in the psychic static. Hold onto yourself. Your body waits, worlds away.",
    experimentalVariantIntro:
      "You coalesce into... something. Colors bleed, shapes flow, the ground is suggestion. Welcome to the Ethereal Planes. Your thoughts echo in the psychic static. Hold onto yourself. Your body waits, worlds away.",
  },

  // --- World 5: The Late Night Office (SHORT) ---
  {
    id: 5,
    name: "The Late Night Office (SHORT)",
    worldSetting:
      "A mundane office building after hours. The main lights are off, replaced by the cold hum of emergency lighting. Automated systems have locked down, leaving the corridors silent except for the ticking clock and the gentle hum of servers. Everything is familiar, yet slightly alienating in the emptiness.",
    atmosphere:
      "Quiet tension, mundane realism, slightly desperate, low-stakes claustrophobia.",
    toneOfNarration:
      "Dryly Comedic Realism. Narrator captures the character's mounting frustration and the absurdity of the situation. Pacing is steady, reflecting the slow passage of time, punctuated by small, frantic actions.",
    character: {
      name: "Brenda Perks",
      titleOrRole: "Mid-Level Analyst / Accidental Overnight Guest",
      appearance:
        "Mid-30s, dressed in standard office attire (blouse, slacks) now looking crumpled. Hair escaping a practical bun. Dark circles under her eyes from overwork. Sensible, slightly scuffed shoes.",
      personalityTraits:
        "Practical, organized, usually calm under pressure (work pressure, that is). Prone to exasperated sighs. Increasingly stressed and desperate as the situation sinks in. Not typically mechanically inclined.",
      quirksAndHabits:
        "Paces when stressed. Talks aloud to inanimate objects (especially the locked door). Clutches her empty coffee mug like a lifeline. Checks her dead phone habitually. Sighs frequently.",
      backstorySummary:
        "A diligent employee who stayed late to finish a critical report, losing track of time. Has an important family commitment early the next morning she absolutely cannot miss. Generally follows rules, not used to improvising solutions.",
      likesDislikes:
        "Likes: Completed spreadsheets, quiet mornings (at home), strong coffee, reliable schedules. Dislikes: Automated systems (currently), dead batteries, locked doors, unexpected overtime, the smell of burnt microwave popcorn.",
      catchphrasesOrCurses: [
        "Oh, for Pete's sake!",
        "Seriously?!",
        "You have *got* to be kidding me.",
        "I just wanna go home!",
        "Okay, Brenda, think.",
      ],
    },
    startingInventory: [
      {
        name: "Paperclip",
        description:
          "A standard small metal paperclip, slightly bent. Used for holding papers.",
      },
      {
        name: "Plastic Ruler (30cm)",
        description:
          "A clear plastic ruler with centimeter and inch markings. Rigid but slightly flexible. Used for drawing straight lines.",
      },
      {
        name: "Empty Coffee Mug",
        description:
          "A ceramic mug with a corporate logo, stained faintly brown inside. Currently providing zero caffeine but significant moral support.",
      },
    ],
    mainObjectives: [
      "Find a way to bypass the electronically and mechanically locked main exit door.",
      "Escape the office building before morning.",
    ],
    plotPoints: [
      "You're Brenda. Working late. Too late. CLICK. The main lights die, replaced by dim emergency ones. CLUNK. The main exit door's magnetic lock engages.",
      "Silence. You're alone. Security left hours ago. No one's due back until 6 AM.",
      "Your phone? Dead. The desk phone? Needs an after-hours security code you don't possess.",
      "The building's climate control is off. The air is getting still and slightly stuffy.",
      "That family breakfast at 7 AM tomorrow? Missing it is unthinkable. Panic begins to set in.",
      "Dim recollection... orientation mentioned emergency overrides? Something about fires? Details are annoyingly vague.",
      "Logic dictates there must be manual releases for power failures. Somewhere.",
      "A half-emptied cleaning cart sits abandoned. Did the cleaner leave in a hurry?",
      "Near the security desk, a glint of metal under a floor grate... Is that a key?",
      "The employee handbook mentioned the main doors have *both* electronic locks and a manual emergency release.",
      "Security cameras are likely recording your impending escape attempt (or embarrassing failure).",
      "Right. Ordinary office supplies. Time to get creative. How hard can it be?",
    ],
    keyLocations: [
      {
        name: "The Office Floor",
        description:
          "Rows of darkened cubicles and desks under the stark emergency lighting. Monitors are black mirrors. Long shadows make familiar shapes seem strange. Smells faintly of stale coffee and carpet cleaner.",
      },
      {
        name: "Security Desk Area",
        description:
          "A small alcove near the main exit. A disabled security monitor sits dark. A floor grate is set into the tile nearby. This seems like a key area.",
      },
      {
        name: "The Main Exit",
        description:
          "Large glass doors, unyielding. The magnetic lock indicator glows red. High on the wall beside it, a red emergency release button sits behind a protective wire mesh cage.",
      },
    ],
    puzzles: [
      {
        id: "key-retrieval",
        name: "The Grate Escape Key",
        sceneDescription:
          "Looking down through the narrow metal floor grate near the security desk, you see it: a small, shiny brass key, labeled 'OVERRIDE'. It's tantalizingly close, but the gaps are far too small for your fingers.",
        objective: "Retrieve the key from beneath the floor grate.",
        fixedFunctionObject: {
          name: "Paperclip",
          description:
            "A standard office paperclip, designed for temporarily binding sheets of paper.",
        },
        solutionNarrative:
          "Frustration mounting, you grab a paperclip from the desk. Straightening it out, you carefully bend a small hook onto one end. Kneeling, you painstakingly fish the hook through the grate, snagging the key ring after several tries. You pull it up slowly, heart pounding.",
        controlVariantHint:
          "The key's right there! If only you could reach it... Fingers are too big. A box of paperclips sits on the desk.",
        experimentalVariantHint:
          "Key under the grate. Lying near the edge of the grate is another paperclip, bent into a crude hook shape, as if someone else tried (and maybe failed?). A fresh box of paperclips sits invitingly on the desk.",
        narrativeJustification:
          "This override key is essential for disengaging the main door's *electronic* lock system. Emergency procedures state this key must be used first. Without it, the manual release won't work. Calling security means explaining this mess.",
      },
      {
        id: "button-press",
        name: "The Uncooperative Button",
        sceneDescription:
          "The final step: the manual release. A large red button mounted high on the wall near the exit, safely behind a sturdy wire mesh. It's just high enough that reaching it comfortably, let alone pressing it effectively through the mesh, seems impossible.",
        objective: "Press the manual emergency release button.",
        fixedFunctionObject: {
          name: "Plastic Ruler (30cm)",
          description:
            "A standard office ruler, used for measuring lengths and drawing straight lines.",
        },
        solutionNarrative:
          "Stretching on tiptoe is useless. You grab the plastic ruler from a nearby desk. Holding it firmly, you poke the rigid end through an opening in the wire mesh, aiming carefully. With a satisfying *click*, the ruler presses the button.",
        controlVariantHint:
          "Okay, key used. Now that button... It's high up, and behind mesh. How to poke it? A plastic ruler lies on that messy desk over there.",
        experimentalVariantHint:
          "The red button behind mesh, just out of reach. You notice faint scuff marks on the wall paint right below it, consistent with something long and thin being used to poke it before. A plastic ruler lies on a nearby table.",
        narrativeJustification:
          "With the electronic lock disabled by the key, this button disengages the physical, mechanical locks on the door. It's placed high and behind mesh to prevent accidental activation during work hours. No press, no escape.",
      },
    ],
    controlVariantIntro:
      "Click. CLUNK. The office plunges into dimness. The heavy lock on the main door engages. You hear the silence settle. You're locked in. Okay, Brenda. Don't panic. Just... find a way out.",
    experimentalVariantIntro:
      "Click. CLUNK. The office plunges into dimness. The heavy lock on the main door engages. Earlier, you saw the cleaner poke at a high vent with a broom handle and fiddle near a floor grate with some wire... maybe useful? You're locked in.",
  },

  // --- World 6: Server Room Glitch (SHORT) ---
  {
    id: 6,
    name: "Server Room Glitch (SHORT)",
    worldSetting:
      "A university server room after hours. Racks of humming machines fill the space, cooled by a low, constant drone of air conditioning. Cables snake across floors and ceilings. After a power fluctuation, the heavy main door is sealed, the network connection is dead, and the main console displays only a cryptic error.",
    atmosphere:
      "Confined, technical, urgent, slightly cool becoming warm, low hum.",
    toneOfNarration:
      "Technical Thriller/Problem Solving. Narrator reflects the character's logical thought process, the urgency of the situation, and the technical details. Pacing is quick during problem-solving, tense during setbacks.",
    character: {
      name: "Alex Chen",
      titleOrRole: "Computer Science Student / Trapped Debugger",
      appearance:
        "Early 20s, wearing a university hoodie, jeans, and slightly smudged glasses. Looks tired but alert, focused. Hair is slightly messy from running hands through it.",
      personalityTraits:
        "Logical, analytical, persistent, code-focused. More comfortable with software than hardware but willing to learn/improvise. Gets stressed but channels it into problem-solving.",
      quirksAndHabits:
        "Taps fingers rhythmically when thinking. Pushes glasses up nose frequently. Mutters technical terms and code snippets. Sometimes narrates problem-solving steps aloud quietly. Drinks copious amounts of caffeinated beverages (none available now).",
      backstorySummary:
        "A bright CompSci student working late on a critical research project deadline. Authorized access to the server room. Experienced a sudden power surge that triggered the emergency lockdown. Now needs to apply theoretical knowledge to a very physical problem.",
      likesDislikes:
        "Likes: Elegant code, fast processors, stable networks, solved bugs, logical consistency, caffeine. Dislikes: Kernel panics, hardware failures, locked doors, poor cable management, illogical situations (like this one).",
      catchphrasesOrCurses: [
        "Segmentation fault!",
        "Okay, what's the state?",
        "Root cause analysis...",
        "Right, dependencies...",
        "Binary solution needed.",
      ],
    },
    startingInventory: [
      {
        name: "Ethernet Cable (3m)",
        description:
          "A standard blue network cable with RJ45 connectors. Currently unplugged and useless for its intended purpose.",
      },
      {
        name: "Blank CD-R",
        description:
          "A shiny, blank compact disc, reflective surface. Meant for burning data.",
      },
      {
        name: "USB Stick",
        description:
          "A small, generic USB flash drive. FAT32 formatted, currently empty.",
      },
    ],
    mainObjectives: [
      "Locate and successfully activate the manual door release mechanism.",
      "Escape the server room before the limited backup power fails.",
    ],
    plotPoints: [
      "You're Alex, CompSci student. Pulling an all-nighter debugging code in the server room.",
      "Zap! Power flickers violently. Systems crash. CLUNK. The heavy security door slams shut and locks. Network connection drops.",
      "The main KVM terminal freezes, displaying only: 'Kernel panic - not syncing: VFS: Unable to mount root fs...'. Utterly unresponsive.",
      "Emergency lights kick in, bathing the racks in a low, humming glow. Backup power is active, but finite.",
      "Your student access card? Denied. Security protocols override standard access during emergencies.",
      "Cell service? Zero bars. The room is effectively a Faraday cage. Landline phone needs the dead network.",
      "Vague memory... orientation tour... guide mentioned a manual override panel near the door? Didn't pay attention then.",
      "No one's coming. IT won't be back till morning. Campus security doesn't check locked server rooms.",
      "Ventilation switches to minimal backup mode. The heat from the racks begins to slowly build. It's getting warm.",
      "Time to apply debugging logic to the physical world. Scan the environment. Identify the problem. Find a workaround. Use available resources.",
    ],
    keyLocations: [
      {
        name: "Server Racks",
        description:
          "Rows of tall metal cabinets filled with humming, blinking machines. A labyrinth of cables connects everything. The air vibrates with fan noise and heat. Some racks have spare components or manuals sitting on top.",
      },
      {
        name: "Control Terminal (KVM)",
        description:
          "The main keyboard, video, mouse station. The monitor glows faintly with the impassive kernel panic message. Keyboard and mouse are unresponsive.",
      },
      {
        name: "The Sealed Door Area",
        description:
          "A heavy-duty metal security door, currently sealed. Beside it, a small metal panel hangs slightly loose, revealing circuitry beneath. An optical sensor is embedded in the door frame nearby.",
      },
    ],
    puzzles: [
      {
        id: "contact-bridge",
        name: "The Jumper Point Puzzle",
        sceneDescription:
          "Peering into the exposed manual override panel near the door, you see two clearly marked screw terminals labeled 'DOOR_RELEASE_JMP'. They're slightly recessed, too far apart to bridge with just your fingers.",
        objective:
          "Momentarily connect the two 'DOOR_RELEASE_JMP' contact points.",
        fixedFunctionObject: {
          name: "Ethernet Cable (3m)",
          description:
            "A standard network cable with metallic pins visible inside its plastic RJ45 connectors. Normally used for data transfer.",
        },
        solutionNarrative:
          "No jumper wire handy. You grab the spare Ethernet cable. Holding one plastic RJ45 connector carefully, you angle the exposed metal pins inside it to simultaneously touch both screw terminals. A faint click echoes from the door mechanism.",
        controlVariantHint:
          "The panel has two contact points needing to be bridged. Fingers won't work. That spare Ethernet cable is lying on the rack.",
        experimentalVariantHint:
          "Two contact points. Taped next to the panel is a faded note: 'PSU Test: Jumper pins 1+3 w/ wire/clip'. Recalling a lab tech using a network cable's end to test pin continuity on a circuit board, the nearby Ethernet cable seems promising.",
        narrativeJustification:
          "This manual jumper circuit bypasses the fried electronic controls, directly interrupting power to the electromagnetic lock. It's a hardware failsafe. Requires a conductive tool. No connection, no override.",
      },
      {
        id: "optical-sensor-align",
        name: "The Obstructed Safety Sensor",
        sceneDescription:
          "Following the wires from the override, you spot a small optical sensor embedded in the door frame, blinking a faint red light. Its line-of-sight to the corresponding reflector/emitter on the door itself is blocked by a thick, drooping bundle of poorly managed network cables.",
        objective: "Make the optical safety sensor register a clear path.",
        fixedFunctionObject: {
          name: "Blank CD-R",
          description:
            "A blank compact disc with a highly reflective bottom surface. Designed for storing data optically.",
        },
        solutionNarrative:
          "The sensor needs to 'see' its partner. You grab the blank CD-R. Using its mirror-like surface, you carefully angle it near the sensor, bouncing the faint red blinking light around the obstructing cable bundle and back towards the sensor's lens, tricking it into registering an unbroken beam.",
        controlVariantHint:
          "An optical sensor needs a clear path, but cables are blocking it. Needs reflection... A spindle of blank CD-Rs sits on a dusty server.",
        experimentalVariantHint:
          "Sensor blocked by cables. You remember a networking lecture slide showing fiber optic loopback tests using reflective surfaces. Someone has used a shiny CD shard wedged in a rack to reflect a status LED towards a camera. A spindle of blank CD-Rs is nearby.",
        narrativeJustification:
          "This is a safety interlock. Even if the override is jumped, the door won't release if the sensor detects an obstruction. You need to fool the sensor into thinking the path is clear to complete the manual release sequence.",
      },
    ],
    controlVariantIntro:
      "ERROR: Kernel panic... The screen freezes. The door CLUNKS shut. The main lights die. Backup power hums. Welcome to your unscheduled hardware debugging session. Objective: escape.",
    experimentalVariantIntro:
      "ERROR: Kernel panic... The screen freezes. The door CLUNKS shut. The main lights die. Backup power hums. Your OS professor always joked about 'percussive maintenance' and using 'whatever conductive thing is handy'. Time to get handy.",
  },

  // // --- World 7: Aethelgard Sky-Docks ---
  // {
  //   id: 7,
  //   name: "Aethelgard Sky-Docks",
  //   worldSetting:
  //     "A breathtaking, precarious metropolis built upon colossal, interconnected airships floating miles above the swirling Cloud Abyss. Brass pipes hiss steam, clockwork contraptions whir constantly, and ramshackle dwellings cling to metal hulls. Below is mystery, above are pirates and storms. Ingenuity and desperation fuel this city in the sky.",
  //   atmosphere:
  //     "Adventurous, industrious, vertiginous, steampunk wonder mixed with grimy reality.",
  //   toneOfNarration:
  //     "Spirited Steampunk Adventure. Narrator has a sense of wonder and pluck, capturing the character's optimism and the setting's mechanical marvels and dangers. Pacing is brisk, reflecting the constant motion and peril.",
  //   character: {
  //     name: 'Piper "Sparky" Cogsworth',
  //     titleOrRole: "Airship Engineer / Aspiring Inventor",
  //     appearance:
  //       "Late 20s, bright copper hair escaping intricate braids often woven with stray wires. Smudges of grease permanently adorn her face. Wears patched-up overalls over a sturdy shirt, pockets bulging with tools. Protective goggles usually pushed up onto her forehead. Moves with nimble confidence on catwalks and rigging.",
  //     personalityTraits:
  //       "Optimistic, resourceful, brilliant mechanic, fiercely loyal, slightly naive about people's motives. Possesses boundless energy and a belief that anything can be fixed or improved with enough tinkering.",
  //     quirksAndHabits:
  //       "Hums loudly (and often off-key) while working. Taps components with her wrench 'Bessie' to gauge their integrity. Chews on licorice root sticks. Gets easily distracted by interesting mechanical devices. Complains good-naturedly at stubborn machinery.",
  //     backstorySummary:
  //       "Learned mechanics from her mother, a famed inventor who vanished exploring the Cloud Abyss years ago. Piper works odd jobs on the Sky-Docks, patching up aging airships while secretly working on her own designs, hoping to one day follow her mother. Took a 'simple' repair job that landed her aboard a pirate vessel.",
  //     likesDislikes:
  //       "Likes: Well-oiled machinery, intricate clockwork, strong tea, thunderstorms (from a safe distance), discovering new gadgets. Dislikes: Rust, bureaucratic regulations, heights (ironically), sky-pirates (especially Captain Sharpfin), unexplained malfunctions.",
  //     catchphrasesOrCurses: [
  //       "Blast my bearings!",
  //       "Leaking sky-squid!",
  //       "Needs more torque!",
  //       "Hold onto your rivets!",
  //       "It's just a bit of creative engineering!",
  //     ],
  //   },
  //   startingInventory: [
  //     {
  //       name: "Heavy Wrench ('Bessie')",
  //       description:
  //         "A large, heavy-duty wrench, lovingly maintained. Feels balanced in Piper's hand. Secret compartment in handle holds mother's notes.",
  //     },
  //     {
  //       name: "Oilcan",
  //       description:
  //         "A brass oilcan, nearly full. Used for lubricating moving parts. Has a precise nozzle.",
  //     },
  //     {
  //       name: "Brass Spyglass",
  //       description:
  //         "A collapsible spyglass, slightly dented but functional. Used for viewing distant objects or potential threats.",
  //     },
  //     {
  //       name: "Tin of Assorted Nuts & Bolts",
  //       description:
  //         "A small tin filled with various sizes of spare nuts, bolts, washers, and gears. Rattles promisingly.",
  //     },
  //   ],
  //   mainObjectives: [
  //     "Retrieve the stolen Aetherium Crystal from the pirate Captain Sharpfin.",
  //     "Sabotage the engine of Sharpfin's ship, 'The Cloud Serpent', to prevent its departure.",
  //     "Secure a working sky-skiff or other means of escape from the pirate vessel.",
  //     "Investigate Sharpfin's true purpose for the specific Aetherium Crystal.",
  //   ],
  //   plotPoints: [
  //     "You're Piper Cogsworth, ace mechanic. That 'leaky valve' repair? It was aboard 'The Cloud Serpent', ship of the notorious Captain Sharpfin. You're currently an unintentional guest.",
  //     "Overhearing Sharpfin's gloating confirmed it: he stole the Treasury's Aetherium Crystal, vital for Aethelgard's stability!",
  //     "Spotted! Now you're hiding in the ship's bowels as it prepares to sail into the pirate-infested skies.",
  //     "Your mother's hidden notes mention this type of crystal: not just power sources, but keys to navigating the treacherous Cloud Abyss.",
  //     "Sharpfin isn't just stealing power; he plans to use the crystal to plunder uncharted ruins deep within the deadly Abyss.",
  //     "Your only potential ally: 'Sprocket', a grumpy clockwork parrot whose voicebox you once repaired. He knows the ship's secrets.",
  //     "Sharpfin's crew patrols constantly – burly sky-pirates armed with cutlasses and steam-powered blunderbusses.",
  //     "The engine room, heart of the ship and location of the sabotage target, is heavily guarded.",
  //     "Found schematics show Sharpfin modified the crystal's housing. Why? What's he really after?",
  //     "Trouble brewing: rival pirates, the Iron Condors, are shadowing 'The Cloud Serpent'. An attack seems imminent.",
  //     "Sprocket squawks about a hidden bay containing experimental sky-skiffs – potential escape! But the door is magnetically sealed.",
  //     "Intercepted whispers: Sharpfin found something *else* with the crystal, something he intends to sell. Could it relate to your mother's disappearance?",
  //     "The ship's massive, automated foghorn keeps malfunctioning, letting out unexpected deafening blasts. Potential cover noise?",
  //     "Decisions loom: prioritize escaping, securing the crystal for the city, crippling the ship, or chasing the dangerous thread connected to your mother's fate?",
  //   ],
  //   keyLocations: [
  //     {
  //       name: "The Deck of 'The Cloud Serpent'",
  //       description:
  //         "Open to the rushing wind, clouds whipping past below. Rigging crisscrosses between masts. Steam vents hiss periodically. Sky-pirates patrol precarious catwalks. Smells of engine oil, ozone, and damp wood.",
  //     },
  //     {
  //       name: "Engineering Corridors",
  //       description:
  //         "Narrow, greasy passageways winding around the ship's mechanical heart. Exposed pipes drip strange fluids. The air is hot, vibrating with the engine's thrum. Lit by flickering gas lamps.",
  //     },
  //     {
  //       name: "The Main Engine Room",
  //       description:
  //         "A cavernous space dominated by the roaring, glowing Aetherium engine. Heat waves shimmer. Armed guards watch vital gauges and controls. The noise is deafening.",
  //     },
  //     {
  //       name: "Hidden Cargo Bay",
  //       description:
  //         "A dusty, forgotten section of the hold. Crates stamped with faded military insignia are lashed down. Strange prototypes under tarps hint at experimental tech. Smells of dust and mildew.",
  //     },
  //   ],
  //   puzzles: [
  //     {
  //       id: "jammed-gear",
  //       name: "The Grimy Grate Gear",
  //       sceneDescription:
  //         "A ventilation shaft grate, large enough to crawl through, is controlled by a clockwork gear mechanism. The gear is visibly jammed with thick, hardened grime and rust.",
  //       objective: "Unjam the gear to open the ventilation grate.",
  //       fixedFunctionObject: {
  //         name: "Oilcan",
  //         description:
  //           "Your trusty brass oilcan, used for lubricating stiff or squeaking mechanical parts.",
  //       },
  //       solutionNarrative:
  //         "Lubrication alone won't cut through this gunk. Aiming the oilcan's nozzle directly at the obstructing crust on the gear, you squeeze hard. The focused jet of oil acts like a miniature pressure washer, blasting the grime loose. The gear spins freely.",
  //       controlVariantHint:
  //         "That gear's completely seized. Rust and grime. Your oilcan might help loosen things up.",
  //       experimentalVariantHint:
  //         "Gear's rusted solid. A nearby maintenance placard illustrates using pressurized oil streams for 'de-gunking' delicate automata components. Your oilcan can shoot a focused stream.",
  //       narrativeJustification:
  //         "This vent shaft bypasses the main crew corridor patrolled by Sharpfin's thugs. It's your only stealthy route towards the engine room and the hidden cargo bay. No entry here means facing pirates head-on.",
  //     },
  //     {
  //       id: "pressure-plate-bypass",
  //       name: "The Rattling Floor Plate",
  //       sceneDescription:
  //         "The corridor leading towards the bridge narrows. The entire floor section here is a single large pressure plate, clearly wired to a clanging alarm bell mounted overhead. It looks incredibly sensitive.",
  //       objective: "Cross the pressure plate without triggering the alarm.",
  //       fixedFunctionObject: {
  //         name: "Tin of Assorted Nuts & Bolts",
  //         description:
  //           "A small tin containing a mixture of heavy metal fasteners and gears. Usually used for repairs.",
  //       },
  //       solutionNarrative:
  //         "Direct weight will trigger it. Opening your tin, you carefully begin scattering the heavy nuts, bolts, and gears evenly across the entire surface of the pressure plate. By distributing the weight thinly, you keep the pressure below the trigger threshold, allowing you to step carefully across.",
  //       controlVariantHint:
  //         "That floor plate screams 'alarm trap'. Looks sensitive to focused weight. Your tin of nuts and bolts feels heavy...",
  //       experimentalVariantHint:
  //         "Alarm plate ahead. Near the galley entrance, you saw spilled ball bearings scattered thinly across a similar (inactive) floor sensor plate, seemingly not activating it. Your tin contains many small, heavy items.",
  //       narrativeJustification:
  //         "This corridor leads to the bridge overlook, the best place to spot where Sharpfin has secured the Aetherium Crystal. Triggering this alarm would bring the whole crew down on you before you even know the target's location.",
  //     },
  //     {
  //       id: "magnetic-lock-override",
  //       name: "The Stubborn Mag-Lock Seal",
  //       sceneDescription:
  //         "The heavy steel door to the experimental sky-skiff bay hums with power. A powerful magnetic lock holds it fast. The electronic control panel next to it is scorched and sparking – completely dead.",
  //       objective: "Disrupt the magnetic lock to open the door.",
  //       fixedFunctionObject: {
  //         name: "Heavy Wrench ('Bessie')",
  //         description:
  //           "Your large, solid steel wrench. Used for turning bolts, tightening pipes, and occasional 'percussive maintenance'.",
  //       },
  //       solutionNarrative:
  //         "Brute force won't beat the magnet. Recalling basic physics, you press the large, heavy ferrous mass of Bessie directly against the door plating, right next to the magnetic lock mechanism. The introduction of the large iron mass disrupts the magnetic field significantly, weakening its hold just enough for you to shoulder the door open with a groan of protesting metal.",
  //       controlVariantHint:
  //         "Strong magnetic lock, fried controls. Bessie is a big chunk of solid metal...",
  //       experimentalVariantHint:
  //         "Powerful mag-lock. A nearby engineer's log complains about magnetic field interference readings whenever large ferrous tools like 'power wrenches or prybars' are left too close to sensitive sensors. Bessie is reassuringly heavy and very ferrous.",
  //       narrativeJustification:
  //         "These experimental sky-skiffs are your most likely escape route after you achieve your objectives. The magnetic lock is high-security. You need to interfere with the field itself, as the controls are gone. No entry, no escape vehicle.",
  //     },
  //     {
  //       id: "reaching-lever",
  //       name: "The High Coolant Lever",
  //       sceneDescription:
  //         "Inside the engine room's control mezzanine, the crucial coolant release lever for sabotage is visible behind a protective mesh cage, mounted just out of your reach high on the wall.",
  //       objective: "Pull the out-of-reach coolant release lever.",
  //       fixedFunctionObject: {
  //         name: "Brass Spyglass",
  //         description:
  //           "Your collapsible brass spyglass, used for observing distant objects.",
  //       },
  //       solutionNarrative:
  //         "Stretching is futile. You extend your brass spyglass to its full length. Carefully maneuvering the narrow, rigid tube through an opening in the mesh cage, you hook the eyepiece rim over the distant lever. A firm tug downwards, and the lever engages with a hiss of venting coolant.",
  //       controlVariantHint:
  //         "The sabotage lever! But it's too high, behind mesh. Your spyglass is in your pocket.",
  //       experimentalVariantHint:
  //         "Lever is just too high. Earlier on deck, you saw a pirate using the long, thin handle of a mop to hook a ration bar that fell under a grating. Your spyglass extends to become long and thin.",
  //       narrativeJustification:
  //         "This specific coolant release will cause a controlled engine shutdown, preventing Sharpfin's escape without causing an immediate, catastrophic explosion (which would be bad for you too). Reaching this lever is the key to effective, non-suicidal sabotage.",
  //     },
  //   ],
  //   controlVariantIntro:
  //     "Wind screams past the rigging of 'The Cloud Serpent'. You're Piper Cogsworth, trapped aboard a pirate airship high above the endless clouds of Aethelgard. Time to put those engineering skills to the test for survival and sabotage.",
  //   experimentalVariantIntro:
  //     "Wind screams past the rigging of 'The Cloud Serpent'. You're Piper Cogsworth, trapped aboard a pirate airship high above the endless clouds of Aethelgard. Time to put those engineering skills to the test for survival and sabotage.",
  // },

  // // --- World 8: The Verdant Library of Whispering Books ---
  // {
  //   id: 8,
  //   name: "The Verdant Library of Whispering Books",
  //   worldSetting:
  //     "An ancient, sentient library where knowledge literally grows on trees (or shelves made of living wood). Books bloom like flowers, vines inscribed with poetry curl around pillars, and entire sections rearrange themselves according to narrative logic. It's tended by shy Scriveners, grumpy Topiary Guardians, and the silent wisdom of the Eldest Scroll.",
  //   atmosphere:
  //     "Whimsical, magical, cozy yet vast, intellectually stimulating, slightly overgrown.",
  //   toneOfNarration:
  //     "Whimsical Fantasy Academia. Narrator's voice is gentle, slightly bookish, conveying wonder and the quiet magic of the place. Pacing is unhurried, allowing for delightful details, but can quicken during moments of textual peril.",
  //   character: {
  //     name: "Finch Featherstone",
  //     titleOrRole: "Apprentice Lexicographer (Third Class)",
  //     appearance:
  //       "Youngish, indeterminate age, often mistaken for a pile of books. Wears ink-stained robes embroidered with tiny sprouting seedlings. Spectacles perpetually smudged. Hair is a chaotic nest holding forgotten bookmarks and stray leaves. Moves quietly, almost apologetically.",
  //     personalityTraits:
  //       "Earnest, meticulous, deeply knowledgeable about library lore, cripplingly shy with strangers but talks animatedly to books. Easily distracted by interesting footnotes. Possesses a gentle heart and a deep love for the Library.",
  //     quirksAndHabits:
  //       "Sneezes clouds of shimmering book dust. Whispers apologies when bumping into furniture. Constantly straightening books on shelves. Leaves cryptic marginalia in his journal. Can identify paper types by smell.",
  //     backstorySummary:
  //       "Found as an infant abandoned in the Library's Thesaurus section, raised by the institution itself. Considers the Library his home and family. Devoted to its preservation and cataloging. Dreams of one day reading the legendary Whispering Folio.",
  //     likesDislikes:
  //       "Likes: The smell of old paper and damp moss, quiet corners, correctly alphabetized sections, warm beverages, intricate calligraphy. Dislikes: Dog-eared pages, loud noises, overdue fines, disorder, the Dewey Decimators (rival faction of rogue indexers).",
  //     catchphrasesOrCurses: [
  //       "Oh dear me!",
  //       "Fascinating folio!",
  //       "By the Blessed Bibliography!",
  //       "Maintain alphabetical integrity!",
  //       "Shush now, the encyclopedias are pondering.",
  //     ],
  //   },
  //   startingInventory: [
  //     {
  //       name: "Quill Pen",
  //       description:
  //         "A large goose feather quill, tip slightly frayed but still serviceable. Used for elegant script.",
  //     },
  //     {
  //       name: "Inkwell (Midnight Blue)",
  //       description:
  //         "A small, corked glass inkwell filled with dark blue ink. Label claims 'Non-Staining Formula (Mostly)'.",
  //     },
  //     {
  //       name: "Thick Leather-Bound Journal",
  //       description:
  //         "A sturdy blank journal with thick, creamy pages, perfect for notes and sketches. Smells faintly of vanilla.",
  //     },
  //     {
  //       name: "Magnifying Glass",
  //       description:
  //         "A classic brass-rimmed magnifying glass, useful for examining small print or tiny botanical details.",
  //     },
  //   ],
  //   mainObjectives: [
  //     "Identify and contain the 'Voracious Manuscript' that is consuming other books.",
  //     "Trace the Manuscript's origin and understand its nature.",
  //     "Navigate the shifting, genre-based corridors to reach the Library's protected Root-Core.",
  //     "Consult the Eldest Scroll within the Root-Core for a method to neutralize the Manuscript.",
  //   ],
  //   plotPoints: [
  //     "You're Finch Featherstone, apprentice in the living Library. All is not well. A new acquisition, the 'Voracious Manuscript', is literally eating other books.",
  //     "The Manuscript absorbs the text and knowledge of its victims, growing physically larger and more chaotic in appearance.",
  //     "The Library's usual defenses – binding vines, punctuation golems – seem unable or unwilling to stop it.",
  //     "Senior Librarians have retreated to the Reference Sanctum, attempting complex containment charms that only result in embarrassing grammatical errors.",
  //     "The Manuscript seems drawn towards the Library's heart, the Root-Core, where the Eldest Scroll resides and the Library's consciousness is focused.",
  //     "Familiar corridors twist and reform. Passages are blocked by overgrown metaphor-thickets or sudden, illogical narrative dead-ends.",
  //     "Faint whispers emanate from the Manuscript – echoes of the books it has consumed, hinting it originated from the forbidden 'Expired Section'.",
  //     "Topiary Guardians, usually serene hedge animals, have become aggressive, trimming passersby with sharp shears and literary criticisms.",
  //     "Recovered fragments suggest the Manuscript seeks not just knowledge, but the Library's core narrative, its very essence, potentially to rewrite it.",
  //     "Only the Eldest Scroll, containing the essence of all stories, might hold the key to understanding and counteracting this textual parasite.",
  //     "Inky, amorphous tendrils begin probing distant sections, showing the Manuscript's corrupting influence is spreading rapidly.",
  //     "A cryptic note from a long-lost apprentice mentions using 'conceptual resonance' – fighting text with text, idea with idea.",
  //     "Reaching the Root-Core involves solving puzzles based on literary devices, navigating genre-specific hazards (like the melancholy Poetry Bogs), and citing sources correctly.",
  //     "You must find a way to contain the Manuscript before it consumes the Library's heart, armed only with your knowledge and basic scrivener's tools.",
  //   ],
  //   keyLocations: [
  //     {
  //       name: "The Main Stacks",
  //       description:
  //         "Towering shelves of living wood reaching into misty heights. Books bloom in various stages of ripeness. Gentle rustling of pages fills the air. Smells of paper, moss, ink, and wisdom.",
  //     },
  //     {
  //       name: "The Genre Gardens",
  //       description:
  //         "Sections where the environment reflects the literary genre. The 'Thriller Thicket' is dark and suspenseful; the 'Romance Rosarium' is filled with fragrant, blooming sonnets; the 'Sci-Fi Sphere' hums with contained nebulae.",
  //     },
  //     {
  //       name: "The Root-Core Chamber (Goal)",
  //       description:
  //         "The heart of the Library, where the main trunk of the shelves converge. Bathed in soft, golden light. The Eldest Scroll rests on a central plinth, radiating quiet power.",
  //     },
  //     {
  //       name: "The Binding Workshop",
  //       description:
  //         "Workbenches covered in tools for book repair – presses, knives, pots of fragrant glue. Scraps of leather and parchment litter the floor. Smells strongly of adhesive and old paper.",
  //     },
  //   ],
  //   puzzles: [
  //     {
  //       id: "gap-in-narrative",
  //       name: "The Literal Plot Hole",
  //       sceneDescription:
  //         "In the Fiction wing, the floor has vanished! A gaping chasm – a literal plot hole – stretches before you, smelling faintly of dropped subplots and unresolved character arcs. It's too wide to leap.",
  //       objective: "Cross the plot hole safely.",
  //       fixedFunctionObject: {
  //         name: "Thick Leather-Bound Journal",
  //         description:
  //           "Your sturdy blank journal, used for recording notes and observations.",
  //       },
  //       solutionNarrative:
  //         "Looking at the sturdy covers and strong spine of your journal, an idea forms. Opening it flat, you carefully lay it across the plot hole. The thick covers span the gap, creating a makeshift, slightly precarious bridge. You edge across carefully.",
  //       controlVariantHint:
  //         "A gap in the story, made real! How to cross? Your journal feels solid, substantial.",
  //       experimentalVariantHint:
  //         "A literal plot hole yawns ahead. Nearby, a tiny pixie librarian has laid a large, open picture book across two toadstools to form a bridge to reach a high flower. Your journal has similarly strong covers.",
  //       narrativeJustification:
  //         "This plot hole blocks access to the Historical Fiction section, which may contain records of similar textual anomalies. The only alternative route involves navigating the chaotic Limerick Labyrinth, a place known to drive librarians mad.",
  //     },
  //     {
  //       id: "faded-inscription",
  //       name: "The Pale Verse",
  //       sceneDescription:
  //         "An ancient stone archway is carved with an inscription, likely the key to a shortcut. Time, moss, and dust have rendered the letters almost invisible, faded into the stone.",
  //       objective: "Make the faded inscription readable.",
  //       fixedFunctionObject: {
  //         name: "Inkwell (Midnight Blue)",
  //         description:
  //           "Your inkwell, filled with dark blue ink. Primarily used for writing with your quill.",
  //       },
  //       solutionNarrative:
  //         "Recalling ancient rubbing techniques, but lacking charcoal, you try another method. Carefully uncorking your inkwell, you gently pour a small amount of the dark ink over the faded inscription. The liquid pools within the shallow carved letters, making them stand out in sharp contrast against the lighter stone.",
  //       controlVariantHint:
  //         "Can barely make out the letters... too faded. If only they stood out more... Your inkwell contains dark ink.",
  //       experimentalVariantHint:
  //         "Faded carving. Elsewhere in the library, you saw how spilled tea had darkened the engraved letters on a commemorative plaque, making them suddenly visible. Your inkwell contains dark, staining liquid.",
  //       narrativeJustification:
  //         "This inscription reveals the command phrase for the 'Allegorical Aqueduct', a shortcut bypassing the dangerous Haiku Headwaters, known for their sudden, disorienting shifts in perspective. Without this phrase, reaching the Non-Fiction Stacks becomes perilous.",
  //     },
  //     {
  //       id: "silencing-mechanism",
  //       name: "The Babbling Binding",
  //       sceneDescription:
  //         "The door to the Restricted Catalogue is sealed by a 'Babbling Binding' – a lock resembling a small, constantly moving mouth made of parchment, chattering incessant nonsense rhymes and riddles, making it impossible to concentrate on the subtle auditory cues needed to pick it.",
  //       objective: "Silence the distracting lock mechanism.",
  //       fixedFunctionObject: {
  //         name: "Quill Pen",
  //         description:
  //           "Your goose feather quill, with a soft, slightly frayed tip. Used for writing.",
  //       },
  //       solutionNarrative:
  //         "The noise is maddening! On impulse, you gently insert the soft, feathery tip of your quill pen into the lock's chattering 'mouth'. The soft feathers effectively dampen the vibrations producing the sound, reducing the chatter to a muffled whisper, allowing you to finally hear the delicate clicks of the tumblers.",
  //       controlVariantHint:
  //         "Can't hear the tumblers over this infernal chatter! Need to quiet it somehow... Your quill pen has a very soft tip.",
  //       experimentalVariantHint:
  //         "The lock won't stop talking! Nearby, a librarian has carefully stuffed a bundle of soft page-fluff into the perpetually whistling spout of an enchanted kettle. Your quill's tip looks soft and fluffy.",
  //       narrativeJustification:
  //         "This door leads to the Restricted Catalogue containing forbidden lore, including texts on controlling or banishing textual parasites like the Voracious Manuscript. The Babbling Binding is designed to frustrate casual attempts. Silencing it is key to focusing on the intricate lock-picking required.",
  //     },
  //     {
  //       id: "revealing-hidden-ink", // Renamed ID slightly
  //       name: "The Heat-Shy Scroll",
  //       sceneDescription:
  //         "A promising scroll labeled 'Map to the Root-Core' appears completely blank when unrolled. You suspect invisible ink, perhaps derived from heat-sensitive lemon juice, a classic scrivener's trick.",
  //       objective: "Reveal the invisible ink on the scroll.",
  //       fixedFunctionObject: {
  //         name: "Magnifying Glass",
  //         description:
  //           "Your brass-rimmed magnifying glass, typically used for enlarging small text or details.",
  //       },
  //       solutionNarrative:
  //         "No candle or flame available. However, the Library is lit by glowing moss and enchanted lanterns. Holding your magnifying glass, you carefully focus the ambient light from a bright patch of glowing moss into a concentrated point on the scroll's surface. Slowly moving the point of heat across the parchment reveals the hidden map lines appearing as faint brown marks.",
  //       controlVariantHint:
  //         "Blank scroll... likely invisible ink. Usually needs heat. How to apply heat safely? Your magnifying glass rests heavy in your pocket.",
  //       experimentalVariantHint:
  //         "Blank scroll, possibly invisible ink. A nearby instructional woodcut shows an ancient scribe using a polished crystal lens to focus sunlight for meticulously burning patterns onto wood. Your magnifying glass can focus light...",
  //       narrativeJustification:
  //         "This scroll contains the only known map showing the safe paths through the shifting inner Library to the Root-Core. Without revealing its contents, navigating the Library's dangerous, ever-changing corridors to reach the Eldest Scroll is almost impossible.",
  //     },
  //   ],
  //   controlVariantIntro:
  //     "The Verdant Library sighs around you, a living entity of paper and chlorophyll. You're Finch, apprentice, protector. But a shadow falls – a book that consumes. Your quiet life is over; the Library needs saving.",
  //   experimentalVariantIntro:
  //     "The Verdant Library sighs around you, a living entity of paper and chlorophyll. You're Finch, apprentice, protector. But a shadow falls – a book that consumes. Your quiet life is over; the Library needs saving.",
  // },

  // // --- World 9: Scrapyard Metropolis of Xylos ---
  // {
  //   id: 9,
  //   name: "Scrapyard Metropolis of Xylos",
  //   worldSetting:
  //     "A sprawling, brutalist city built from the skeletal remains of colossal war machines and bombed-out infrastructure following a forgotten conflict. Towers of twisted girders pierce a perpetually smoggy sky, rivers of iridescent chemical sludge carve paths through canyons of junk, and survivors barter scavenged tech under the flicker of salvaged neon.",
  //   atmosphere:
  //     "Gritty, post-apocalyptic, dangerous, decaying, survivalist, harsh.",
  //   toneOfNarration:
  //     "Gritty Post-Apocalyptic Survival. Narrator's voice is rough, terse, reflecting the character's hardened cynicism and the harshness of the environment. Pacing is deliberate, emphasizing danger and scarcity.",
  //   character: {
  //     name: 'Roric "Patch" Bolt',
  //     titleOrRole: "Scavenger / Survivor",
  //     appearance:
  //       "Mid-30s, face weathered and etched by hardship, eyes constantly scanning for threats or salvage. Wears layered, mismatched pieces of scavenged leather, canvas, and scrap metal plating. One arm is a crude but functional prosthetic made of hydraulics and salvaged metal.",
  //     personalityTraits:
  //       "Cynical, resourceful, pragmatic, deeply distrustful, incredibly tough (physically and mentally). A lone wolf by necessity. Speaks little, observes much. Values function over form.",
  //     quirksAndHabits:
  //       "Tests structural integrity by kicking things. Hoards potentially useful (and sometimes useless) junk. Chews strips of leathery dried 'mystery meat'. Communicates primarily through grunts and minimal gestures. Constantly checks his prosthetic's joints.",
  //     backstorySummary:
  //       "A child survivor of the war that created Xylos. Grew up entirely within the scrapyard ruins, learning to scavenge, fight, and survive. The past is a source of trauma he refuses to discuss. Known only as 'Patch' due to his patched gear and prosthetic.",
  //     likesDislikes:
  //       "Likes: Functional salvage, secure hideouts, silence, reliable gear, synth-ale (in moderation). Dislikes: Rust Ghouls, collapsing structures, cheaters, radiation hotspots, talking about the past, unnecessary noise.",
  //     catchphrasesOrCurses: [
  //       "Still works.",
  //       "Scrap.",
  //       "Quiet.",
  //       "*Grunt*",
  //       "Waste of resources.",
  //     ],
  //   },
  //   startingInventory: [
  //     {
  //       name: "Crowbar",
  //       description:
  //         "A heavy iron crowbar, pocked with rust but still solid. Primary tool for prying, smashing, and occasional defense.",
  //     },
  //     {
  //       name: "Roll of Duct Tape",
  //       description:
  //         "A partially used roll of grey duct tape. Sticky, versatile. Referred to locally as 'Scrap-Seal'.",
  //     },
  //     {
  //       name: "Geiger Counter",
  //       description:
  //         "A salvaged pre-war Geiger counter. Crackling speaker emits ominous clicks in proximity to radiation. Needle jitters erratically.",
  //     },
  //     {
  //       name: "Empty Canteen",
  //       description:
  //         "A dented metal canteen, scratched and worn. Currently empty.",
  //     },
  //   ],
  //   mainObjectives: [
  //     "Locate a functional Pulse Core within the hazardous ruins of Sector 7.",
  //     "Successfully navigate the irradiated and structurally unstable Sector 7.",
  //     "Avoid or neutralize the mutated creatures (Rust Ghouls, Scrap Wyrms) endemic to the area.",
  //     "Deliver the Pulse Core to the Barter Baron Grub.",
  //     "Determine Grub's true intentions for the volatile power source.",
  //   ],
  //   plotPoints: [
  //     "You're Patch. Life is salvage. Barter Baron Grub needs a Pulse Core, pre-war energy source. Offers safe passage through Ghoul territory – valuable payment.",
  //     "Only source: Sector 7. Old military tech zone. Irradiated hellhole crawling with mutants. Most scavvers won't go near.",
  //     "Your Geiger counter crackles louder as you approach Sector 7's perimeter. Air tastes metallic.",
  //     "Rust Ghouls – gaunt, fast mutants drawn to metal – infest the ruins. They hunt by sound, scent, and the glint of salvage.",
  //     "Worse are the Scrap Wyrms – colossal burrowing monstrosities made of fused wreckage, their passage causes tremors and collapses.",
  //     "Sector 7 is a death trap: unstable ruins, hidden radiation pits, precarious scrap heaps ready to slide.",
  //     "Faint signal trace... logs from a failed expedition mention a sealed military bunker within Sector 7. Best hope for an intact Pulse Core.",
  //     "Grub's insistence on *this* Core feels off. They're powerful, yes, but unstable. What's his angle?",
  //     "Rumors: rival gangs, like the Iron Vultures, are also hunting for Cores. Competition could get bloody.",
  //     "Strange energy fields in certain areas mess with your Geiger counter, even make your prosthetic arm twitch.",
  //     "Scattered data fragments hint the 'mutations' aren't random – linked to experimental tech deployed here before the war.",
  //     "A barely functional security turret broadcasts fragmented warnings: 'Containment failure... Pulse Core instability... Evacuate...'",
  //     "Getting *to* the Core requires climbing treacherous debris, crawling through crushed conduits, making paths where none exist.",
  //     "Acquiring the Core might trigger dormant defenses or attract something huge and hungry. And then you have to get it *back* to Grub.",
  //   ],
  //   keyLocations: [
  //     {
  //       name: "Barter Town Outskirts",
  //       description:
  //         "A chaotic fringe of makeshift stalls built from wreckage. flickering salvaged signs cast an uncertain glow. Air smells of smoke, chemicals, and desperation. Mutants, humans, and jury-rigged bots trade salvage.",
  //     },
  //     {
  //       name: "Scrap Canyons",
  //       description:
  //         "Deep ravines carved through mountains of compressed junk. Precarious paths wind along ledges. Rivers of iridescent chemical sludge flow sluggishly below. Unstable structures loom overhead.",
  //     },
  //     {
  //       name: "Sector 7 Ruins",
  //       description:
  //         "The skeletal remains of military buildings and research labs, twisted and irradiated. Silence hangs heavy, broken only by wind whistling through broken structures and distant, inhuman screeches. Geiger counter clicks incessantly.",
  //     },
  //     {
  //       name: "Military Bunker Entrance (Goal)",
  //       description:
  //         "A heavily reinforced blast door, partially buried under collapsed debris. Rusted warning signs hang askew. Air feels heavy, charged with radiation.",
  //     },
  //   ],
  //   puzzles: [
  //     {
  //       id: "acid-pool-crossing",
  //       name: "The Sludge Ford",
  //       sceneDescription:
  //         "A wide, bubbling pool of viscous, foul-smelling chemical sludge blocks the collapsed underpass ahead. The fumes sting your eyes. Looks corrosive enough to dissolve boot leather in seconds.",
  //       objective: "Cross the pool of corrosive sludge.",
  //       fixedFunctionObject: {
  //         name: "Crowbar",
  //         description:
  //           "Your trusty iron pry bar, used for leverage, breaking things, and sometimes hitting things.",
  //       },
  //       solutionNarrative:
  //         "Jumping is suicide. Scanning the debris piles on either side, you spot stable anchor points. Jamming one end of the heavy crowbar deep into a concrete slab on one side, you carefully wedge the other end into a twisted girder opposite, creating a crude, horizontal support just above the sludge. Using it as a handhold and balance aid, you tightrope-walk carefully across.",
  //       controlVariantHint:
  //         "That sludge will eat right through you. Too wide to jump. Need some kind of bridge or support... Your crowbar is long and solid.",
  //       experimentalVariantHint:
  //         "Corrosive sludge pool. Nearby, another scavenger has jammed a long metal pole horizontally between two sturdy junk piles to hang their waterskin safely above a patch of oily ground. Your crowbar is similarly long and strong.",
  //       narrativeJustification:
  //         "This underpass is the only known route towards the bunker that avoids the worst of the Ghoul surface patrols. Turning back means facing them. Crossing this sludge is necessary to proceed towards the Pulse Core.",
  //     },
  //     {
  //       id: "noise-distraction",
  //       name: "The Echoing Corridor",
  //       sceneDescription:
  //         "The narrow corridor ahead echoes with the unmistakable scraping and clicking sounds of several Rust Ghouls scavenging just around the bend. The floor is littered with loose metal debris, making a silent approach impossible.",
  //       objective: "Distract the Rust Ghouls to sneak past.",
  //       fixedFunctionObject: {
  //         name: "Empty Canteen",
  //         description:
  //           "Your dented metal canteen, currently empty. Makes a hollow sound when tapped.",
  //       },
  //       solutionNarrative:
  //         "Direct confrontation is deadly. Spotting loose bolts and shards of metal, you quickly scoop a handful into your empty metal canteen. Capping it loosely, you hurl it down a dark side passage. The clattering, rattling echo is deafening in the confined space. You hear the Ghouls screech and scramble towards the noise. Now's your chance to slip past.",
  //       controlVariantHint:
  //         "Ghouls ahead. Can't sneak on this junk floor. Need a diversion... something loud... Your empty canteen makes a racket if shaken.",
  //       experimentalVariantHint:
  //         "Ghoul sounds close. Tucked in a corner is a crude tripwire attached to a pile of empty cans – a noise trap. Your own empty canteen could hold noisy debris...",
  //       narrativeJustification:
  //         "This corridor leads directly to the bunker's outer access point. Fighting multiple Ghouls here is too risky. A diversion is the only tactical option to get past them undetected and conserve precious resources.",
  //     },
  //     {
  //       id: "radiation-shielding",
  //       name: "The Radiation Breach",
  //       sceneDescription:
  //         "Your Geiger counter shrieks uncontrollably as you approach a jagged breach torn in the bunker wall. A visible shimmer in the air indicates a focused beam of intense radiation pouring out – the source likely near the Pulse Core storage.",
  //       objective:
  //         "Create temporary shielding to pass through the radiation beam.",
  //       fixedFunctionObject: {
  //         name: "Roll of Duct Tape",
  //         description:
  //           "Your roll of sticky, fabric-backed tape. Used for repairs, patching, and generally holding the world together.",
  //       },
  //       solutionNarrative:
  //         "Instant cancer beam. No thanks. You quickly gather several large, flat pieces of scrap metal nearby – prioritizing thicker, denser pieces. Overlapping them hastily, you use long strips of duct tape to bind them together into a crude, heavy shield. Hoisting it in front of your torso, you take a deep breath and sprint through the shimmering beam.",
  //       controlVariantHint:
  //         "Geiger's screaming! That beam is deadly. Need shielding, fast. Lots of scrap metal around. You've got duct tape.",
  //       experimentalVariantHint:
  //         "Lethal radiation beam. Nearby, a collapsed section reveals a makeshift shelter built by layering salvaged metal sheets, crudely held together with remnants of tape and wire. Plenty of scrap pieces lie about. Your duct tape is strong.",
  //       narrativeJustification:
  //         "This radiation leak originates near the Pulse Core's containment, likely due to damage. Exposure, even brief, is dangerous. You need makeshift shielding to pass through this breach and reach the Core itself. This is the final barrier.",
  //     },
  //     {
  //       id: "lever-activation",
  //       name: "The Seized Power Lever",
  //       sceneDescription:
  //         "Inside the dusty bunker control room, a large, heavy lever labeled 'Auxiliary Power - Core Containment' is visibly jammed with debris and corrosion. You need to throw this lever to safely release the Pulse Core.",
  //       objective: "Apply enough leverage to move the jammed power lever.",
  //       fixedFunctionObject: {
  //         name: "Geiger Counter",
  //         description:
  //           "Your bulky, box-shaped Geiger counter. Used for detecting radiation.",
  //       },
  //       solutionNarrative:
  //         "The lever won't budge with the crowbar alone. Looking around, you wedge the sturdy, boxy casing of your Geiger Counter tightly against the wall right at the base of the lever's pivot point. Now, using the Geiger Counter as a solid fulcrum, you place the tip of your crowbar under the lever handle and heave. The added leverage works – the lever groans and shifts.",
  //       controlVariantHint:
  //         "Lever's jammed solid. Crowbar isn't enough leverage on its own. Need a better angle, a fulcrum... Your Geiger counter is pretty solid and blocky.",
  //       experimentalVariantHint:
  //         "Stuck lever. A faded maintenance diagram pasted on the console shows the proper procedure for seized mechanisms: use a 'stable wedge block' placed near the pivot point in conjunction with a 'pry bar' for maximum force. Your Geiger counter is blocky; your crowbar is a pry bar.",
  //       narrativeJustification:
  //         "The Pulse Core is secured in a containment field that requires auxiliary power for safe release sequence. This lever controls that power flow. Yanking the Core out without proper release could trigger failsafes, destabilize the Core, or worse. Moving this lever is essential for safe retrieval.",
  //     },
  //   ],
  //   controlVariantIntro:
  //     "Xylos. City of scrap and rust. You're Patch. Survival is currency. Grub wants a Pulse Core from the irradiated hell of Sector 7. Payment is passage. Job's simple. Getting there, getting it, and getting back? Anything but.",
  //   experimentalVariantIntro:
  //     "Xylos. City of scrap and rust. You're Patch. Survival is currency. Grub wants a Pulse Core from the irradiated hell of Sector 7. Payment is passage. Job's simple. Getting there, getting it, and getting back? Anything but.",
  // },

  // // --- World 10: The Grand Pudding Heist in Wobbleton ---
  // {
  //   id: 10,
  //   name: "The Grand Pudding Heist in Wobbleton",
  //   worldSetting:
  //     "The glorious, edible city of Wobbleton! Buildings are crafted from gingerbread and cake, rivers flow with chocolate, lampposts are rock candy, and the very air smells of vanilla and cinnamon. However, the tyrannical Earl Grey T. Baggins has unjustly hoarded the city's greatest treasure – the Everlasting Gobstopper!",
  //   atmosphere:
  //     "Whimsical, comical, sugary, lighthearted adventure, delightfully absurd.",
  //   toneOfNarration:
  //     "Over-the-Top Comedic Whimsy. Narrator should sound delighted, slightly mischievous, perhaps like a children's storybook narrator who's had too much sugar. Pacing is energetic and playful. Emphasize the absurdity and deliciousness.",
  //   character: {
  //     name: "Pip Stickyfingers",
  //     titleOrRole: "Disgraced Apprentice Confectioner / Champion of Sweets",
  //     appearance:
  //       "A diminutive gnome with bright, mischievous eyes. Wears a jam-stained patchwork apron over colourful clothes. Pointy boots made of hardened caramel click softly. A candied cherry atop his cap wobbles precariously. Constantly has crumbs on his tunic.",
  //     personalityTraits:
  //       "Mischievous, optimistic, obsessed with sweets, surprisingly agile and stealthy. Possesses an encyclopedic knowledge of confectionery. Prone to sugar rushes and minor acts of candy theft. Believes strongly in sugary justice.",
  //     quirksAndHabits:
  //       "Constantly nibbles on inventory or surrounding scenery. Talks encouragingly (or scoldingly) to pastries. Leaves a faint trail of sprinkles. Hums jaunty, tune-deaf melodies. Pockets jingle with pilfered candies.",
  //     backstorySummary:
  //       "Once a promising apprentice at the Royal Confectionery, Pip was exiled for an 'unauthorized effervescence experiment' involving the Earl's prized pet poodle (it turned blue). Now uses his skills for... less sanctioned activities. Believes the Everlasting Gobstopper is a public treasure, unjustly hoarded by the Earl.",
  //     likesDislikes:
  //       "Likes: Sugar (all forms), shiny wrappers, elaborate schemes, fizzy drinks, outsmarting guards, free samples. Dislikes: Savory foods (especially vegetables!), locked pantries, Earl Grey T. Baggins, marzipan (untrustworthy texture), being told 'no sweets before dinner'.",
  //     catchphrasesOrCurses: [
  //       "By my Gummy Bears!",
  //       "Sweet sprinkles!",
  //       "Custard calamity!",
  //       "Did that éclair just sneer?",
  //       "For the love of frosting!",
  //     ],
  //   },
  //   startingInventory: [
  //     {
  //       name: "Sturdy Candy Cane",
  //       description:
  //         "A large, red-and-white striped candy cane, surprisingly solid, slightly sticky to the touch. Traditional festive treat.",
  //     },
  //     {
  //       name: "Coil of Liquorice Whip",
  //       description:
  //         "A long, flexible strand of black liquorice, coiled neatly. Chewy, with a faint aniseed smell.",
  //     },
  //     {
  //       name: "Bag of Super-Sour Lemon Drops",
  //       description:
  //         "A small cloth bag filled with bright yellow candies. Warning: Extreme Pucker Power! Coated in sour sugar dust.",
  //     },
  //     {
  //       name: "Half-Eaten Gingerbread Man",
  //       description:
  //         "A classic gingerbread cookie, unfortunately missing one leg. Still smells warmly of ginger and spice.",
  //     },
  //   ],
  //   mainObjectives: [
  //     "Successfully infiltrate Earl Grey T. Baggins's heavily guarded Fondant Fortress.",
  //     "Navigate the fortress's treacherous and delicious defensive measures.",
  //     "Locate the legendary Vault of Valued Vittles.",
  //     "Liberate the Everlasting Gobstopper from the Earl's greedy grasp.",
  //     "Make a daring escape before the Sugar Rush Alarm brings the entire city watch (made of gingerbread) down on you.",
  //   ],
  //   plotPoints: [
  //     "You're Pip Stickyfingers, master of mischief, connoisseur of candy! Your target: the legendary Everlasting Gobstopper, held captive by the dastardly Earl Grey T. Baggins in his Fondant Fortress!",
  //     "The Gobstopper! Said to grant eternal flavor and untold delight! (And maybe make your tongue change colors indefinitely).",
  //     "Earl Grey, a crumbly tea biscuit tyrant, keeps it locked up just because he can. What a cad!",
  //     "The Fortress defenses are formidable: patrols of tough Gingerbread Guards, Sherbet Sharks in the Chocolate River moat, and the Earl's cunning head of security, Marzipan Mallory (your arch-rival since the poodle incident!).",
  //     "Your inside man? Phil, a perpetually nervous Marshmallow Peep who owes you big time. He's left clues.",
  //     "Beware the traps! Collapsing cookie catwalks, sticky caramel pits, and motion-activated peppermint sprinklers!",
  //     "Phil's napkin-blueprint reveals secret Churro Ventilation Shafts – a potential way in, if you don't get stuck.",
  //     "The Vault of Valued Vittles lies deep within, protected by syrup laser grids, weight-sensitive fudge floors, and a lock that only opens to the Earl's dreadful humming.",
  //     "Marzipan Mallory suspects intruders. Her elite force of weaponized Petit Fours is on high alert.",
  //     "Rumor has it the Gobstopper itself is guarded by one final puzzle – a test of taste, perhaps?",
  //     "Complication! The Candy Commandos, a rival gang led by the fearsome Sergeant Jawbreaker, are *also* hitting the Fortress tonight! Chaos ensues!",
  //     "Escape options: brave the defenses again, or find the fabled Ginger-Snap Catapult rumored to be on the Fortress roof?",
  //     "The stakes are high! Failure means a dip in the Fondue Moat, or worse... being forced to eat broccoli by the Earl!",
  //     "Use your wits, your agility, and your deep understanding of structural confectionery to pull off the sweetest heist in Wobbleton history!",
  //   ],
  //   keyLocations: [
  //     {
  //       name: "Wobbleton City Streets",
  //       description:
  //         "Paved with cookie dough slabs, lined with gingerbread houses frosted in cheerful colors. Rock candy lampposts glow warmly. The air is thick with the scent of baking. Sentient sugar cubes scurry underfoot.",
  //     },
  //     {
  //       name: "The Fondant Fortress Exterior",
  //       description:
  //         "Imposing walls of smooth, grey fondant rise high, studded with decorative (and sharp) spun-sugar shards. Battlements are lined with stern-looking gingerbread archers. A moat of bubbling hot fudge surrounds the base.",
  //     },
  //     {
  //       name: "Fortress Interior Halls",
  //       description:
  //         "Walled with perfectly layered Battenberg cake, tiled with buttery shortbread squares. Portraits of the Earl (looking smug) hang everywhere. Smells strongly of vanilla extract and intimidation.",
  //     },
  //     {
  //       name: "Vault of Valued Vittles Antechamber",
  //       description:
  //         "Floors polished to a high sheen (dark chocolate), intricate royal icing piping decorates the walls. Air hums with the energy of sophisticated sugary security systems.",
  //     },
  //   ],
  //   puzzles: [
  //     {
  //       id: "chasm-crossing",
  //       name: "The Perilous Buttercream Gap",
  //       sceneDescription:
  //         "Oh dear! A wide chasm filled with fluffy, tempting, but dangerously soft buttercream frosting blocks the corridor. On the far side, a reinforced gumdrop turret looks sturdy.",
  //       objective: "Cross the buttercream chasm without falling in.",
  //       fixedFunctionObject: {
  //         name: "Sturdy Candy Cane",
  //         description:
  //           "A large, festive candy cane. Hard, sugary, with a convenient hook. Normally for decoration or slow consumption.",
  //       },
  //       solutionNarrative:
  //         "Leaping is out, wading is worse! Eyeing the gumdrop turret opposite, you whirl your sturdy candy cane like a tiny, sugary grappling hook. With a flick of the wrist, the hook sails across and catches firmly! Holding tight, you take a running leap and swing gleefully across the buttercream abyss!",
  //       controlVariantHint:
  //         "That buttercream looks soft... and deep. Need to get across somehow. Your candy cane has a rather useful hook shape!",
  //       experimentalVariantHint:
  //         "Wide buttercream gap. High above, you see a licorice spider lowering itself safely using a long strand of its own silk wrapped around a distant marzipan flower. Your candy cane's hook could snag something...",
  //       narrativeJustification:
  //         "This chasm separates the entry hall from the West Wing bakery, where intelligence suggests the Vault schematics are kept (likely drawn in icing). Getting these plans avoids blundering into guarded areas.",
  //     },
  //     {
  //       id: "key-snagging",
  //       name: "The Sprinkles Sound Trap Key",
  //       sceneDescription:
  //         "Blast! The key to the Pantry Passage (a known shortcut!) dangles from a hook high on the far wall. Problem: the entire floor between here and there is covered in a thick layer of crunchy, multi-colored sprinkles – impossible to cross silently!",
  //       objective: "Retrieve the key without making noise on the sprinkles.",
  //       fixedFunctionObject: {
  //         name: "Coil of Liquorice Whip",
  //         description:
  //           "A long, flexible strand of black liquorice candy. Chewy, slightly stretchy.",
  //       },
  //       solutionNarrative:
  //         "Can't walk on that! Uncoiling your long liquorice whip, you take careful aim. With a practiced flick learned from years of pilfering pies, the whip snakes out, wraps around the key ring, and yanks it off the hook! You reel it in silently. Clever Pip!",
  //       controlVariantHint:
  //         "Key's way over there. But stepping on those sprinkles will wake the whole fortress! Need reach... Your liquorice whip is quite long...",
  //       experimentalVariantHint:
  //         "Key hangs high over the noisy floor. A nearby tapestry depicts a legendary gnome hero using a strand of enchanted pulled sugar to lasso a jewel from a sleeping dragon's hoard. Your liquorice whip is long and flexible...",
  //       narrativeJustification:
  //         "The Pantry Passage bypasses Marzipan Mallory's security hub. She's currently distracted (reports mention a rogue gingerbread man). Retrieving this key silently allows you to slip past her main surveillance area.",
  //     },
  //     {
  //       id: "distracting-guards",
  //       name: "The Unamused Gingerbread Duo",
  //       sceneDescription:
  //         "Two formidable Gingerbread Guards, armed with sharpened candy cane spears, stand rigidly before the Vault corridor entrance. Their gumdrop eyes are fixed forward, expressions decidedly unsweet.",
  //       objective: "Distract the guards to slip past them.",
  //       fixedFunctionObject: {
  //         name: "Bag of Super-Sour Lemon Drops",
  //         description:
  //           "A bag of intensely sour candies. Known to cause extreme facial puckering.",
  //       },
  //       solutionNarrative:
  //         "Fighting them is folly! Opening your bag, you take out two Super-Sour Lemon Drops. With a silent underhand toss, you roll one towards each guard's feet. Curiosity gets the better of them. They pop the candies in their mouths... and instantly their faces contort into magnificent puckers! Eyes water, spears wobble – distracted! You dart past.",
  //       controlVariantHint:
  //         "Those guards look tough. Need a diversion... something to really make them... react. Your lemon drops are legendarily sour.",
  //       experimentalVariantHint:
  //         "Stern guards block the path. You overhear one muttering about how distracting hiccups were after Sergeant Jawbreaker told a particularly fizzy joke. Your lemon drops are known for causing... strong reactions.",
  //       narrativeJustification:
  //         "This is the final guard post before the Vault's automated defenses. Direct confrontation would trigger alarms fortress-wide. A non-combative, intensely distracting maneuver is essential to proceed undetected.",
  //     },
  //     {
  //       id: "pressure-plate-weight",
  //       name: "The Finicky Fudge Plate",
  //       sceneDescription:
  //         "Inside the Vault antechamber, a square section of the dark chocolate floor looks different – a pressure plate made of fudge! A thin red beam from a syrup laser grid crosses the path just beyond it. The plate seems to need a very specific, light weight.",
  //       objective:
  //         "Apply the correct weight to the pressure plate to deactivate the laser grid.",
  //       fixedFunctionObject: {
  //         name: "Half-Eaten Gingerbread Man",
  //         description:
  //           "Your gingerbread cookie companion, currently missing a leg. Still edible... or useful?",
  //       },
  //       solutionNarrative:
  //         "Hmm, needs just a little weight. You retrieve your Half-Eaten Gingerbread Man. Carefully, you place him (or what's left of him) gently onto the center of the fudge plate. The syrup laser flickers... and vanishes! Perfect weight! Sorry, old friend...",
  //       controlVariantHint:
  //         "That fudge plate looks delicate. Too much weight, alarm. Too little, nothing. Need something light... but not *too* light... Your gingerbread man snack is in your pocket.",
  //       experimentalVariantHint:
  //         "Sensitive fudge plate. A nearby diagram shows the calibration procedure for the Vault's scales, using 'standard confectionery counterweights' – which look remarkably like gingerbread men of various sizes. Your gingerbread man seems... potentially standard issue?",
  //       narrativeJustification:
  //         "This pressure plate is directly linked to the syrup laser grid guarding the Vault door itself. Deactivating it is the final step before confronting the Vault lock. Triggering the alarm here means Marzipan Mallory arrives in seconds.",
  //     },
  //   ],
  //   controlVariantIntro:
  //     "Behold Wobbleton! A city built of dreams and desserts! You are Pip Stickyfingers, and tonight, sugary justice will be served! Earl Grey's Fondant Fortress awaits, and within it, the Everlasting Gobstopper. Let the Grand Pudding Heist begin!",
  //   experimentalVariantIntro:
  //     "Behold Wobbleton! A city built of dreams and desserts! You are Pip Stickyfingers, and tonight, sugary justice will be served! Earl Grey's Fondant Fortress awaits, and within it, the Everlasting Gobstopper. Let the Grand Pudding Heist begin!",
  // },
];

// Helper function (or place it in a utility file)
export const getWorldConfig = (worldId: number): WorldDefinition => {
  const world = worldDefinitions.find((w) => w.id === worldId);
  if (!world) {
    throw new Error(`Configuration for world ID ${worldId} not found.`);
  }
  return world;
};
