/* ==========================================================================
   shared/data.js — the single content source for ALL SIX portfolio templates.
   Edit this file to change text, images, dates, projects, skills and UI copy.
   It is a plain script (no modules) so every template works from a simple
   local server — or even straight from the file system.

   Sample applicant: Elham Hesami, a young director and visual artist applying
   to study FILM DIRECTING / CINEMA ARTS for the Fall 2027 intake.
   Every work in this portfolio belongs to the film project "I AM WAR".
   (Bio details, dates, awards and links are placeholders — replace with real ones.)
   ========================================================================== */

const portfolio = {

  /* ----------------------------------------------------------------------
     UI COPY — every label, heading and microcopy string the templates show.
     Wrap a word in *asterisks* to make it italic/accent in templates that
     support it (others simply strip the asterisks).
     ---------------------------------------------------------------------- */
  copy: {
    skipLink: "Skip to content",
    loader: {
      label: "Welcome to my portfolio",
      skip: "Skip intro",
      /* Boot-log lines used by the terminal-style loader ({name}, {n} are filled in) */
      lines: [
        "Booting {name}.sys",
        "Loading {n} timeline records",
        "Threading the first reel",
        "Status: rolling"
      ]
    },
    nav: [
      { id: "about",    label: "About" },
      { id: "timeline", label: "Story" },
      { id: "projects", label: "Work" },
      { id: "skills",   label: "Skills" },
      { id: "future",   label: "Next" },
      { id: "contact",  label: "Contact" }
    ],
    theme: { toLight: "Switch to light theme", toDark: "Switch to dark theme" },
    menu:  { open: "Menu", close: "Close" },
    hero: {
      eyebrow: "Welcome — film & art application portfolio · Fall 2027",
      cta1: "Watch my story",
      cta2: "Get in touch",
      scroll: "Scroll",
      portraitCaption: "Class of 2027"
    },
    about: {
      index: "01", label: "About",
      statement: "Welcome in. I make films and images that *listen first* — pull up a chair, the story is about to begin.",
      facts: { school: "School", applying: "Applying for", based: "Based in" }
    },
    timeline: {
      index: "02", label: "Life timeline",
      title: "Come along: *one frame at a time.*",
      hint: "Scroll to travel through time",
      listLabel: "Life timeline entries",
      filtersLabel: "Filter the timeline by category",
      all: "All",
      count: "{n} moments",
      age: "Age",
      milestone: "Milestone",
      open: "Read the story",
      categories: {
        education: "Education",
        project:   "Projects",
        award:     "Awards",
        work:      "On set",
        personal:  "Personal",
        travel:    "Travel"
      }
    },
    modal: {
      close: "Close", prev: "Previous", next: "Next",
      visit: "Learn more", tags: "Tags", of: "of"
    },
    projects: {
      index: "03", label: "Selected work",
      title: "Now *showing* — all are welcome.",
      visit: "Opens in a new tab",
      repo: "Source code"
    },
    skills: {
      index: "04", label: "Skills",
      title: "What I *bring.*",
      groups: {
        technical: "Directing & craft",
        creative:  "Art & research",
        language:  "Languages",
        soft:      "On set"
      }
    },
    future: {
      index: "05", label: "What's next",
      title: "Where I am *heading.*",
      closing: "Film school is not the finish line — it is the first day of shooting, and everyone is welcome on set."
    },
    contact: {
      index: "06", label: "Contact",
      title: "Let us *talk.*",
      intro: "Admissions tutor, producer, researcher or fellow filmmaker — you are always welcome here, and I answer every message within two days.",
      emailLabel: "Write to me",
      form: {
        name: "Your name",
        email: "Your email",
        message: "Message",
        send: "Open in my email app",
        subjectPrefix: "Hello Elham — message from",
        success: "Your email app should open now with the message ready to send."
      }
    },
    footer: {
      rights: "All rights reserved.",
      top: "Back to top",
      note: "Thank you for watching — you are always welcome here. I Am War."
    },
    /* Scrapbook vocabulary (used by the Playful template) */
    playful: {
      greeting: "Hi, I'm",
      dragHint: "Psst — drag the photos around!",
      shuffle: "Shuffle photos",
      tidy: "Tidy up",
      flip: "Flip card",
      flipBack: "Flip back",
      stamp: "Fall 2027",
      to: "To:",
      aboutNote: "Things worth knowing",
      skillsNote: "The bigger the sticker, the stronger the skill. Tap one!",
      groupsLabel: "Highlight a skill group",
      party: "Party time!",
      mapNote: "Follow the line from the first credit to today"
    },
    /* 3D journey vocabulary (used by the Journey 3D template) */
    journey: {
      loading: "Threading the film",
      start: "Begin the journey",
      scrollHint: "Scroll to fly",
      next: "Next stop",
      prev: "Previous stop",
      tourLabel: "Stops on the journey",
      fallbackTitle: "Life timeline",
      soundOn: "War-drum sound on",
      soundOff: "War-drum sound off",
      detailsOpen: "Open full story",
      arrived: "Arrived",
      view3d: "3D journey",
      view2d: "Simple list",
      viewLabel: "Switch timeline view",
      menuLabel: "Chapters",
      chapterHome: "Home",
      stopOf: "Stop {n} of {total}",
      webglMissing: "3D is not available on this device, so here is the story as a simple timeline."
    },
    /* Cinema vocabulary (used by the Director's Cut template, ex6) */
    cinema: {
      leader: "Reel 1 · I Am War",
      rec: "REC",
      scene: "Scene",
      slate: { prod: "Production", roll: "Roll", scene: "Scene", take: "Take", dir: "Director", date: "Date" },
      play: "Play", pause: "Pause", prev: "Previous clip", next: "Next clip",
      monitor: "Programme monitor", tracks: "Tracks",
      clipOf: "Clip {n} of {total}",
      scriptFade: "FADE IN:",
      scriptSlug: "INT. THE EDIT SUITE — NIGHT",
      scriptCut: "CUT TO:",
      nowShowing: "Now showing",
      rating: "Year",
      comingSoon: "Coming soon",
      next: "Next up",
      mixer: "Mixing desk",
      mixerHint: "Every fader is a skill. Give one a nudge — it springs back.",
      credits: "End credits",
      creditsRoles: { director: "Directed by", writer: "Written by", artist: "Key art by", editor: "Edited by" },
      lights: { on: "House lights on", off: "House lights off" },
      swipe: "Drag to browse",
      welcome: "Welcome",
      welcomeLine: "Pull up a chair — the film is about to start.",
      thanks: "Thank you for watching"
    },
    /* Terminal / HUD vocabulary (used by the Neon Grid template) */
    terminal: {
      prompt: "elham@portfolio:~$",
      title: "shot_log.sh",
      command: "cat records/{id}.log",
      online: "ONLINE",
      status: "Applying to study Film Directing · Fall 2027 intake",
      bpm: "FPS",
      copy: "Copy",
      copied: "Copied",
      filterFlag: "--filter",
      openFile: "Open file",
      records: "{n} records",
      execute: "Execute",
      labels: {
        identity: "Identity",
        vitals: "Audio signal",
        status: "Status",
        skills: "Top skills",
        counter: "Reels completed",
        dossier: "Dossier",
        stats: "Key figures",
        cases: "Film files",
        roadmap: "Roadmap",
        console: "Contact console"
      }
    }
  },

  /* ----------------------------------------------------------------------
     PERSON
     Verified from public pages: IMDb credits, ORCID publications, the
     Bauhaus-Universität Weimar 2024 scholarship gallery. Everything else is
     sample text — replace it with Elham's own words.
     ---------------------------------------------------------------------- */
  person: {
    name: "Elham Hesami",
    title: "Director · Actress · Visual artist · Researcher",
    university: "Faculty of Art & Design · Bauhaus-Universität Weimar",
    degree: "Film, Art & Directing",
    location: "Weimar, Germany",
    bio: "Welcome! I am a director, actress, camera-crew member and researcher — and I believe a single image can make a stranger's story feel like your own. Come in, get comfortable, and have a look around.",
    about: [
      "Welcome — I am so glad you are here. I have worked on both sides of the camera: in front of it as an actress in Breath (2016) and Pinto (2021), and behind it in the camera department of Sister (2016) and the television series Lady of the Mansion (2018–2019, 31 episodes). Seeing a film from both sides taught me that directing is, above all, listening.",
      "I Am War is the thread through everything in this portfolio. It began as a charcoal drawing of a child's shadow on a wall and grew into a short film, a poster series, a shot book, a sound installation and a making-of. It is a story told from the point of view of war itself, and I hope it feels as human to you as it does to me.",
      "Alongside the film work I am a published researcher: first author of peer-reviewed articles on children and families and on a serious game for autistic children, a peer reviewer for Trends in Psychiatry and Psychotherapy and the Asian Journal of Education and Social Studies, and a Deutschlandstipendium holder at the Bauhaus-Universität Weimar. This portfolio is the long version of my application. Take your time; there is a seat for you."
    ],
    avatar: "../shared/img/portrait.svg",
    avatarAlt: "Portrait of Elham Hesami",
    email: "elham.hesami@example.com",
    socials: [
      { label: "IMDb", url: "https://www.imdb.com/name/nm15535393/" },
      { label: "Instagram", url: "https://www.instagram.com/elhamhesamiii/" },
      { label: "ORCID", url: "https://orcid.org/0000-0002-1973-9011" },
      { label: "Bauhaus-Universität Weimar", url: "https://www.uni-weimar.de/de/universitaet/forschung-und-kunst/wissenschaftliche-karrieren/stipendien-und-foerderung/stipendiengalerie-2024/elham-hesami/" }
    ]
  },

  /* ----------------------------------------------------------------------
     TIMELINE — 15 moments.  age is optional (null = not shown).
     category: education | project | award | work | personal | travel
     ---------------------------------------------------------------------- */
  timeline: [
    {
      id: "anahita", year: 2010, date: "2010", age: null,
      category: "work",
      title: "First Screen Credit: Anahita",
      subtitle: "Additional crew · listed on IMDb",
      description: "My name first appeared in the credits of Anahita (2010), as part of the additional crew. It was a small job and a big lesson: a film is made by dozens of people who all believe in the same picture.",
      image: "../shared/img/tl-anahita.svg",
      alt: "A film crew working together on a quiet set",
      tags: ["Crew", "First credit", "Beginnings"],
      link: "https://www.imdb.com/name/nm15535393/",
      highlight: false
    },
    {
      id: "breath", year: 2016, date: "2016", age: null,
      category: "work",
      title: "In Front of the Camera: Breath",
      subtitle: "Actress · Breath (2016)",
      description: "I played a role in Breath (2016), my first time in front of the lens. Acting taught me what a director owes an actor: patience, trust and a clear reason for every take.",
      image: "../shared/img/tl-breath.svg",
      alt: "A close-up of an actor on set in soft light",
      tags: ["Acting", "Performance", "Trust"],
      link: "https://www.imdb.com/name/nm15535393/",
      highlight: false
    },
    {
      id: "sister", year: 2016, date: "2016", age: null,
      category: "work",
      title: "Behind the Camera: Sister",
      subtitle: "Camera department · Sister (2016)",
      description: "The same year I stepped behind the camera on Sister (2016), working in the camera department. I learned how a frame is built: where the light falls, where the eye rests and what is deliberately left in the dark.",
      image: "../shared/img/tl-sister.svg",
      alt: "A camera operator framing a shot",
      tags: ["Camera", "Framing", "Light"],
      link: "https://www.imdb.com/name/nm15535393/",
      highlight: false
    },
    {
      id: "lady-of-the-mansion", year: 2018, date: "2018–2019", age: null,
      category: "work",
      title: "Lady of the Mansion",
      subtitle: "Camera department · TV series, 31 episodes",
      description: "Two seasons of early mornings and long days in the camera department of a television series, 31 episodes in all. Television taught me speed, stamina and how to keep a story's look consistent across hours of film.",
      image: "../shared/img/tl-lady-of-the-mansion.svg",
      alt: "A television set with lights and cameras ready for a scene",
      tags: ["Television", "Stamina", "Teamwork"],
      link: "https://www.imdb.com/name/nm15535393/",
      highlight: true
    },
    {
      id: "pinto", year: 2021, date: "2021", age: null,
      category: "work",
      title: "Pinto",
      subtitle: "Actress · Pinto (2021)",
      description: "A leading chapter as an actress in Pinto (2021). Returning to the other side of the lens, with more experience behind the camera, changed how I listen to an actor's silence.",
      image: "../shared/img/tl-pinto.svg",
      alt: "An actress in a quiet, warmly lit interior scene",
      tags: ["Acting", "Cinema", "Craft"],
      link: "https://www.imdb.com/name/nm15535393/",
      highlight: false
    },
    {
      id: "alexithymia-study", year: 2022, date: "2022", age: null,
      category: "project",
      title: "Published Research on Children & Families",
      subtitle: "Modern Care Journal · first author",
      description: "A peer-reviewed article, written as first author, on how parental alexithymia and neglect relate to children's maladjustment in families with and without autistic children. Learning to listen to families, carefully and without judgement, is a habit that now shapes how I direct.",
      image: "../shared/img/tl-alexithymia-study.svg",
      alt: "An open journal article beside a notebook and a cup of tea",
      tags: ["Research", "Child development", "Empathy"],
      link: "https://doi.org/10.5812/MODERNC-131384",
      highlight: false
    },
    {
      id: "deutschlandstipendium", year: 2024, date: "2024", age: null,
      category: "award",
      title: "Deutschlandstipendium",
      subtitle: "Bauhaus-Universität Weimar",
      description: "Named in the 2024 scholarship gallery of the Bauhaus-Universität Weimar, a scholarship that supports students for talent and commitment. It gave me time, a studio and the quiet confidence to keep making the films I care about.",
      image: "../shared/img/tl-deutschlandstipendium.svg",
      alt: "The Bauhaus-Universität Weimar main building in soft daylight",
      tags: ["Scholarship", "Bauhaus", "Support"],
      link: "https://www.uni-weimar.de/de/universitaet/forschung-und-kunst/wissenschaftliche-karrieren/stipendien-und-foerderung/stipendiengalerie-2024/elham-hesami/",
      highlight: true
    },
    {
      id: "weimar-art-design", year: 2024, date: "2024", age: null,
      category: "education",
      title: "Faculty of Art & Design, Weimar",
      subtitle: "Bauhaus-Universität Weimar",
      description: "A home among painters, designers and filmmakers in the city where the Bauhaus began. Surrounded by people who treat an idea as something to build with your hands, I started to draw the film I would later call I Am War.",
      image: "../shared/img/tl-weimar-art-design.svg",
      alt: "A bright art studio with sketches pinned to the wall",
      tags: ["Art & Design", "Studio", "Community"],
      link: "",
      highlight: false
    },
    {
      id: "film-memory-workshop", year: 2024, date: "Summer 2024", age: null,
      category: "travel",
      title: "A Journey of Listening",
      subtitle: "Sample entry — add your own trip",
      description: "Ten days walking an old city, listening to people who had lived through war as children. I came home with a notebook full of voices and one sentence I could not shake: 'I am war.' That sentence became the seed of my film.",
      image: "../shared/img/tl-film-memory-workshop.svg",
      alt: "An old city street in warm evening light",
      tags: ["Memory", "Listening", "Seeds of I Am War"],
      link: "",
      highlight: false
    },
    {
      id: "writing-i-am-war", year: 2025, date: "2025", age: null,
      category: "project",
      title: "I Am War — Writing the Film",
      subtitle: "Interviews, drawings, one script",
      description: "I gathered voices of people who had grown up near conflict and wove their words into a script told from the point of view of war itself — a quiet, patient voice that follows a child through one day. I drew every scene before I wrote it, because the film has to feel like a memory.",
      image: "../shared/img/tl-writing-i-am-war.svg",
      alt: "A desk covered with script pages, charcoal sketches and an audio recorder",
      tags: ["Screenwriting", "Interviews", "I Am War"],
      link: "https://example.com/i-am-war-script",
      highlight: true
    },
    {
      id: "kookism-paper", year: 2025, date: "January 2025", age: null,
      category: "project",
      title: "Kookism — A Serious Game",
      subtitle: "Heliyon · first author",
      description: "An evaluation, written as first author, of a serious game called 'Kookism' and how it supports the receptive vocabulary of autistic children aged four to nine. Play, image and story as ways to reach a child: the same belief behind every frame I shoot.",
      image: "../shared/img/tl-kookism-paper.svg",
      alt: "A child's hands touching a colourful tablet game",
      tags: ["Serious games", "Language", "Care"],
      link: "https://doi.org/10.1016/j.heliyon.2024.e41036",
      highlight: true
    },
    {
      id: "sharing-the-process", year: 2025, date: "2025", age: null,
      category: "personal",
      title: "Sharing the Process",
      subtitle: "@elhamhesamiii on Instagram",
      description: "I open the studio door online too: sketches, set photos and half-finished frames, shared as they happen. People write back with their own stories, and a few of those stories have found their way into I Am War.",
      image: "../shared/img/tl-sharing-the-process.svg",
      alt: "A sketchbook and a phone showing work-in-progress images",
      tags: ["Community", "Process", "Openness"],
      link: "https://www.instagram.com/elhamhesamiii/",
      highlight: false
    },
    {
      id: "i-am-war-film", year: 2026, date: "2026", age: null,
      category: "project",
      title: "I Am War — The Short Film",
      subtitle: "The heart of the portfolio",
      description: "After all the drawing, writing and rehearsing, I Am War became a film: a short story told by war itself, following one child through a single day. A stranger told me afterwards that she hadn't breathed for the last five minutes. That is the best review I will ever get.",
      image: "../shared/img/tl-i-am-war-film.svg",
      alt: "A child's silhouette on a wall above a glowing city",
      tags: ["Direction", "Short film", "I Am War"],
      link: "https://example.com/i-am-war",
      highlight: true
    },
    {
      id: "i-am-war-exhibition", year: 2026, date: "2026", age: null,
      category: "project",
      title: "I Am War — The Exhibition",
      subtitle: "Key art, storyboards and sound",
      description: "I Am War also lives outside the screen: charcoal posters, the hand-drawn shot book and a dark room where visitors sit inside the silence between the interviews. Everyone is welcome to come in and stay as long as they like.",
      image: "../shared/img/tl-i-am-war-exhibition.svg",
      alt: "A gallery room with framed charcoal posters",
      tags: ["Exhibition", "Charcoal", "I Am War"],
      link: "https://example.com/i-am-war-exhibition",
      highlight: false
    },
    {
      id: "applying", year: 2026, date: "November 2026", age: null,
      category: "education",
      title: "Applying to Film School",
      subtitle: "Fall 2027 intake",
      description: "Today. I am gathering years of acting, camera work, drawing, research and one long film into a single place and asking for a seat at a school that values image and conscience equally. This portfolio is my application — and a promise about the kind of director I intend to become.",
      image: "../shared/img/tl-applying.svg",
      alt: "The entrance of a film school building in warm morning light",
      tags: ["Film directing", "Next chapter", "Welcome"],
      link: "",
      highlight: false
    }
  ],

  /* ----------------------------------------------------------------------
     PROJECTS — every work belongs to the film project "I AM WAR"
     ---------------------------------------------------------------------- */
  projects: [
    {
      title: "I Am War — The Short Film", year: 2026,
      description: "Step into the cinema and meet a short film told from the point of view of war itself, following one child through a single day. Made with friends, borrowed lights and a great deal of care — cinema as an act of listening, and listening as a work of art.",
      image: "../shared/img/proj-1.svg",
      tech: ["Cinema", "Direction", "Screenwriting"],
      link: "https://example.com/i-am-war",
      repo: ""
    },
    {
      title: "I Am War — Poster & Key Art", year: 2026,
      description: "Come and see the film on the wall: a series of large charcoal and ink posters — art that carries the story from the cinema into the street and the gallery. A child's shadow, a wall, and a city of light.",
      image: "../shared/img/proj-2.svg",
      tech: ["Art", "Charcoal", "Print"],
      link: "https://example.com/i-am-war-posters",
      repo: ""
    },
    {
      title: "I Am War — The Shot Book", year: 2025,
      description: "Peek behind the camera. A hand-drawn storyboard and shot book covering every scene, with lighting diagrams, lens notes and colour keys — the art and craft of cinema, shared so others can learn from it.",
      image: "../shared/img/proj-3.svg",
      tech: ["Cinema", "Storyboarding", "Art direction"],
      link: "https://example.com/i-am-war-shot-book",
      repo: ""
    },
    {
      title: "I Am War — The Sound of Silence", year: 2026,
      description: "Sit down in the dark with us. A sound-art installation built from the interviews, where visitors rest in the silence between the words while a single projected shadow breathes on the wall, like a cinema with no film.",
      image: "../shared/img/proj-4.svg",
      tech: ["Sound art", "Installation", "Interviews"],
      link: "https://example.com/i-am-war-sound",
      repo: ""
    },
    {
      title: "I Am War — The Making Of", year: 2026,
      description: "Meet the people behind the film. A making-of documentary about the art of cinema: the casting, the cold mornings, the rehearsals and the mistakes — edited by me, narrated by the crew who made it possible.",
      image: "../shared/img/proj-5.svg",
      tech: ["Cinema", "Documentary", "Editing"],
      link: "https://example.com/i-am-war-making-of",
      repo: ""
    }
  ],

  /* ----------------------------------------------------------------------
     SKILLS — level 0–100, group: technical | creative | language | soft
     ---------------------------------------------------------------------- */
  skills: [
    { name: "Directing",                level: 88, group: "technical" },
    { name: "Acting",                   level: 86, group: "technical" },
    { name: "Camera Department",        level: 82, group: "technical" },
    { name: "Screenwriting",            level: 80, group: "technical" },
    { name: "Charcoal & Drawing",       level: 94, group: "creative" },
    { name: "Storyboarding",            level: 90, group: "creative" },
    { name: "Research & Writing",       level: 88, group: "creative" },
    { name: "Persian",                  level: 100, group: "language" },
    { name: "English",                  level: 92, group: "language" },
    { name: "German",                   level: 72, group: "language" },
    { name: "French",                   level: 40, group: "language" },
    { name: "Listening to People",      level: 95, group: "soft" },
    { name: "Working in a Crew",        level: 90, group: "soft" },
    { name: "Calm Under Pressure",      level: 82, group: "soft" }
  ],

  /* ----------------------------------------------------------------------
     STATS — leading digits animate; any text after them is kept as a suffix
     ---------------------------------------------------------------------- */
  stats: [
    { label: "Screen credits on IMDb",          value: "6" },
    { label: "First-author articles",           value: "2" },
    { label: "Peer reviews completed",          value: "3" },
    { label: "Works in I Am War",               value: "5" }
  ],

  /* ----------------------------------------------------------------------
     FUTURE GOALS
     ---------------------------------------------------------------------- */
  future: [
    {
      goal: "Study Film Directing and learn from every frame",
      description: "Join a school that puts cameras in students' hands in the first term, and spend as much time on set as in the lecture hall."
    },
    {
      goal: "Grow I Am War into a feature",
      description: "Develop the short into a feature-length film that mixes charcoal animation with live action, and share it with audiences around the world."
    },
    {
      goal: "Teach filmmaking where stories are hardest to tell",
      description: "Start a travelling workshop that lends cameras and drawing paper to young people in communities shaped by conflict, so they can tell their own stories."
    }
  ],

  /* ----------------------------------------------------------------------
     I AM WAR — the key-art feature shown in every template
     ---------------------------------------------------------------------- */
  iamwar: {
    kicker: "The film at the heart of this portfolio",
    title: ["I AM", "WAR"],
    tagline: "A story told by war itself — and the child who walks through it.",
    body: "I Am War is the thread through everything you will see here: a short film, a poster series, a shot book, a sound installation and a making-of. Come in, sit down, and see how one quiet drawing grew into a whole world.",
    filmBy: "A film by Elham Hesami",
    caption: "Key art — the director and the child's shadow",
    cta: "See all five works",
    worksLabel: "Five works, one film"
  }
};

/* Make the object reachable from every script and from Node (for tooling). */
if (typeof window !== "undefined") window.portfolio = portfolio;
if (typeof module !== "undefined" && module.exports) module.exports = portfolio;
