export const NARRATIVE = {
  intro: {
    wakeUp: "WAKE UP",
    title: "NEIGHBOURHOOD\nPROTOCOL",
    subtitle: "A story about neighbours. About choices.\nAbout what happens when you look the other way.",
    start: "START"
  },

  scene1: {
    label: "THE LOOKOUT",
    number: "01",

    // Dialogue — dark phase (before scene reveals)
    darkLine: "There goes another morning. I'm so tired… maybe I'll just skip class today. My head is killing me.",

    // After scene reveals: character at window
    atWindowLines: [
      "Ugh, I feel so sluggish. I really need to stop staying up so late.",
      "At least the neighbourhood is quiet for once… maybe the silence will help the headache.",
    ],

    // After truck arrives
    truckLines: [
      "Wait… what is that? I've never seen that truck before. Did Leo call someone? Or is he expecting a delivery?",
      "Who's even in there? I can't tell. The tint on the windows is so dark, I can't see shit. It's just… sitting there.",
    ],

    // After frame shake
    suspiciousLines: [
      "I don't know how I feel about this. It's too early for construction, and they haven't even gotten out of the car. This is beyond suspicious.",
      "Should I warn Leo? What if I'm just being paranoid? I don't want to overstep, but something feels… off. Like, really off.",
    ],

    prompt: "What should I do?",

    // Ignore branch
    ignoreLines: [
      "I'm just overthinking things. I shouldn't jump to conclusions. I've been watching too many movies…",
      "I'm sure it's nothing. I should just mind my own business. I'm going to make some coffee and forget I saw that truck.",
      "It's probably just the city fixing a pipe. Yeah. Just a pipe.",
    ],

    // Warn branch
    warnLines: [
      "Yeah, this is way too weird. It's bothering me too much to just sit here. I'm warning Leo.",
      "If I'm wrong, I'm just the 'crazy neighbour.' But if I'm right… I can't just watch this happen.",
    ],
    warningHint: "Type WARNING to alert Leo",

    choices: {
      action: "Warn Leo",
      ignore: "Ignore truck",
    },

    success: {
      outcome: "You chose to warn Leo. You decided to follow your gut, and your action saved him.",
      fact: "Community phone trees and neighbourhood alert networks have directly disrupted ICE operations in cities like Chicago, Los Angeles, and Minneapolis. A 2026 AP investigation found that 'ruse' arrests — using high-visibility vests, utility trucks, and unmarked vehicles — account for over 40% of residential ICE operations. Knowing the signs and sharing them is a protected act of community care.",
      source: "Source: AP, \"Undercover and Unmarked: The Rise of ICE 'Ruse' Arrests\" (Feb 2026)"
    },
    failure: {
      outcome: "You chose to ignore the truck. While you stayed quiet, Leo was taken in broad daylight.",
      fact: "ICE 'ruse' tactics exploit the appearance of ordinary workers — lumber trucks, utility vans, stuffed animals on dashboards — to lower a neighbourhood's guard. Once targeted, individuals have as little as 90 seconds before they are in federal custody. The tactic relies on bystander silence. Your silence was the tactic working as designed.",
      source: "Source: MPR News / AP, \"Extreme Ruses\" Report (Feb 2026)"
    }
  },

  scene2: {
    label: "THE WITNESS",
    number: "02",

    // Phase 1 — calm arrival at bus stop
    arrivalLines: [
      "Sigh… I can't believe I forgot to do groceries last night. This is what I get for being lazy sometimes.",
      "Now I'm hungry and have to leave the house when all I want to do is rot in bed.",
      "Hmm.. at least according to my phone, the bus will be here soon…",
    ],

    // Phase 2 — notices the lady reading
    lookUpLine: "Damn, look at me staring at my phone all the time. I should probably read a book just like the lady on the bench. My eyes actually hurt.",

    // Phase 3 — ICE agents tackle the girl
    arrestLines: [
      'Girl: "AAHHHH! WHAT ARE YOU DOING? GET OFF ME!"',
      'Agent 1: "SHUT UP! STOP RESISTING!"',
      'Girl: "YOU CAN\'T DO THIS! YOU\'RE HURTING ME! I AM A U.S. CITIZEN!"',
      'Agent 2: "WE HAVE AN ORDER. SECURE HER HANDS!"',
    ],

    // Phase 4 — witness reacts, agent confronts
    reactionLines: [
      "OMG! What the fuck??",
      "They are hurting her! They're literally throwing her onto the pavement!",
      '"HEY! Leave her alone! What are you doing?!"',
    ],
    confrontationLine: 'Agent 1: "STAY BACK! YOU ARE OBSTRUCTING FEDERAL AGENTS. DO YOU WANT TO GET LOCKED UP WITH HER?"',
    decisionLine: "My heart is pounding so fast I can barely breathe. What should I do? I don't want to get involved and potentially hurt myself... but I can't just stand here and watch this.",

    prompt: "What should I do?",
    choices: {
      action: "Film the scene",
      ignore: "Flee the scene",
    },

    // Flee branch
    fleeLines: [
      "I can't risk it. I need to get out of here before they turn on me, too.",
    ],

    // Film branch
    filmLines: [
      "I'm not leaving her alone here with these fuckers. There's no saying what they will do to her once there's no witness left.",
      "Holy shit, my hands are shaking so bad... let's hurry before they come for me.",
    ],

    success: {
      outcome: "You kept recording. You held your ground at ten feet. The footage became evidence.",
      fact: "A federal ruling confirmed that filming law enforcement from a \"safe distance\" — established as 10 feet — is a constitutionally protected right under the First Amendment. In January 2026, Reuters documented 650+ \"interference\" charges filed against bystanders who filmed ICE operations. Of those, 91% were later dropped or dismissed. Your camera is a legal tool.",
      source: "Source: Reuters, Gomez, A., \"The Witness Trap\" (Jan 2026)"
    },
    failure: {
      outcome: "You went inside. The arrest was unwitnessed. There is no footage. There is no accountability.",
      fact: "Without documentation, ICE field operations have no independent record. Bystander footage has been used to challenge unlawful arrests, identify officers who exceeded their authority, and support habeas corpus filings. The threat of arrest for filming is, in most cases, a bluff. Walking away makes the bluff work.",
      source: "Source: Reuters, \"The Witness Trap\" (Jan 2026); American Immigration Council (Nov 2025)"
    }
  },

  scene3: {
    label: "THE GROCERIES",
    number: "03",

    exteriorLines: [
      "I'm finally here. There's a lot less people inside than usual. It's... too quiet.",
      "It must be because everyone is too afraid to leave the house. I can't believe they're targeting people in places like this now. It's disgusting.",
      "Just the other day, Jeanette — my neighbour — got taken away right at this entrance.",
      "Let's just make this quick and head back home. I don't want to stay out here longer than I have to.",
    ],

    aisleLines: [
      "Okay, focus... Let's see... What do I actually need?",
      "...Wait.",
      "With Jeanette gone... who's taking care of her kids? They're only 10 and 12. They can't be on their own.",
      "Are they even eating? I wonder if they're just sitting in that dark apartment, too terrified to even walk to the corner store.",
      "I have a little bit of extra cash on me. It was supposed to be for my transit pass next month, but...",
      "Should I spend it and buy some food for them, or should I save it? I don't know if I can afford to be a hero right now... but I don't know if I can afford to look away either.",
    ],

    prompt: "What should I do?",
    choices: {
      action: "Bring Groceries",
      ignore: "Save the money"
    },

    saveLines: [
      "I can't. I barely have enough to get through the week as it is. If I spend this, I'm stuck walking three miles to campus every day.",
      "Someone else will help them. The neighbourhood fund, or a relative... right? I'll just buy enough for myself.",
      "I'm just a student. I can't carry everyone's problems on my shoulders.",
    ],

    buyLines: [
      "Fuck it. It's just money, but for those kids, it's everything right now.",
      "Jeanette always looked out for me when I first moved here. I can't let her kids sit in a dark kitchen, wondering when their next meal is coming.",
    ],

    progressHint: "Press spacebar to fill the cart",

    cartFullLines: [
      "Okay. That's enough to last them a few days. Bread, milk, some fruit... It's not much, but it's a start.",
      "I'll leave it on the porch. I won't even knock. I don't want to scare them, and I don't want to see the fear in their eyes.",
    ],
    success: {
      outcome: "You brought groceries. You showed up. The kids ate dinner.",
      fact: "Mutual aid networks in communities under active ICE enforcement have documented measurable outcomes: reduced family displacement, maintained school attendance, and sustained local economic activity. The Deportation Data Project (2025) found that families with active neighbourhood support connections were 3x less likely to lose housing in the 30 days following a primary earner's arrest. Showing up is a structural intervention.",
      source: "Source: Deportation Data Project (2025); Solidarity Network, \"The Neighbourhood Shield\" (2026)"
    },
    failure: {
      outcome: "You stayed away. The family disappeared from the neighbourhood within the week.",
      fact: "ICE's $28 billion surveillance budget now includes access to Medicaid records, school enrollment data, and commercial data brokers to map households and identify undocumented residents. Once a primary earner is removed, families face immediate financial collapse with no institutional support. Isolation is the intended outcome. Mutual aid is the direct counter.",
      source: "Source: EFF, \"The $28 Billion Eye\" (Dec 2025); Deportation Data Project (2025)"
    }
  },

  end: {
    title: "YOU MADE IT THROUGH.",
    body: "Three scenes. Three neighbours. Three moments where ordinary people had to decide what kind of community they lived in.\n\nThe tactics in this experience are documented. The charges are real. The mutual aid networks exist.\n\nNow you know what to look for.",
    cta: "LEARN MORE",
    restart: "PLAY AGAIN"
  }
};
