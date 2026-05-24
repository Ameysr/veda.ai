import OpenAI from "openai";
import { z } from "zod";
import { config } from "../config";
import type { AssignmentInput, QuestionPaper } from "../types";
import { buildGenerationPrompt } from "./prompt.service";

const QuestionSchema = z.object({
  id: z.string(),
  number: z.number(),
  text: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  marks: z.number(),
  type: z.enum([
    "mcq",
    "short_answer",
    "long_answer",
    "true_false",
    "fill_blank",
  ]),
  options: z.array(z.string()).optional(),
});

const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  instruction: z.string(),
  questions: z.array(QuestionSchema),
});

const PaperSchema = z.object({
  title: z.string(),
  subject: z.string(),
  totalMarks: z.number(),
  durationMinutes: z.number(),
  generalInstructions: z.array(z.string()),
  sections: z.array(SectionSchema),
});

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = fenced ? fenced[1].trim() : trimmed;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in response");
  return JSON.parse(text.slice(start, end + 1));
}

export function generateMockPaper(input: AssignmentInput): QuestionPaper {
  const titleLower = input.title.toLowerCase();
  const subjectLower = input.subject.toLowerCase();

  // Define subject-specific rich pools
  const photosynthesisPool = {
    mcq: [
      { text: "Which pigment is primarily responsible for absorbing light energy during photosynthesis?", options: ["Chlorophyll a", "Carotenoids", "Phycobilins", "Anthocyanins"] },
      { text: "Where do the light-dependent reactions of photosynthesis take place within the chloroplast?", options: ["Thylakoid membrane", "Stroma", "Outer membrane", "Intermembrane space"] },
      { text: "Which of the following molecules acts as the primary electron carrier in the light reactions?", options: ["NADP+", "NAD+", "FAD", "Oxygen"] },
      { text: "During the Calvin cycle, carbon dioxide is fixed into which organic molecule?", options: ["3-phosphoglycerate (3-PGA)", "Glucose", "Ribulose bisphosphate (RuBP)", "Pyruvate"] },
      { text: "What is the primary gaseous byproduct released by plants during the photolysis of water?", options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Water vapor"] }
    ],
    short_answer: [
      "Explain the main difference between light-dependent and light-independent (Calvin cycle) reactions.",
      "What is the biological function of stomata in plant leaves, and how do they regulate gas exchange?",
      "Briefly describe the process of photolysis and its significance in photosynthesis.",
      "Identify the primary limiting factors that can affect the overall rate of photosynthesis.",
      "State the balanced chemical equation for the process of photosynthesis."
    ],
    long_answer: [
      "Describe in detail the light-dependent reactions of photosynthesis. Explain how solar energy is absorbed by Photosystems I and II, and how this leads to the synthesis of ATP and NADPH.",
      "Explain the Calvin cycle (light-independent reactions). Detail the three main phases: carbon fixation, reduction, and regeneration of RuBP, explaining the energy inputs required.",
      "Discuss how environmental factors—namely light intensity, carbon dioxide concentration, and temperature—affect the rate of photosynthesis. Explain the concept of limiting factors using graphical descriptions.",
      "Compare C3, C4, and CAM plants. Detail how their anatomical and physiological adaptations help them manage water loss and optimize carbon fixation in arid environments.",
      "Explain the structure of a chloroplast. Detail how its compartmentalization (thylakoid, stroma, thylakoid lumen) supports the chemiosmotic gradient needed for ATP synthesis."
    ],
    true_false: [
      { text: "Photosynthesis is an anabolic process, meaning it builds complex organic molecules from simpler inorganic ones.", options: ["True", "False"] },
      { text: "The Calvin cycle requires direct absorption of sunlight to split carbon dioxide molecules.", options: ["True", "False"] },
      { text: "Water molecules are split during Photosystem II to replenish excited electrons.", options: ["True", "False"] }
    ],
    fill_blank: [
      "The enzyme responsible for the first major step of carbon fixation in the Calvin cycle is called ______.",
      "The fluid-filled space surrounding the thylakoid membranes within a chloroplast is the ______.",
      "Light absorption in plants is maximized by auxiliary pigments known as ______."
    ]
  };

  const cellPool = {
    mcq: [
      { text: "Which organelle is primarily responsible for aerobic respiration and ATP generation?", options: ["Mitochondria", "Lysosome", "Golgi apparatus", "Ribosome"] },
      { text: "What is the primary material that carries genetic instructions inside eukaryotic cells?", options: ["DNA", "RNA", "Protein", "Lipid"] },
      { text: "Which stage of mitosis is characterized by chromosomes aligning along the cell equator?", options: ["Metaphase", "Prophase", "Anaphase", "Telophase"] },
      { text: "Which structure regulates the movement of substances in and out of the cell?", options: ["Plasma membrane", "Cell wall", "Endoplasmic reticulum", "Nuclear envelope"] },
      { text: "The process of cell division that results in four genetically diverse haploid daughter cells is called:", options: ["Meiosis", "Mitosis", "Binary fission", "Cytokinesis"] }
    ],
    short_answer: [
      "Explain the fundamental differences between prokaryotic and eukaryotic cells.",
      "What is the function of the rough endoplasmic reticulum, and why is it termed 'rough'?",
      "Briefly describe the key events that take place during the interphase of the cell cycle.",
      "What are lysosomes, and what role do they play in cellular maintenance?",
      "Explain the concept of active transport across a cell membrane."
    ],
    long_answer: [
      "Describe in detail the stages of cellular respiration. Explain how glucose is oxidized during glycolysis, the Krebs cycle, and the electron transport chain, outlining ATP yields.",
      "Explain the process of protein synthesis in eukaryotic cells. Detail the mechanisms of transcription in the nucleus and translation at the ribosomes.",
      "Discuss the structure and function of the fluid mosaic model of the cell membrane. Detail the roles of phospholipids, cholesterol, and integral/peripheral proteins.",
      "Compare and contrast mitosis and meiosis. Outline the differences in their purpose, chromosome alignment, genetic recombination, and final daughter cell ploidy.",
      "Detail the structures and functions of five major organelles found in animal cells, explaining how their compartmentalization supports specialized biochemical pathways."
    ],
    true_false: [
      { text: "All eukaryotic cells possess a rigid cellulose cell wall outside the plasma membrane.", options: ["True", "False"] },
      { text: "Mitochondria contain their own ribosomes and loops of DNA separate from the host cell nucleus.", options: ["True", "False"] },
      { text: "Passive diffusion requires energy input from ATP to transport small non-polar molecules.", options: ["True", "False"] }
    ],
    fill_blank: [
      "The organelle responsible for sorting, modifying, and packaging proteins for secretion is the ______.",
      "During cell division, the actual division of the cytoplasm is known as ______.",
      "Genetic recombination due to crossing-over occurs during ______ I of meiosis."
    ]
  };

  const historyPool = {
    mcq: [
      { text: "Which historical event is characterized by the storming of the Bastille on July 14, 1789?", options: ["French Revolution", "Russian Revolution", "American Revolution", "Industrial Revolution"] },
      { text: "In which year did the global conflict of World War I officially begin?", options: ["1914", "1918", "1939", "1945"] },
      { text: "Who is credited with inventing the movable-type printing press in Europe during the 15th century?", options: ["Johannes Gutenberg", "Galileo Galilei", "Leonardo da Vinci", "Isaac Newton"] },
      { text: "Which ancient civilization is famous for its legal system (Code of Hammurabi) and cuneiform writing?", options: ["Mesopotamia", "Ancient Egypt", "Ancient Greece", "Roman Empire"] },
      { text: "The period of geopolitical tension between the United States and the Soviet Union after WWII is known as the:", options: ["Cold War", "Thirty Years' War", "Great War", "Age of Imperialism"] }
    ],
    short_answer: [
      "Explain the primary long-term and short-term causes that sparked World War I.",
      "What was the historical significance of the Magna Carta signed in 1215?",
      "Briefly analyze two major social impacts of the Industrial Revolution in 18th-century Europe.",
      "Define the term 'Renaissance' and describe its core intellectual and artistic tenets.",
      "Describe the main objective of the League of Nations and explain why it failed."
    ],
    long_answer: [
      "Analyze the social, economic, and political inequalities under the Old Regime that triggered the French Revolution. Assess the impact of the Reign of Terror on its outcomes.",
      "Explain the structural causes and global consequences of the Great Depression of 1929. How did governments attempt to resolve the crisis?",
      "Discuss the rise and fall of the Roman Empire. Analyze how military expansion, administrative reforms, economic inflation, and external invasions contributed to its eventual collapse.",
      "Examine the main ideologies and strategic maneuvers that defined the Cold War. Discuss the concepts of containment, proxy wars, and MAD (Mutually Assured Destruction).",
      "Detail the key factors that allowed the Spanish conquest of the Aztec and Inca empires, emphasizing military technology, biological pathogens, and local alliances."
    ],
    true_false: [
      { text: "The treaty signed at Versailles in 1919 lay the groundwork for peace and total stability in 20th-century Europe.", options: ["True", "False"] },
      { text: "The silk road served exclusively as a military pathway rather than a commercial and cultural exchange network.", options: ["True", "False"] },
      { text: "The printing press accelerated the spread of Protestant Reformation ideas across Europe.", options: ["True", "False"] }
    ],
    fill_blank: [
      "The United States declared its independence from Great Britain in the year ______.",
      "The structural reform program of reorganization introduced by Mikhail Gorbachev in the late 1980s was known as ______.",
      "The philosophical movement in 18th-century Europe that emphasized reason, science, and individualism was the ______."
    ]
  };

  const geographyPool = {
    mcq: [
      { text: "What are the massive moving slabs of the Earth's lithosphere called?", options: ["Tectonic plates", "Crustal currents", "Mantle plumes", "Orogeny belts"] },
      { text: "Which layer of the atmosphere contains the highest concentration of ozone that filters harmful UV rays?", options: ["Stratosphere", "Troposphere", "Mesosphere", "Thermosphere"] },
      { text: "What is the primary driving force behind deep ocean conveyor belt currents (thermohaline circulation)?", options: ["Density differences (temp/salinity)", "Wind patterns", "Tectonic activity", "Lunar gravity"] },
      { text: "Which geological feature is formed when two continental plates collide?", options: ["Fold mountain ranges", "Mid-ocean ridges", "Deep ocean trenches", "Rift valleys"] },
      { text: "The volcanic and seismic activity zone bordering the Pacific Ocean basin is known as the:", options: ["Ring of Fire", "San Andreas Fault", "Mid-Atlantic Ridge", "Alpide Belt"] }
    ],
    short_answer: [
      "Explain the difference between weather and climate, outlining the main driving factors of each.",
      "What is the greenhouse effect, and how does it regulate Earth's average surface temperature?",
      "Briefly describe how a volcanic island arc is formed along a convergent plate boundary.",
      "Explain the process of physical weathering and how it differs from chemical weathering.",
      "Define the term 'carrying capacity' in the context of ecosystems and populations."
    ],
    long_answer: [
      "Explain the plate tectonics theory. Describe convergent, divergent, and transform boundaries. Detail the geological features (earthquakes, volcanoes, trenches) associated with each boundary type.",
      "Describe the global rock cycle. Detail the physical and chemical processes through which igneous, sedimentary, and metamorphic rocks are formed, altered, and recycled.",
      "Discuss the hydrologic cycle in detail. Explain the processes of evaporation, transpiration, condensation, precipitation, and runoff, and how human activities disrupt this cycle.",
      "Analyze the causes and geographical consequences of desertification in arid regions like the Sahel. Discuss sustainable solutions to combat soil degradation.",
      "Explain the global atmospheric circulation cells (Hadley, Ferrel, Polar). Detail how solar radiation gradients drive these cells and shape major global climate zones."
    ],
    true_false: [
      { text: "Tectonic plates float on a completely liquid layer of the outer core.", options: ["True", "False"] },
      { text: "The primary source of carbon dioxide emissions from human activity is the burning of fossil fuels.", options: ["True", "False"] },
      { text: "Convergent plate boundaries are where two tectonic plates are pulling apart from one another.", options: ["True", "False"] }
    ],
    fill_blank: [
      "The process by which wind, water, or ice moves weathered rock and soil is called ______.",
      "The imaginary line located at 0 degrees latitude that divides the Earth is the ______.",
      "Rain that is significantly more acidic than normal due to atmospheric pollutants is called ______ rain."
    ]
  };

  const csPool = {
    mcq: [
      { text: "Which of the following data structures operates on a Last-In, First-Out (LIFO) basis?", options: ["Stack", "Queue", "Linked List", "Binary Tree"] },
      { text: "What is the average-case time complexity of searching for an element in a balanced Binary Search Tree (BST)?", options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"] },
      { text: "Which programming paradigm is built around the concept of 'objects' containing data and methods?", options: ["Object-Oriented Programming", "Functional Programming", "Procedural Programming", "Logical Programming"] },
      { text: "In database systems, what does the 'C' in ACID transaction properties stand for?", options: ["Consistency", "Concurrency", "Commitment", "Caching"] },
      { text: "Which network protocol is primarily responsible for securely fetching web pages over the internet?", options: ["HTTPS", "FTP", "SMTP", "DNS"] }
    ],
    short_answer: [
      "Explain the fundamental differences between a compiler and an interpreter.",
      "What is recursion in programming, and what is its primary base-case requirement?",
      "Briefly describe the concept and benefits of encapsulation in Object-Oriented design.",
      "What is the difference between a class and an object in programming?",
      "Define the term 'API' (Application Programming Interface) and outline its utility."
    ],
    long_answer: [
      "Compare and contrast relational databases (SQL) and non-relational databases (NoSQL). Discuss differences in their schema design, scaling strategies (vertical vs. horizontal), and transactional guarantees.",
      "Explain the Big O notation and how it is used to analyze algorithms. Detail the time and space complexity differences between Bubble Sort, Merge Sort, and Quick Sort.",
      "Discuss the concept of Software Development Life Cycle (SDLC). Compare the traditional Waterfall model with the modern Agile framework, highlighting their key phases.",
      "Detail the design and implementation of a RESTful API. Explain the purpose of HTTP methods (GET, POST, PUT, DELETE), status codes (2xx, 4xx, 5xx), and standard request formats.",
      "Explain how computers manage memory using stack allocation and heap allocation. Discuss memory leaks, garbage collection algorithms, and manual memory management."
    ],
    true_false: [
      { text: "A binary search algorithm can be executed on an unsorted array of numbers.", options: ["True", "False"] },
      { text: "In object-oriented programming, a subclass can inherit attributes and methods from a superclass.", options: ["True", "False"] },
      { text: "An interpreter compiles an entire program into machine code before executing any line.", options: ["True", "False"] }
    ],
    fill_blank: [
      "A step-by-step set of instructions to solve a specific problem or complete a task is called an ______.",
      "A variable that is declared inside a function and cannot be accessed outside of it has ______ scope.",
      "The process of finding and fixing errors or bugs in a program is known as ______."
    ]
  };

  const englishPool = {
    mcq: [
      { text: "Which literary device involves comparing two unlike things using the words 'like' or 'as'?", options: ["Simile", "Metaphor", "Personification", "Alliteration"] },
      { text: "Who is the tragic protagonist of William Shakespeare's famous play set in Denmark?", options: ["Hamlet", "Macbeth", "Romeo", "Othello"] },
      { text: "What is the term for a poem that consists of exactly fourteen lines, usually written in iambic pentameter?", options: ["Sonnet", "Haiku", "Ode", "Ballad"] },
      { text: "Which literary term describes the perspective or voice from which a story is narrated?", options: ["Point of view", "Theme", "Setting", "Tone"] },
      { text: "In classic dramatic structures, what is the term for the final resolution or untying of the plot?", options: ["Denouement", "Climax", "Exposition", "Rising Action"] }
    ],
    short_answer: [
      "Explain the difference between active voice and passive voice with illustrative examples.",
      "Define what a metaphor is and explain how it differs from a simile.",
      "What is alliteration, and what is its primary poetic effect?",
      "Briefly analyze the difference between first-person and third-person limited narration.",
      "Define the term 'theme' in literature and give an example from a book you have read."
    ],
    long_answer: [
      "Analyze the theme of unchecked ambition in William Shakespeare's *Macbeth*. Explain how the prophecies and Macbeth's inner desires drive him to moral decay and tragic ruin.",
      "Discuss the narrative structure and the role of Nick Carraway as a narrator in F. Scott Fitzgerald's *The Great Gatsby*. How does his bias affect the reader's view of Jay Gatsby?",
      "Examine the use of symbolism in literature. Choose two major symbols from classic novels (e.g., the green light in *Gatsby*, the conch in *Lord of the Flies*) and analyze their deeper meanings.",
      "Compare and contrast the literary movements of Romanticism and Realism. Discuss how their core philosophies, themes, and stylistic choices reflect their historical eras.",
      "Explain the concept of character development (arc). Discuss how a protagonist's internal conflict and external obstacles drive their growth or tragic downfall in a novel."
    ],
    true_false: [
      { text: "An irony occurs when the actual outcome of an event is the exact opposite of what was reasonably expected.", options: ["True", "False"] },
      { text: "A biography is a book about a person's life written by that person themselves.", options: ["True", "False"] },
      { text: "Free verse poetry is characterized by strict adherence to traditional rhyme schemes and metrical beats.", options: ["True", "False"] }
    ],
    fill_blank: [
      "A figure of speech where non-human things are described with human characteristics is called ______.",
      "The repetition of similar vowel sounds inside consecutive words is known as ______.",
      "An reference within a literary work to another famous historical event, person, or text is an ______."
    ]
  };

  const physicsPool = {
    mcq: [
      { text: "What is the SI unit of electric current?", options: ["Ampere", "Volt", "Ohm", "Watt"] },
      { text: "Which of the following represents Newton's second law of motion?", options: ["F = ma", "E = mc²", "v = u + at", "p = mv"] },
      { text: "What is the speed of light in a vacuum?", options: ["3 x 10⁸ m/s", "3 x 10⁶ m/s", "1.5 x 10⁸ m/s", "2.9 x 10⁵ m/s"] },
      { text: "Which type of lens is used to correct myopia (nearsightedness)?", options: ["Concave lens", "Convex lens", "Bifocal lens", "Cylindrical lens"] },
      { text: "What is the work done in lifting a 10 kg object to a height of 2 meters? (g = 9.8 m/s²)", options: ["196 Joules", "98 Joules", "20 Joules", "49 Joules"] }
    ],
    short_answer: [
      "Explain the fundamental difference between speed and velocity.",
      "State Ohm's Law and write its mathematical expression.",
      "What is the refraction of light, and why does it occur?",
      "Briefly describe the concept of gravitational potential energy.",
      "State Archimedes' Principle and give one practical application."
    ],
    long_answer: [
      "Describe the law of conservation of energy. Explain how it applies to a swinging simple pendulum, detailing energy transfers at different positions.",
      "Explain the working principle of an AC generator. Discuss the role of slip rings and brushes, and how electromagnetic induction is utilized.",
      "Derive the three equations of motion (v = u + at, s = ut + 0.5at², v² = u² + 2as) using graphical or calculus methods.",
      "Discuss the wave-particle duality of light. Explain the photoelectric effect and how it proves the particle nature of light.",
      "Detail the thermodynamic cycles of a Carnot engine. Explain why its efficiency can never reach 100%."
    ],
    true_false: [
      { text: "Sound waves travel faster in a vacuum than they do in dry air.", options: ["True", "False"] },
      { text: "The acceleration due to gravity is independent of the mass of the falling object in a vacuum.", options: ["True", "False"] },
      { text: "Mass of an object changes depending on the strength of the local gravitational field.", options: ["True", "False"] },
      { text: "A step-up transformer increases both the voltage and the current simultaneously.", options: ["True", "False"] }
    ],
    fill_blank: [
      "The rate of doing work or consuming energy is defined as ______.",
      "The escape velocity of an object from the Earth's surface is approximately ______ km/s.",
      "______ is the property of an object to resist any change in its state of rest or uniform motion.",
      "A light year is a unit of ______."
    ]
  };

  const mathPool = {
    mcq: [
      { text: "What is the derivative of f(x) = 3x² - 5x + 2 with respect to x?", options: ["6x - 5", "3x - 5", "6x", "6x² - 5"] },
      { text: "If 3x + 7 = 22, what is the value of x?", options: ["5", "3", "7", "6"] },
      { text: "What is the value of log₁₀(1000)?", options: ["3", "10", "2", "4"] },
      { text: "The sum of the interior angles of a regular hexagon is:", options: ["720 degrees", "540 degrees", "360 degrees", "900 degrees"] },
      { text: "If a card is drawn at random from a standard deck of 52 cards, what is the probability of drawing a King?", options: ["1/13", "1/52", "4/13", "1/4"] }
    ],
    short_answer: [
      "Solve the quadratic equation x² - 7x + 12 = 0.",
      "Find the equation of the line passing through points (2, 3) and (5, 9).",
      "Evaluate the limit as x approaches 0 of sin(x) / x.",
      "Find the derivative of f(x) = e^(2x) * cos(x).",
      "Calculate the area of a triangle with vertices at (1,1), (4,1), and (2,5)."
    ],
    long_answer: [
      "State and prove the Pythagorean Theorem using any standard mathematical method of your choice.",
      "Solve the system of linear equations using Gauss-Jordan elimination or Cramer's Rule:\n2x + y - z = 8\n-3x - y + 2z = -11\n-2x + y + 2z = -3",
      "Evaluate the definite integral of (3x² + 2x - 1) dx from limit x = 1 to x = 3, and explain its geometric meaning.",
      "An open box is to be made from a square piece of cardboard (side 12 inches) by cutting equal squares from each corner and folding up the sides. Find the dimensions that maximize the volume.",
      "State the Fundamental Theorem of Calculus. Explain both parts and discuss how it connects differentiation and integration."
    ],
    true_false: [
      { text: "The derivative of any constant function is always zero.", options: ["True", "False"] },
      { text: "All equilateral triangles are also isosceles triangles.", options: ["True", "False"] },
      { text: "The matrix multiplication is commutative, i.e., AB = BA for any two square matrices A and B.", options: ["True", "False"] },
      { text: "A function is continuous at a point if and only if its limit exists at that point.", options: ["True", "False"] }
    ],
    fill_blank: [
      "A polynomial of degree two is called a ______ equation.",
      "The value of sin²(θ) + cos²(θ) is always equal to ______.",
      "The derivative of ln(x) is ______.",
      "A matrix having equal number of rows and columns is called a ______ matrix."
    ]
  };

  const chemistryPool = {
    mcq: [
      { text: "What is the chemical symbol for Gold?", options: ["Au", "Ag", "Gd", "Fe"] },
      { text: "Which of the following represents a strong acid?", options: ["HCl", "CH₃COOH", "NH₃", "H₂O"] },
      { text: "What is the oxidation number of sulfur in H₂SO₄?", options: ["+6", "+4", "-2", "0"] },
      { text: "Which gas is evolved when calcium carbonate reacts with dilute hydrochloric acid?", options: ["Carbon Dioxide", "Hydrogen", "Oxygen", "Chlorine"] },
      { text: "The bond between sodium and chlorine in NaCl is:", options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"] }
    ],
    short_answer: [
      "Explain the key differences between ionic and covalent bonding.",
      "State the Law of Conservation of Mass in your own words.",
      "What are isotopes? Provide two examples of isotopes of carbon.",
      "Define pH and explain how the pH scale determines acidity or alkalinity.",
      "What is Le Chatelier's Principle?"
    ],
    long_answer: [
      "Explain the Haber-Bosch process for industrial synthesis of ammonia. Discuss how temperature, pressure, and catalysts affect the reaction rate and equilibrium yield using Le Chatelier's Principle.",
      "Describe Bohr's model of the atom. How does it explain atomic emission spectra, and what are its main limitations?",
      "Detail the differences between exothermic and endothermic reactions. Draw energy profile diagrams for both, showing activation energy and enthalpy change.",
      "Outline the Mendeleev periodic law and compare it with the modern periodic law. Explain the trends in atomic radius and electronegativity down a group and across a period.",
      "Write a comprehensive guide on buffer solutions. Explain their composition, how they resist pH changes, and their biological significance."
    ],
    true_false: [
      { text: "Pure water is a good conductor of electricity.", options: ["True", "False"] },
      { text: "In an electrochemical cell, oxidation always takes place at the anode.", options: ["True", "False"] },
      { text: "An element can be broken down into simpler substances by chemical means.", options: ["True", "False"] },
      { text: "Catalysts increase the rate of reaction by lowering the activation energy.", options: ["True", "False"] }
    ],
    fill_blank: [
      "The horizontal rows of the modern periodic table are known as ______.",
      "The number of moles of solute present in 1 liter of solution is called ______.",
      "A substance that donates a pair of electrons is a Lewis ______.",
      "The standard unit for measuring amount of substance is the ______."
    ]
  };

  const generalPool = {
    mcq: [
      { text: `What is considered the foundational starting point when examining a complex system like "${input.title}"?`, options: ["Defining basic structures and relationships", "Ignoring minor variables and anomalies", "Focusing exclusively on historical edge cases", "Relying on modern web frameworks"] },
      { text: `Which methodology is universally recognized as the most effective for validation in "${input.subject}"?`, options: ["Empirical testing and observation", "Arbitrary consensus", "Personal conviction", "None of the above"] },
      { text: `What represents the main conceptual difficulty when analyzing "${input.title}"?`, options: ["Synthesizing multi-faceted parameters", "Remembering basic names", "Locating simple reference materials", "Formatting source documents"] },
      { text: `How does studying "${input.title}" contribute to the broader discipline of "${input.subject}"?`, options: ["By establishing fundamental patterns and models", "By replacing all existing theories", "By introducing unverified terms", "By complicating simple workflows"] }
    ],
    short_answer: [
      `Detail two major practical applications of the concepts underlying "${input.title}".`,
      `Explain the primary relationship between "${input.title}" and the broader study of "${input.subject}".`,
      `What are the most critical variables of interest when analyzing "${input.title}"?`,
      `Identify the main constraints or limitations encountered when researching "${input.title}".`,
      `Briefly define three core terminologies that are essential to understanding "${input.title}".`
    ],
    long_answer: [
      `Write a comprehensive essay on "${input.title}". Discuss its core theoretical foundations, its historical evolution within "${input.subject}", and its contemporary practical applications in the modern world.`,
      `Compare and contrast the major paradigms or methodologies used to investigate "${input.title}". Detail the advantages, disadvantages, and ethical considerations of each approach.`,
      `Propose a structured research framework or step-by-step experiment to analyze a typical problem in "${input.title}". Outline your hypotheses, variables, testing methods, and expected findings.`,
      `Explain how the principles of "${input.title}" connect to and influence other sub-disciplines within "${input.subject}". Discuss the interdisciplinary value of this topic.`,
      `Assess the future directions and emerging trends related to "${input.title}". How do you anticipate upcoming technologies or discoveries will reshape this topic over the next decade?`
    ],
    true_false: [
      { text: `A robust understanding of "${input.title}" is key to mastering advanced concepts in "${input.subject}".`, options: ["True", "False"] },
      { text: `Research and methodologies regarding "${input.title}" have remained completely unchanged for the past century.`, options: ["True", "False"] },
      { text: `Analyzing "${input.title}" requires considering both qualitative and quantitative parameters.`, options: ["True", "False"] }
    ],
    fill_blank: [
      `The fundamental concept that underpins "${input.title}" is known as ______ deflection or state.`,
      `A systematic investigation into "${input.title}" leads to a clearer understanding of ______ in "${input.subject}".`,
      `In typical experiments regarding "${input.title}", the primary variable that is controlled or monitored is the ______ variable.`
    ]
  };

  // Choose the pool based on keyword matching on both subject and title
  let pool = generalPool;

  if (titleLower.includes("photosynthesis") || titleLower.includes("plant") || titleLower.includes("chlorophyll")) {
    pool = photosynthesisPool;
  } else if (titleLower.includes("cell") || titleLower.includes("genetic") || titleLower.includes("dna") || subjectLower.includes("bio")) {
    pool = cellPool;
  } else if (titleLower.includes("war") || titleLower.includes("revolution") || titleLower.includes("history") || subjectLower.includes("history") || subjectLower.includes("social")) {
    pool = historyPool;
  } else if (titleLower.includes("earth") || titleLower.includes("volcano") || titleLower.includes("geography") || subjectLower.includes("geography") || subjectLower.includes("earth")) {
    pool = geographyPool;
  } else if (titleLower.includes("computer") || titleLower.includes("code") || titleLower.includes("program") || titleLower.includes("python") || titleLower.includes("algorithm") || subjectLower.includes("computer") || subjectLower.includes("coding") || subjectLower.includes("software")) {
    pool = csPool;
  } else if (titleLower.includes("english") || titleLower.includes("literature") || titleLower.includes("shakespeare") || titleLower.includes("novel") || subjectLower.includes("english") || subjectLower.includes("literature")) {
    pool = englishPool;
  } else if (subjectLower.includes("phys")) {
    pool = physicsPool;
  } else if (subjectLower.includes("math") || subjectLower.includes("algebra") || subjectLower.includes("calculus") || subjectLower.includes("geometry")) {
    pool = mathPool;
  } else if (subjectLower.includes("chem")) {
    pool = chemistryPool;
  }

  // Helper to draw unique/shuffled items from a pool
  function getQuestions(type: "mcq" | "short_answer" | "long_answer" | "true_false" | "fill_blank", count: number, marks: number, sectionLetter: string) {
    const list: any[] = [];
    const poolItems = pool[type] || generalPool[type] || generalPool.short_answer;

    for (let i = 0; i < count; i++) {
      const idx = i % poolItems.length;
      const item = poolItems[idx];

      const qText = typeof item === "string" ? item : item.text;
      const qOptions = typeof item === "string" ? undefined : item.options;

      const difficulties: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];
      const diff = difficulties[i % 3];

      list.push({
        id: `${sectionLetter.toLowerCase()}-q${i + 1}`,
        number: i + 1,
        text: qText,
        difficulty: diff,
        marks,
        type,
        ...(qOptions ? { options: qOptions } : {})
      });
    }
    return list;
  }

  const sections = input.questionTypes
    .filter((t) => t.count > 0)
    .map((t, sectionIndex) => {
      const sectionLetter = String.fromCharCode(65 + sectionIndex);
      const questions = getQuestions(t.type, t.count, t.marksPerQuestion, sectionLetter);

      let instruction = "Attempt all questions in this section.";
      if (t.type === "mcq") {
        instruction = "Select the single best answer for each question.";
      } else if (t.type === "true_false") {
        instruction = "Determine whether the following statements are True or False.";
      } else if (t.type === "fill_blank") {
        instruction = "Fill in the blanks with the most appropriate terms.";
      }

      return {
        id: `section-${sectionLetter.toLowerCase()}`,
        title: `Section ${sectionLetter} – ${t.label}`,
        instruction,
        questions,
      };
    });

  const totalMarks = input.questionTypes.reduce(
    (sum, t) => sum + t.count * t.marksPerQuestion,
    0
  );

  return {
    title: input.title,
    subject: input.subject,
    totalMarks,
    durationMinutes: Math.max(60, Math.ceil(totalMarks * 1.5)),
    generalInstructions: [
      "Read all questions carefully before attempting.",
      "Write your answers in the space provided on the answer sheet.",
      "All questions carry marks as indicated next to them.",
      "Ensure your name, roll number, and section are clearly filled in.",
      input.additionalInstructions
        ? `Teacher note: ${input.additionalInstructions}`
        : "",
    ].filter(Boolean),
    sections,
  };
}

export async function generateQuestionPaper(
  input: AssignmentInput
): Promise<QuestionPaper> {
  if (!config.openaiKey) {
    return generateMockPaper(input);
  }

  const openai = new OpenAI({ apiKey: config.openaiKey });
  const prompt = buildGenerationPrompt(input);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You output only valid JSON for exam papers. Never include markdown fences or commentary.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty LLM response");

  const parsed = extractJson(raw);
  const validated = PaperSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Invalid paper schema: ${validated.error.message}`);
  }
  return validated.data;
}
