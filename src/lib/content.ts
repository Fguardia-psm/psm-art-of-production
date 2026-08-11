export type ArchetypeId =
  | "cartographer"
  | "illuminator"
  | "quartermaster"
  | "field-marshal"
  | "fire-bearer";

export type ChapterSlug =
  | "quiet-months"
  | "without-conflict"
  | "choose-ground"
  | "command-energy"
  | "light-field"
  | "agency-march"
  | "intelligence";

export type ChapterResult = "victory" | "field-note" | "lesson";

export type BookStage =
  | "new"
  | "growing"
  | "top-producer"
  | "building-agency";

export interface ProductionForecast {
  risk: string;
  breakthrough: string;
  mission30: string;
  measure: string;
  target: string;
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  epithet: string;
  summary: string;
  /** Producer "horoscope" — how this reading shows up in the book */
  fieldReading: string;
  /** How you win when the season is yours */
  atYourBest: string;
  /** Pattern that costs production when ignored */
  whenYouStruggle: string;
  /** Concrete focus for the next 90 days / AEP runway */
  seasonFocus: string;
  /** Diagnosis → prescription (Hawat: Production Forecast) */
  forecast: ProductionForecast;
  strengths: string[];
  blindSpot: string;
  psmMove: string;
  seal: string;
  mondayScript: string;
}

export interface ScoutQuestion {
  id: string;
  prompt: string;
  options: {
    label: string;
    scores: Partial<Record<ArchetypeId, number>>;
  }[];
}

export interface Chapter {
  slug: ChapterSlug;
  number: string;
  title: string;
  spacedTitle: string;
  quote: string;
  quoteSub?: string;
  situation: string;
  principle: string;
  markWell: string;
  fieldNote: string;
  interaction: ChapterInteraction;
  optional?: boolean;
}

export type ChapterInteraction =
  | {
      type: "prep-storm";
      prompt: string;
      options: { id: string; label: string; good: boolean }[];
      need: number;
      success: string;
      partial: string;
      failure: string;
    }
  | {
      type: "objection";
      prompt: string;
      clientLine: string;
      options: {
        id: string;
        label: string;
        grade: ChapterResult;
        reveal: string;
      }[];
    }
  | {
      type: "ground";
      prompt: string;
      grounds: { id: string; label: string; fertile: boolean; note: string }[];
      need: number;
    }
  | {
      type: "day-formation";
      prompt: string;
      slots: { id: string; label: string; correct: string }[];
      tasks: { id: string; label: string }[];
      fieldNote: string;
    }
  | {
      type: "fires";
      prompt: string;
      fires: { id: string; label: string; note: string }[];
      need: number;
    }
  | {
      type: "reflect";
      prompt: string;
      options: { id: string; label: string; note: string }[];
      need: number;
    };

export interface ClientFace {
  id: string;
  name: string;
  cue: string;
  approach: string;
  wrong: string;
  right: string;
  openingLine: string;
  fieldNote: string;
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  cartographer: {
    id: "cartographer",
    name: "The Cartographer",
    epithet: "Maps the field before the first step",
    summary:
      "You win by preparation. Markets, carriers, seasons, and compliance are not obstacles to you — they are terrain you have already measured.",
        fieldReading:
      "Your book feels safest when the map is complete. You are the agent who studies carrier changes, CMS noise, and pharmacy corridors before peers even open the CRM. Clients trust you because you sound like someone who has already walked the path. In a heavy AEP, you are the calm voice — unless the map becomes a hiding place and the first appointments never book.",
    atYourBest:
      "You turn quiet months into advantage: renewals clean, scripts tight, carriers ranked, compliance squared. When others scramble, you execute a plan written in July.",
    whenYouStruggle:
      "Over-preparation. Waiting for perfect intel while fertile ground sits unvisited. Analysis without feet on the ground.",
    seasonFocus:
      "Pick three fertile territories. Put appointments on the calendar before you polish one more spreadsheet. The map must meet the field.",
    forecast: {
      risk: "Analysis before action — the map never meets the field.",
      breakthrough: "Territory planning plus scheduled client reviews.",
      mission30: "Book 12 review or renewal appointments on the calendar.",
      measure: "Appointments booked (not hours prepping).",
      target: "3 solid appointments per week for 4 weeks.",
    },
strengths: [
      "Studies the landscape before every campaign",
      "Builds systems that turn chaos into clarity",
      "Moves with intelligence, not guesswork",
    ],
    blindSpot:
      "You may over-plan while the season is already moving. Action must still meet the map.",
    psmMove:
      "Partner with PSM for carrier arsenal clarity, market intel, and infrastructure that matches your discipline.",
    seal: "Preparation is the victory.",
    mondayScript:
      "Block 90 minutes: renewals list, carrier change log, and three pharmacies you will visit this week.",
  },
  illuminator: {
    id: "illuminator",
    name: "The Illuminator",
    epithet: "Wins the client without conflict",
    summary:
      "You do not push. You listen beneath the words, uncover the hidden truth in every objection, and guide until the path is self-evident.",
        fieldReading:
      "You win people, not arguments. Objections do not threaten you — they invite you under the surface. Clients leave feeling understood, which is why your retention can outrun producers who \"close harder.\" The risk is noble exhaustion: every conversation is deep, but the week has no formation.",
    atYourBest:
      "You convert fear into clarity. The appointment feels like guidance, not pressure. Referrals arrive because families felt seen.",
    whenYouStruggle:
      "Pipeline neglect. When the calendar is empty, illumination has nowhere to land — and you blame \"leads\" instead of ground and rhythm.",
    seasonFocus:
      "Protect two non-negotiable appointment blocks daily. Practice three opening lines for the Nine Faces. Depth plus volume — not depth alone.",
    forecast: {
      risk: "Deep conversations without a full pipeline — noble exhaustion.",
      breakthrough: "Protected appointment blocks + Nine Faces fluency.",
      mission30: "Hold 16 client conversations using one Face language per sit.",
      measure: "Sits completed and next-steps set same day.",
      target: "4 sits per week; zero “I’ll call you later” with no date.",
    },
strengths: [
      "Highest form of close: understanding, not pressure",
      "Reads the nine faces of the client",
      "Turns resistance into recognition",
    ],
    blindSpot:
      "Without pipeline ground and systems, illumination alone exhausts you.",
    psmMove:
      "Grow with PSM mentorship and conversation mastery so every appointment becomes quiet certainty.",
    seal: "The greatest agents do not sell — they illuminate.",
    mondayScript:
      "Role-play three objections out loud. Record the first question you will ask before any product name.",
  },
  quartermaster: {
    id: "quartermaster",
    name: "The Quartermaster",
    epithet: "Orders energy so momentum compounds",
    summary:
      "You know scattered effort dies. CRM, templates, calendars, and formation of the day turn strength into campaigns that last.",
        fieldReading:
      "You are allergic to wasted motion. CRM hygiene, templates, and a day in formation are not busywork — they are how you stay strong in October. Teams lean on you for process. The danger is becoming the best-organized agent with the quietest market presence.",
    atYourBest:
      "Follow-ups never die. Renewals run like logistics. New producers borrow your systems and suddenly look professional.",
    whenYouStruggle:
      "Order without outreach. A perfect system and an empty funnel. Visibility feels \"unsystematic,\" so you under-invest in fire.",
    seasonFocus:
      "Keep the formation — then add one deliberate visibility fire (community, pharmacy, digital) with a measured reply rate.",
    forecast: {
      risk: "Perfect systems, quiet funnel — order without outreach.",
      breakthrough: "Formation plus one deliberate visibility fire.",
      mission30: "Zero CRM loops older than 48 hours; run formation 5 days/week.",
      measure: "Open loops closed + outbound touches logged.",
      target: "15 outbound touches/day in formation; inbox zero by Friday.",
    },
strengths: [
      "Systems preserve strength others waste",
      "Maneuvers with intention, not haste",
      "Makes productive mornings into legacy weeks",
    ],
    blindSpot:
      "Order without presence leaves fertile ground unclaimed. Visibility still multiplies effort.",
    psmMove:
      "Use PSM technology and back-office leverage so your systems scale without friction.",
    seal: "Order directs movement. Momentum wins campaigns.",
    mondayScript:
      "Audit CRM: zero open loops older than 48 hours. Template one renewal touch before lunch.",
  },
  "field-marshal": {
    id: "field-marshal",
    name: "The Field Marshal",
    epithet: "Builds structure that multiplies others",
    summary:
      "Ambition without structure breeds chaos. You recruit carefully, train relentlessly, and raise an agency that advances as one.",
        fieldReading:
      "You think in agencies, not only appointments. Standards, scoreboards, and culture matter to you. You recruit with care when you are at your best — and you feel the weight when structure lags ambition. Others look to you for the plan; they need you on the field too.",
    atYourBest:
      "A small team moves as one. Coaching is weekly, not annual. Growth compounds because foundations were laid before headcount.",
    whenYouStruggle:
      "Command from the office. Personal production and craft dull while you \"build.\" Chaos returns when culture is only a speech.",
    seasonFocus:
      "One scoreboard. One coaching cadence. One personal production block you will not cancel. Structure that still smells like the field.",
    forecast: {
      risk: "Command from the office — structure without personal craft.",
      breakthrough: "One scoreboard, one coaching cadence, one personal block.",
      mission30: "Install a weekly huddle and a personal production block you will not cancel.",
      measure: "Team sits + your personal production hours protected.",
      target: "1 huddle/week; 8 personal production hours/week.",
    },
strengths: [
      "Lays foundations before summoning numbers",
      "Culture as shield — honor, integrity, shared success",
      "Growth that compounds instead of collapses",
    ],
    blindSpot:
      "Command without personal craft dulls the edge. Stay close to the field.",
    psmMove:
      "Scale with PSM’s agency infrastructure, training paths, and compliance-first support.",
    seal: "Growth requires structure, not ambition alone.",
    mondayScript:
      "One coaching huddle. One scoreboard. One standard you will not bend this week.",
  },
  "fire-bearer": {
    id: "fire-bearer",
    name: "The Fire-Bearer",
    epithet: "Warms the field before the first call",
    summary:
      "A silent agent is invisible. You tend digital fire, community presence, branding, and follow-up until strangers become allies.",
        fieldReading:
      "You refuse to be invisible. Brand, content, community, and follow-up are how strangers become appointments. You understand that trust often starts before the handshake. The risk is a bright flame and a soft close — presence without craft in the room.",
    atYourBest:
      "The phone rings warmer. Events and posts turn into conversations. Your name travels the zip codes you serve.",
    whenYouStruggle:
      "Vanity metrics. Activity without enrollments. Marketing that never hands the baton to a disciplined appointment process.",
    seasonFocus:
      "One fire you will tend weekly. One conversion path from attention to appointment. Measure replies and sits — not likes.",
    forecast: {
      risk: "Bright flame, soft close — attention without enrollments.",
      breakthrough: "One fire tended weekly with a path from reply to sit.",
      mission30: "Ship 4 value touches and convert replies into booked sits.",
      measure: "Replies → sits → enrollments (not likes).",
      target: "10 meaningful replies and 6 sits from fire this month.",
    },
strengths: [
      "Marketing as strategy, not vanity",
      "Trust begins before the appointment",
      "A well-tended blaze transforms the landscape",
    ],
    blindSpot:
      "Flame without craft burns cold when the conversation begins. Sharpen the appointment itself.",
    psmMove:
      "Ignite with PSM’s Marketing Hub, customized materials, and exclusive lead programs.",
    seal: "Marketing ignites the field before the first call is made.",
    mondayScript:
      "Ship one piece of value content and one community touch. Measure replies, not vanity.",
  },
};

export const SCOUT_QUESTIONS: ScoutQuestion[] = [
  {
    id: "q1",
    prompt: "Before AEP or a heavy OEP week, what do you lock first?",
    options: [
      {
        label: "Carriers, compliance notes, renewals, and my prep list",
        scores: { cartographer: 3, quartermaster: 1 },
      },
      {
        label: "How I’ll listen so the client never feels sold",
        scores: { illuminator: 3 },
      },
      {
        label: "CRM clean-up, templates, and a fixed daily schedule",
        scores: { quartermaster: 3, cartographer: 1 },
      },
      {
        label: "How my team will run when volume spikes",
        scores: { "field-marshal": 3 },
      },
      {
        label: "Visibility — mail, ads, community, brand, follow-up",
        scores: { "fire-bearer": 3 },
      },
    ],
  },
  {
    id: "q2",
    prompt: "A client says, “I’m not signing anything today.” You…",
    options: [
      {
        label: "Ask what happened before — find the real fear",
        scores: { illuminator: 3 },
      },
      {
        label: "Go back to the market plan I already built for them",
        scores: { cartographer: 2, quartermaster: 1 },
      },
      {
        label: "Use a process I’ve practiced — same steps every time",
        scores: { quartermaster: 2, cartographer: 1 },
      },
      {
        label: "Coach my agent on how to handle this client type",
        scores: { "field-marshal": 3 },
      },
      {
        label: "Wish I’d warmed trust before this appointment",
        scores: { "fire-bearer": 2, illuminator: 1 },
      },
    ],
  },
  {
    id: "q3",
    prompt: "What multiplies your production most right now?",
    options: [
      {
        label: "Where I stand — pharmacies, events, referrals, presence",
        scores: { "fire-bearer": 2, cartographer: 1 },
      },
      {
        label: "How I run the day — follow-up, sits, admin, prep",
        scores: { quartermaster: 3 },
      },
      {
        label: "How well I understand the person across the table",
        scores: { illuminator: 3 },
      },
      {
        label: "A team that runs the same playbook",
        scores: { "field-marshal": 3 },
      },
      {
        label: "Being known before the first handshake",
        scores: { "fire-bearer": 3 },
      },
    ],
  },
  {
    id: "q4",
    prompt: "When carriers or rules change mid-season, you…",
    options: [
      {
        label: "Update my plan and tell clients only what still holds",
        scores: { cartographer: 3 },
      },
      {
        label: "Fix systems first so the team doesn’t freestyle",
        scores: { quartermaster: 3, "field-marshal": 1 },
      },
      {
        label: "Retrain the team and reset one standard",
        scores: { "field-marshal": 3 },
      },
      {
        label: "Shift channels — more fire where eyes already are",
        scores: { "fire-bearer": 3 },
      },
      {
        label: "Slow the appointment and re-earn trust in plain words",
        scores: { illuminator: 3 },
      },
    ],
  },
  {
    id: "q5",
    prompt: "What does a “win” look like for you in a client meeting?",
    options: [
      {
        label: "They feel guided — the choice becomes obvious",
        scores: { illuminator: 3 },
      },
      {
        label: "The prep already did the heavy lift before we sat down",
        scores: { cartographer: 3 },
      },
      {
        label: "The day stayed in formation — no wasted motion",
        scores: { quartermaster: 3 },
      },
      {
        label: "My agent handled it to standard without me",
        scores: { "field-marshal": 3 },
      },
      {
        label: "They already knew my name before the appointment",
        scores: { "fire-bearer": 3 },
      },
    ],
  },
  {
    id: "q6",
    prompt: "What do you most want next from a partner or FMO?",
    options: [
      {
        label: "Sharper personal production and craft support",
        scores: { illuminator: 2, cartographer: 2 },
      },
      {
        label: "Agency infrastructure that multiplies my people",
        scores: { "field-marshal": 3 },
      },
      {
        label: "Marketing fire and warmer ground before I dial",
        scores: { "fire-bearer": 3 },
      },
      {
        label: "Cleaner intel — carriers, markets, compliance",
        scores: { cartographer: 3 },
      },
      {
        label: "Tighter systems so I stop leaking hours",
        scores: { quartermaster: 3 },
      },
    ],
  },
];

export const CHAPTERS: Chapter[] = [
  {
    slug: "quiet-months",
    number: "I",
    title: "The Quiet Months",
    spacedTitle: "T h e  Q u i e t  M o n t h s",
    quote: "To know your production, know your preparation.",
    quoteSub: "The unprepared agent improvises. The prepared agent executes.",
    situation:
      "AEP hits hard. OEP tests you. SEP never stops. If you treat the season like a surprise, it owns you.",
    principle:
      "Wins are built in the quiet months: renewals clean, words sharp, carriers known, clutter gone. Prep is the appointment before the appointment.",
    markWell:
      "When preparation is thorough, fear dissolves. The planning is the victory; the appointment merely reveals it.",
    fieldNote:
      "Master’s note: Top books still leave 10–15% of prep for the first week of AEP — plans flex. Rigidity is not preparation.",
    interaction: {
      type: "prep-storm",
      prompt:
        "The night before AEP. Season pressure is rising. Tap the prep moves that actually protect production — leave the busywork off your list.",
      need: 3,
      options: [
        { id: "crm", label: "Order CRM and renewal records", good: true },
        { id: "scripts", label: "Refine scripts and explanations", good: true },
        { id: "scroll", label: "Scroll social without a plan", good: false },
        {
          id: "carriers",
          label: "Study carriers and compliance limits",
          good: true,
        },
        {
          id: "wait",
          label: "Wait until AEP to “figure it out”",
          good: false,
        },
        {
          id: "reviews",
          label: "Schedule client reviews in advance",
          good: true,
        },
      ],
      success:
        "When the storm breaks, you do not flinch. Days are full, yet your spirit is steady — each movement follows a path laid down before the chaos.",
      partial:
        "Strong bones, incomplete armor. You will survive the opening days — but gaps in prep become overtime and errors. Seal the remaining ranks before the winds rise.",
      failure:
        "Neglect multiplies. Mistakes compound. Weariness grows until it breaks the unprepared. You are conquered long before the first task begins.",
    },
  },
  {
    slug: "without-conflict",
    number: "II",
    title: "Win Without Conflict",
    spacedTitle: "W i n  W i t h o u t  C o n f l i c t",
    quote: "The supreme skill is to win the client without conflict.",
    quoteSub: "Thus, the greatest agents do not sell — they illuminate.",
    situation:
      "They’ve been burned. Push and the table freezes. Force feels like a sale. Understanding feels like help.",
    principle:
      "Objections hide a fear or a need. Ask under the words. When they feel seen, they choose — you don’t drag them.",
    markWell:
      "This is the highest form of victory: to win without struggle, persuade without contention, guide without overpowering.",
    fieldNote:
      "Master’s note: Silence after a hard truth is not failure — it is processing. Do not fill every pause with product.",
    interaction: {
      type: "objection",
      prompt: "Dialogue at the table. Tension rises if you force. Choose the path that forges trust.",
      clientLine:
        "“I’ve been burned by agents before. I’m not signing anything today.”",
      options: [
        {
          id: "push",
          label: "Push the close — “This rate won’t last.”",
          grade: "lesson",
          reveal:
            "Pressure confirms their fear. The ground hardens. Victory by force is no victory at all.",
        },
        {
          id: "inquire",
          label: "Inquire — “What happened that made you cautious?”",
          grade: "victory",
          reveal:
            "Beneath the words: a past wound and a need for clarity. You slow your pace, speak plainly, and become a companion on a shared road.",
        },
        {
          id: "features",
          label: "List product features until they yield",
          grade: "lesson",
          reveal:
            "Features without understanding are noise. They do not see themselves in the path you describe.",
        },
        {
          id: "illuminate",
          label: "Reflect their need, then simplify the decision",
          grade: "victory",
          reveal:
            "When the client sees their own needs reflected clearly, they choose the path — not because it was forced, but because you illuminated it.",
        },
        {
          id: "time",
          label: "Agree: “No signature today — let’s map what you need first.”",
          grade: "field-note",
          reveal:
            "Field note: Removing pressure often unlocks honesty. Just do not leave without a next step and a clear agenda — or the wound cools into disappearance.",
        },
      ],
    },
  },
  {
    slug: "choose-ground",
    number: "III",
    title: "Choose Your Ground",
    spacedTitle: "C h o o s e  Y o u r  G r o u n d",
    quote: "Victory comes to those who hold the advantageous ground.",
    quoteSub: "Strengthen your position and demand will rise to meet you.",
    situation:
      "Your pipeline is your ground. Cold lists burn hours. Warm ground multiplies every skill you already have.",
    principle:
      "Stand where trust already exists: pharmacies, events, referrals, clear digital presence. Location multiplies effort.",
    markWell:
      "The agent who stands where they cannot be seen will struggle regardless of skill. Choose ground carefully, and in choosing, secure triumph.",
    fieldNote:
      "Master’s note: Employer groups and faith communities can be fertile ground too — if you enter as a servant of the community, not a pitch.",
    interaction: {
      type: "ground",
      prompt: "Unfurl the parchment map. Plant banners only on fertile ground.",
      need: 3,
      grounds: [
        {
          id: "pharmacy",
          label: "Local pharmacies & clinics",
          fertile: true,
          note: "Trust is already sown where elders seek counsel.",
        },
        {
          id: "random-dm",
          label: "Cold DMs to strangers at midnight",
          fertile: false,
          note: "Barren ground. Effort consumed without return.",
        },
        {
          id: "community",
          label: "Community events & senior centers",
          fertile: true,
          note: "A steady presence known for constancy, not noise.",
        },
        {
          id: "referrals",
          label: "Referral circles",
          fertile: true,
          note: "Familiar voices open doors skill alone cannot.",
        },
        {
          id: "obscurity",
          label: "Silence — hope they find you",
          fertile: false,
          note: "When an agent stands in obscurity, excellence is unseen.",
        },
        {
          id: "digital",
          label: "Clear digital presence & follow-up",
          fertile: true,
          note: "Reputation grows in places unseen yet powerful.",
        },
      ],
    },
  },
  {
    slug: "command-energy",
    number: "IV",
    title: "Command Your Energy",
    spacedTitle: "C o m m a n d  Y o u r  E n e r g y",
    quote: "Order directs movement. Momentum wins campaigns.",
    quoteSub: "Idle agents blame leads. Master agents command energy.",
    situation:
      "Busy is not productive. Scatter the day and you end tired with the same book. Order the day and volume gets lighter.",
    principle:
      "Run one formation: morning follow-up, midday appointments, afternoon admin, evening prep. Do less thrashing. Get more done.",
    markWell:
      "A productive morning becomes a productive day. A productive day becomes a productive week. A productive week becomes legacy.",
    fieldNote:
      "Master’s note: Rural producers may reverse midday/afternoon. The principle is formation — not a universal clock. Protect deep work; batch the rest.",
    interaction: {
      type: "day-formation",
      prompt: "Place each duty on its proper stone across the river of the day.",
      fieldNote:
        "If your market demands different hours, keep the principle: one formation, not task-hopping.",
      slots: [
        { id: "morning", label: "Morning", correct: "follow-up" },
        { id: "midday", label: "Midday", correct: "appointments" },
        { id: "afternoon", label: "Afternoon", correct: "reviews" },
        { id: "evening", label: "Evening", correct: "prep" },
      ],
      tasks: [
        { id: "follow-up", label: "Follow-up & outreach" },
        { id: "appointments", label: "Appointments" },
        { id: "reviews", label: "Reviews & admin" },
        { id: "prep", label: "Preparation for tomorrow" },
      ],
    },
  },
  {
    slug: "light-field",
    number: "V",
    title: "Light the Field",
    spacedTitle: "L i g h t  t h e  F i e l d",
    quote: "Marketing ignites the field before the first call is made.",
    quoteSub:
      "A silent agent is invisible. An agent with fire attracts opportunity.",
    situation:
      "If nobody knows you before the call, every appointment starts cold. Marketing is not noise — it is warmth before the handshake.",
    principle:
      "Tend five fires: digital, mail, community, brand, follow-up. Track cost → conversations → enrollments. Fire without measure is vanity.",
    markWell:
      "Where no fire is lit, cold resistance reigns. Where fire burns, the field yields itself. Intelligence is armor, compass, and supremacy.",
    fieldNote:
      "Master’s note: Fire without tracking is vanity. Pair every channel with a simple measure: cost, conversations, enrollments.",
    interaction: {
      type: "fires",
      prompt:
        "Your book is cold until people know you. Light every channel you will use this season — digital, mail, community, brand, follow-up.",
      need: 4,
      fires: [
        {
          id: "digital",
          label: "Digital advertising",
          note: "Signals presence where eyes already travel.",
        },
        {
          id: "mail",
          label: "Direct mail",
          note: "A steady flame in the mailbox of trust.",
        },
        {
          id: "community",
          label: "Community presence",
          note: "Warmth among familiar voices.",
        },
        {
          id: "brand",
          label: "Branding & simple teachings",
          note: "Recognition before the first handshake.",
        },
        {
          id: "followup",
          label: "Automated follow-up",
          note: "The flame that does not go out overnight.",
        },
      ],
    },
  },
  {
    slug: "agency-march",
    number: "VI",
    title: "The Agency on the March",
    spacedTitle: "T h e  A g e n c y  o n  t h e  M a r c h",
    quote: "Growth requires structure, not ambition alone.",
    quoteSub:
      "Before expanding, ensure your systems can bear the weight of victory.",
    situation:
      "An agency is an army. Each staff member, each agent, each process is a soldier with purpose. Ambition without structure breeds chaos.",
    principle:
      "Recruit carefully. Train relentlessly. Measure consistently. Compensate wisely. Culture becomes the shield — honor, integrity, shared success.",
    markWell:
      "Growth without structure collapses. Growth with structure compounds. Master order before the march.",
    fieldNote:
      "Master’s note: Do not hire production problems into your culture. One misaligned agent costs more than an empty desk.",
    optional: true,
    interaction: {
      type: "reflect",
      prompt: "What foundations must stand before you summon numbers?",
      need: 3,
      options: [
        {
          id: "train",
          label: "Training that enlightens new and skilled alike",
          note: "Inexperienced guided; skilled refined.",
        },
        {
          id: "methods",
          label: "Methods and SOPs that endure busy season",
          note: "Structure that bears the weight of victory.",
        },
        {
          id: "hire-fast",
          label: "Hire anyone who says they will work hard",
          note: "Ambition without filter becomes chaos.",
        },
        {
          id: "culture",
          label: "Culture where integrity is expected",
          note: "Culture is the shield of the agency.",
        },
        {
          id: "measure",
          label: "Simple scoreboards agents can trust",
          note: "What is measured is multiplied.",
        },
      ],
    },
  },
  {
    slug: "intelligence",
    number: "VII",
    title: "The Use of Intelligence",
    spacedTitle: "T h e  U s e  o f  I n t e l l i g e n c e",
    quote: "He who knows the market before others acts without hesitation.",
    quoteSub:
      "The greatest agents appear lucky. What they possess is information.",
    situation:
      "To move without intelligence is to stumble in darkness. Patterns rise from CRM history, compliance bulletins, carrier shifts, and client feedback.",
    principle:
      "Study your own history — which words persuade, which errors repeat, which clients return. Watch carriers for reasons, not only changes. Intelligence is armor, compass, and supremacy.",
    markWell:
      "With intelligence comes foresight. With foresight comes confidence. With confidence comes decisive action.",
    fieldNote:
      "Master’s note: Review last AEP’s top 20 losses. Half were preventable with earlier intelligence.",
    optional: true,
    interaction: {
      type: "reflect",
      prompt: "Which intelligence sources will you actually tend this month?",
      need: 3,
      options: [
        {
          id: "crm",
          label: "CRM patterns — wins, losses, follow-up lag",
          note: "Your history is a signal fire.",
        },
        {
          id: "compliance",
          label: "Compliance bulletins & rule shifts",
          note: "Rules shape the battlefield more than any pitch.",
        },
        {
          id: "gossip",
          label: "Rumors alone, with no verification",
          note: "Noise is not intelligence.",
        },
        {
          id: "carriers",
          label: "Carrier changes and the reasons behind them",
          note: "Understand why the map moved.",
        },
        {
          id: "feedback",
          label: "Client feedback after appointments",
          note: "The field teaches those who listen.",
        },
      ],
    },
  },
];

export const CLIENT_FACES: ClientFace[] = [
  {
    id: "overwhelmed",
    name: "The Overwhelmed",
    cue: "Papers everywhere. Too many plan names. Eyes dart.",
    approach: "Become calm. Slow the pace. One clear path.",
    wrong: "Flood them with more options and jargon.",
    right: "Simplify. One decision at a time. Steady voice.",
    openingLine:
      "“Let’s put the papers aside for a moment. We’ll take one step — only one — and make it clear.”",
    fieldNote: "If they leave with three choices, they leave with none.",
  },
  {
    id: "misinformed",
    name: "The Misinformed",
    cue: "Confident facts that are half-true or outdated.",
    approach: "Become clear. Correct gently with evidence.",
    wrong: "Argue or embarrass them for being wrong.",
    right: "Illuminate the true ground without shame.",
    openingLine:
      "“You’re right to check this carefully. Here’s what changed since you last heard that — and what still holds.”",
    fieldNote: "Protect their dignity; correct the map.",
  },
  {
    id: "loyalist",
    name: "The Loyalist",
    cue: "“I’ve had this plan for years. I won’t leave.”",
    approach: "Become respectful. Honor the past, then show fit.",
    wrong: "Attack their current plan or agent.",
    right: "Respect loyalty; compare with care and clarity.",
    openingLine:
      "“Loyalty is wise. Let’s honor what’s working — and only change what no longer serves you.”",
    fieldNote: "Never make them feel foolish for staying too long.",
  },
  {
    id: "skeptic",
    name: "The Skeptic",
    cue: "Crossed arms. Tests every claim.",
    approach: "Become transparent. Show the mechanism, not the pitch.",
    wrong: "Overpromise or dodge hard questions.",
    right: "Invite scrutiny. Earn trust with plain truth.",
    openingLine:
      "“Ask me the hard questions. I’ll show you the documents, the network, and where the risks still sit.”",
    fieldNote: "Skeptics become your strongest referrals when respected.",
  },
  {
    id: "bargain",
    name: "The Bargain-Seeker",
    cue: "Premium first. Value second — until costs appear later.",
    approach: "Become concise on total cost of care, not sticker price.",
    wrong: "Race to the cheapest option blindly.",
    right: "Frame value: network, drugs, risk — then price.",
    openingLine:
      "“Premium matters. So do drugs, doctors, and surprise bills. Let’s price the whole year, not just the month.”",
    fieldNote:
      "Sometimes cheapest is correct. Prove it with utilization, don’t default to it.",
  },
  {
    id: "utilizer",
    name: "The High-Utilizer",
    cue: "Doctors, specialists, monthly scripts — complex needs.",
    approach: "Become thorough. Map providers and formulary with care.",
    wrong: "Rush a generic recommendation.",
    right: "Detail the terrain of their actual care.",
    openingLine:
      "“Bring every doctor and every bottle. We will not guess your care — we will map it.”",
    fieldNote: "Accuracy here is the sale. Speed is the enemy.",
  },
  {
    id: "tech",
    name: "The Tech-Resistant",
    cue: "Avoids apps, portals, QR codes. Prefers paper and voice.",
    approach: "Become patient. Meet them where they already are.",
    wrong: "Force digital-only enrollment paths.",
    right: "Offer human process; technology serves, not rules.",
    openingLine:
      "“We can do this the old way — paper, phone, and me. Technology is optional; your comfort is not.”",
    fieldNote: "Never make them feel behind the times.",
  },
  {
    id: "newcomer",
    name: "The Medicare Newcomer",
    cue: "Turning 65. Alphabet soup. Quiet anxiety.",
    approach: "Become teacher. Foundations before features.",
    wrong: "Assume they know A/B/D and enrollment windows.",
    right: "Teach the map, then walk it together.",
    openingLine:
      "“Before plans, a five-minute map of Medicare. Once the ground is clear, choices get easy.”",
    fieldNote: "Teaching creates lifelong clients.",
  },
  {
    id: "silent",
    name: "The Silent Decider",
    cue: "Few words. Long pauses. Decisions happen internally.",
    approach: "Become steady. Leave space. Do not fill every silence.",
    wrong: "Talk over the quiet to “keep control.”",
    right: "Presence without pressure. Let clarity settle.",
    openingLine:
      "“Take the time you need. I’ll sit with the quiet — and answer only when you’re ready.”",
    fieldNote: "Your calm is the product.",
  },
];

export const BOOK_STAGES: { id: BookStage; label: string }[] = [
  { id: "new", label: "New agent" },
  { id: "growing", label: "Growing book" },
  { id: "top-producer", label: "Top producer" },
  { id: "building-agency", label: "Building an agency" },
];

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export interface FieldReport {
  id: string;
  codename: string;
  agentName: string;
  region: string;
  yearsInField: string;
  role: string;
  stage: string;
  pressure: string;
  switchReason: string;
  leverage: string;
  result: string;
  economics: string[];
  quote: string;
  forArchetypes: ArchetypeId[];
}

export const FIELD_REPORTS: FieldReport[] = [
  {
    id: "builder",
    codename: "The Builder",
    agentName: "Marcus R.",
    region: "Southeast",
    yearsInField: "14 years · agency principal",
    role: "Independent agency owner",
    stage: "8 producing agents · multi-state Medicare",
    pressure:
      "Contracting, E&O, and compliance review began consuming nights that used to go to coaching and recruiting.",
    switchReason:
      "Not because production was weak — because the ceiling was operational. Every new agent added weight, not leverage.",
    leverage:
      "PSM’s compliance-first infrastructure, carrier access, and training paths let the owner hire into a system instead of inventing one.",
    result:
      "Recruiting capacity returned. Marcus stopped being the bottleneck for every appointment and every paperwork exception.",
    economics: [
      "Hours reclaimed from back-office → reinvested in recruiting conversations",
      "New agents onboard into shared methods instead of tribal knowledge",
      "Compliance burden distributed — license risk no longer a solo midnight job",
    ],
    quote:
      "I didn’t need another pep talk. I needed the desk to stop owning me so I could grow the roster.",
    forArchetypes: ["field-marshal", "quartermaster", "cartographer"],
  },
  {
    id: "producer",
    codename: "The Producer",
    agentName: "Elena V.",
    region: "Southwest",
    yearsInField: "9 years · personal book",
    role: "Strong personal book · high AEP volume",
    stage: "Top-decile personal production · solo-heavy shop",
    pressure:
      "Support ceiling hit. Marketing was ad hoc. When carriers shifted, she was first to know last.",
    switchReason:
      "Needed an FMO that matched craft — not cheerleading. Wanted fire (marketing) and intelligence without babysitting.",
    leverage:
      "Marketing Hub materials, exclusive lead programs, and field mentorship that respects a producer who already knows how to close.",
    result:
      "More warm ground before first call. Less improvisation on carrier change weeks. Same craft — higher throughput.",
    economics: [
      "Lower cost-per-conversation when presence is already lit",
      "Fewer dead appointments from cold, uneducated traffic",
      "Time saved on materials and carrier chase → more appointments kept",
    ],
    quote:
      "Show me operating leverage, not a logo. If the field stays cold, nothing else matters.",
    forArchetypes: ["illuminator", "fire-bearer", "cartographer"],
  },
  {
    id: "marshal",
    codename: "The Marshal",
    agentName: "James K.",
    region: "Midwest",
    yearsInField: "11 years · expansion lead",
    role: "Agency expansion lead",
    stage: "Building second tier · targeting 15+ writing agents",
    pressure:
      "Ambition outran structure. Training was uneven. Top producers carried culture alone.",
    switchReason:
      "Needed operating leverage: consistent training tracks, measurable standards, and a banner agents would join.",
    leverage:
      "PSM training paths for new / growing / agency builders, plus technology that keeps the formation intact at volume.",
    result:
      "Scale with order. Downline walks the same campaign language. Culture compounds instead of fraying.",
    economics: [
      "Faster ramp on new agents → earlier contribution to book growth",
      "Shared campaign (this experience) becomes onboarding, not a speech",
      "Leadership time shifts from firefighting to deliberate expansion",
    ],
    quote:
      "Headcount without a campaign is just payroll. Structure is what multiplies.",
    forArchetypes: ["field-marshal", "quartermaster", "fire-bearer"],
  },
];

export const FIELD_REPORTS_DISCLAIMER =
  "Field Reports are composite patterns from partner transitions (names stylized). They show operating leverage — not guaranteed results. Ask a field leader for live references in your market.";

export const RECRUITER_OPENERS: Record<
  ArchetypeId,
  { openWith: string; avoid: string; proofAngle: string }
> = {
  cartographer: {
    openWith:
      "Let’s talk growth systems — market intel, carriers, and prep before the storm.",
    avoid: "Generic ‘we have great contracts’ openers.",
    proofAngle:
      "Show how intelligence and infrastructure reduce improvisation under AEP load.",
  },
  illuminator: {
    openWith:
      "Let’s talk client relationships — how you win without pressure, and how we protect that craft.",
    avoid: "High-pressure recruiting scripts.",
    proofAngle:
      "Nine Faces + conversation mastery support; proof that support doesn’t flatten their style.",
  },
  quartermaster: {
    openWith:
      "Let’s talk operations — CRM, back-office, and energy that doesn’t leak.",
    avoid: "Motivation talks without systems.",
    proofAngle:
      "Technology and compliance leverage that turns order into capacity.",
  },
  "field-marshal": {
    openWith:
      "Let’s talk scaling teams — structure before headcount, culture that holds.",
    avoid: "Lead dumps without training architecture.",
    proofAngle:
      "Agency paths, onboarding, and operating leverage for multi-agent shops.",
  },
  "fire-bearer": {
    openWith:
      "Let’s talk presence — marketing fire that warms the field before the call.",
    avoid: "Vanity metrics without enrollment math.",
    proofAngle:
      "Marketing Hub, materials, and programs tied to conversations and enrollments.",
  },
};

export function buildRecruiterBrief(input: {
  name: string;
  email: string;
  phone: string;
  npn: string;
  state: string;
  bookStage: string;
  focus?: string;
  archetype: ArchetypeId;
  nineFacesScore?: number;
  chapterResults?: Record<string, string>;
  readinessScore?: number;
  readinessLabel?: string;
}): string {
  const arch = ARCHETYPES[input.archetype];
  const opener = RECRUITER_OPENERS[input.archetype];
  const lines = [
    `RECRUITER BRIEF — The Art of Production`,
    `Source: art-of-production campaign · NPN soft-gate`,
    ``,
    `AGENT`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `NPN: ${input.npn} · State: ${input.state}`,
    `Book stage: ${input.bookStage}`,
    input.focus ? `Focus: ${input.focus}` : null,
    ``,
    `ARCHETYPE (more valuable than the lead alone)`,
    `${arch.name} — ${arch.epithet}`,
    `Seal: “${arch.seal}”`,
    `PSM move: ${arch.psmMove}`,
    input.nineFacesScore !== undefined
      ? `Nine Faces score: ${input.nineFacesScore}/9`
      : null,
    input.readinessScore !== undefined
      ? `Campaign readiness: ${input.readinessScore}/100 — ${input.readinessLabel ?? ""}`
      : null,
    ``,
    `OPEN THE CALL WITH`,
    opener.openWith,
    ``,
    `PROOF ANGLE`,
    opener.proofAngle,
    ``,
    `AVOID`,
    opener.avoid,
    ``,
    `MONDAY SCRIPT (for them)`,
    arch.mondayScript,
    input.chapterResults && Object.keys(input.chapterResults).length
      ? `\nCHAPTER SCORECARD\n${Object.entries(input.chapterResults)
          .map(([k, v]) => `· ${k}: ${v}`)
          .join("\n")}`
      : null,
    ``,
    `Next step: Field Reports → Talk to a field leader (not a generic pitch deck).`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export const PSM_PARTNER_URL =
  "https://www.psmbrokerage.com/?utm_source=art-of-production&utm_medium=campaign&utm_campaign=recruiting";

/** Contact Us — primary handoff while NPN webhook is offline */
export const PSM_CONTACT_URL =
  "https://www.psmbrokerage.com/contact?utm_source=art-of-production&utm_medium=campaign&utm_campaign=recruiting";

export const PDF_URL =
  "https://www.psmbrokerage.com/hubfs/THE%20ART%20OF%20PRODUCTION.pdf";

export type RecruiterIntel = {
  archetype?: ArchetypeId | null;
  name?: string;
  readiness?: number;
  readinessLabel?: string;
  nineFacesScore?: number;
  chaptersDone?: number;
  weakestChapter?: string;
  strongestChapter?: string;
  fieldReportsSeen?: boolean;
  utmContent?: string;
};

/** Contact Us link carrying recruiter intelligence (query params for CRM/forms). */
export function fieldLeaderUrl(
  archetypeOrIntel?: ArchetypeId | null | RecruiterIntel,
  name?: string,
) {
  const intel: RecruiterIntel =
    archetypeOrIntel && typeof archetypeOrIntel === "object"
      ? archetypeOrIntel
      : { archetype: archetypeOrIntel as ArchetypeId | null | undefined, name };

  const u = new URL(PSM_CONTACT_URL);
  u.searchParams.set("utm_content", intel.utmContent ?? "field-leader");
  u.searchParams.set("from", "art-of-production");
  if (intel.archetype) {
    u.searchParams.set("archetype", intel.archetype);
    const arch = ARCHETYPES[intel.archetype];
    u.searchParams.set("archetype_name", arch.name);
  }
  if (intel.name) u.searchParams.set("agent", intel.name);
  if (intel.readiness !== undefined)
    u.searchParams.set("readiness", String(intel.readiness));
  if (intel.readinessLabel)
    u.searchParams.set("readiness_label", intel.readinessLabel);
  if (intel.nineFacesScore !== undefined)
    u.searchParams.set("nine_faces", `${intel.nineFacesScore}/9`);
  if (intel.chaptersDone !== undefined)
    u.searchParams.set("chapters", String(intel.chaptersDone));
  if (intel.weakestChapter)
    u.searchParams.set("weakest", intel.weakestChapter);
  if (intel.strongestChapter)
    u.searchParams.set("strongest", intel.strongestChapter);
  if (intel.fieldReportsSeen)
    u.searchParams.set("field_reports", "seen");
  return u.toString();
}

/** Human-readable recruiter one-liner for counsel CTA. */
export function recruiterIntelSummary(intel: RecruiterIntel): string {
  const arch = intel.archetype ? ARCHETYPES[intel.archetype].name : "Unknown";
  const parts = [
    arch,
    intel.readiness !== undefined
      ? `Readiness ${intel.readiness}/100${intel.readinessLabel ? ` (${intel.readinessLabel})` : ""}`
      : null,
    intel.nineFacesScore !== undefined
      ? `Nine Faces ${intel.nineFacesScore}/9`
      : null,
    intel.weakestChapter ? `Watch: ${intel.weakestChapter}` : null,
    intel.strongestChapter ? `Strength: ${intel.strongestChapter}` : null,
    intel.fieldReportsSeen ? "Field Reports reviewed" : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export const PARTNER_PROOF = [
  {
    stat: "63%",
    label:
      "of agents report better client acquisition & retention via exclusive lead vendors",
  },
  {
    stat: "82%",
    label: "feel more informed on changes and regulations",
  },
  {
    stat: "76%",
    label: "gain productivity on back-office tasks",
  },
];

export const PARTNER_STORIES = [
  {
    role: "Growing Medicare book",
    line: "I stopped improvising AEP. With systems and mentorship, my quiet months finally paid for the storm.",
  },
  {
    role: "Agency builder",
    line: "Structure before headcount. PSM’s training paths let me raise agents without becoming everyone’s bottleneck.",
  },
  {
    role: "Top producer",
    line: "I didn’t need cheerleading. I needed carriers, compliance muscle, and marketing fire that didn’t embarrass the brand.",
  },
];

export const SUPPORT_MODEL = [
  {
    t: "Who calls you",
    d: "A field-oriented partner path — not a ticket queue. Mentorship for new, growing, and agency-building tracks.",
  },
  {
    t: "What “compliance-first” means",
    d: "Guardrails and infrastructure so production moves fast without gambling your license on guesswork.",
  },
  {
    t: "How marketing works",
    d: "Marketing Hub, customized materials, and programs that warm the field before the appointment — strategy, not noise.",
  },
  {
    t: "How tech multiplies you",
    d: "Enrollment and CRM leverage so energy goes to clients, not paperwork chaos.",
  },
];

export function scoreArchetype(
  answers: Record<string, number>,
): ArchetypeId {
  const totals: Record<ArchetypeId, number> = {
    cartographer: 0,
    illuminator: 0,
    quartermaster: 0,
    "field-marshal": 0,
    "fire-bearer": 0,
  };

  for (const q of SCOUT_QUESTIONS) {
    const idx = answers[q.id];
    if (idx === undefined) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    for (const [id, n] of Object.entries(opt.scores)) {
      totals[id as ArchetypeId] += n ?? 0;
    }
  }

  let best: ArchetypeId = "cartographer";
  let bestScore = -1;
  for (const id of Object.keys(totals) as ArchetypeId[]) {
    if (totals[id] > bestScore) {
      bestScore = totals[id];
      best = id;
    }
  }
  return best;
}

export function getChapter(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}

export const REQUIRED_CHAPTERS = CHAPTERS.filter((c) => !c.optional);
export const OPTIONAL_CHAPTERS = CHAPTERS.filter((c) => c.optional);
export const REQUIRED_CHAPTER_SLUGS = REQUIRED_CHAPTERS.map((c) => c.slug);

export function shuffleArray<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807 + 7) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function resultLabel(r: ChapterResult) {
  if (r === "victory") return "Victory";
  if (r === "field-note") return "Field note";
  return "Lesson";
}
