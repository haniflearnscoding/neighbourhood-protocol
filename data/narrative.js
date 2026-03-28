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
    text: "What a beautiful day in the park.\nAn agent shouts that you're \"obstructing.\"\nYou're standing ten feet away with your phone.",
    choices: {
      action: "Keep Recording",
      ignore: "Go inside"
    },
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
    text: "Sarah was taken yesterday.\nShe's one of the 1,000 taken today.\nHer kids are still in the apartment.\nThe neighbourhood fund is covering rent.",
    choices: {
      action: "Bring Groceries",
      ignore: "Stay away"
    },
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
