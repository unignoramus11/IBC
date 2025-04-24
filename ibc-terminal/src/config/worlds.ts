/**
 * worlds.ts
 * ---------
 * Defines the configuration for all adventure worlds and puzzles in the IBC Terminal research platform.
 * Each world contains variant-specific context for functional fixedness research, including priming and control conditions.
 *
 * Exports:
 * - Puzzle, World: TypeScript interfaces for world and puzzle structure
 * - getWorldConfig: Returns the configuration for a given worldId
 */

// World configurations for the five adventure worlds

export interface Puzzle {
  id: string;
  name: string;
  description: string;
  fixedFunctionObject: string;
  solution: string;
  controlVariant: string; // Variant A - standard context
  experimentalVariant: string; // Variant B - priming context
}

export interface World {
  id: number;
  name: string;
  description: string;
  startingInventory: string[];
  mainObjectives: string[];
  puzzles: Puzzle[];
  controlVariant: {
    intro: string;
    environmentDescriptions: Record<string, string>;
  };
  experimentalVariant: {
    intro: string;
    environmentDescriptions: Record<string, string>;
  };
}

// Array of world configurations
const worlds: World[] = [
  // World 0: Neo-Tokyo 2099
  {
    id: 0,
    name: "Neo-Tokyo 2099",
    description:
      "A cyberpunk dystopia where technology is both ubiquitous and broken. The city is a maze of neon-lit streets, towering megacorporations, and shadowy back alleys. Most systems are automated but unreliable, requiring creative solutions to navigate the urban jungle.",
    startingInventory: ["Personal Datapad", "ID Chip", "Credstick (empty)"],
    mainObjectives: [
      "Find a way into the restricted TechCorp building",
      "Locate the prototype neural interface",
      "Escape the city before the manhunt begins",
    ],
    puzzles: [
      {
        id: "sliding-door",
        name: "The Sliding Door",
        description:
          "A security door keeps closing automatically before you can get through.",
        fixedFunctionObject:
          "Datapad (normally used for communication/information)",
        solution:
          "Use the datapad as a physical wedge to keep the sliding door from closing",
        controlVariant:
          "Your smartpad shows a notification about low battery. The security door ahead keeps closing automatically before you can get through.",
        experimentalVariant:
          "You notice someone has jammed a thin smartpad under a door down the hallway to keep it from closing. Your own smartpad shows a notification about low battery. The security door ahead keeps closing automatically before you can get through.",
      },
      {
        id: "electric-panel",
        name: "The Circuit Breaker",
        description:
          "An exposed electrical panel needs to be bypassed to restore power to an elevator.",
        fixedFunctionObject:
          "ID Chip (normally used for identification/access)",
        solution:
          "Use the metal contacts on the ID chip to bridge a circuit in the electrical panel",
        controlVariant:
          "The elevator is offline. Nearby, an electrical panel has its cover removed, showing several disconnected circuits. Your ID chip glints in the dim light.",
        experimentalVariant:
          "The elevator is offline. Nearby, an electrical panel has its cover removed. You notice a maintenance worker across the hall using the metal contacts of their ID card to test electrical continuity between points. Your own ID chip glints in the dim light.",
      },
      {
        id: "biometric-scanner",
        name: "The Biometric Lock",
        description:
          "A door requires a fingerprint scan, but you don't have authorized prints.",
        fixedFunctionObject:
          "Adhesive bandage (normally used for covering wounds)",
        solution:
          "Use the adhesive side of the bandage to lift a fingerprint from a surface and apply it to the scanner",
        controlVariant:
          "A door ahead requires a fingerprint scan for access. You notice a first aid kit on the wall with various supplies including adhesive bandages. The surface of the scanner is smudged with previous fingerprints.",
        experimentalVariant:
          "A door ahead requires a fingerprint scan for access. In a security video playing on a nearby screen, you see a thief using adhesive tape to lift fingerprints from a glass. You notice a first aid kit on the wall with various supplies including adhesive bandages. The surface of the scanner is smudged with previous fingerprints.",
      },
    ],
    controlVariant: {
      intro:
        "Welcome to Neo-Tokyo 2099. The neon lights cast a harsh glow over the rain-slicked streets as you navigate through the crowded undercity. Your mission to infiltrate TechCorp begins now, with nothing but your wits and a few basic items to aid you.",
      environmentDescriptions: {
        street:
          "The streets are crowded with people and autonomous drones. Holographic advertisements flicker overhead, while security cameras track movements at every corner.",
        alley:
          "A narrow alley between towering buildings. Discarded tech and refuse litter the ground. The walls are covered in graffiti and illegal augmentation advertisements.",
        lobby:
          "The corporate lobby is sterile and minimalist. Security drones patrol regularly, and automated systems track all visitors.",
      },
    },
    experimentalVariant: {
      intro:
        "Welcome to Neo-Tokyo 2099. The neon lights cast a harsh glow over the rain-slicked streets as you navigate through the crowded undercity. Your mission to infiltrate TechCorp begins now, with nothing but your wits and a few basic items to aid you.",
      environmentDescriptions: {
        street:
          "The streets are crowded with people and autonomous drones. A street vendor uses a credit chip to prop up their wobbly display table. Holographic advertisements flicker overhead.",
        alley:
          "A narrow alley between towering buildings. A maintenance worker uses an ID card to scrape gum off their shoe. Discarded tech and refuse litter the ground.",
        lobby:
          "The corporate lobby is sterile and minimalist. A visitor at the desk is pressing a piece of tape against a coffee cup, then carefully transferring something to their pocket.",
      },
    },
  },

  // World 1: Forgotten Castle
  {
    id: 1,
    name: "Forgotten Castle",
    description:
      "A medieval fantasy realm with ancient magic and mysterious artifacts. The castle is an ancient structure dating back centuries, with numerous secret passages, enchanted objects, and mystical barriers. The magic that once powered the castle is fading, creating unpredictable effects throughout the structure.",
    startingInventory: ["Unlit torch", "Small dagger", "Empty waterskin"],
    mainObjectives: [
      "Find the lost crown of the ancient king",
      "Discover what caused the castle's abandonment",
      "Escape before the mystical barriers seal permanently",
    ],
    puzzles: [
      {
        id: "ancient-lock",
        name: "The Ancient Lock",
        description:
          "An ornate door is sealed with a peculiar lock that won't accept conventional keys.",
        fixedFunctionObject: "Dagger (normally used as a weapon)",
        solution:
          "Use the dagger as a makeshift key by inserting its handle pattern into the lock",
        controlVariant:
          "The heavy wooden door is held shut by an unusual lock with a star-shaped keyhole. Your dagger feels heavy in its sheath.",
        experimentalVariant:
          "The heavy wooden door is held shut by an unusual lock with a star-shaped keyhole. On a nearby table, you notice someone has left behind a knife with an ornately carved star-patterned hilt. Your own dagger has a similar hilt design.",
      },
      {
        id: "broken-bridge",
        name: "The Broken Bridge",
        description:
          "A stone bridge has collapsed, leaving a gap too wide to jump across.",
        fixedFunctionObject: "Shield (normally used for protection)",
        solution:
          "Place the shield flat across the gap to create a temporary bridge",
        controlVariant:
          "The stone bridge has collapsed, leaving a gap about three feet wide. Below, jagged rocks line a deep crevasse. A discarded shield leans against the wall nearby.",
        experimentalVariant:
          "The stone bridge has collapsed, leaving a gap about three feet wide. Below, jagged rocks line a deep crevasse. Nearby, you see a servant using a large serving tray as a makeshift platform to cross between two tables. A discarded shield leans against the wall.",
      },
      {
        id: "sealed-room",
        name: "The Sealed Chamber",
        description:
          "A chamber filled with ancient scrolls is sealed tight with no apparent way to open it.",
        fixedFunctionObject: "Torch (normally used for light)",
        solution:
          "Use the smoke from the torch to reveal hidden air vents that can be manipulated to open the chamber",
        controlVariant:
          "The chamber door has no visible handle or lock. The smooth stone wall feels cool to the touch. Your unlit torch could provide some light in this dim corridor.",
        experimentalVariant:
          "The chamber door has no visible handle or lock. In an adjacent room, you notice how smoke from the fireplace reveals the subtle airflow through nearly invisible vents. Your unlit torch could provide some light in this dim corridor.",
      },
    ],
    controlVariant: {
      intro:
        "The Forgotten Castle looms before you, a silent giant against the twilight sky. Legends speak of treasures and dangers within its weathered walls. Armed with only basic equipment, you step through the partially open main gate.",
      environmentDescriptions: {
        courtyard:
          "The overgrown courtyard is littered with fallen statues and crumbling stonework. Vines climb the walls, and birds nest in the decaying towers.",
        "great-hall":
          "Once a place of feasts and celebrations, the great hall now lies in ruins. Massive tables are covered in dust, and tattered banners hang from the rafters.",
        library:
          "Bookshelves stretch from floor to ceiling, many books now rotting or covered in cobwebs. A layer of dust covers everything.",
      },
    },
    experimentalVariant: {
      intro:
        "The Forgotten Castle looms before you, a silent giant against the twilight sky. Legends speak of treasures and dangers within its weathered walls. Armed with only basic equipment, you step through the partially open main gate.",
      environmentDescriptions: {
        courtyard:
          "In the overgrown courtyard, a fallen statue serves as a makeshift bridge over a small stream. Vines climb the walls, and birds nest in the decaying towers.",
        "great-hall":
          "A servant uses the flat side of a decorative shield to transport multiple goblets across the hall. Massive tables are covered in dust, and tattered banners hang from the rafters.",
        library:
          "The librarian waves an incense holder, watching how the smoke patterns reveal hidden air currents that lead to concealed shelves.",
      },
    },
  },

  // World 2: Chronos Station
  {
    id: 2,
    name: "Chronos Station",
    description:
      "An abandoned space station with malfunctioning systems. Once the pride of human achievement in deep space, Chronos Station now drifts silently, its corridors empty and its systems failing. Time behaves strangely here, with anomalies causing unpredictable effects.",
    startingInventory: [
      "Emergency Beacon (inactive)",
      "Multitool",
      "Half-charged Oxygen Tank",
    ],
    mainObjectives: [
      "Restore primary power to critical systems",
      "Discover what happened to the station's crew",
      "Secure an escape pod before the station's orbit decays",
    ],
    puzzles: [
      {
        id: "radiation-barrier",
        name: "The Radiation Barrier",
        description:
          "A corridor is flooded with radiation, making it impossible to pass safely.",
        fixedFunctionObject: "Food tray (normally used for holding meals)",
        solution:
          "Use the reflective bottom surface of the metal food tray to deflect the radiation beam",
        controlVariant:
          "A warning light flashes in the corridor ahead, indicating dangerous radiation levels. Through the viewport, you can see a beam of energy cutting across the passage. The galley nearby contains various items including metal food trays.",
        experimentalVariant:
          "A warning light flashes in the corridor ahead, indicating dangerous radiation levels. Through the viewport, you can see a beam of energy cutting across the passage. In a nearby lab, a scientist's log shows diagrams of using reflective surfaces to redirect similar radiation beams. The galley contains various items including metal food trays.",
      },
      {
        id: "sealed-airlock",
        name: "The Sealed Airlock",
        description:
          "An airlock has malfunctioned, with its manual override inaccessible behind a panel.",
        fixedFunctionObject:
          "Access Card (normally used for electronic access)",
        solution:
          "Use the thin edge of the access card to pry open the panel and reach the manual override",
        controlVariant:
          "The airlock door remains sealed, with the control panel flashing red. A small access panel nearby is tightly shut. Your access card doesn't seem to work with any of the operational readers.",
        experimentalVariant:
          "The airlock door remains sealed, with the control panel flashing red. Nearby, you see a maintenance worker using a thin piece of metal to pry open a similar panel. Your access card doesn't seem to work with any of the operational readers.",
      },
      {
        id: "quantum-lock",
        name: "The Quantum Lock",
        description:
          "A security door requires quantum entanglement to unlock, but the authentication device is damaged.",
        fixedFunctionObject:
          "Holographic Display (normally used for viewing information)",
        solution:
          "Repurpose the holographic display's quantum projection system to simulate the authentication pattern",
        controlVariant:
          "The security door is locked with a sophisticated quantum mechanism. The authentication device is clearly damaged. A portable holographic display sits on a nearby workstation, still functional.",
        experimentalVariant:
          "The security door is locked with a sophisticated quantum mechanism. The authentication device is clearly damaged. A research note on a nearby workstation discusses how holographic displays operate using similar quantum principles to the security system. A portable holographic display sits nearby, still functional.",
      },
    ],
    controlVariant: {
      intro:
        "The airlock cycles closed behind you, sealing you inside Chronos Station. Emergency lights provide minimal illumination, and the silence is broken only by occasional mechanical groans and electronic beeps. Something went very wrong here.",
      environmentDescriptions: {
        hub: "The central hub connects to various parts of the station. Status displays flash warnings and errors, and some passages are blocked by security protocols.",
        quarters:
          "The crew quarters are in disarray, with personal belongings scattered as if abandoned in a hurry. Many doors are locked or jammed.",
        lab: "Scientific equipment fills the laboratory, much of it damaged or in standby mode. Research samples and data tablets are strewn about.",
      },
    },
    experimentalVariant: {
      intro:
        "The airlock cycles closed behind you, sealing you inside Chronos Station. Emergency lights provide minimal illumination, and the silence is broken only by occasional mechanical groans and electronic beeps. Something went very wrong here.",
      environmentDescriptions: {
        hub: "In the central hub, a technician's body is slumped next to an open panel where they used their ID card as a makeshift screwdriver. Status displays flash warnings.",
        quarters:
          "In the crew quarters, someone has set up a makeshift table using a serving tray balanced across two storage containers. Many doors are locked or jammed.",
        lab: "In the laboratory, a partially completed experiment shows how the researchers were redirecting particle beams using reflective surfaces to create quantum entanglement.",
      },
    },
  },

  // World 3: Subterranean Nexus
  {
    id: 3,
    name: "Subterranean Nexus",
    description:
      "An underground network of caves and lost civilizations. Deep beneath the earth's surface lies an expansive cavern system that houses the remains of a technologically advanced civilization. Natural cave formations intermingle with ancient architecture and dormant machinery.",
    startingInventory: [
      "Rechargeable Lantern (low battery)",
      "Coil of rope",
      "Energy bar",
    ],
    mainObjectives: [
      "Activate the ancient transportation network",
      "Recover the underground civilization's historical records",
      "Find a way back to the surface before cave-ins block the route",
    ],
    puzzles: [
      {
        id: "crystal-lock",
        name: "The Crystal Mechanism",
        description:
          "A door is locked by a mechanism that requires specific light wavelengths to unlock.",
        fixedFunctionObject: "Water bottle (normally used for drinking)",
        solution:
          "Fill the water bottle and use it as a lens to focus and refract light into the correct pattern",
        controlVariant:
          "The stone door is inset with crystalline receptors that seem to respond to light. Your lantern's beam alone doesn't trigger any reaction. You have an empty water bottle in your pack.",
        experimentalVariant:
          "The stone door is inset with crystalline receptors that seem to respond to light. In a nearby chamber, you notice how water droplets from the ceiling are creating rainbow patterns when they catch the light. You have an empty water bottle in your pack.",
      },
      {
        id: "sound-canyon",
        name: "The Sonic Chasm",
        description:
          "A deep chasm blocks the path, with evidence that sound waves can activate a hidden bridge.",
        fixedFunctionObject: "Metal container (normally used for storage)",
        solution:
          "Use the metal container as a makeshift percussion instrument to create the correct resonance frequency",
        controlVariant:
          "A deep chasm cuts across the passage. Unusual rock formations line the walls, and you notice faint harmonic vibrations in the air. You have an empty metal container in your pack.",
        experimentalVariant:
          "A deep chasm cuts across the passage. Nearby, water dripping onto different rock formations creates musical tones that cause small stone platforms to temporarily extend. You have an empty metal container in your pack.",
      },
      {
        id: "pressure-plates",
        name: "The Pressure Mechanism",
        description:
          "A series of pressure plates must be simultaneously activated to open a passageway.",
        fixedFunctionObject: "Notebook (normally used for writing)",
        solution:
          "Tear pages from the notebook, fold them to create rigid structures that can be placed on the pressure plates",
        controlVariant:
          "The passage ahead has several stone plates on the floor that sink when stepped on, but rise again when weight is removed. Your backpack contains a notebook with blank pages.",
        experimentalVariant:
          "The passage ahead has several stone plates on the floor that sink when stepped on, but rise again when weight is removed. In a nearby room, you notice how someone has folded parchment into structured shapes to hold small objects above water. Your backpack contains a notebook with blank pages.",
      },
    ],
    controlVariant: {
      intro:
        "The narrow tunnel opens into a vast underground cavern, revealing structures clearly built by intelligent hands. Your lantern casts long shadows across stone and metal surfaces untouched for millennia. The air is surprisingly fresh, suggesting hidden ventilation systems.",
      environmentDescriptions: {
        "main-cavern":
          "Stalactites and stalagmites frame the enormous cavern, where artificial structures blend seamlessly with natural formations. Glowing fungi provide dim illumination.",
        "ancient-city":
          "The buildings of the underground city are constructed of stone and an unknown metal alloy. Strange symbols decorate the walls, and inactive machinery sits in silent squares.",
        "crystal-garden":
          "Crystal formations of various colors and sizes grow throughout this cavern, some seemingly cultivated in specific patterns. They respond to light with subtle hums and color changes.",
      },
    },
    experimentalVariant: {
      intro:
        "The narrow tunnel opens into a vast underground cavern, revealing structures clearly built by intelligent hands. Your lantern casts long shadows across stone and metal surfaces untouched for millennia. The air is surprisingly fresh, suggesting hidden ventilation systems.",
      environmentDescriptions: {
        "main-cavern":
          "A clever explorer has used an empty bottle filled with luminescent fungi as an improvised lamp. Stalactites and stalagmites frame the enormous cavern, where artificial structures blend with natural formations.",
        "ancient-city":
          "Among the ruins, you notice how someone has used metal debris to create percussive sounds that activate small mechanisms in doorways.",
        "crystal-garden":
          "An abandoned research station shows diagrams of how the ancient inhabitants created folded paper structures to hold multiple crystals in specific arrangements.",
      },
    },
  },

  // World 4: Ethereal Planes
  {
    id: 4,
    name: "Ethereal Planes",
    description:
      "A dreamlike dimension where reality itself is malleable. The boundaries between thought and physical reality blur in this strange realm. The environment responds to emotions and intentions, landscapes shift unexpectedly, and conventional physics applies only loosely.",
    startingInventory: [
      "Reality Anchor (partially functional)",
      "Memory Crystal",
      "Emotion Vial (empty)",
    ],
    mainObjectives: [
      "Stabilize your presence in this shifting reality",
      "Locate the Nexus of Consciousness that controls the realm",
      "Find a way to return to your own dimension before your mind merges with the Ethereal Planes",
    ],
    puzzles: [
      {
        id: "thought-barrier",
        name: "The Barrier of Doubt",
        description:
          "A barrier of swirling negative energy blocks the path, strengthened by doubt and fear.",
        fixedFunctionObject: "Mirror (normally used for reflection)",
        solution:
          "Position the mirror to reflect the barrier back on itself, causing it to doubt its own existence",
        controlVariant:
          "A churning wall of dark energy blocks the path ahead, growing stronger when you feel uncertainty. It seems to feed on negative emotions. You have a small hand mirror in your pack.",
        experimentalVariant:
          "A churning wall of dark energy blocks the path ahead. Nearby, you notice how a reflective pool is causing ripples in a similar energy formation, seemingly confusing its structure. You have a small hand mirror in your pack.",
      },
      {
        id: "dream-lock",
        name: "The Memory Seal",
        description:
          "A door is sealed with a lock that requires specific memories to open.",
        fixedFunctionObject:
          "Emotion Vial (normally used to store emotional essence)",
        solution:
          "Use the empty emotion vial to capture the ambient memory fragments floating in the air, then apply them to the lock",
        controlVariant:
          "The ornate door appears to be made of solidified memories, with a receptacle that pulses with expectation. Fragments of memory float through the air like motes of dust. You have an empty emotion vial that could hold something.",
        experimentalVariant:
          "The ornate door appears to be made of solidified memories. Nearby, a dreaming entity is using a bubble-like container to collect floating memory fragments. You notice how the collected memories interact with similar doors. You have an empty emotion vial that could hold something.",
      },
      {
        id: "reality-flux",
        name: "The Shifting Chasm",
        description:
          "A gap in reality constantly changes width, making it impossible to cross consistently.",
        fixedFunctionObject:
          "Reality Anchor (normally used to stabilize your presence)",
        solution:
          "Place the reality anchor not on yourself but on the chasm, forcing it to maintain a single stable state",
        controlVariant:
          "The path ahead repeatedly fractures into a chasm of swirling colors and void, its width changing unpredictably. Your reality anchor helps keep you from being affected by the dimensional shifts around you.",
        experimentalVariant:
          "The path ahead repeatedly fractures into a chasm of swirling colors and void. In another area, you notice a traveler placing a similar anchor device on an unstable object rather than themselves, causing the object to maintain a consistent state. Your reality anchor helps keep you from being affected by the dimensional shifts.",
      },
    ],
    controlVariant: {
      intro:
        "Colors and shapes that shouldn't exist swirl around you as you materialize in the Ethereal Planes. The ground beneath your feet feels simultaneously solid and insubstantial. Your thoughts seem to echo in the air, and distant whispers of others' dreams reach your consciousness.",
      environmentDescriptions: {
        "memory-fields":
          "Fragments of memories, both yours and others', float through the air like dandelion seeds. The landscape shifts subtly based on which memories are currently dominant.",
        "dream-forest":
          "Trees made of crystallized dreams grow in impossible patterns, their branches reaching into different realities. Creatures formed from collective subconscious flit between the trunks.",
        "emotion-sea":
          "A vast ocean of swirling emotions stretches to the horizon, its colors and consistency changing with the collective feelings of all beings connected to this realm.",
      },
    },
    experimentalVariant: {
      intro:
        "Colors and shapes that shouldn't exist swirl around you as you materialize in the Ethereal Planes. The ground beneath your feet feels simultaneously solid and insubstantial. Your thoughts seem to echo in the air, and distant whispers of others' dreams reach your consciousness.",
      environmentDescriptions: {
        "memory-fields":
          "A wise entity uses a reflective surface to redirect a negative emotion back to its source, causing it to dissipate. Fragments of memories float through the air like dandelion seeds.",
        "dream-forest":
          "Among the crystallized dream trees, you notice how travelers place anchoring devices on shifting paths rather than on themselves, creating stable routes through chaos.",
        "emotion-sea":
          "At the shore of the emotion sea, collectors use empty vessels to capture specific emotional currents for later use in emotional locks and barriers.",
      },
    },
  },

  // World 5: The Late Night Office (SHORT)
  {
    id: 5,
    name: "The Late Night Office (SHORT)",
    description:
      "It's late, everyone else has gone home, and you find yourself accidentally locked inside the office building after hours. The main power is partially shut down for the night, leaving only emergency lights and locking most automated doors. You need to find a way out using only what's available around you.",
    startingInventory: [
      "Paperclip",
      "Plastic Ruler (30cm)",
      "Empty Coffee Mug",
    ],
    mainObjectives: [
      "Find a way to bypass the locked main exit door",
      "Escape the office building",
    ],
    puzzles: [
      {
        id: "key-retrieval",
        name: "The Dropped Key",
        description:
          "You see the security override key needed for the main exit, but it has fallen through a narrow grate in the floor near the security desk. The gap is too small for your hand.",
        fixedFunctionObject:
          "Paperclip (normally used for holding papers together)",
        solution:
          "Unbend the paperclip to create a small hook, then carefully fish the key out through the grate.",
        controlVariant:
          "The override key rests tantalizingly just below the floor grate, visible but out of reach. Your fingers won't fit through the openings. A box of paperclips sits on the nearby desk.",
        experimentalVariant:
          "The override key rests tantalizingly just below the floor grate, visible but out of reach. You notice a bent paperclip lying near the grate, as if someone already tried (or succeeded) fishing something out. A box of fresh paperclips sits on the nearby desk.",
      },
      {
        id: "button-press",
        name: "The High Emergency Button",
        description:
          "The manual door release for the main exit is located behind a protective mesh high on the wall, slightly too high for you to reach comfortably and press effectively through the mesh.",
        fixedFunctionObject:
          "Plastic Ruler (normally used for measuring or drawing straight lines)",
        solution:
          "Use the end of the rigid plastic ruler to poke through the mesh and press the emergency release button.",
        controlVariant:
          "The red emergency door release button is visible behind a protective wire mesh high up on the wall near the exit. It looks just out of comfortable reach. A plastic ruler lies on a nearby table among some documents.",
        experimentalVariant:
          "The red emergency door release button is visible behind a protective wire mesh high up on the wall near the exit. You notice scuff marks on the wall near the button, consistent with someone using a long object to reach it. A plastic ruler lies on a nearby table.",
      },
    ],
    controlVariant: {
      intro:
        "The main lights click off, plunging the office into the dim glow of emergency lighting. You hear the heavy magnetic lock on the main door engage. You're locked in. Time to find a way out.",
      environmentDescriptions: {
        "office-floor":
          "Desks are tidy or cluttered, monitors dark. Emergency lights cast long shadows. The air conditioning is off, making the room slightly stuffy.",
        "security-area":
          "A small desk near the main exit with a disabled security monitor. This is where the override key seems to have been dropped near a floor grate.",
        "main-exit":
          "The large glass main doors are firmly locked. A red emergency release button is mounted high on the wall next to it, behind protective mesh.",
      },
    },
    experimentalVariant: {
      intro:
        "The main lights click off, plunging the office into the dim glow of emergency lighting. You hear the heavy magnetic lock on the main door engage. Earlier, you saw the janitor using a ruler to push a reset button on the thermostat and fiddling near a floor grate with a piece of wire. Maybe that's useful? You're locked in. Time to find a way out.",
      environmentDescriptions: {
        "office-floor":
          "Desks are tidy or cluttered, monitors dark. Emergency lights cast long shadows. The air conditioning is off, making the room slightly stuffy. A coffee mug is wedged under a filing cabinet drawer to keep it slightly ajar.", // Hint for general unconventional use, not specific puzzle.
        "security-area":
          "A small desk near the main exit with a disabled security monitor. The override key has fallen through the grate. A bent paperclip lies nearby, as if used as a tool.", // Hint for paperclip puzzle
        "main-exit":
          "The large glass main doors are firmly locked. A red emergency release button is mounted high on the wall, behind protective mesh. There are faint scuff marks near the button, suggesting it's been poked with something long before.", // Hint for ruler puzzle
      },
    },
  },

  // World 6: Server Room Glitch (SHORT)
  {
    id: 6,
    name: "Server Room Glitch (SHORT)",
    description:
      "You're pulling an all-nighter debugging code in the university's server room. Suddenly, a power fluctuation trips a security protocol. The main door locks with a heavy CLUNK, the network drops, and the main control terminal freezes, displaying only a cryptic kernel panic message. Emergency lights are on, but you're trapped. You need to find a manual override or restore minimal system control to escape.",
    startingInventory: [
      "Ethernet Cable (3m, unplugged)",
      "Blank CD-R",
      "USB Stick (FAT32 formatted, empty)",
    ],
    mainObjectives: [
      "Find and activate the manual door release mechanism",
      "Escape the server room before the backup power fails",
    ],
    puzzles: [
      {
        id: "contact-bridge",
        name: "The Override Jumper",
        description:
          "You've located a dusty manual override panel near the door. The cover is off, revealing two contact points labelled 'DOOR_RELEASE_JMP'. They need to be momentarily connected to trigger the lock release, but they're slightly recessed and too far apart to bridge with just your fingers.",
        fixedFunctionObject:
          "Ethernet Cable (normally used for network connection)",
        solution:
          "Use the exposed metal pins on one of the RJ45 connectors of the Ethernet cable to carefully bridge the two contact points simultaneously.",
        controlVariant:
          "The manual override panel has two clearly marked contact points needing to be bridged. Your fingers can't quite reach both securely. A spare Ethernet cable lies coiled on a nearby rack shelf.",
        experimentalVariant:
          "The manual override panel has two clearly marked contact points. Taped next to it is a faded, hand-written note: 'PSU Test: Jumper pins 1+3 w/ wire/clip if console dead'. A spare Ethernet cable lies coiled nearby. You remember seeing a lab tech using the end of a network cable to test pin continuity on a breadboard last week.",
      },
      {
        id: "optical-sensor-align",
        name: "The Misaligned Sensor",
        description:
          "Part of the door release sequence seems to require confirming an optical beam sensor pair is aligned (perhaps a safety feature). One sensor, blinking faintly, is positioned inside the door frame, but its corresponding emitter or reflector target on the door itself is obstructed by a dangling bundle of poorly-managed cables you can't easily move.",
        fixedFunctionObject: "Blank CD-R (normally used for data storage)",
        solution:
          "Use the reflective surface of the blank CD-R as a makeshift mirror. Angle it carefully to redirect the blinking light from the sensor back onto itself (or onto its intended target past the obstruction), simulating alignment.",
        controlVariant:
          "You trace the wiring from the override panel to an optical sensor inside the door frame, blinking weakly. Its line-of-sight to the door is blocked by a thick bundle of zip-tied cables. A spindle of blank CD-Rs sits on a dusty server case nearby.",
        experimentalVariant:
          "You trace the wiring to a blinking optical sensor, blocked by cables. You recall a lecture slide showing how fiber optic signals can be looped back for testing using reflective surfaces. Nearby, someone has used a shiny CD shard wedged into a server rack to reflect a status LED towards a monitoring camera. A spindle of blank CD-Rs sits on a dusty server case.",
      },
    ],
    controlVariant: {
      intro:
        "ERROR: Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(0,0). The terminal freezes. The door locks. The main lights go out. Just great. You're stuck in the server room's cold air hum.",
      environmentDescriptions: {
        "server-racks":
          "Rows of humming server racks fill the room. Cable management ranges from neat to 'cable spaghetti'. Various components like spare drives, cables, and manuals are scattered on top of less-used machines.",
        "control-terminal":
          "The main KVM switch and monitor are useless, displaying the kernel panic. The keyboard is unresponsive.",
        "door-area":
          "The heavy metal door is sealed tight. Beside it is the manual override panel with its cover missing, and the optical sensor embedded in the frame.",
      },
    },
    experimentalVariant: {
      intro:
        "ERROR: Kernel panic - not syncing... The terminal freezes, door locks, lights go out. Typical. You remember your OS professor joking about 'percussive maintenance' and using 'whatever conductive thing is handy' for hardware debug. Time to apply that creativity. You're stuck.",
      environmentDescriptions: {
        "server-racks":
          "Rows of humming servers. Someone has propped open a server chassis lid using an old network card for better airflow. Cable management is a nightmare in places. You see a note taped to one rack: 'Diagnostic port pins: TX, RX, GND... Jumper RX-TX for loopback test'.", // Hints at unconventional use of pins/connectors & jury-rigging
        "control-terminal":
          "The main KVM is frozen. Someone left a Linux cheat sheet nearby showing diagrams for terminal commands.", // Flavor, less direct hint
        "door-area":
          "The heavy door is sealed. The override panel is exposed. You notice a faint scratch mark between the two contact points, like something metallic was dragged across them. The optical sensor blinks, partially obscured. A broken piece of a CD lies on the floor nearby.", // Hints for both puzzles
      },
    },
  },
];

/**
 * Returns the configuration object for a given world ID.
 * @param worldId - The world index (0-4)
 * @returns The world configuration object
 * @throws If the worldId is not found
 */
export const getWorldConfig = (worldId: number): World => {
  const world = worlds.find((w) => w.id === worldId);

  if (!world) {
    throw new Error(`World with ID ${worldId} not found`);
  }

  return world;
};
