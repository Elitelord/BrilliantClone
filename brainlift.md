# BrainLift: The Application of AI to Learning Science


---

## Owners

- Sameer Agarwal
- Cursor(Research)

---

## Purpose

### Purpose

The purpose of this BrainLift is to develop a rigorous, defensible point of view on **how artificial intelligence should be applied to learning science** — that is, how AI (from classic intelligent tutoring systems through modern generative models) can be used to make *evidence-based* learning principles (retrieval practice, spacing, interleaving, cognitive-load management, mastery learning, scaffolding, and high-quality feedback) work at scale, **without** replacing the act of a learner's mind doing the work. It is grounded in a concrete artifact: *Population Path*, a Brilliant-style, learn-by-doing web app that teaches the Demographic Transition Model and layers AI on top of a typed, verifiable content model.

### In Scope

- The cognitive/learning-science principles that any AI learning tool should be built on (the "why it works").
- How AI is actually applied to learning: intelligent tutoring systems, adaptive/personalized learning, knowledge tracing, generative-AI tutors, automated feedback, and AI content generation.
- The design discipline of **grounding** AI in structured state and **verifying** AI output against subject logic (so the model never teaches a confident wrong answer).
- AI as an **additive** layer on a system that already teaches with AI turned off.
- Real-world products and the empirical evidence (and counter-evidence) for their effectiveness.
- Developing new knowledge and "spiky points of view" that an off-the-shelf AI could not generate.

---

## DOK 4: Spiky Points of View (SPOVs)

> **Reserved for the owner.** A Spiky POV is a well-reasoned, actionable, often contrarian argument synthesized from multiple DOK 3 insights. Do not fill this in with AI — this is the part that must be entirely your own.

- **Spiky POV 1:** _[State your first Spiky POV as a strong, clear assertion.]_
  - **Elaboration:** _[Defend it by synthesizing your DOK 3 insights and DOK 2 knowledge tree. Explain its implications and why it is novel.]_
- **Spiky POV 2:** _[State your second Spiky POV.]_
  - **Elaboration:** _[Defend and elaborate, connecting back to your foundational research.]_
- **Spiky POV 3:** _[Optional — add as many as you forge.]_
  - **Elaboration:** _[...]_

---

## Experts

> Curated leading thinkers across (a) the science of learning and (b) AI in education. Following their work builds the foundational knowledge behind the DOK 3 insights and DOK 4 SPOVs.

### A. The Science of Learning

**Robert A. Bjork (with Elizabeth Ligon Bjork)**
- **Who:** Distinguished Research Professor of Psychology, UCLA; directs the Bjork Learning & Forgetting Lab.
- **Focus:** "Desirable difficulties"; storage vs. retrieval strength; the dissociation of current *performance* from durable *learning*.
- **Why Follow:** The single most important corrective for AI/edtech — don't optimize for in-session performance or engagement; design difficulty that maximizes long-term retention and transfer.
- **Where:** https://bjorklab.psych.ucla.edu/

**Henry "Roddy" Roediger III**
- **Who:** James S. McDonnell Distinguished University Professor (Emeritus), Washington University in St. Louis.
- **Focus:** Retrieval practice / the testing effect; memory; applying cognitive psychology to education.
- **Why Follow:** Foundational research justifying retrieval-based learning loops and frequent low-stakes quizzing in AI tutors.
- **Where:** https://artsci.washu.edu/faculty-staff/henry-roediger

**Jeffrey D. Karpicke**
- **Who:** James V. Bradley Professor of Psychological Sciences, Purdue University; Cognition and Learning Lab.
- **Focus:** Retrieval-based learning; computer-based learning tools; self-regulated learning.
- **Why Follow:** Directly studies retrieval in technology-mediated learning — a blueprint for AI practice systems.
- **Where:** https://learninglab.psych.purdue.edu/people/

**John Sweller**
- **Who:** Emeritus Professor of Education, UNSW Sydney.
- **Focus:** Cognitive Load Theory; the worked-example effect; instructional design.
- **Why Follow:** The theory governing how to scaffold AI explanations and worked examples without overloading working memory.
- **Where:** https://www.unsw.edu.au/staff/john-sweller

**John Hattie**
- **Who:** Laureate Professor Emeritus, Melbourne Education Research Institute, University of Melbourne.
- **Focus:** *Visible Learning*; meta-analysis of feedback and influences on achievement.
- **Why Follow:** Ranks "what works" by effect size (especially feedback) — useful for prioritizing AI features (note methodological critiques of his meta-meta-analysis).
- **Where:** https://education.unimelb.edu.au/about-us/our-people/profiles/john-hattie

**Daniel T. Willingham**
- **Who:** Professor of Psychology, University of Virginia.
- **Focus:** Cognitive science → K–16 classroom practice; myth-busting (learning styles).
- **Why Follow:** The best translator of cognitive science for practitioners; sharp on what edtech should and shouldn't claim.
- **Where:** http://www.danielwillingham.com/

**Pooja K. Agarwal**
- **Who:** Cognitive scientist; founder of RetrievalPractice.org; co-author of *Powerful Teaching*.
- **Focus:** Applied retrieval practice, spacing, interleaving, and metacognition in real classrooms.
- **Why Follow:** Bridges lab findings to classroom-ready strategies — ideal source for designing learner-facing study features.
- **Where:** https://www.retrievalpractice.org/about

**Michelene "Micki" Chi**
- **Who:** Regents Professor, Arizona State University; directs the Learning & Cognition Lab and ICAP Center.
- **Focus:** Self-explanation; expertise; the ICAP framework (Interactive > Constructive > Active > Passive).
- **Why Follow:** Provides a precise theory of *what kind* of engagement deepens learning — directly useful for designing AI interactions.
- **Where:** https://search.asu.edu/profile/1274385

*Historical anchor:* **Benjamin S. Bloom** (1913–1999, University of Chicago) — mastery learning, Bloom's Taxonomy, and the "2 Sigma Problem" that frames the entire goal of scalable, tutoring-quality AI learning. Canonical paper: https://gwern.net/doc/psychology/1984-bloom.pdf

### B. AI in Education

**Kenneth R. Koedinger**
- **Who:** Hillman University Professor (HCII & Psychology), Carnegie Mellon; directs LearnLab; co-founder, Carnegie Learning.
- **Focus:** Intelligent tutoring systems; the "doer effect"; cognitive tutors; educational data mining.
- **Why Follow:** The leading figure connecting cognitive science, Cognitive Tutor/MATHia, and modern hybrid human–AI tutoring — directly models "AI applied to learning science."
- **Where:** https://hcii.cmu.edu/people/ken-koedinger

**John R. Anderson**
- **Who:** Richard King Mellon Professor of Psychology & Computer Science, Carnegie Mellon; creator of the **ACT-R** cognitive architecture.
- **Focus:** Cognitive modeling; the theoretical foundation of intelligent tutoring.
- **Why Follow:** Cognitive tutors built on his work taught math to hundreds of thousands of students — the intellectual root of adaptive learning.
- **Where:** http://act-r.psy.cmu.edu/peoplepages/ja/ja-vita.php

**Kurt VanLehn**
- **Who:** Professor, Arizona State University; ITS, student/cognitive modeling, natural-language tutoring dialogues.
- **Focus:** Comparative effectiveness of human tutoring, ITS, and other systems.
- **Why Follow:** Authored the definitive meta-analysis that recalibrated the "2 sigma" hype (human tutoring ≈ 0.79 SD, ITS ≈ 0.76 SD) — essential for honest claims.
- **Where:** https://scai.engineering.asu.edu/faculty/kurt-vanlehn/

**Neil Heffernan**
- **Who:** William Smith Dean's Professor, Worcester Polytechnic Institute; co-creator of **ASSISTments**.
- **Focus:** A rigorously evaluated (WWC-rated) learning platform plus an embedded RCT testbed for edtech research.
- **Why Follow:** A model for *additive*, evidence-first AI: build the system, then prove it works with randomized trials.
- **Where:** https://www.neilheffernan.net/

**Ryan Baker**
- **Who:** Professor; directs the Penn Center for Learning Analytics, University of Pennsylvania.
- **Focus:** Educational data mining / learning analytics; detecting disengagement and modeling learners.
- **Why Follow:** Leading voice on measuring what actually happens as students learn with software — the antidote to engagement theater.
- **Where:** https://learninganalytics.upenn.edu/ryanbaker/

**Rose Luckin**
- **Who:** Emerita Professor, UCL Knowledge Lab; founder, Educate Ventures; Institute for Ethical AI in Education.
- **Focus:** AI in education and its ethics; advising governments and industry.
- **Why Follow:** The foremost UK authority on responsible AI in education — frames the guardrails any product should respect.
- **Where:** https://profiles.ucl.ac.uk/48663-rose-luckin

**Sal Khan**
- **Who:** Founder/CEO, Khan Academy; creator of **Khanmigo**; author of *Brave New Words* (2024).
- **Focus:** Mastery learning at scale; the "AI personal tutor for every student" vision.
- **Why Follow:** The most visible popularizer shaping public and policy framing of AI tutoring — including candid lessons on adoption.
- **Where:** https://www.ted.com/talks/sal_khan_how_ai_could_save_not_destroy_education

---

## DOK 3: Insights

> **Reserved for the owner.** Insights are *your* original conclusions and connections drawn from the Knowledge Tree below — more than summary, less than a full SPOV. Group them thematically; they are the bridge from raw information to your novel arguments. Space is left intentionally blank.

### From the Science of Learning

- **Insight 1:** _[Your original idea/connection.]_
- **Insight 2:** _[...]_

### From Applying AI to Learning

- **Insight 1:** _[...]_
- **Insight 2:** _[...]_

### From Grounding & Verification (this project)

- **Insight 1:** _[...]_
- **Insight 2:** _[...]_

---

## DOK 2: Knowledge Tree

> Organized broad → specific. Each source carries **DOK 1 — Facts** (raw, objective) and a **DOK 2 — Summary** (synthesized in plain language), with a link to the source. This is the evidence base the insights above are built from.

### Category 1: The Science of Learning (the "why it works" any AI tool must respect)

> The evidence-based principles of human learning. AI is only as good for learning as the science it is pointed at.

#### Subcategory 1.1: Retrieval practice (the testing effect)

**Source: Roediger & Karpicke (2006), *Psychological Science*; Agarwal et al. (2021) review**

- **DOK 1 — Facts:**
  - In Roediger & Karpicke (2006), repeated *testing* beat repeated *studying* at long delays: on a 1-week test the study-test group recalled **~61% vs. ~40%** for study-only — even though study-only won at a 5-minute delay.
  - Repeated studying *raised learners' confidence* yet produced *worse* long-term retention — a metacognitive illusion.
  - The benefit held even when tests were given **without feedback**, so it isn't just extra exposure.
  - Agarwal, Nunes & Blunt (2021) systematic review: retrieval practice benefited learning across **50 experiments and 5,000+ students** in real classrooms; 57% of effect sizes were medium or large.
- **DOK 2 — Summary:** The act of pulling information *out* of memory is itself one of the most powerful learning events available, far more durable than re-reading — which only *feels* productive. For AI learning tools this argues for frequent low-stakes quizzing and active recall over re-presenting content.
- **Link to source:** https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x

#### Subcategory 1.2: Spaced / distributed practice

**Source: Cepeda, Pashler, Vul, Wixted & Rohrer (2006), *Psychological Bulletin***

- **DOK 1 — Facts:**
  - Meta-analysis of **839 assessments across 317 experiments** in 184 articles.
  - The **optimal gap between study sessions increases as the desired retention interval increases** (inter-study interval × retention interval interaction).
  - Spaced presentations markedly beat massed (crammed) presentations on final tests.
  - The lineage traces to Ebbinghaus's **1885** forgetting-curve work; Dunlosky et al. (2013) rate distributed practice one of only two "high utility" techniques.
- **DOK 2 — Summary:** Memory decays predictably, but spreading sessions out dramatically slows forgetting vs. cramming — and the *ideal* spacing scales with how long you need to remember. This is the empirical backbone of spaced-repetition systems; AI can personalize the interval to each learner and target horizon.
- **Link to source:** https://pubmed.ncbi.nlm.nih.gov/16719566/

#### Subcategory 1.3: Interleaving vs. blocked practice

**Source: Rohrer & Taylor (2007); Rohrer, Dedrick, Hartwig & Cheung (2020) RCT**

- **DOK 1 — Facts:**
  - Rohrer & Taylor (2007): mixed (interleaved) practice produced **63% vs. 20%** test accuracy over blocked practice (*d* ≈ 1.34), despite worse performance *during* practice.
  - Rohrer et al. (2020), preregistered cluster RCT, 54 classes of 7th-graders: on a surprise test one month later, interleaved scored **61% vs. 38%** (*d* = 0.83).
  - Interleaving forces learners to *choose* the right strategy rather than mechanically repeat the last one; it also guarantees spacing.
- **DOK 2 — Summary:** Mixing problem types reliably *hurts* practice-session performance while *improving* delayed-test performance — a hallmark "desirable difficulty." AI tools that shuffle problem types deliver two evidence-based benefits (interleaving + spacing) at once.
- **Link to source:** http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer_et_al_2020JEdPsych.pdf

#### Subcategory 1.4: Cognitive Load Theory & the worked-example effect

**Source: Sweller (1988), *Cognitive Science*; Sweller & Cooper (1985)**

- **DOK 1 — Facts:**
  - CLT distinguishes **intrinsic** (inherent difficulty), **extraneous** (poor design — reducible), and **germane** (schema-building) load.
  - Working memory is severely capacity-limited for novel information (~a handful of elements); long-term schemas are how expertise overcomes the limit.
  - **Worked-example effect:** for novices, studying step-by-step solutions beats unguided problem solving; Sweller & Cooper (1985) found problem-solvers took **~6× longer** with more errors.
- **DOK 2 — Summary:** Learning is bottlenecked by working memory, so instruction should minimize wasted load and channel effort into building durable schemas; novices in particular learn faster from worked examples than from open problem solving. AI tutors should scaffold heavily at first (worked examples, faded steps) and raise challenge as schemas grow.
- **Link to source:** https://doi.org/10.1207/s15516709cog1202_4

#### Subcategory 1.5: Mastery learning & Bloom's "2 Sigma Problem"

**Source: Bloom (1984), *Educational Researcher***

- **DOK 1 — Facts:**
  - Bloom reported students given **one-to-one tutoring + mastery learning** scored about **two standard deviations** above conventional-classroom peers — the average tutored student beat ~98% of the control class.
  - Roughly **90% of tutored students** reached the level only the top 20% reached conventionally.
  - Bloom framed it as a *problem*: 1-to-1 tutoring is "too costly for most societies to bear on a large scale," challenging researchers to find scalable methods that match it.
  - **Caveat:** later analyses argue 2σ was inflated; modern estimates for well-designed tutoring are closer to **~0.3–0.8 SD** (cf. VanLehn 2011). Read 2σ as an aspirational ceiling.
- **DOK 2 — Summary:** Personalized, mastery-based instruction can produce huge gains over one-size-fits-all classrooms, and Bloom posed the scaling challenge that AI tutoring directly aims to solve. The figure is best treated as a target, not a guaranteed constant — but it remains the canonical motivation for adaptive, mastery-gated AI systems.
- **Link to source:** https://gwern.net/doc/psychology/1984-bloom.pdf

#### Subcategory 1.6: Desirable difficulties & active learning

**Source: E. Bjork & R. Bjork (2011); Freeman et al. (2014), *PNAS*; Koedinger et al. (2015) "doer effect"**

- **DOK 1 — Facts:**
  - **Desirable difficulties** (spacing, interleaving, varied conditions, testing) slow apparent acquisition but enhance long-term retention/transfer — but only if the learner can overcome them.
  - Freeman et al. (2014) meta-analysis of **225 STEM studies**: active learning raised scores **0.47 SD** and cut failure rates (**33.8% lecture vs. 21.8% active** — a 55% higher failure rate under lecture).
  - **Doer effect** (Koedinger et al., 2015): in a MOOC, "doing" predicted learning **~6× more** than reading and **~3× more** than watching video, with evidence the relationship is causal; replicated "at scale" (15.2M events, 18,546 students).
- **DOK 2 — Summary:** Making learning feel harder, in principled ways, usually makes it stick better — performance during practice and actual learning are dissociable. Active "doing" beats passive consumption strongly enough that lecture is a questionable default; AI tools should prioritize frequent doing interleaved with exposition and resist optimizing for in-session ease.
- **Link to source:** https://www.pnas.org/doi/abs/10.1073/pnas.1319030111

#### Subcategory 1.7: Feedback & formative assessment

**Source: Hattie & Timperley (2007), *Review of Educational Research*; Black & Wiliam (1998)**

- **DOK 1 — Facts:**
  - Hattie & Timperley synthesized **12 meta-analyses / 196 studies / ~6,972 effect sizes**; average feedback effect size **0.79** (among the top influences on achievement).
  - *Type* matters more than feedback per se: feedback addressing the **task, process, and self-regulation** levels works; mere **praise** scores only ~0.12.
  - Black & Wiliam (1998) reviewed ~250 studies; formative assessment produced gains of **~0.4–0.7 SD**, helping low achievers most.
- **DOK 2 — Summary:** Feedback is one of the highest-leverage influences on learning — but only when it is specific and actionable (about the task and how to improve), not praise or a bare grade. This is a natural fit for AI: immediate, specific, process-level feedback at scale — provided it's correct.
- **Link to source:** https://journals.sagepub.com/doi/abs/10.3102/003465430298487

#### Subcategory 1.8: What does *not* work — study-strategy myths

**Source: Dunlosky et al. (2013), *PSPI*; Pashler et al. (2008) learning-styles review**

- **DOK 1 — Facts:**
  - Dunlosky et al. rated 10 techniques: **high utility** = practice testing + distributed practice; **moderate** = self-explanation, elaborative interrogation, interleaving; **low utility** = summarizing, **highlighting**, and **rereading** (the most popular student strategies).
  - Pashler et al. (2008): the "learning styles" **meshing hypothesis** has essentially **no rigorous supporting evidence**; classroom application is "unwarranted."
  - "Poor indicators of learning" include **engagement** and **time on task** (echoed in this repo's Phase 3 notes).
- **DOK 2 — Summary:** Students' favorite strategies (rereading, highlighting) are largely wasted effort, while the cheapest robust ones (self-testing, spacing) are underused; and tailoring to "visual/auditory/kinesthetic" styles is a myth. AI tools should optimize for evidence-based mechanisms and measure long-term retention — not style-matching or engagement metrics.
- **Link to source:** https://journals.sagepub.com/doi/abs/10.1177/1529100612453266



### Category 2: Applying AI to Learning (intelligent tutoring → generative AI)

> How AI technology is actually applied to teaching, the evidence for it, and the failure modes that grounding/verification exist to prevent.

#### Subcategory 2.1: Intelligent Tutoring Systems — history & evidence

**Source: VanLehn (2011), *Educational Psychologist*; Kulik & Fletcher (2016), *RER*; ASSISTments RCT (Roschelle et al., 2016)**

- **DOK 1 — Facts:**
  - ITS grew out of John Anderson's **ACT-R** architecture; **Cognitive Tutor / MATHia** (Carnegie Learning, co-founded by Koedinger & Anderson, 1998) was the first ITS in widespread school use.
  - VanLehn (2011) found **human tutoring *d* ≈ 0.79** and **ITS *d* ≈ 0.76** — ITS nearly as effective as human tutors, overturning the old "0.3 / 1.0 / 2.0" belief.
  - Kulik & Fletcher (2016), 50 controlled evaluations: median ITS effect **0.66 SD**, but **0.73 on local tests vs. only 0.13 on standardized tests**.
  - **ASSISTments** (Neil Heffernan): a Maine RCT (2,850 7th-graders) earned the **highest What Works Clearinghouse rating**, with low-prior-achievement students benefiting most.
- **DOK 2 — Summary:** Software that breaks problems into steps, tracks an internal model of student knowledge, and gives step-level feedback can reach **0.6–0.8 SD** gains — close to one-on-one tutoring. The nuance: gains are large on aligned tests and smaller on broad ones, and depend on faithful implementation. These pre-LLM systems set both the pedagogical playbook (mastery, step-level feedback) and the evidence bar modern AI tutors are measured against.
- **Link to source:** https://www.tandfonline.com/doi/abs/10.1080/00461520.2011.611369

#### Subcategory 2.2: Adaptive learning & knowledge tracing

**Source: Corbett & Anderson (1995); Piech et al. (2015), NeurIPS; Knewton coverage**

- **DOK 1 — Facts:**
  - **Bayesian Knowledge Tracing (BKT)** (Corbett & Anderson, 1995) models each skill as a latent variable and estimates mastery probability, sequencing exercises until "mastery."
  - **Deep Knowledge Tracing (DKT)** (Piech et al., 2015) used LSTMs with no hand-coded domain knowledge, improving prediction (reported **AUC ≈ 0.86 vs. ≈ 0.67 for BKT** on ASSISTments) at the cost of interpretability.
  - **Knewton** raised **$182M+**, marketed a "robot tutor in the sky," and was sold to **Wiley in 2019** for a fraction of its funding — the textbook case of adaptive-learning over-promising.
- **DOK 2 — Summary:** Personalized learning rests on knowledge tracing — inferring what a student knows from their answer history. The plumbing works (interpretable BKT; higher-accuracy neural DKT), but the commercial history is a cautionary tale: business hype ("mind-reading adaptivity") repeatedly outran the evidence.
- **Link to source:** https://arxiv.org/abs/1506.05908

#### Subcategory 2.3: Generative-AI / LLM tutors

**Source: Khan Academy (Khanmigo); Duolingo (Max); Sal Khan, TED 2023 & *Brave New Words* (2024)**

- **DOK 1 — Facts:**
  - **Khanmigo** (GPT-4, OpenAI launch partner) debuted **March 14, 2023**, designed to use **Socratic questioning rather than giving answers** ($4/mo or $44/yr; free teacher tools).
  - **Duolingo Max** launched the **same day** on GPT-4 with **"Roleplay"** and **"Explain My Answer"** ($29.99/mo at launch).
  - Sal Khan's 2023 TED talk ("How AI could save... education") argues for "a personal AI tutor for every student and an AI teaching assistant for every teacher"; his 2024 book is *Brave New Words*.
  - Candid 2026 follow-up: Khan acknowledged early student uptake was lower than hoped, prompting a redesign that **embeds the tutor directly into practice problems** rather than as a separate chatbot.
- **DOK 2 — Summary:** Generative-AI tutors went from lab to mass market in a single day in March 2023, wrapping GPT-4 in pedagogical guardrails (Socratic prompting, "don't just give the answer"). The vision is one-to-one tutoring at scale — but the open questions are whether engaging chat *actually produces learning* and whether the AI's answers are *correct*. A key real-world lesson: an AI tutor must live where the work happens.
- **Link to source:** https://blog.khanacademy.org/harnessing-ai-so-that-all-students-benefit-a-nonprofit-approach-for-equal-access/

#### Subcategory 2.4: Evidence on LLM tutoring effectiveness (RCTs)

**Source: Kestin et al. (2025), *Scientific Reports*; Wang et al. (2024) Tutor CoPilot; World Bank Nigeria (2025)**

- **DOK 1 — Facts:**
  - **Harvard physics AI tutor** (Kestin et al., RCT N=194): students learned **more in less time**, with effect sizes **~0.63 up to 0.73–1.3 SD** — roughly **double** the active-learning class — and higher engagement.
  - **Tutor CoPilot** (Stanford, 900 tutors / ~1,800 K-12 students): students of treatment tutors were **+4 pp** more likely to master topics; for **lower-rated tutors, +9 pp** — at ~**$20/tutor/year**.
  - **World Bank Nigeria** (6-week RCT, GPT-4): **+0.31 SD** composite (≈ **1.5–2 years** of schooling) — among the most cost-effective interventions benchmarked.
  - Every successful study used **research-based prompts/scaffolding and positioned the AI as a tutor, not an answer-provider** — off-the-shelf "just use ChatGPT" is not what they tested.
- **DOK 2 — Summary:** The first rigorous RCTs of LLM tutoring are strikingly positive (≈0.3 SD field, ≈0.7–1.3 SD lab) and show AI can even *upskill the weakest human tutors* cheaply. But the gains are **conditional on design** — careful prompting, scaffolding, oversight, and anti-shortcut guardrails. The evidence base is young and mostly short-term.
- **Link to source:** https://www.nature.com/articles/s41598-025-97652-6

#### Subcategory 2.5: AI feedback & automated grading

**Source: AES studies (Computers & Education, 2024; *Scientific Reports*, 2024)**

- **DOK 1 — Facts:**
  - With careful prompting, **GPT-4** reaches **moderate** agreement with human essay raters (e.g., QWK ≈ 0.55–0.58), far above GPT-3.5/Claude 2 under the same prompts.
  - **Prompt strategy dominates:** one study moved GPT-4o from QWK 0.46 → 0.72 with context-enhanced few-shot chain-of-thought — but still below human–human agreement (~0.91).
  - **Zero-shot grading is unreliable and can be biased:** GPT-4o scored essays ~0.9 points lower than humans, matched humans only ~30% of the time, and showed signs of inferring/using students' race in scoring.
- **DOK 2 — Summary:** LLMs make fast, detailed *formative* feedback feasible for every student — the biggest practical win of AI in classrooms. But on *scoring*, zero-shot grading is inaccurate, prompt-sensitive, and can encode demographic bias. The defensible deployment is "**AI drafts feedback, humans own grades**," especially for high-stakes work.
- **Link to source:** https://pubmed.ncbi.nlm.nih.gov/39113951/

#### Subcategory 2.6: Hallucination, verification & grounding (the core safety problem)

**Source: Macina et al. (2024) verifier/generator; RAG-in-education surveys (MDPI, 2025)**

- **DOK 1 — Facts:**
  - LLM tutors hallucinate in the worst possible way — e.g., **praising a wrong answer because the student sounded confident**, or "correcting" an error that doesn't exist.
  - **Decoupling a Verifier from a Generator** (detect the student's error / check the answer *first*, then phrase feedback) measurably **reduces hallucinated feedback** vs. one-pass approaches.
  - Even at best-case math performance, LLMs err on **~10%** of responses; self-consistency sampling helps but doesn't eliminate it (statistics errors only fell 29% → 13% in one study).
  - **RAG** grounding reduces hallucination rates by roughly **23–41%** across education benchmarks; best practice is "pedagogical grounding" — every claim traceable to a verified source — plus **tool use** (calculators, symbolic/logic engines, code execution) for anything computable.
  - **Structured / JSON-schema output** lets each claim be validated programmatically before a student sees it.
- **DOK 2 — Summary:** LLMs produce fluent, confident, sometimes-wrong math, logic, and citations — dangerous in education because a confident error teaches a misconception. The emerging discipline is **separation of concerns**: never let one model simultaneously reason, judge correctness, and phrase feedback. Route generated content/answers through an **independent verifier** (ideally one that *executes* the check) and force **structured output** so truth comes from subject logic, not text prediction.
- **Link to source:** https://arxiv.org/html/2407.09136

#### Subcategory 2.7: Risks, critiques & policy guardrails

**Source: Fan et al. (2025) "metacognitive laziness"; US ED report (2023); UNESCO guidance (2023)**

- **DOK 1 — Facts:**
  - **"Metacognitive laziness"** (Fan et al., 2025, N=117 RCT): the ChatGPT group wrote **better essays but showed no advantage in knowledge gain/transfer**, and engaged in **fewer self-regulatory processes** — "the essay got better; the student didn't."
  - **Cognitive offloading** (Gerlich, 2025, N=666): frequent AI use correlated **negatively with critical-thinking scores**, with younger users most dependent.
  - **US Dept. of Education** (May 2023) makes **"keep humans in the loop"** its central recommendation and flags algorithmic bias.
  - **UNESCO** (Sept 2023) issued the first global guidance: recommends a **minimum age of 13**, mandatory data-privacy standards, and warns adoption has outpaced regulation.
- **DOK 2 — Summary:** The central risk is subtle — AI can make work *look* better while making the learner *worse* (especially the young, who are edtech's main users), layered atop hallucination, bias, privacy, and access concerns. The recurring antidote is **friction/cognitive vigilance** (Socratic prompting, no instant answers) plus human-in-the-loop guardrails — and deep suspicion of engagement as a success metric.
- **Link to source:** https://research.monash.edu/en/publications/beware-of-metacognitive-laziness-effects-of-generative-artificial/



### Category 3: AI-Powered & Learn-by-Doing Products and Their Evidence

> Real products that operationalize the science above — what works, what is "engagement theater," and the recurring lesson that *design and grounding*, not "adding AI," drive results.

#### Subcategory 3.1: Brilliant.org — learn-by-doing, no video, the "6x" claim

**Source: Brilliant.org; Koedinger, Kim, Jia, McLaughlin & Bier (2015), L@S**

- **DOK 1 — Facts:**
  - Brilliant states "you learn by doing — there are no videos, everything is interactive," and that interactive learning is "shown to be **6x more effective**"; it advertises **10 million+ learners**.
  - The "6x" claim traces to Koedinger et al. (2015), "Learning is Not a Spectator Sport," comparing **18,645 MOOC-only vs. 9,075 MOOC+OLI** students: *doing* activities had ~**6×** the learning impact of watching video or reading (coefficients ~0.44 vs. ~0.065).
  - **Accuracy note:** Brilliant's site links a secondary summary, not the primary paper — cite Koedinger et al. (2015) directly.
- **DOK 2 — Summary:** Brilliant's pedagogy is deliberately anti-passive: interactive problem-solving with instant feedback to build intuition first-principles. Its marquee claim rests on a real Carnegie Mellon study (the "doer effect"). This is the direct product ancestor of *Population Path*.
- **Link to source:** http://pact.cs.cmu.edu/pubs/koedinger,%20Kim,%20Jia,%20McLaughlin,%20Bier%202015.pdf

#### Subcategory 3.2: Mentava — mastery-based, accelerated, then off-ramp

**Source: Mentava (mentava.com)**

- **DOK 1 — Facts:**
  - Model: "education = curriculum + motivation," using a direct-instruction, phonics-based curriculum (Orton-Gillingham / Engelmann lineage).
  - Reading program is ~120 levels / ~2,300 activities; at 30 min/day a level takes 1–3 days; the full program is "expected to take less than a year."
  - Explicitly designed to **off-ramp**: it encourages families to transition away from the software into reading physical books once fluency is reached.
- **DOK 2 — Summary:** Mentava is a software tutor built on a rigorous mastery-based curriculum plus serious game-design motivation; its thesis is that the curriculum isn't the hard part — *motivation* is. It is frequently invoked as the template ("the Mentava for X") for accelerated, mastery-gated, self-paced learning that deliberately hands the learner back to the real-world activity.
- **Link to source:** https://www.mentava.com/our-approach

#### Subcategory 3.3: Khan Academy — mastery learning + Khanmigo

**Source: Khan Academy / OpenAI; Chalkbeat (2026)**

- **DOK 1 — Facts:**
  - Khan Academy built its reputation on free **mastery learning** (demonstrate mastery before advancing); Khanmigo (GPT-4) extends it as a Socratic tutor that "never gives you the answer."
  - Sal Khan's framing: a personal AI tutor for every student and an AI assistant for every teacher (TED 2023; *Brave New Words*, 2024).
  - 2026 reflection: early student uptake was low ("they just didn't use it much"), prompting a redesign that **embeds Khanmigo in the practice flow**.
- **DOK 2 — Summary:** Khan Academy is the canonical mastery-learning product and the most visible LLM-tutor deployment, explicitly engineered not to give answers. Its candid admission of adoption struggles is a real-world lesson: an AI tutor must be embedded where the work happens, not bolted on as a separate chatbot.
- **Link to source:** https://openai.com/index/khan-academy/

#### Subcategory 3.4: Duolingo — gamification + spaced repetition + GPT-4

**Source: Settles & Meeder (2016), ACL; TechCrunch / OpenAI (2023)**

- **DOK 1 — Facts:**
  - **Half-Life Regression** (Settles & Meeder, 2016) marries memory-decay theory with ML; it reduced recall-prediction error by **45%+** and improved daily engagement by **12%**.
  - Difficulty/sequencing is personalized by the in-house **"Birdbrain"** model, fed by ~**1.25 billion exercises/day**.
  - **Duolingo Max** (2023) layered GPT-4 on top via "Roleplay" and "Explain My Answer" — the latter exists because open-ended wrong answers can't be pre-scripted.
- **DOK 2 — Summary:** Duolingo is the canonical case for both gamified habit loops (streaks, XP, leaderboards) *and* rigorous learning science (ML-driven spaced repetition). It then used GPT-4 precisely where authored content can't scale — explaining the infinite space of wrong answers — a clean example of AI as a targeted addition, not a replacement.
- **Link to source:** https://aclanthology.org/P16-1174/

#### Subcategory 3.5: Carnegie Learning MATHia & Squirrel AI — adaptive mastery at scale

**Source: RAND RCT (Pane et al., 2014); Squirrel AI coverage (WEF, MIT Tech Review)**

- **DOK 1 — Facts:**
  - **MATHia / Cognitive Tutor:** RAND's RCT (~19,000 students, 147 schools) found a meaningful **~0.20 SD** gain for high-schoolers — but **only in Year 2**, with no effect in Year 1.
  - **Squirrel AI:** decomposes subjects into tens of thousands of "micro-knowledge points"; reports **24M+ students** and **2,000+ learning centers**.
  - Squirrel AI's strongest score advantages come from **company/partner (vendor-reported) comparisons**, not independent peer-reviewed RCTs — treat magnitudes with caution.
- **DOK 2 — Summary:** Adaptive mastery products show real but design- and implementation-dependent effects: even an evidence-based ITS like MATHia needed a *year* to show gains, and the largest vendor claims (Squirrel AI) lack independent RCT backing. The lesson: adaptivity helps, but rollout time and evidence quality matter enormously.
- **Link to source:** https://www.rand.org/pubs/research_briefs/RB9746.html

#### Subcategory 3.6: Spaced-repetition flashcards & the limits of gamification

**Source: Woźniak SM-2 (SuperMemo); Sailer & Homner (2020) meta-analysis**

- **DOK 1 — Facts:**
  - The **SM-2** algorithm (Piotr Woźniak, 1987) schedules each card's next review using a per-card "easiness factor" and a 0–5 recall grade; Anki adopted a modified SM-2 (2006) and now defaults to the ML-based **FSRS**.
  - Sailer & Homner (2020) meta-analysis: gamification has **small but real** effects — cognitive *g* = .49, motivational *g* = .36, behavioral *g* = .25 — but long-term **retention** evidence is thin.
  - Competitive leaderboards can **demotivate struggling/late learners**; reviews recommend segmented leaderboards or personal-progress indicators.
- **DOK 2 — Summary:** Spaced-repetition apps (Anki/Quizlet, descended from SuperMemo) show how a simple hand-tuned algorithm can later be augmented by ML — mirroring Duolingo's HLR. Gamification, meanwhile, "doesn't teach but can make teaching possible": streaks/XP manufacture the *consistency* that lets spaced retrieval do the real work — the design test is whether a mechanic reinforces the learning behavior, not just time-on-app.
- **Link to source:** https://link.springer.com/content/pdf/10.1007/s10648-019-09498-w.pdf

#### Subcategory 3.7: The core design tension — additive AI vs. crutch

**Source: Macina et al. (2024); "Beyond Final Answers" (2025); Univ. of Vienna feedback RCT**

- **DOK 1 — Facts:**
  - LLM tutors "often generate hallucinated outputs and present erroneous information to students," including marking a wrong solution correct.
  - A dedicated **verifier** that first detects the student's error and grounds the response yields feedback that is "more often correct... with less hallucinations."
  - A Univ. of Vienna RCT (N=252) found even **100%-hallucinated feedback** still produced learning gains — but caused lower perceived accuracy/usefulness and more confusion (learners noticed and lost trust).
- **DOK 2 — Summary:** The central principle for grounded AI is that it must be **additive** — the app should still teach correctly with AI off — because LLMs confidently hallucinate, including the worst failure mode for a tutor: validating a wrong answer. The consensus fix is to **decouple verification from generation**: compute the correct answer deterministically from subject logic, then let the model *explain* that verified answer rather than decide it. This is exactly the discipline *Population Path* implements (Category 4).
- **Link to source:** https://arxiv.org/html/2407.09136

#### Subcategory 3.8: Effect-size cheat sheet (for quick reference)

| Intervention | Effect size | Source quality |
|---|---|---|
| Doing vs. watching (CMU MOOC, "doer effect") | "6×" (coeff ~0.44 vs ~0.065) | Peer-reviewed |
| Active learning vs. lecture (Freeman 2014) | +0.47 SD; 55% lower fail rate | Meta-analysis (225 studies) |
| Human tutoring / ITS (VanLehn 2011) | ~0.79 / ~0.76 SD | Meta-analysis |
| ITS median (Kulik & Fletcher 2016) | 0.66 SD (0.73 local / 0.13 standardized) | Meta-analysis (50 RCTs) |
| Cognitive Tutor / MATHia (RAND) | ~0.20 SD (HS, Year 2) | Large RCT |
| Feedback (Hattie & Timperley) | ~0.79 SD avg | Meta-meta-analysis |
| Gamification (Sailer & Homner) | g = .25–.49 (small) | Meta-analysis |
| Harvard AI physics tutor (Kestin 2025) | 0.73–1.3 SD | RCT (N=194) |
| World Bank Nigeria AI tutor (2025) | 0.31 SD (~1.5–2 yrs schooling) | Field RCT |
| Tutor CoPilot (Stanford 2024) | +4 pp (+9 pp weak tutors) | Live-tutoring RCT |

> **Caveat:** these effect sizes come from different outcomes, populations, and durations and are **not directly comparable** — use them as orientation, not a leaderboard.



### Category 4: Case Study — Grounded, Verified AI on a Learn-by-Doing Substrate (*Population Path*)

> Primary sources are this repository's own documents and source code. This is the concrete artifact the BrainLift reasons about: a Brilliant-style app teaching the Demographic Transition Model (DTM), with an additive, verified AI layer.

#### Subcategory 4.1: The learn-by-doing core (what the AI sits on top of)

**Source: `Brilliant.md` — Brilliant pedagogy reference notes**

- **DOK 1 — Facts:**
  - Brilliant teaches **by doing, not watching** — no videos; every concept is taught through interactive problems with instant feedback; it claims interactive learning is **~6x more effective than video**.
  - Core pedagogy is **problem-first** (drop the learner into a problem before formalizing), **intuition before formalism**, **mistakes are non-judgmental**, **bite-sized (~15 min/day)**, and **scaffolding that fades** ("desirable difficulty").
  - The internal acceptance test: **hand the app to someone who doesn't know the subject and see if they actually learn it.**
  - Content is built as **structured/configurable data assets** (not HTML blobs) so problem variations can be mass-produced and human-reviewed for correctness.
  - Hierarchy: **Learning Path → Course → Lesson → Step (interactive problem)**, with prerequisite structure and mastery gating.
- **DOK 2 — Summary:** The app's foundation is a deliberate bet that *active problem-solving sticks and passive content doesn't*. Lessons are data, not markup, which makes adding variations cheap and — critically — makes the content **machine-readable**, the precondition for grounding any later AI. Every MVP requirement maps back to a learning-science principle (learn-by-doing, instant specific feedback, mastery, scaffolding, habit).
- **Link to source:** `Brilliant.md` (repo)

**Source: `prd.md` — Product Requirements (Population Path / DTM)**

- **DOK 1 — Facts:**
  - The subject is the **Demographic Transition Model**, a unit of AP Human Geography; the persona is a **14–15-year-old** studying for the AP exam.
  - The MVP is **3 interactive lessons that build on each other** (the DTM engine; reading population pyramids; sector employment shift), each with ≥1 directly-manipulated problem and a real-time-responding visual.
  - Hard rule: the app must **teach the core idea without any AI doing the work**; *all AI features are explicitly out of MVP scope (Phase 2)* and the learning-science layer (spaced repetition, interleaving, scaffolding/fading) is **Phase 3**.
  - Feedback is **instant (<100ms target), specific, hand-written**; wrong answers get a hint/explanation tied to the likely misconception, then a retry — "never just a red X."
  - Tech: React + TypeScript + Vite + Firebase; lessons authored as **typed JSON/TS objects validated against a shared `Lesson`/`Step` schema** (data-driven, AI-generatable later).
- **DOK 2 — Summary:** The PRD encodes the "teach first, add AI second" discipline at the spec level: AI is forbidden in the MVP precisely so the team must prove the lesson teaches on its own. The structured content model is the load-bearing decision — it is simultaneously the pedagogy (content as data) and the substrate that makes AI grounding/verification possible in Phase 2.
- **Link to source:** `prd.md` (repo)

#### Subcategory 4.2: The AI-feature decision (which AI to ship, and which to refuse)

**Source: `PHASE2-AI-NOTES.md` — Phase 2 AI feature decision notes**

- **DOK 1 — Facts:**
  - Three hard rules for every AI feature: **ground it in the lesson's structured state, not raw text**; **verify anything checkable against the subject's logic**; **the app must keep teaching with AI turned off** (AI = additions, not replacements).
  - Chosen backend: **Firebase AI Logic (Gemini Developer API)** — free tier, keys never on client (secured by App Check), and **native JSON-schema structured output** for validated generation.
  - Shipping AI features: (1) **Wrong-answer nudge** grounded in the learner's current attempt + validator outcome; (2) **AP-style end-of-lesson Skill Check** (3-question MCQ) where `verify.ts` **recomputes correct answers from `dtm.ts`** before display; (3) **"Explain it back"** AI-graded free response (the step is *omitted entirely when AI is off*).
  - **Deliberately skipped:** a free-roaming chatbot tutor (the brief warns against bolting one on — "not grounded, low signal") and full LLM-driven path reordering (deterministic mastery gating "does this honestly; an LLM adds risk, not value").
- **DOK 2 — Summary:** The decision log is a case study in *restraint as design*: the team picks AI features that exploit the structured substrate (nudges grounded in validator outcomes, generated questions re-checked against a math engine) and refuses the seductive, ungrounded ones (open chatbot, LLM path control). The principle "AI is additive, never load-bearing" is enforced by making AI-only steps gracefully vanish when AI is disabled.
- **Link to source:** `PHASE2-AI-NOTES.md` (repo)

**Source: `src/lib/ai/verify.ts` + `src/lib/ai/features/skillCheck.ts` + `schema.ts` — the verification layer (source code)**

- **DOK 1 — Facts:**
  - The LLM is constrained to a fixed set of **question templates** (e.g. `stage-from-rates`, `population-trend`, `pyramid-stage`, `sector-dominant`, `cause-of-death`, `net-migration`, `density-measure`, `malthus-outcome`) and must emit a structured `scenario` object **so the answer can be independently recomputed**.
  - `computeCorrectOptionId()` re-derives the correct answer **deterministically from `dtm.ts`** (e.g. `stageFromRates`, `trendFromGap`, `dominantSector`, `malthusCrossover`); `verifySkillCheckQuestion()` **rejects any question whose AI-claimed answer doesn't match the recomputed one**, and uses the recomputed answer regardless of what the model claimed.
  - Generation **retries up to 3×**, requires **4 options** per item, and **drops** questions that fail verification (ships only verified items, or none).
  - The skill-check prompt demands **AP-exam rigor** (applied stimulus, AP command terms, distractors that each encode a *specific misconception*) and weights toward concepts the learner's mastery record shows are weak.
- **DOK 2 — Summary:** This is the technical heart of "verify anything checkable." The LLM is treated as an *untrusted drafter* of natural-language stimulus; the *truth* always comes from deterministic subject logic. Schema-enforced JSON + template constraints + recomputation turns a hallucination-prone generator into a safe one: the worst case is a missing question, never a wrong one taught as right.
- **Link to source:** `src/lib/ai/verify.ts`, `src/lib/ai/features/skillCheck.ts`, `src/lib/ai/schema.ts` (repo)

**Source: `src/lib/ai/hintGuard.ts` + `features/wrongAnswerNudge.ts` + `describeInteraction.ts` — grounding & no-giveaway guards (source code)**

- **DOK 1 — Facts:**
  - `describeInteraction.ts` serializes **typed learner state** (e.g. "Learner set CBR 36, CDR 9, gap 27, trend rapid-growth") into a plain-language summary for the model — **never raw page text**.
  - The wrong-answer nudge is grounded in `ctx.humanSummary` + the **validator outcome/detail** and is instructed to critique *their specific attempt* in 1–2 sentences "without stating the correct answer, stage number, option label, or target values."
  - `hintLeaksAnswer()` is a **deterministic post-filter** that rejects any AI/authored hint that leaks the solution (correct MC label, target stage number, target trend, target NIR gap, match-pairs answer, etc.), with stricter rules `pre-answer` than `post-wrong`.
  - On quota/API failure, features fail safe: nudges return `null`, the explain-back step shows a retry message rather than the model answer, and `playableSteps()` removes AI-only steps when AI is off.
- **DOK 2 — Summary:** Two guardrails work together: **grounding** (the model only ever sees structured, validated state) and a **no-giveaway guard** (a rules-based filter that catches the model when it tries to hand over the answer). The result is AI feedback that is tailored to the learner's exact mistake yet cannot short-circuit the desirable difficulty of solving it themselves.
- **Link to source:** `src/lib/ai/hintGuard.ts`, `src/lib/ai/features/wrongAnswerNudge.ts`, `src/lib/ai/describeInteraction.ts` (repo)

#### Subcategory 4.3: The learning-science layer (Phase 3 design intent)

**Source: `PHASE3-LEARNING-SCIENCE.md` — Phase 3 learning-science notes**

- **DOK 1 — Facts:**
  - The three highest-utility principles to design around are **retrieval, spacing, and interleaving**; the layer should de-emphasize re-reading/highlighting/summarizing.
  - Learning is treated as **recursive, not linear** — deliberately bring back old concepts instead of marking a stage "done."
  - **Working memory is limited (~7 items)** — don't overload a single step; **prior knowledge/previewing** activates recall and speeds new learning.
  - **Spacing rule of thumb:** a gap too short makes retrieval too easy; aim for roughly a **10–20% test delay** before restudy, so retrieval still succeeds but isn't trivial.
  - Implementation intents: **map prerequisites**, define mastery targets, **generate parallel diagnostic items** and adaptive forms at scale, design **curriculum-aligned MCQ distractors**, and **rephrase prompts on retrieval** so learners can't pattern-match memorized strings. For AI feedback, aim **beyond text** (images/visuals/video where possible).
- **DOK 2 — Summary:** Phase 3 is where AI and learning science fully converge: AI's content-generation strength (parallel items, adaptive forms, rephrased retrieval prompts, multimodal feedback) is pointed directly at the highest-utility evidence-based mechanics (retrieval, spacing, interleaving, mastery). Notably, "poor indicators of learning" (engagement, time on task) are explicitly named — a guard against optimizing AI for engagement theater instead of learning.
- **Link to source:** `PHASE3-LEARNING-SCIENCE.md` (repo)

**Source: `research/ap-human-geography-dtm-teaching-knowledge-base.md` — teaching-methodology comparison**

- **DOK 1 — Facts:**
  - Standard AP classroom consensus blends **direct instruction** with **data-heavy active learning** (country comparisons, pyramid construction, indicator tables); the dominant pattern is **inductive reasoning from evidence** (look first, classify, then receive vocabulary).
  - The app **flips the playbook** to explore/manipulate-first, which aligns with "predict first" and construct-and-interpret activities but de-emphasizes lecture and multi-country spreadsheet work.
  - The app **over-indexes on consensus strengths** (manipulable visuals, rate-gap intuition, pyramid↔DTM mapping, real countries, scaffolded difficulty) and **under-indexes on CED breadth** (epidemiological transition, migration, dependency, momentum, policy, Malthus, historical pyramid scars).
- **DOK 2 — Summary:** Independent research into how the subject is actually taught confirms the app is a high-quality *micro-course on the DTM core mechanism* rather than a full unit — and that its learn-by-doing stance matches the active-learning end of the pedagogical spectrum. This is the external benchmark against which AI-driven breadth expansion (more lessons, more item variety) can be judged.
- **Link to source:** `research/ap-human-geography-dtm-teaching-knowledge-base.md` (repo)

---

### Sources index (consolidated)

| ID | Source | Type |
|---|---|---|
| repo-brilliant | `Brilliant.md` | Primary (local) |
| repo-prd | `prd.md` | Primary (local) |
| repo-readme | `README.md` | Primary (local) |
| repo-phase2 | `PHASE2-AI-NOTES.md` | Primary (local) |
| repo-phase3 | `PHASE3-LEARNING-SCIENCE.md` | Primary (local) |
| repo-research | `research/ap-human-geography-dtm-teaching-knowledge-base.md` | Primary (local) |
| repo-code | `src/lib/ai/*` (verify, skillCheck, hintGuard, describeInteraction, schema) | Primary (local) |

**External primary/landmark sources (full URLs in each subcategory above):**

| Topic | Source | Link |
|---|---|---|
| Retrieval practice | Roediger & Karpicke (2006) | https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x |
| Spacing | Cepeda et al. (2006) | https://pubmed.ncbi.nlm.nih.gov/16719566/ |
| Interleaving | Rohrer et al. (2020) | http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer_et_al_2020JEdPsych.pdf |
| Cognitive load | Sweller (1988) | https://doi.org/10.1207/s15516709cog1202_4 |
| 2 Sigma | Bloom (1984) | https://gwern.net/doc/psychology/1984-bloom.pdf |
| Desirable difficulties | E. & R. Bjork (2011) | https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/04/EBjork_RBjork_2011.pdf |
| Active learning | Freeman et al. (2014), PNAS | https://www.pnas.org/doi/abs/10.1073/pnas.1319030111 |
| Doer effect | Koedinger et al. (2015), L@S | http://pact.cs.cmu.edu/pubs/koedinger,%20Kim,%20Jia,%20McLaughlin,%20Bier%202015.pdf |
| Feedback | Hattie & Timperley (2007) | https://journals.sagepub.com/doi/abs/10.3102/003465430298487 |
| Study strategies | Dunlosky et al. (2013) | https://journals.sagepub.com/doi/abs/10.1177/1529100612453266 |
| Learning styles myth | Pashler et al. (2008) | https://pubmed.ncbi.nlm.nih.gov/26162104/ |
| ITS meta-analysis | VanLehn (2011) | https://www.tandfonline.com/doi/abs/10.1080/00461520.2011.611369 |
| ITS meta-analysis | Kulik & Fletcher (2016) | https://journals.sagepub.com/doi/10.3102/0034654315581420 |
| Knowledge tracing (BKT) | Corbett & Anderson (1995) | https://link.springer.com/doi/10.1007/BF01099821 |
| Deep knowledge tracing | Piech et al. (2015), NeurIPS | https://arxiv.org/abs/1506.05908 |
| ASSISTments RCT | Roschelle et al. (2016) | https://journals.sagepub.com/doi/10.1177/2332858416673968 |
| Khanmigo | Khan Academy / OpenAI | https://openai.com/index/khan-academy/ |
| Duolingo Max | TechCrunch (2023) | https://techcrunch.com/2023/03/14/duolingo-launches-new-subscription-tier-with-access-to-ai-tutor-powered-by-gpt-4/ |
| Duolingo HLR | Settles & Meeder (2016), ACL | https://aclanthology.org/P16-1174/ |
| Sal Khan vision | TED 2023 | https://www.ted.com/talks/sal_khan_how_ai_could_save_not_destroy_education |
| Harvard AI tutor RCT | Kestin et al. (2025) | https://www.nature.com/articles/s41598-025-97652-6 |
| Tutor CoPilot RCT | Wang et al. (2024) | https://arxiv.org/abs/2410.03017 |
| World Bank Nigeria RCT | de Simone et al. (2025) | https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099548105192529324 |
| AI essay scoring | Computers & Education (2024) | https://pubmed.ncbi.nlm.nih.gov/39113951/ |
| AI grading bias | Scientific Reports (2024) | https://www.nature.com/articles/s41598-024-79208-2 |
| Verifier/generator | Macina et al. (2024) | https://arxiv.org/html/2407.09136 |
| RAG in education | MDPI survey (2025) | https://www.mdpi.com/2076-3417/15/8/4234 |
| Metacognitive laziness | Fan et al. (2025), BJET | https://research.monash.edu/en/publications/beware-of-metacognitive-laziness-effects-of-generative-artificial/ |
| Cognitive offloading | Gerlich (2025), Societies | https://www.mdpi.com/2075-4698/15/1/6 |
| US ED AI report | OET (2023) | https://www.ed.gov/sites/ed/files/documents/ai-report/ai-report.pdf |
| UNESCO GenAI guidance | UNESCO (2023) | https://www.unesco.org/en/articles/unesco-governments-must-quickly-regulate-generative-ai-schools |
| Brilliant pedagogy | Brilliant.org | https://brilliant.org/ |
| Mentava approach | Mentava | https://www.mentava.com/our-approach |
| Cognitive Tutor RCT | RAND (Pane et al., 2014) | https://www.rand.org/pubs/research_briefs/RB9746.html |
| Squirrel AI | World Economic Forum (2024) | https://www.weforum.org/stories/2024/07/ai-tutor-china-teaching-gaps/ |
| SM-2 spaced repetition | SuperMemo (Woźniak) | http://www.super-memory.com/english/ol/sm2.htm |
| Gamification meta-analysis | Sailer & Homner (2020) | https://link.springer.com/content/pdf/10.1007/s10648-019-09498-w.pdf |

> **Citation-integrity notes:** (1) Bloom's "2 sigma" is likely overstated; modern tutoring estimates are ~0.3–0.8 SD. (2) Effect sizes across eras/studies are not directly comparable. (3) Some 2025–2026 arXiv items are preprints, cited for the *engineering pattern* (verifier/generator, RAG grounding), not as settled effect-size evidence. (4) Brilliant's "6×" links a secondary article — cite Koedinger et al. (2015) directly. (5) Squirrel AI magnitude claims are vendor-reported, not independent RCTs.

---

## Full draft — for final submission (Sunday)

> Brainlift build write-up following the project brief's five sections (tools/workflow, prompting strategies, phase decisions, code analysis, key learnings). The lean early-submission version is `BRAINLIFT-SUBMISSION.md`. This block is the fuller working draft to refine for the Sunday final.

**Project:** *Population Path* — a Brilliant-style, learn-by-doing web app that teaches the **Demographic Transition Model (DTM)**, a unit of AP Human Geography.
**Author:** Sameer Agarwal
**Persona:** a 14–15-year-old studying AP Human Geography (Unit 2) for the exam.
**Stack:** React + TypeScript + Vite, Tailwind, Framer Motion, custom SVG + d3-scale visuals, Firebase (Auth + Firestore + Hosting), Zustand. Lessons are **typed data** (`Lesson`/`Step` objects validated against a shared schema), not hardcoded UI — which is the load-bearing decision that makes everything downstream (AI grounding, verification, generation) possible.

### 1. Tools and workflow

- **Primary tool: Cursor** (agent + inline edits) as the day-to-day coding environment, driving an Anthropic Claude / OpenAI GPT model. `[FILL IN: name the exact model(s) you drove Cursor with most, e.g. Claude Sonnet/Opus, and roughly the split.]`
- **How I used it (the actual loop):**
  1. **Plan in Markdown first, code second.** I wrote decision docs (`prd.md`, `PHASE2-AI-NOTES.md`, `PHASE3-LEARNING-SCIENCE.md`) and used them as durable context I could point the agent at, rather than re-explaining intent every prompt. This kept the agent grounded across long sessions.
  2. **Schema-first, then fill in.** I had the agent define the typed content model (`types/content.ts`) and the deterministic domain math (`lib/dtm.ts`, `lib/validators.ts`) before any AI features, so the AI layer had a verifiable substrate to sit on.
  3. **Tight feedback loop.** Generate → run `npm run type-check` / `npm test` → paste failures back to the agent. The TypeScript types and unit tests acted as guardrails that caught the agent's mistakes automatically.
  4. **Research via a separate "deep-research" pass** to build the learning-science evidence base (the knowledge tree above), kept separate from the build agent so insights passed through my own brain rather than being auto-synthesized.
- **Deploy:** Firebase Hosting (`npm run deploy`). Live at https://brilliantclone-b4a2a.web.app.

### 2. Prompting strategies

A few patterns that consistently worked. Exact transcripts are mine to paste in for the final.

**a) "Build the verifiable substrate before the AI."** I prompted the agent to implement the domain as pure functions (`stageFromRates`, `trendFromGap`, `dominantSector`, `malthusCrossover`, `computeDensities`) plus outcome-based validators *first*, explicitly so AI output could later be checked against them. This single decision is what made the skill-check feature safe.
> `[FILL IN: paste the actual prompt you used to scaffold dtm.ts / validators.ts.]`

**b) "Generate as data, not as UI."** To build interactive lessons, I prompted for **typed `Step` objects** (interaction config + answer + outcome-keyed feedback) rather than React components, e.g. *"Author lesson 1 as an array of `Step` objects matching the `Lesson` schema; every wrong-answer outcome must have hand-written feedback tied to a specific misconception — never just 'incorrect'."* The data-driven model let me mass-produce and review lesson variations cheaply.
> `[FILL IN: paste the actual lesson-authoring prompt + one Step it produced.]`

**c) "Constrain the LLM to templates + force structured output."** For AI question generation I prompted the model to emit only from a fixed template set with a structured `scenario` object *"so the answer can be independently recomputed"* — and to return strict JSON. This is what turned a hallucination-prone generator into a verifiable one (see `features/skillCheck.ts`).
> `[FILL IN: paste the skill-check generation prompt, or cite the SKILL_CHECK_TASK string in the repo.]`

**d) "Critique their attempt, don't reveal the answer."** For the wrong-answer nudge, the prompt grounds the model in the learner's *actual* serialized state + validator outcome and instructs it to critique the specific mistake in 1–2 sentences *"without stating the correct answer, stage number, option label, or target values."* Paired with a deterministic post-filter (`hintGuard.ts`) that rejects any leak.
> `[FILL IN: optional — paste a real nudge the model produced for a wrong answer.]`

**e) `[FILL IN: one more prompt that genuinely surprised you — e.g. a debugging prompt, a refactor, or how you got the agent to wire the provider-agnostic AI layer.]`**

### 3. Phase decisions

#### Phase 2 — AI features (the three hard rules)

Per the brief, every AI feature had to honor three rules, and the implementation enforces all three:

1. **Grounded in structured state, not raw page text.** `describeInteraction.ts` serializes *typed* learner state (e.g. "Learner set CBR 36, CDR 9, gap 27, trend rapid-growth") into the model context. The model never sees raw HTML/page text.
2. **Anything checkable is verified against the subject's logic.** `verify.ts` is the domain's equivalent of a "math engine": it **recomputes** every skill-check answer deterministically from `dtm.ts` and rejects any question whose AI-claimed answer doesn't match. The worst failure case is a *missing* question, never a wrong one taught as right.
3. **The app must keep teaching with AI off.** AI is strictly additive. Nudges return `null` on failure, the "Explain it back" step is **removed entirely** when AI is off, and Phase 1 already teaches the full DTM with zero AI.

**Backend decision (the real, shipped one).** The notes originally chose *Firebase AI Logic (Gemini)* for its free tier and native JSON-schema output. What actually shipped is a **provider-agnostic AI layer** (`src/lib/ai/provider/`) supporting **firebase / openai / gemini-api / proxy** behind one interface — every feature calls `generateText` / `generateJson`, and only the provider swaps. **For this submission the app runs the OpenAI provider.** **Why the change:** it decouples the product from any single vendor's key availability and quota, and lets me pick the provider with the best question-generation quality for the moment without touching feature code. **As of today I bumped the model from `gpt-4o-mini` to `gpt-4o`, with automatic fallback to `gpt-4o-mini` if `gpt-4o` is unavailable** — the larger model writes sharper exam-style stimuli, and the fallback keeps the feature alive if the bigger model errors or is rate-limited.

**Three AI features shipped:**

- **Wrong-answer nudge** — after a wrong check, a tailored 1–2 sentence hint grounded in the learner's actual attempt + validator outcome, gated by a no-giveaway guard.
- **"Explain it back"** — learner types 1–2 sentences; AI grades against a rubric (0–3, correct if ≥2). Omitted entirely when AI is off; on API failure shows a retry message, never the model answer.
- **End-of-lesson AP-style skill check** — 3 MCQs generated from verifiable templates, with correct answers **recomputed from `dtm.ts`** before display; generation retries up to 3× and drops any question that fails verification.

**Three features deliberately skipped (restraint as design):**

- **End-of-lesson "misconception coach"** — cut for the checkpoint to keep scope tight; the deterministic mastery path already guides next steps. (Revisit candidate.)
- **Free-roaming chatbot tutor** — the brief explicitly warns against it; ungrounded and low-signal.
- **Full LLM-driven path reordering** — deterministic mastery gating already does this honestly; an LLM would add risk, not value.

**Known limitation (documented as a decision, not an oversight).** The skill-check questions are **correct and verified, but the question *writing* isn't yet at full AP-exam rigor** — the prose and distractors aren't sharp enough. This is deliberate triage for the early checkpoint: correctness was the non-negotiable, polish was not. **Plan for the final (Sunday):** (1) the stronger model (already bumped to `gpt-4o`) for sharper stimuli, and (2) **expand the verifiable templates to cover the newer lessons** — L4 (limits of growth / density + Malthus), L6 (migration), and L7 (place-the-country), whose concepts don't all map cleanly onto the current five core templates (`stage-from-rates`, `population-trend`, `pyramid-stage`, `sector-dominant`, `cause-of-death`). Until a concept has a verifiable template, I'd rather ship no question than an unverified one.

#### Phase 3 — Learning-science layer (planned / in progress for Sunday)

The Phase 3 design intent (from `PHASE3-LEARNING-SCIENCE.md`) points AI's content-generation strength directly at the **highest-utility, evidence-based mechanics**:

- **Retrieval practice** over re-reading — frequent low-stakes recall, with prompts **rephrased on each retrieval** so learners reconstruct meaning instead of pattern-matching memorized strings.
- **Spacing** — bring concepts back on a deliberate delay (rule of thumb: a ~10–20% test delay so retrieval still succeeds but isn't trivial), treating learning as **recursive, not linear**.
- **Interleaving** — mix problem types so learners must *choose* the right approach (also guarantees spacing).
- **Mastery + cognitive load** — respect working-memory limits per step, map prerequisites, generate **parallel diagnostic items** and curriculum-aligned distractors at scale.

**Why these and not engagement features:** the notes explicitly flag **engagement and time-on-task as poor indicators of learning**. The whole layer optimizes for durable retention, not in-session ease — and AI is used precisely where authored content can't scale (parallel items, adaptive forms, rephrased prompts), never as a replacement for the learner doing the work.

### 4. Code analysis (AI-generated vs hand-written)

Rough split: **`[FILL IN: e.g. ~80%]` AI-generated, `[FILL IN: e.g. ~20%]` hand-written / hand-directed.** *(Replace with your real estimate — you can sanity-check with `git` line counts.)*

What that split actually looks like in practice:

- **Mostly AI-generated (heavily reviewed):** boilerplate components, the provider layer, the bulk of feature scaffolding, type definitions, normalization/parsing helpers (e.g. the alias-tolerant `normalizeSkillCheckScenario` / `normalizeSkillCheckBatch`).
- **Hand-written or tightly hand-directed (the decisions):** the architecture and content model, the domain math + validators (the source of truth), the **verification/grounding/guard discipline** (`verify.ts`, `hintGuard.ts`, `context.ts`), the choice of which AI features to ship vs refuse, and all of the learning-science reasoning.

The honest framing: **AI wrote most of the lines; I made the load-bearing decisions** about what's verifiable, what's grounded, and what stays additive.

### 5. Key learnings (spiky opinions)

- **The substrate is the product; the AI is a topping.** The single highest-leverage decision was making lessons *typed data* and the domain *pure functions* — before any AI. Everything safe about the AI layer (grounding, recomputation, no-giveaway guards) is only possible because there's a verifiable substrate underneath. Teams that "add AI" to an unstructured app are building on sand.
- **Treat the LLM as an untrusted drafter, never a judge.** The skill check works because the model only *writes the stimulus* — the **truth always comes from `dtm.ts`**, recomputed independently. Never let one model simultaneously reason, decide correctness, *and* phrase feedback. Decoupling the verifier from the generator is the difference between "tutor" and "confident liar."
- **Refusing AI features is a design skill.** Skipping the chatbot tutor and LLM path-reordering made the product *better*, not lazier. The seductive, ungrounded features are exactly the ones to cut.
- **"Correct but not yet sharp" beats "sharp but possibly wrong."** For the checkpoint I shipped verified-but-plain questions rather than fluent ones I couldn't guarantee. In education a confident wrong answer teaches a misconception — the most expensive bug there is.
- **Optimize for retention, distrust engagement.** Engagement and time-on-task are not learning. Designing the AI around retrieval/spacing/interleaving (and *against* engagement theater) is the contrarian-but-correct bet.
- `[FILL IN: one personal spiky take — e.g. something surprising about how the agent behaved, or a belief this project changed for you.]`

---

*Sources grounding this write-up (all in-repo): `prd.md`, `README.md`, `PHASE2-AI-NOTES.md`, `PHASE3-LEARNING-SCIENCE.md`, and the implementation in `src/lib/ai/` (`generate.ts`, `context.ts`, `describeInteraction.ts`, `verify.ts`, `hintGuard.ts`, `provider/`, and `features/wrongAnswerNudge.ts`, `skillCheck.ts`, `explainBack.ts`).*
