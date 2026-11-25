# Hackathon Game Plan

**User:** Anonymous  
**Created:** 11/24/2026 23:16:02  
**Updated:** 11/25/2026 11:40:15  
**Exported:** 11/25/2026 11:46:06  
**Link:** [https://chatgpt.com/g/g-p-6b06ae4b9d208191b7feb2c3f1756d04-ods-terrasync/c/6b060ca1-c414-83e9-b163-715fe2674dc7](https://chatgpt.com/g/g-p-6b06ae4b9d208191b7feb2c3f1756d04-ods-terrasync/c/6b060ca1-c414-83e9-b163-715fe2674dc7)  

## Prompt:
11/24/2026, 11:16:02 PM

Quick one so we were shortlisted for a hackathon and we would have to build terrasynv from scratch though we have our old codename that is private but we will have to create a public repo and then deploy on nobus cloud. So we are looking at refactoring our codename and focus on only southwest regions primarily Osun state, Ogun state, Lagos and Ondo State 

So basically im trying to draft our game plan cos we need to win and i must win. I will upload the handbook for tou to go through so dont miss anything out. Go through it line by line. I have the backend and fronted on separate repo locally I would've zipped them and sent to you so you could go through but that might come in the morning or what do you think. Let's just start from you going through the book first

[Attachment: ODS2026OgunInnovateHackathonGuide_2.pdf]

## Response:
11/24/2026, 11:16:03 PM · gpt-6-2

> **Extracting Hackathon Guide Text**
>
>
> **Extracted hackathon guide text**
>
> 
>
> Worked for 24s

Congratulations on getting shortlisted again\! 😂 I see we are not going there just to participate. We're going there with the intention of taking first place.

I agree with your approach. Tonight, we should study the handbook, understand exactly what the organisers want, identify how to maximise our scores, and establish a game plan for TerraSync. Tomorrow morning, we can look at the previous project's architecture and functionality to inform our planning, subject to the competition rules.

I've gone through all nine pages of the **Ogun Innovate Hackathon 2026 Guide**, including the rules, judging criteria, playbook, deliverables and frequently asked questions.

There is one particularly important rule concerning your existing codebase that we need to be careful about.

# PART 1: Understanding the hackathon handbook

## 1\. Competition overview - Pages 1-2

First-place prize

# ₦2,500,000

Second place

## ₦1,500,000

Third place

## ₦1,000,000

Competing teams

# 50

Competition tracks

# 6

Date

**25 November 2026**

Venue

**Ogun Tech Hub, Kobape, Abeokuta**

The competition has two distinct evaluation stages. We need to prepare to win both.

## 50 teams

Initial competition

## 10 teams

20% qualify for the final

## 3 winners

6% of competing teams

**1 overall winner**

The review team will visit every team twice during development. After development ends, they will score all 50 teams and select the top 10. Those 10 teams will pitch to the judges, whose scores determine the final winners. fileciteturn0file0L45-L93

**Strategic implication\:** We cannot spend the entire day building something impressive and hope to explain everything at the final pitch. We must impress the review team throughout development. Without making the top 10, we will not even get the opportunity to pitch.

## 2\. Competition tracks - Page 3

The six tracks are\:

| Track | Focus |
|--------|--------|
| Edtech | Education and skills development |
| Fintech | Banking, payments and credit |
| Proptech and Real Estate | Property and housing |
| Healthtech and Telemedicine | Healthcare delivery |
| Agritech and Food Security | Farming, food supply chains and food security |
| AI and Machine Learning | AI-powered solutions to African challenges |

TerraSync fits naturally into Agritech and Food Security, although it could also fit into AI and Machine Learning. We must compete under whichever track you selected during registration.

More importantly, the handbook specifically emphasises that the solution should serve people in Ogun State while having the potential to expand beyond it. Local fit matters to the judges. fileciteturn0file0L112-L143

This is why I support narrowing TerraSync's geographical scope, but I would go a little further\:

**Ogun first. Southwest Nigeria next. National expansion later.**

Rather than giving Ogun, Osun, Ondo and Lagos equal attention, we should make Ogun the primary demonstration and pilot location, with the other three states representing our initial expansion coverage.

## 3\. Competition rules - Page 4

This is probably the most important page in the entire handbook.

| Rule | What it means for us |
|--------|--------|
| Start from scratch | All competition code must be written on the day. |
| Build the submitted idea | We can refine TerraSync but must remain consistent with the submitted proposal. |
| New repository | Create it during the opening session and share it with the organisers. |
| Designs and wireframes | We can prepare these tonight. |
| Open-source libraries | Permitted. |
| AI coding tools | Permitted. |
| Nobus Cloud | Mandatory deployment platform. |
| Team size | Teams of two may add one person. Teams of three or more cannot add members. |
| Ownership | We retain ownership of the new product. |
| Prize payment | Paid to the team lead's verified account. |

fileciteturn0file0L157-L188

**Critical disqualification risk**

The handbook explicitly states that bringing previously written code or presenting an earlier project as new work can result in disqualification and withdrawal of any prize.

Page 4, disqualification clause; reinforced by the FAQ on page 9.

fileciteturn0file0L193-L205

### What this means for our existing TerraSync codebase

There is a difference between rebuilding TerraSync and refactoring the existing TerraSync repository.

| Approach | Assessment |
|--------|--------|
| Copying old code into a new public repository | Prohibited |
| Refactoring previously written backend code | Prohibited |
| Reusing existing frontend components | Prohibited |
| Using the existing deployed application | Prohibited |
| Preparing new UI designs tonight | Allowed |
| Planning the system architecture | Reasonable preparation, although not explicitly addressed |
| Using Claude Code or Codex during the event | Allowed |
| Building a fresh implementation of the submitted idea | Allowed |

I would therefore recommend a **clean rebuild rather than a code refactor**\.

We can use our knowledge of the previous TerraSync implementation, understand what worked and what didn't, and make better architectural decisions. However, we should not feed the old source code into a coding agent to reproduce or refactor it for the competition.

Also, the handbook requires a new repository but does not explicitly specify that it must be public. If you received that instruction separately, we should follow it.

## 4\. Judging criteria - Page 5

This is what we should build our entire strategy around. Every feature, technical decision and presentation slide should contribute to at least one of these criteria.

---

**Total**  **100%**

Both the table review and the final stage pitch use these same five criteria. fileciteturn0file0L224-L276

### 4.1. Live product - 30 marks

The judges want a working product built during the event and deployed on Nobus Cloud.

For TerraSync, we need\:

- A functional, accessible frontend.
- A working backend with real processing.
- At least one complete end-to-end farmer journey.
- Successful Nobus Cloud deployment.
- Proper error handling.
- A responsive mobile interface.
- A reliable live demonstration.

We should deploy early, even if the initial deployment contains only a basic working application. We can progressively update it throughout the day.

### 4.2. Understanding of the problem - 20 marks

The judges expect a clearly defined problem supported by evidence or real user insights.

This means saying that farmers face challenges because of climate change, pests and food insecurity is not enough.

We need to research\:

- Ogun State's agricultural landscape.
- Major crops grown across our four target states.
- Crop-specific challenges affecting farmers.
- Access to agricultural extension services.
- Weather-related agricultural risks.
- Existing agricultural solutions and their limitations.
- Actual farmer experiences, where available.

Every important statistic we use should have a credible source.

This is something we can work on tonight without writing any competition code.

### 4.3. Originality and local fit - 20 marks

This is where TerraSync needs to distinguish itself from another generic AI farming chatbot.

I want us to explore features such as location-specific recommendations, crop-specific intelligence, weather-aware farming decisions, Yoruba language accessibility and practical recommendations suited to local farming conditions.

We don't necessarily need to implement all of these. We need to select the ones that make TerraSync genuinely useful in Ogun State.

**The AI itself should not be our entire selling point. What the AI enables farmers to do better should be.**

### 4.4. Impact - 15 marks

The judges want clear benefits for real users, a realistic adoption plan and a way to sustain the solution.

We need to answer questions like\:

- Who exactly uses TerraSync?
- How will we reach farmers?
- Why would they continue using it?
- How would agricultural cooperatives and extension officers benefit?
- How will we measure improvements?
- Who pays for the service?
- How will we sustain infrastructure and AI inference costs?

We should not invent impact figures or claim partnerships that do not exist. We can present measurable pilot targets and a realistic adoption strategy instead.

### 4.5. Presentation - 15 marks

The team must communicate its technical choices, limitations and next steps clearly.

We need to explain why we chose particular AI models, data sources, technologies, target crops and geographical regions.

Notice something important: **70% of the available marks come from criteria other than the live product.**

That means a technically sophisticated application alone is not enough to win. Research, local relevance, impact and communication deserve significant attention.

---

## 5\. Prizes, infrastructure and benefits - Page 6

| Benefit | Eligibility |
|--------|--------|
| ₦5 million total prize pool | Top three teams |
| Nobus Cloud credits | Every team member |
| Cloud training and certificate | Participants |
| Free .com.ng domain | Every team |
| Workspace access | Winning teams |
| Mentorship | Also offered |

Every team member is expected to register for a Nobus Cloud account before the event. The guide says credits will start being distributed two to three days after registration opens. fileciteturn0file0L295-L333

**Registration\:** [nobus.io](https://nobus.io/registration?utm_source=chatgpt.com)

We need to understand the Nobus deployment process before we start building tomorrow. I would not want us to finish a beautiful application and then spend the final hour struggling with cloud configuration.

The handbook does not specify the credit amount, available instance specifications, GPU availability or managed database services. We need to confirm those before finalising the architecture.

---

## 6\. Order of events - Page 7

The handbook does not provide exact starting times, progress check times or the total number of development hours. These will be communicated separately. fileciteturn0file0L352-L410

Therefore, our development plan should be milestone-based rather than dependent on an assumed six-hour or eight-hour hackathon.

The organisers will provide power extensions at every table and morning refreshments. They are arranging internet connectivity but explicitly advise participants to bring their own mobile data.

---

## 7\. Official development playbook - Page 8

Interestingly, the organisers have practically given us a blueprint for how to approach the competition.

First 30 minutes

**Planning**
Agree on the core demo journey and assign responsibilities.

---

Before progress check 1

**Build the core**
Get the primary workflow working from beginning to end.

---

Before progress check 2

**Integration and refinement**
Demonstrate progress, connect components and improve reliability.

---

After progress check 2

**Feature freeze**
Stop adding features. Test, deploy and prepare the final demonstration.

The organisers also recommend frequent commits, early cloud deployment, clear responsibilities and at least two pitch rehearsals. They discourage unnecessary features, late pitch preparation, reliance on a single laptop or internet connection, and bringing existing code. fileciteturn0file0L429-L475

### Official five-minute pitch structure

1

2

Live demo

4

---

**Judges' questions**  5 minutes

Half of our pitch time is allocated to the live demonstration under the suggested playbook. We should build TerraSync around a compelling two-and-a-half-minute user journey.

---

## 8\. Pre-event requirements and FAQs - Page 9

**Preparation checklist**  / completed

The FAQ reiterates that earlier prototypes cannot be reused, participants cannot belong to multiple teams, repository activity will be monitored throughout the day, and only the top 10 teams will pitch on stage. fileciteturn0file0L494-L534

Official contact: hello\@ogundigitalsummit.com

---

# PART 2: Our preliminary TerraSync game plan

Everything from this point is my proposed strategy, rather than a requirement stated by the organisers.

## 9\. Geographical positioning

| State | Proposed priority |
|--------|--------|
| Ogun | Primary pilot and live demonstration |
| Ondo | Initial regional coverage |
| Osun | Initial regional coverage |
| Lagos | Initial regional coverage |

I would position TerraSync as a **location-aware agricultural intelligence platform for Southwest Nigeria, starting with Ogun State.**

The four states are our initial coverage area, not the entirety of Southwest Nigeria.

We should also consider localisation at the LGA level rather than just the state level, provided we can obtain sufficiently reliable data.

## 10\. What TerraSync could become

Instead of trying to build an agricultural super-app in one day, I would explore a focused decision-support system.

**Farmer**

Selects location, crop and farming challenge

**Weather intelligence**

Local conditions

**Crop knowledge**

Regional guidance

**Crop health**

Image-based assessment

**Local context**

Location-specific data

**TerraSync intelligence engine**

Combines relevant information into actionable guidance

**Personalised farmer action plan**

What to do, when to do it, why it matters and when to seek expert assistance

This is a preliminary product concept. We haven't yet established which features are feasible, what datasets are available or what was included in your original submission.

## 11\. Feature prioritisation

| Proposed feature | Priority |
|--------|--------|
| Location and crop selection | P0 |
| Personalised farming recommendations | P0 |
| Weather-aware recommendations | P0 |
| Mobile-friendly farmer interface | P0 |
| Nobus Cloud deployment | P0 |
| Crop disease image assessment | P1 |
| Yoruba language support | P1 |
| Agricultural knowledge retrieval with sources | P1 |
| Voice interaction | P2 |
| Farm history and analytics | P2 |
| Marketplace | P3 |
| Complex administrative dashboard | P3 |

P0 means essential, P1 means high-value enhancement, P2 means optional, and P3 means defer unless there is a compelling reason.

These priorities are provisional. I want us to evaluate each feature against its development time, reliability, originality, local relevance and contribution to the judging criteria.

## 12\. Proposed technical architecture

I remember that the previous TerraSync MVP used React/Vite, Django REST and PostgreSQL. We don't necessarily need to change technologies simply because we're rebuilding.

**React + Vite**

Farmer-facing web application

**Backend API**

Django REST or FastAPI

**AI services**

Inference and recommendations

**External data**

Weather and agriculture

**Knowledge base**

Regional agricultural guidance

**Database**

PostgreSQL or simpler MVP storage

---

**Nobus Cloud**

Application hosting and deployment

I would also consider a fresh monorepo containing separate frontend and backend directories. This could simplify repository monitoring, integration and deployment.

We can still keep the frontend and backend architecturally independent without maintaining two separate Git repositories.

We should confirm this during the opening briefing.

## 13\. Our internal scoring target

We can use this scorecard to evaluate ourselves before the review team arrives.

Interactive TerraSync internal scorecard

# /100

Self-assessment target

[Reset to target]

The initial 92/100 target is an internal goal I have proposed, not an official qualification threshold or a prediction of our results.

---

# PART 3: How we should prepare

## 14\. What we should work on tonight

Since the hackathon is tomorrow, I would concentrate on preparation that does not involve writing competition code.

| Task | Priority |
|--------|--------|
| Review the original hackathon submission | Critical |
| Research Ogun State agriculture | Critical |
| Identify credible agricultural data sources | Critical |
| Study Nobus Cloud deployment | Critical |
| Decide the core farmer journey | Critical |
| Prepare UI designs and wireframes | High |
| Define team responsibilities | High |
| Plan architecture and integrations | High |
| Research competing agricultural platforms | High |
| Develop the pitch narrative | High |
| Prepare potential judges' questions | High |

## 15\. About uploading the old repositories tomorrow

You don't need to stress yourself zipping everything tonight.

Given the handbook's strict rules, I would prefer that we first work with the original product description, feature list, screenshots and architecture documentation.

If you upload the old repositories tomorrow, we should use them only for a retrospective assessment of the previous product, not to generate a disguised refactor or reuse its implementation. If there is any uncertainty about whether that is permitted, we should ask the organisers.

For the new build, we can create a completely fresh implementation using the permitted AI coding tools.

## 16\. Our overall preparation roadmap

## 17\. What I need from you next

Before we go deep into the research and finalise the game plan, I need four things\:

1. **Your original hackathon submission\:** Exactly what you submitted about TerraSync that got you shortlisted.
2. **Your registered track\:** Agritech and Food Security or AI and Machine Learning?
3. **Your team composition\:** Is it still Team Zenith with you, Feranmi and Adejire? Who will handle what?
4. **Any additional organisers' instructions\:** Especially the actual development duration, Nobus Cloud credits and public repository requirements.

I have not yet inspected the old codebase, verified agricultural datasets or researched Nobus Cloud's technical capabilities. Consequently, the architecture and feature recommendations above are not final.

But one thing is clear from this handbook: **we should not aim to build the application with the most features. We should aim to build the most convincing, locally relevant, functional solution in the room.**

Let's approach this as a competition we are deliberately engineering to win, not just another software development project. 🏆

## Prompt:
11/25/2026, 6:47:54 AM

1 Just general details of terrasync
Agritech and food...
Team Zenith

## Response:
11/25/2026, 6:47:57 AM · gpt-6-2

> **Searched 3 websites**
>
> 
>
> Worked for a couple of seconds

Perfect. So we have three things established\:

| Item | Confirmed details |
|--------|--------|
| Project | TerraSync |
| Competition track | Agritech and Food Security |
| Team | Zenith |
| Primary market | Ogun State |
| Additional coverage | Ondo, Osun and Lagos |
| Competition objective | First place - ₦2.5 million |

Since you submitted a general description of TerraSync rather than a rigid feature specification, we may have some flexibility to refine the product while maintaining its original purpose.

Now, instead of spending time reinventing TerraSync's entire concept, I suggest we focus on four workstreams: **product, agricultural research, engineering and deployment, and pitch strategy.**

## Proposed division of responsibilities

Assuming Team Zenith still consists of you, Feranmi and Adejire, I would suggest the following allocation, subject to everyone's strengths.

| Responsibility | Team member |
|--------|--------|
| AI, agricultural intelligence, data integration and backend | You |
| Frontend, UI/UX and API integration | Feranmi |
| Cloud deployment, infrastructure, testing and integration | Adejire |
| Product decisions and pitch preparation | Everyone |

Nobody should wait until another person finishes before starting their own work. Agree on API contracts early and develop in parallel.

## Deployment decision

I've checked the official Nobus Cloud documentation. It supports Linux virtual machines, SSH access, floating IPs, security groups, container services and managed PostgreSQL. \[[Nobus](https://nobus.io/documentation?utm_source=chatgpt.com); [Documentation](https://nobus.io/documentation/fcs?utm_source=chatgpt.com)\]

For a one-day hackathon, I would avoid Kubernetes and unnecessary infrastructure complexity.

**Farmer's mobile browser**

**Nobus Cloud Linux VM**

Nginx reverse proxy

**React frontend**

**Python backend**

PostgreSQL database

External agricultural, weather and AI services

A single VM with Docker Compose would be my preliminary deployment choice, subject to the available credits and organiser instructions.

Official reference: [nobus.io](https://nobus.io/documentation/fcs?utm_source=chatgpt.com)\.

## What I want us to investigate next

We should conduct detailed research covering\:

| Research area | Expected outcome |
|--------|--------|
| Ogun agricultural challenges | Evidence-backed problem statement |
| Four-state agricultural profiles | Priority crops and regional challenges |
| Agricultural datasets | Reliable, accessible data sources |
| Weather and climate APIs | Location-specific farming intelligence |
| Soil and satellite data | Feasibility of precision agriculture |
| Crop disease models | Supported local crops and limitations |
| Existing agritech platforms | TerraSync's competitive advantage |
| Yoruba accessibility | Practical multilingual support |
| Business model | Sustainable adoption strategy |
| Government agricultural initiatives | Potential alignment and future partnerships |

## Send me the old repositories

Since it's morning now, you can send the frontend and backend ZIP files if convenient, or preferably the existing architecture documentation, screenshots and feature descriptions.

I want to understand what TerraSync already does before proposing features that might be redundant or inconsistent with your original vision. Any source-code review should be retrospective only; the competition implementation must be fresh.

We will then establish\:

- **What to retain conceptually.**
- **What to remove.**
- **What to improve.**
- **What to introduce specifically for Ogun State.**
- **What is realistically achievable today.**
- **What will make the judges remember TerraSync.**

I haven't confirmed the team's individual responsibilities, available building hours or cloud credits yet, so those parts remain provisional.

**Our goal is not simply TerraSync 2.0. It is a competition-optimised TerraSync that demonstrates real agricultural intelligence, strong local relevance and a credible path to adoption.**

## Prompt:
11/25/2026, 8:02:53 AM

[Attachment: terrasync-frontend-main.zip]

[Attachment: terrasync-backend-main.zip]

## Response:
11/25/2026, 8:02:56 AM · gpt-6-2

> **Listing ZIP Archive Contents**
>
>
> **Reading TerraSync Documentation Files**
>
>
> **Reading TerraSync Documentation Files**
>
> 
>
> Worked for 20s

I've successfully opened both TerraSync repositories. And from the initial inspection, TerraSync is considerably more developed than the basic agricultural AI assistant we were discussing earlier.

The existing product already has a much stronger identity: **a mobile-first agricultural decision-support platform that helps smallholder farmers understand what needs their attention today, why it matters and what they should do next.**

I think that should remain central to our hackathon strategy.

I'm reviewing the existing repositories as a retrospective product assessment, not as source code to transplant into the competition repository, given the handbook's restrictions.

# 1\. Existing TerraSync codebase

**Frontend**

# 326

ZIP archive entries, including directories

React · TypeScript · Vite · Tailwind CSS · PWA

**Backend**

# 169

ZIP archive entries, including directories

Django REST · PostgreSQL · Gemini · OpenWeather

Both repositories contain extensive documentation, automated tests and feature-specific modules.

The backend README reports 337 passing tests from its previous documented test run. I have not independently rerun those tests.

## Existing product capabilities

| Feature | Existing implementation |
|--------|--------|
| Authentication | Registration, JWT, email verification, password reset |
| Farm setup | Location, soil and crop information |
| Crop management | Six supported crops and lifecycle tracking |
| Daily Insights | Deterministic agronomic recommendations |
| AI Assistant | Gemini-powered text and image interaction |
| Crop health screening | Image-based preliminary assessment |
| Weather | OpenWeather integration |
| Farm tasks | Task tracking and planting reminders |
| Crop advisory | Crop-specific educational content |
| Pest management | Pest and disease information |
| Multilingual support | English, Yoruba, Hausa, Igbo and Pidgin |
| PWA | Mobile-first progressive web application |
| Analytics | Event tracking |
| Privacy | AI consent, image handling and account controls |
| Push notifications | Subscription storage, but actual sending is not implemented |

Sources: backend `README.md`, frontend `docs/LOCALIZATION.md`, and the feature modules in both uploaded repositories.

# 2\. What makes the existing TerraSync different

After reading the product documentation, I think the strongest aspect of TerraSync is its **Daily Insights engine**, rather than its AI chatbot.

The existing architecture deliberately separates deterministic agricultural intelligence from generative AI.

**Farmer context**

Location, soil, crops, planting dates, growth stages and tasks

**Agronomic rules engine**

---

Crop lifecycle assessment

Task prioritisation

Inspection recommendations

Deterministic decisions

**Environmental context**

---

Current weather

Weather forecasts

Farm location

Environmental conditions

**Daily Insights**
What needs my attention today?

**Context-aware AI Assistant**

Explains recommendations, answers questions and screens crop images

**Farmer takes action**

Inspect crops, create tasks and manage farm activities

The diagram summarises the existing product concept. Weather information is currently separate from the deterministic Daily Insights engine, although the AI Assistant receives weather context.

This separation is important because TerraSync is not simply asking an LLM to generate random farming advice. Its proactive insights come from defined rules, while the assistant provides contextual explanations.

Source: backend `docs/INSIGHTS_ENGINE.md`, `docs/PILOT_READINESS.md` and frontend `docs/DAILY_INSIGHTS.md`\.

**This is the product identity I would preserve in the new build.**

# 3\. Existing supported crops

The previous version supports six crops.

[![British American Tobacco Nigeria Foundation invests N4bn, empowers 1,000 Ogun maize farmers - Businessday NG](https://images.openai.com/static-rsc-4/vHpXOmn_PGjpeZ0_khaX8ofDe2FGf4KMi7Jq4jSm_7kbTghydQxJ6ACIHOq3msiW1ASIUq0JEft6rcFFRRM6NqpUPKvS4Y7bBqlTqay4o055gBgW27SVxz91X8K8xUMRJow3_df9iCmxfX_99KZk8Wi6M3bCaw_V1kjU1u-Bd9QMI5-q4DPOReKEWO6b1iCc?purpose=fullsize)](https://businessday.ng/news/article/british-american-tobacco-nigeria-foundation-invests-n4bn-empowers-1000-ogun-maize-farmers/)

**Maize**

[![Harvested #cassava roots from the Project's trial site in Abeokuta, Ogun State. #Nigeria. | Female farmer, Cassava, Ogun state](https://images.openai.com/static-rsc-4/Re_h3ggkCipPV23aWfNwo3SYEpQc1P-VqQYNNsx5gGuuYyi_aN9m8XTgEjSrSDiUic6i7ZJr2IXjZJ1tV5roi2b8J-88LvkFhniw3o7obhkxPJZwHfJCc_WId3SuIO_fAqognvkbCM__h7_MOa6lIf8B2dJXHLVoOp9Q1OfEjwdtmgcHkIXnP1GCDihGTNu1?purpose=fullsize)](https://www.pinterest.com/pin/harvested-cassava-roots-from-the-projects-trial-site-in-abeokuta-ogun-state-nigeria--523402787926167429/)

**Cassava**

[![What Crops Will You Grow in Year 2025? A Guide for Nigerian Farmers - Veggie Grow](https://images.openai.com/static-rsc-4/cXXArALsoXnkP80hL-mcLcMpLmRwrjeaW3Z7V1GEKi3BVrWvpcC6brxD9X_W5d0_lXb3QVWMMBlBjp4ENNrq0kns8KW44FuHV-gRJ0vGoz65jVpOr0Iogp-d2cUCfIYO6WvdnhH284Y-NrzMkT5ps6SV2u4vXuRr19s14P28Y7LKURi9yFQgEiEOqzWgIHDY?purpose=fullsize)](https://veggiegrow.ng/what-crops-will-you-grow-in-year-2025-a-guide-for-nigerian-farmers/)

**Tomato**

[![Crops Overview](https://images.openai.com/static-rsc-4/Iz-bXCMH1sZIvwAa8UhDZuBFtlCrmtore-HvtVENLSUkIpX33e7kQ0piJEhEf-ui1VdUXFhoLEas0UrH4W8h3zJhVxJVkkseQ1NO58XvtyxX7M8_D0-jthL_HIC2JWG5ptR5cNXwgTo4trgB5rTY7r5t67TZrx7C3XZjYmq82-S7i1v5u0EgsuS1PGM8hU7z?purpose=fullsize)](https://www.icrisat.org/crops/groundnut/overview)

**Groundnut**

[![How Profitable Pepper Farming Is In Nigeria - Agriculture - Nigeria](https://images.openai.com/static-rsc-4/pn3UwB5E3bIiFjOmeD8HqUH6EUBAqsOpD42OejQ6cm-2mSWs7mjXPJTylW6qgyVmgKjkEpLfqRdx1W7iKTU1PeU7TX7Se97wTfzO5xTIztx7YzaKPJScaGmiMvGqm_fcffjmO6vJyfxbu4hs5SheLgWAB3q7jbBCqEY3B09jCjRJWHw5uEEbuXURETUGEZp3?purpose=fullsize)](https://www.nairaland.com/7956959/how-profitable-pepper-farming-nigeria)

**Pepper**

[![My Last Harvest From My Yam Farm. Govt, We Need Loan In The South - Agriculture - Nigeria](https://images.openai.com/static-rsc-4/u3jmdvHFo5mswY98aHmYKO8G7e_06FPeagKd8sM9sGeyB6x8Thde-12SZ6zPrF67MgBQXDexoemqoq39XTgNXUizGt5OTcphDCwneL9UZ9b6DfCuNatoQpbSIGRWbbP9mzs4tgH_qgmuWCo3_allsGA29faGVSfhUtDcLzhlweWHNv-9LkSwANDnyVWh97YA?purpose=fullsize)](https://www.nairaland.com/6438557/last-harvest-yam-farm-govt)

**Yam**

All six have internally reviewed agronomic rules in the previous implementation. However, the documentation explicitly states that they have not received external professional agronomic approval.

For the hackathon, my provisional recommendation would be to prioritise cassava, maize, tomato and pepper, subject to our research into the agricultural profiles of the four states.

We should not select crops simply because the old version supports them.

# 4\. Gaps identified in the previous TerraSync

This is particularly interesting because the existing documentation is quite transparent about its limitations.

| Gap | Existing status | Hackathon opportunity |
|--------|--------|--------|
| Regional agricultural intelligence | Not established as a four-state knowledge system | High |
| Source-backed AI responses | Assistant citations are empty | Very high |
| Agronomic validation | Internal review only | High |
| Weather-driven daily decisions | Weather tips separate from Daily Insights | Very high |
| Offline functionality | Static assets cached, no offline write synchronisation | Medium |
| Push notifications | Subscription storage only | Low |
| Yoruba translations | Available but not native-speaker reviewed | High |
| Satellite intelligence | Not implemented | Low |
| IoT integration | Not implemented | Low |
| Multiple farm plots | Not implemented | Low |
| Expert verification workflow | Not implemented | Medium |

Sources: backend `docs/PILOT_READINESS.md`, `docs/AGRONOMIC_VALIDATION_BACKLOG.md`, frontend `docs/LOCALIZATION.md`\.

## The three improvements I would investigate first

### A. Regional intelligence

Make TerraSync understand the farmer's geographical context rather than simply collecting a location for weather information.

This could include state, LGA, crop suitability, seasonal conditions, common crop risks and locally relevant agricultural guidance.

### B. Evidence-backed recommendations

The previous assistant does not implement retrieval or source citations.

This is an opportunity to make the new TerraSync more trustworthy by grounding recommendations in credible agricultural resources, with visible references and clear uncertainty boundaries.

### C. Weather-aware Daily Insights

The previous version has weather-aware AI conversations, but weather tips are separate from its proactive rules engine.

A stronger product could combine crop growth stage, farm context and forecast information to help farmers make timely decisions.

For example, instead of simply displaying a rain forecast, TerraSync could explain which planned farm activities might need reconsideration because of that forecast, where supported by reliable agronomic guidance.

---

# 5\. What we should build for the hackathon

I would not attempt to reproduce the entire existing application in one day.

| Module | Priority | Decision |
|--------|--------|--------|
| Farm profile and location | P0 | Essential |
| Crop lifecycle tracking | P0 | Essential |
| Daily Insights | P0 | Core differentiator |
| Local weather intelligence | P0 | Essential |
| Regional agricultural knowledge | P0 | Core differentiator |
| AI Assistant | P0 | Essential |
| Source-backed recommendations | P0 | Trust and credibility |
| Crop image screening | P1 | Strong demonstration feature |
| English and Yoruba | P1 | Local accessibility |
| Farm tasks | P1 | Connect advice to action |
| Full authentication lifecycle | P2 | Simplify for MVP |
| Chat history | P2 | Optional |
| PWA installation | P2 | Optional |
| Profile pictures | P3 | Defer |
| Email verification | P3 | Defer |
| Push notifications | P3 | Defer |
| Extensive analytics | P3 | Defer |
| Marketplace | P3 | Out of scope |

These are proposed priorities, not confirmed requirements.

# 6\. The new TerraSync positioning

I would work with this product direction\:

> TerraSync is a location-aware agricultural decision-support platform that helps smallholder farmers in Southwest Nigeria make timely, informed farming decisions using crop-specific knowledge, local weather conditions and context-aware artificial intelligence.

**Starting in Ogun State, expanding across Ondo, Osun and Lagos.**

Our selling point should not be the number of AI features we have. It should be that TerraSync helps farmers answer three questions every day\:

**What needs my attention today?**

Identify important farm activities and potential risks.

---

**Why does it matter?**

Understand the reasoning behind recommendations.

---

**What should I do next?**

Receive practical and context-specific guidance.

# 7\. Proposed live demonstration

We need one coherent story rather than jumping between unrelated features.

Consider a hypothetical cassava farmer in Odeda LGA, Ogun State.

The judges should be able to see the connection between the farmer's problem, the technology and the resulting action.

# 8\. Important findings and limitations

There are a few things we must not overlook.

- The backend README describes Railway deployment as unverified, while `PILOT_READINESS.md` describes it as live. These documents conflict, and I have not independently verified the deployment.
- The existing agricultural rules have not been externally validated.
- The existing non-English translations have not been native-speaker reviewed.
- Image-based screening is not a confirmed disease diagnosis.
- The old application does not have source-grounded retrieval.
- I have inspected the archive structures and selected technical documentation, but have not yet completed a line-by-line source-code audit or executed either application.

Also, because of the competition rules, the existing repositories must remain separate from the new competition implementation.

# 9\. Where we go from here

**My recommendation is that we move straight into agricultural research now.**

We need to understand the four states at the LGA, crop, climate, soil, pest and disease levels. We also need to identify reliable agricultural publications, datasets and APIs that we can use to support the new product.

That research should determine our final feature scope, rather than us deciding on features first and looking for evidence to justify them afterwards.

We already have a strong product concept. Now we need to make it unmistakably relevant to Ogun State.

## Prompt:
11/25/2026, 8:10:48 AM

I need detailed prompts so I can give different ai chats so we can then put them together

## Response:
11/25/2026, 8:10:50 AM · gpt-6-2

Yes\! This is exactly how I would approach it given our limited time. Instead of conducting all the research sequentially in one conversation, we can create specialised AI research agents, run them in parallel and consolidate their findings into one TerraSync master game plan.

I would divide the work into **10 independent research chats and one final synthesis chat.** You can use ChatGPT, Claude, Gemini or Perplexity, preferably with web research enabled.

Each chat should have a clearly defined responsibility so we don't end up with ten versions of the same generic agricultural research.

# 1\. Research distribution

| Chat | Assignment | Priority |
|--------|--------|--------|
| 01 | Ogun State agricultural intelligence | Critical |
| 02 | Ondo State agricultural intelligence | High |
| 03 | Osun State agricultural intelligence | High |
| 04 | Lagos State agricultural intelligence | High |
| 05 | Agricultural datasets, APIs and knowledge sources | Critical |
| 06 | Agritech competitors and market opportunities | High |
| 07 | AI architecture and agricultural intelligence engine | Critical |
| 08 | Nobus Cloud and deployment strategy | Critical |
| 09 | Farmer experience, accessibility and product design | High |
| 10 | Business model, impact and winning pitch | Critical |
| 11 | Master synthesis and execution plan | Final stage |

Run chats 01-10 simultaneously. Chat 11 should receive their completed reports.

# 2\. Common context for every AI chat

Copy this context into each conversation before pasting its individual assignment. You can also attach the hackathon handbook.

**standard: **

## PROJECT CONTEXT: TERRASYNC - OGUN INNOVATE HACKATHON 2026

You are a specialised research and strategy agent supporting Team Zenith in preparing TerraSync for the Ogun Innovate Hackathon 2026.

Our objective is to develop a highly competitive, technically functional, locally relevant agricultural technology solution capable of winning first place.

### Competition context

- Competition: Ogun Innovate Hackathon 2026
- Date: 25 November 2026
- Venue: Ogun Tech Hub, Abeokuta, Nigeria
- Team: Zenith
- Track: Agritech and Food Security
- Competing teams: 50
- Finalists: 10
- First-place prize: ₦2,500,000
- Development duration: One day, exact building hours not yet confirmed
- Mandatory deployment platform: Nobus Cloud

### Judging criteria

- Live working product deployed on Nobus Cloud: 30%
- Understanding of the problem: 20%
- Originality and local fit: 20%
- Impact and sustainability: 15%
- Presentation: 15%

There will be two progress checks, a final table review and, for the top 10 teams, a five-minute pitch followed by five minutes of questions.

### Competition constraints

The competition requires a completely fresh implementation built during the event in a new repository.

Existing proprietary source code must not be copied, refactored, transferred or presented as new work. Open-source libraries and AI tools are permitted. Designs and wireframes may be prepared beforehand.

Your assignment is research, planning and decision support. Do not generate competition implementation code before the official building period.

### About TerraSync

TerraSync is a mobile-first agricultural decision-support platform designed to help smallholder farmers answer three questions:

1. What needs my attention today?
2. Why does it matter?
3. What should I do next?

The previous product concept includes:

- Farm profiling and location information
- Crop management and growth-stage tracking
- Deterministic Daily Insights
- Weather information
- Context-aware AI agricultural assistant
- Preliminary crop health image screening
- Farm tasks and reminders
- Multilingual accessibility
- Crop-specific agricultural guidance

The previous technology stack included React, Vite, TypeScript, Django REST Framework, PostgreSQL, Gemini and OpenWeather.

The new implementation is not required to retain every previous feature or technology.

### Geographic scope

Primary focus: Ogun State.

Additional initial coverage:

- Ondo State
- Osun State
- Lagos State

We are deliberately narrowing the solution to these four states to improve local relevance, agricultural accuracy and implementation feasibility.

### Potential improvements

- LGA-level agricultural intelligence
- Location-specific crop recommendations
- Weather-aware Daily Insights
- Evidence-backed agricultural recommendations
- Source-grounded AI responses
- English and Yoruba accessibility
- Low-bandwidth mobile experience
- Responsible crop health screening
- Practical farmer action plans

These are proposed capabilities, not fixed requirements.

### Research standards

Conduct detailed, evidence-based research.

Prioritise official government publications, peer-reviewed research, reputable agricultural institutions, technical documentation and credible development organisations.

For every significant factual claim:

- Provide the original source URL.
- Identify the publishing organisation.
- Include publication date where available.
- Distinguish verified facts from assumptions.
- State geographical and temporal limitations.
- Do not fabricate statistics, datasets, citations, partnerships or API capabilities.
- Explicitly identify unavailable or unverifiable information.

Do not give generic agricultural advice that cannot be connected to the target region.

### Output requirements

Your report will be combined with reports from other specialised research agents.

Structure your response using:

1. Executive summary
2. Detailed findings
3. Supporting evidence and sources
4. Implications for TerraSync
5. Prioritised recommendations
6. One-day hackathon feasibility
7. Risks, limitations and unresolved questions
8. Actionable implementation requirements
9. Final decision summary

Classify recommendations as:

- P0: Essential for the hackathon
- P1: High-value enhancement
- P2: Optional
- P3: Post-hackathon development

Prioritise practical decisions over lengthy theoretical discussions.

Your specific assignment follows.

---

# 3\. Individual research prompts

## Chat 01 - Ogun State agricultural intelligence

This is arguably our most important research chat. Ogun is where we need to demonstrate the strongest local relevance.

**standard: **

# RESEARCH ASSIGNMENT 01: OGUN STATE AGRICULTURAL INTELLIGENCE

Act as a senior agricultural researcher, Nigerian agricultural economist, agronomist and geospatial intelligence specialist.

Conduct comprehensive research into Ogun State's agricultural ecosystem to inform TerraSync's primary pilot and hackathon demonstration.

## A. Agricultural landscape

Investigate:

- Agriculture's contribution to Ogun State's economy.
- Agricultural employment and smallholder farming.
- Major food and cash crops.
- Agricultural production volumes where reliable data exists.
- Important agricultural communities and farming clusters.
- Subsistence versus commercial farming.
- Seasonal agricultural activities.
- Government agricultural priorities.
- Food security challenges.

## B. LGA-level agricultural profiling

Investigate all 20 local government areas of Ogun State.

For each LGA, identify where evidence permits:

- Dominant agricultural activities.
- Major crops.
- Agricultural communities.
- Soil and agroecological characteristics.
- Rainfall and temperature patterns.
- Irrigation availability.
- Flooding and drought exposure.
- Important crop pests and diseases.
- Agricultural extension access.
- Market access.
- Relevant agricultural institutions.

Do not invent LGA-specific data where none exists.

Produce a structured LGA comparison table and classify the confidence of each finding.

## C. Crop intelligence

Identify the most relevant crops for TerraSync.

Investigate cassava, maize, tomato, pepper, yam, rice, vegetables, cocoa and other crops that emerge from the research.

For each priority crop, investigate:

- Suitable growing conditions.
- Planting seasons.
- Typical growth stages.
- Expected maturity periods and varietal differences.
- Common farm activities by growth stage.
- Important pests and diseases.
- Environmental risk factors.
- Harvest considerations.
- Common farmer mistakes.
- Safe and practical recommendations.
- Situations requiring professional agronomic assistance.

Identify which information can support deterministic Daily Insights.

## D. Farmer pain points

Investigate evidence relating to:

- Limited access to extension officers.
- Delayed pest and disease identification.
- Weather uncertainty.
- Input costs.
- Post-harvest losses.
- Information accessibility.
- Language barriers.
- Digital literacy.
- Connectivity.
- Agricultural market access.

Rank these problems according to severity, available evidence and suitability for a digital decision-support platform.

## E. Local agricultural ecosystem

Identify relevant organisations and initiatives, including:

- Ogun State Ministry of Agriculture.
- Agricultural development programmes.
- FUNAAB.
- Agricultural research institutions.
- Farmer cooperatives.
- Extension services.
- Government agricultural programmes.
- Relevant NGOs and development organisations.

Distinguish potential future collaborators from confirmed partnerships.

## F. TerraSync pilot recommendation

Recommend:

- The best initial pilot LGA or agricultural community.
- The three to five most suitable crops.
- The strongest evidence-backed problem statement.
- The most compelling farmer persona.
- A realistic live demonstration scenario.
- Agricultural rules suitable for a one-day MVP.
- Data limitations that must be communicated to judges.

## Required deliverables

1. Ogun State agricultural intelligence report.
2. LGA-level agricultural profile table.
3. Prioritised crop selection matrix.
4. Evidence-backed farmer problem matrix.
5. Candidate agronomic rules with sources and applicability conditions.
6. Recommended pilot location.
7. Ten strongest verified facts for the pitch deck.
8. Final P0, P1, P2 and P3 recommendations.

Be extremely thorough, but clearly distinguish what can be implemented today from what requires long-term research or field validation.

## Chat 02 - Ondo State agricultural intelligence

**standard: **

# RESEARCH ASSIGNMENT 02: ONDO STATE AGRICULTURAL INTELLIGENCE

Act as an agricultural researcher and regional agricultural intelligence specialist.

Conduct a comprehensive agricultural assessment of Ondo State as an initial expansion region for TerraSync.

Investigate all 18 LGAs where reliable information exists.

## Research scope

### 1. Agricultural profile

- Major food and cash crops.
- Smallholder farming activities.
- Agricultural production clusters.
- Agroecological zones.
- Forest, coastal and inland agricultural differences.
- Agricultural contribution to livelihoods.
- Government agricultural priorities.

### 2. Crop-specific intelligence

Investigate relevant crops, including cocoa, cassava, maize, yam, vegetables, tomato, pepper and oil palm.

For each priority crop, identify:

- Geographical distribution.
- Growing conditions.
- Planting seasons.
- Growth stages.
- Important farm activities.
- Common pests and diseases.
- Climate-related risks.
- Practical management guidance.
- Credible agricultural knowledge sources.

### 3. LGA-level intelligence

Create a table containing:

- LGA.
- Dominant crops.
- Agricultural characteristics.
- Climate and soil considerations.
- Important agricultural risks.
- Relevant data sources.
- Evidence confidence.

### 4. Farmer challenges

Investigate extension access, weather uncertainty, disease management, agricultural information gaps, input availability, connectivity, language and digital adoption.

### 5. TerraSync localisation

Determine:

- Which agricultural recommendations can be shared with Ogun State.
- Which recommendations require Ondo-specific adaptation.
- Which crops should be supported initially.
- Which crops should be deferred.
- Whether coastal and inland areas require different decision rules.
- Suitable agricultural pilot communities.
- Potential research institutions and extension partners.

### 6. Implementation requirements

Propose a structured regional agricultural knowledge profile that can support:

- State and LGA selection.
- Crop recommendations.
- Growth-stage tracking.
- Weather-aware Daily Insights.
- Evidence-backed AI assistance.
- Agricultural risk notifications.

## Deliverables

- Detailed Ondo agricultural intelligence report.
- LGA profile matrix.
- Prioritised crop list.
- Candidate evidence-backed agronomic rules.
- Comparison with Ogun State.
- Five strongest verified facts for presentation.
- One-day implementation recommendations.
- Data gaps and validation requirements.

Do not recommend supporting every crop merely because it is grown in Ondo State. Prioritise according to farmer value, evidence quality and implementation feasibility.

## Chat 03 - Osun State agricultural intelligence

**standard: **

# RESEARCH ASSIGNMENT 03: OSUN STATE AGRICULTURAL INTELLIGENCE

Act as an agricultural economist, agronomist and regional agricultural researcher.

Research Osun State as one of TerraSync's initial coverage regions.

## Research objectives

### A. Agricultural landscape

Investigate:

- Major farming activities.
- Smallholder agricultural practices.
- Food and cash crops.
- Agricultural production clusters.
- Agroecological characteristics.
- Agricultural livelihoods.
- Government agricultural programmes.
- Food security challenges.

### B. LGA-level agricultural intelligence

Investigate all 30 LGAs where reliable data is available.

Create a structured profile containing:

- LGA.
- Major crops.
- Agricultural communities.
- Soil and climate considerations.
- Important agricultural activities.
- Pest and disease risks.
- Seasonal agricultural patterns.
- Evidence source.
- Confidence level.

### C. Crop knowledge

Identify the most relevant crops for TerraSync, investigating cassava, maize, yam, cocoa, vegetables, pepper, tomato and any other locally important crops.

For priority crops, research:

- Planting windows.
- Growth stages.
- Farm activity schedules.
- Common pests and diseases.
- Weather-related risks.
- Crop management recommendations.
- Harvest considerations.
- Region-specific variations.

### D. Farmer challenges and adoption

Investigate:

- Extension service accessibility.
- Agricultural information gaps.
- Digital literacy.
- Smartphone and internet limitations.
- Yoruba language needs.
- Farm management challenges.
- Market and input constraints.

### E. Regional differentiation

Compare Osun with Ogun and Ondo where evidence permits.

Determine which agricultural intelligence can be reused conceptually across regions and which requires local adaptation.

### F. TerraSync requirements

Recommend:

- Initial supported crops.
- Suitable pilot locations.
- Regional agricultural rules.
- Weather-aware recommendations.
- Relevant agricultural knowledge sources.
- Potential agricultural institutions and future collaborators.
- Features that would genuinely benefit Osun farmers.

## Required deliverables

1. Osun agricultural intelligence report.
2. LGA-level comparison table.
3. Crop prioritisation matrix.
4. Farmer problem and evidence matrix.
5. Candidate agronomic rules.
6. Regional adaptation requirements.
7. Five verified pitch-worthy findings.
8. P0-P3 implementation recommendations.

Explicitly identify where reliable LGA-level agricultural information is unavailable. Do not substitute state-level assumptions for verified local data.

## Chat 04 - Lagos State agricultural intelligence

Lagos should not automatically receive the same product treatment as the other three states. This chat should investigate whether urban and peri-urban agriculture require a different approach.

**standard: **

# RESEARCH ASSIGNMENT 04: LAGOS STATE AGRICULTURAL INTELLIGENCE

Act as a specialist in urban agriculture, peri-urban farming, food security and Nigerian agricultural systems.

Conduct detailed research into Lagos State to determine how TerraSync should support its agricultural users.

Do not assume Lagos has the same agricultural conditions or farmer requirements as Ogun, Ondo and Osun.

## A. Agricultural landscape

Investigate:

- Urban and peri-urban agriculture.
- Smallholder farming.
- Commercial agriculture.
- Vegetable production.
- Food production clusters.
- Land availability.
- Water availability.
- Agricultural livelihoods.
- Lagos State food security priorities.
- Agricultural government programmes.

## B. Geographic profiling

Investigate the 20 constitutionally recognised LGAs and relevant LCDAs where useful and supported by evidence.

Identify agricultural areas, particularly around Epe, Ikorodu, Badagry, Ibeju-Lekki and other locations identified through research.

For relevant areas, investigate:

- Agricultural activities.
- Dominant crops.
- Land and soil characteristics.
- Flooding risks.
- Coastal environmental conditions.
- Irrigation requirements.
- Market proximity.
- Agricultural constraints.

## C. Crop intelligence

Investigate the importance and suitability of:

- Leafy vegetables.
- Tomato.
- Pepper.
- Maize.
- Cassava.
- Other locally significant crops.

Determine which crops are most relevant to TerraSync's initial scope.

Investigate crop growth stages, planting practices, weather risks, pests, diseases and management requirements.

## D. Urban agricultural challenges

Investigate:

- Limited farming space.
- Flooding and drainage.
- Soil and water contamination.
- Salinity where relevant.
- Irrigation.
- Input costs.
- Weather variability.
- Food supply pressures.
- Access to agricultural knowledge.
- Digital adoption.

## E. TerraSync adaptation

Determine whether Lagos farmers need:

- Different farm onboarding options.
- Container or small-plot farming support.
- Irrigation-related recommendations.
- Urban crop-specific knowledge.
- Different weather-risk thresholds.
- Different user experience requirements.

Do not expand into aquaculture, livestock or hydroponics unless evidence demonstrates strong relevance to the submitted TerraSync concept and one-day feasibility.

## Required deliverables

1. Lagos agricultural intelligence report.
2. Agricultural LGA and LCDA profile table.
3. Priority crop matrix.
4. Urban versus rural agricultural requirements.
5. Candidate regional agricultural rules.
6. Five verified pitch-worthy findings.
7. Recommended initial Lagos coverage.
8. Features to include and exclude.
9. P0-P3 recommendations.

Identify which features should remain common across all four states and which should be location-specific.

---

## Chat 05 - Datasets, APIs and agricultural knowledge sources

This is the research chat that should tell us what we can actually integrate into the product, rather than just what sounds impressive.

**standard: **

# RESEARCH ASSIGNMENT 05: AGRICULTURAL DATASETS, APIs AND KNOWLEDGE INFRASTRUCTURE

Act as a senior data scientist, geospatial data engineer, agricultural data researcher and API integration specialist.

Your responsibility is to identify reliable, legally usable and technically accessible data sources for TerraSync.

Target regions: Ogun, Ondo, Osun and Lagos, Nigeria.

The product must be feasible within a one-day hackathon.

## 1. Weather and climate data

Investigate and compare:

- OpenWeather.
- Open-Meteo.
- NASA POWER.
- NiMet.
- CHIRPS.
- Other credible weather and climate providers.

For each source, verify:

- Nigerian geographic coverage.
- Spatial resolution.
- Temporal resolution.
- Current weather availability.
- Forecast availability.
- Historical data availability.
- Available weather variables.
- Authentication requirements.
- Free-tier limits.
- Pricing.
- API endpoints.
- Documentation quality.
- Licensing.
- Reliability limitations.
- Suitability for agricultural recommendations.

Recommend a primary provider and fallback strategy.

Distinguish historical climate data from live forecasts.

## 2. Soil data

Investigate:

- ISRIC SoilGrids.
- FAO soil datasets.
- Africa Soil Information Service resources.
- Nigerian soil surveys.
- Other credible soil databases.

Determine availability of:

- Soil pH.
- Texture.
- Organic carbon.
- Soil moisture where available.
- Nutrient-related variables.
- Drainage characteristics.
- Spatial resolution.
- Uncertainty estimates.

Explain whether these datasets can support plot-level recommendations or only broad regional estimates.

## 3. Administrative and geographic data

Find reliable sources for:

- State boundaries.
- LGA boundaries.
- LGA names and identifiers.
- Geographic coordinates.
- Settlements.
- Agricultural locations.
- Reverse geocoding.

Investigate sources such as geoBoundaries, HDX, OpenStreetMap and official Nigerian geographic datasets.

Recommend the simplest reliable approach to state and LGA selection.

## 4. Crop production and agricultural statistics

Investigate:

- National Bureau of Statistics.
- FAOSTAT.
- Federal Ministry of Agriculture and Food Security.
- State agricultural ministries.
- Agricultural development programmes.
- Agricultural surveys.
- Research publications.

Identify available crop production, farming population, yield and agricultural activity datasets.

Clearly distinguish national, state and LGA-level coverage.

## 5. Agricultural knowledge sources

Find credible crop production guides, extension manuals and agronomic publications from:

- IITA.
- FAO.
- CABI.
- CGIAR.
- National agricultural research institutes.
- FUNAAB.
- IAR&T.
- NIHORT.
- Relevant universities and extension organisations.

For each source, provide:

- Direct URL.
- Document title.
- Publishing organisation.
- Publication date.
- Supported crops.
- Geographic relevance.
- Available format.
- Licensing or usage restrictions.
- Suitability for retrieval-augmented generation.
- Suitability for deterministic agronomic rules.

## 6. Crop disease image datasets and models

Investigate:

- PlantVillage.
- PlantDoc.
- Cassava disease datasets.
- African crop disease datasets.
- Relevant Hugging Face models.
- Peer-reviewed crop disease classifiers.
- Multimodal AI alternatives.

Assess:

- Supported crops and diseases.
- African field-image representation.
- Training versus real-world performance.
- Licensing.
- Model size.
- CPU inference feasibility.
- Deployment complexity.
- Out-of-distribution risks.
- Confidence and uncertainty handling.

Do not assume laboratory dataset accuracy translates to field performance.

## 7. Satellite and remote sensing

Investigate Sentinel-2, Landsat, MODIS, Google Earth Engine and relevant agricultural APIs.

Assess whether any satellite-derived features can realistically be integrated within one day.

Recommend deferring features that require complex processing, unavailable credentials or substantial validation.

## 8. Data integration strategy

Propose a data-source architecture covering:

- Live API data.
- Static reference data.
- Curated agricultural knowledge.
- Source attribution.
- Caching.
- Data freshness.
- API failures.
- Rate limiting.
- Geographic uncertainty.
- Missing data.

## Required deliverables

A. Comprehensive dataset and API inventory.

B. Comparison matrix with:

- Provider.
- Data type.
- Coverage.
- Resolution.
- Access method.
- Cost.
- Licensing.
- Reliability.
- Integration complexity.
- Hackathon suitability.

C. Recommended primary and fallback sources.

D. Direct links to documentation and downloadable resources.

E. Proposed agricultural knowledge metadata schema.

F. P0-P3 data integration priorities.

G. A final shortlist of the smallest set of data sources required to deliver a compelling working TerraSync MVP.

Verify actual accessibility rather than merely listing dataset names. State when credentials, downloads or live endpoint behaviour have not been tested.

---

## Chat 06 - Competitor analysis and differentiation

**standard: **

# RESEARCH ASSIGNMENT 06: AGRITECH COMPETITIVE INTELLIGENCE

Act as an agritech market researcher, product strategist and competitive intelligence analyst.

Conduct a detailed competitive analysis for TerraSync, a location-aware agricultural decision-support platform targeting smallholder farmers in Southwest Nigeria.

## 1. Identify competitors

Research relevant Nigerian, African and international agricultural technology platforms.

Investigate candidates such as:

- Plantix.
- Farmerline.
- Hello Tractor.
- Farmcrowdy.
- ThriveAgric.
- Crop2Cash.
- DigiFarm.
- Relevant agricultural AI assistants.
- Government agricultural advisory platforms.
- Weather-based agricultural advisory services.

Verify that each platform is active and relevant before including it.

Identify additional direct competitors discovered through research.

## 2. Competitor assessment

For each relevant platform, investigate:

- Target users.
- Geographic coverage.
- Core product offering.
- Agricultural advisory capabilities.
- Weather intelligence.
- Crop disease screening.
- Crop lifecycle management.
- Local language support.
- Farm task management.
- Evidence-backed recommendations.
- Offline or low-bandwidth functionality.
- Pricing and business model.
- Distribution strategy.
- Strengths.
- Limitations supported by evidence.

Distinguish direct competitors from adjacent agricultural platforms.

Do not claim a competitor lacks a feature merely because its public documentation does not mention it.

## 3. Market gap analysis

Identify opportunities relating to:

- Localised agricultural intelligence.
- Proactive daily recommendations.
- Weather-aware decision support.
- Crop growth-stage awareness.
- Explainable agricultural recommendations.
- Yoruba accessibility.
- Evidence-backed AI assistance.
- Low-bandwidth usability.
- Integration with agricultural extension services.

Determine which opportunities are genuinely underserved and which are already addressed by existing products.

## 4. TerraSync differentiation

Recommend:

- A clear product category.
- A defensible unique value proposition.
- Three strongest competitive advantages.
- Features that are not meaningful differentiators.
- A realistic competitive positioning strategy.
- A memorable one-sentence product description.

## 5. Hackathon positioning

Evaluate differentiation against the judging criteria.

Identify which capabilities would make judges recognise TerraSync as more than a generic AI chatbot.

Recommend a compelling demonstration that communicates differentiation through working functionality rather than marketing claims.

## Required deliverables

1. Competitor landscape.
2. Verified feature comparison matrix.
3. Direct versus indirect competitor classification.
4. Evidence-backed market gap analysis.
5. TerraSync SWOT analysis.
6. Proposed unique value proposition.
7. Three strongest differentiators.
8. Features to avoid building.
9. Likely competitor-related judges' questions and suggested answers.
10. P0-P3 recommendations.

Avoid unsupported claims that TerraSync is the first, only or best agricultural platform of its kind.

---

## Chat 07 - AI engineering and system architecture

This chat should focus on the actual intelligence behind TerraSync. I would assign it to an AI with strong technical reasoning capabilities.

**standard: **

# RESEARCH ASSIGNMENT 07: TERRASYNC AI AND SYSTEM ARCHITECTURE

Act as a principal AI engineer, machine learning architect, backend engineer and responsible AI specialist.

Design a technically feasible, evidence-grounded architecture for a fresh TerraSync implementation during a one-day hackathon.

Do not reproduce or refactor previously written proprietary code. Produce architecture, specifications and implementation planning only until the official building period.

## 1. Architecture alternatives

Evaluate:

- React/Vite frontend with FastAPI backend.
- React/Vite frontend with Django REST backend.
- A simplified full-stack architecture.
- Monorepo versus separate repositories.
- PostgreSQL versus lightweight MVP persistence.

Compare:

- Development speed.
- Team collaboration.
- Integration complexity.
- Deployment complexity.
- Reliability.
- Maintainability.
- Testing.
- Suitability for Nobus Cloud.

Recommend the simplest architecture that satisfies the core product requirements.

## 2. Deterministic Daily Insights engine

Design a conceptual agricultural decision engine that considers:

- State and LGA.
- Crop.
- Planting date.
- Estimated growth stage.
- Farm activities.
- Soil information where reliable.
- Weather observations.
- Weather forecasts.
- Farmer-reported symptoms.
- Outstanding tasks.

Propose a rule representation covering:

- Rule identifier.
- Applicable crops.
- Applicable regions.
- Growth stages.
- Trigger conditions.
- Priority.
- Recommended action.
- Explanation.
- Supporting source.
- Confidence or evidence status.
- Contraindications.
- Escalation requirements.

Explain how rules should be evaluated, prioritised, deduplicated and presented.

Do not invent agricultural thresholds. Identify where validated agronomic evidence is required.

## 3. Weather-aware agricultural intelligence

Design how forecast data can influence daily recommendations.

Consider:

- Rainfall.
- Temperature.
- Humidity.
- Wind.
- Forecast uncertainty.
- Data freshness.
- Crop-specific sensitivity.
- Planned farm activities.

Distinguish general weather information from validated agricultural recommendations.

Design fallback behaviour when weather data is unavailable.

## 4. Evidence-grounded AI assistant

Compare:

- Curated knowledge retrieval.
- Keyword or BM25 retrieval.
- Embedding-based retrieval.
- Vector databases.
- Direct context injection.
- Hybrid retrieval.

Recommend the most practical approach for a small agricultural knowledge base and one-day development.

Design:

- Document ingestion.
- Metadata.
- Chunking strategy.
- Source selection.
- Context construction.
- Citation generation.
- Answer grounding.
- Hallucination prevention.
- Prompt injection protection.
- Unanswerable question handling.
- Language adaptation.

Compare suitable LLM providers and identify external API dependency risks.

## 5. Crop image screening

Evaluate:

- Dedicated disease classification models.
- Multimodal LLMs.
- Hybrid approaches.
- Deferring image screening.

Consider:

- Supported crops.
- Field-image reliability.
- Image quality.
- Out-of-distribution inputs.
- Confidence limitations.
- Inference costs.
- CPU requirements.
- User safety.

Design a responsible screening workflow that communicates uncertainty and does not claim definitive diagnosis.

Avoid unsupported pesticide or chemical dosage recommendations.

## 6. Multilingual intelligence

Design a practical English and Yoruba experience.

Evaluate:

- Curated UI translations.
- LLM-generated translations.
- Language-specific responses.
- Voice interaction.
- Terminology consistency.
- Native-speaker review requirements.

Recommend what is achievable within one day.

## 7. Backend specifications

Produce conceptual specifications for:

- Farm profile.
- Crop records.
- Daily insights.
- Weather data.
- Agricultural knowledge.
- AI assistant.
- Image screening.
- Tasks.
- User preferences.

Provide proposed API contracts, request and response field definitions, validation requirements and error cases.

Do not generate implementation code before the official build period.

## 8. Reliability and security

Consider:

- API failures.
- Timeouts.
- Caching.
- Secret management.
- Authentication.
- Input validation.
- Image upload restrictions.
- Rate limiting.
- Data privacy.
- Observability.
- Health checks.
- Graceful degradation.

## 9. Testing and evaluation

Define a minimal test strategy for:

- Agricultural rule correctness.
- Growth-stage calculations.
- Weather integration.
- Regional filtering.
- Citation accuracy.
- Unsupported questions.
- Image screening limitations.
- API contracts.
- End-to-end farmer journeys.
- Deployment health.

## 10. Development priorities

Produce:

- P0 essential functionality.
- P1 enhancements.
- P2 optional functionality.
- P3 deferred functionality.
- Dependencies between modules.
- Parallel development opportunities.
- Critical path.
- Recommended feature-freeze criteria.

## Required deliverables

1. Recommended system architecture.
2. Architecture diagram.
3. Component responsibilities.
4. Proposed data model.
5. API contract specifications.
6. AI and retrieval strategy.
7. Deterministic insights design.
8. Failure-handling strategy.
9. Testing and evaluation plan.
10. Milestone-based engineering plan.
11. Technical risks and mitigation.
12. Final architecture decision record.

Optimise for a genuinely working product, not architectural sophistication for its own sake.

---

## Chat 08 - Nobus Cloud and DevOps

We should not leave deployment research until the application is finished. This agent should prepare our infrastructure strategy independently.

**standard: **

# RESEARCH ASSIGNMENT 08: NOBUS CLOUD DEPLOYMENT AND DEVOPS

Act as a senior DevOps engineer, cloud architect and infrastructure reliability specialist.

Research Nobus Cloud and design a practical deployment strategy for TerraSync during the Ogun Innovate Hackathon 2026.

Nobus Cloud deployment is mandatory. Do not recommend hosting the competition application on Vercel, Render, Railway or other cloud platforms.

## 1. Nobus Cloud capabilities

Use current official Nobus documentation to investigate:

- Account registration.
- Credit activation.
- Compute instances.
- Available operating systems.
- Instance sizes.
- CPU and RAM.
- Storage.
- Networking.
- Public and floating IPs.
- Security groups.
- SSH access.
- Managed databases.
- Container services.
- Object storage.
- DNS.
- Domain configuration.
- HTTPS support.
- Monitoring.
- Pricing.

Clearly identify what has been verified and what depends on the hackathon credits or account permissions.

## 2. Deployment architecture comparison

Compare:

- Single Linux VM with Docker Compose.
- Single Linux VM with manually managed services.
- Separate frontend and backend instances.
- Managed container services.
- Managed PostgreSQL versus database on the application VM.

Evaluate cost, complexity, development time, reliability and troubleshooting.

Recommend a primary architecture and a simpler fallback.

## 3. Deployment planning

Provide a detailed conceptual deployment runbook covering:

- Account verification.
- Credit confirmation.
- Instance provisioning.
- SSH configuration.
- Network and firewall setup.
- Dependency installation.
- Repository access.
- Frontend build.
- Backend configuration.
- Database setup.
- Database migrations.
- Reverse proxy configuration.
- Environment variables.
- HTTPS.
- Health checks.
- Public accessibility.
- Deployment verification.

Before the official building period, provide planning and explanations rather than project-specific deployment scripts or configuration code.

## 4. Repository and team workflow

Design a workflow for:

- Fresh repository creation during the opening session.
- Frontend and backend collaboration.
- Branching strategy.
- Pull requests.
- Frequent commits.
- Integration.
- Deployment updates.
- Rollback.
- Protecting secrets.
- Public repository hygiene.

## 5. External services

Assess the implications of using:

- External LLM APIs.
- Weather APIs.
- External agricultural data APIs.

Distinguish hosting the application on Nobus Cloud from consuming external APIs.

Identify any competition-rule ambiguity that requires organiser confirmation.

## 6. Reliability and contingency

Prepare mitigation plans for:

- Cloud credits not appearing.
- SSH failure.
- Instance provisioning failure.
- Port accessibility problems.
- Database connection failures.
- CORS issues.
- Frontend API configuration errors.
- DNS propagation delays.
- HTTPS certificate problems.
- External API outages.
- Internet disruption.
- Deployment failures immediately before review.

## 7. Cost assessment

Estimate resource requirements for:

- A small hackathon demo.
- A limited farmer pilot.
- Future growth.

Use verified Nobus pricing where available.

Do not invent the amount of hackathon credits.

## Required deliverables

1. Verified Nobus Cloud capability report.
2. Recommended deployment architecture.
3. Detailed deployment runbook.
4. Required environment variables and secrets inventory.
5. Repository collaboration strategy.
6. Deployment acceptance checklist.
7. Troubleshooting decision tree.
8. Primary and fallback deployment plans.
9. Cost and resource estimates.
10. Questions to ask the Nobus trainers.

Prioritise deploying a minimal working application early, then updating it as features are completed.

---

## Chat 09 - Product design and farmer experience

**standard: **

# RESEARCH ASSIGNMENT 09: TERRASYNC PRODUCT DESIGN AND FARMER EXPERIENCE

Act as a senior product designer, UX researcher, accessibility specialist and product manager experienced in designing technology for African smallholder farmers.

Design a practical, mobile-first user experience for TerraSync.

The solution must be suitable for a one-day hackathon and demonstrate strong local relevance to Ogun State.

## 1. User research

Investigate evidence concerning:

- Smallholder farmer technology usage.
- Smartphone accessibility.
- Internet connectivity.
- Digital literacy.
- Language preferences.
- Agricultural information-seeking behaviour.
- Trust in digital recommendations.
- Existing extension service interactions.

Distinguish evidence from hypothetical personas.

## 2. User personas

Develop realistic provisional personas for:

- A smallholder cassava or maize farmer.
- A vegetable farmer.
- A farmer with limited digital literacy.
- An agricultural extension officer as a potential secondary user.

For each persona, describe:

- Goals.
- Daily activities.
- Challenges.
- Technology constraints.
- Information needs.
- Potential TerraSync usage.

Do not present invented personas as interviewed farmers.

## 3. Core user journey

Design an end-to-end workflow:

- Open TerraSync.
- Select preferred language.
- Create a farm profile.
- Select state and LGA.
- Select crop and planting date.
- View current farm status.
- Receive Daily Insights.
- Understand weather implications.
- Ask a contextual agricultural question.
- Optionally upload a crop image.
- Save an actionable farm task.

Simplify unnecessary steps.

## 4. Information architecture

Determine essential pages and navigation.

Evaluate:

- Onboarding.
- Home dashboard.
- Farm management.
- Daily Insights.
- Weather.
- AI assistant.
- Crop health screening.
- Tasks.
- Settings.

Identify which screens can be combined or removed.

## 5. Screen-level specifications

For each essential screen, define:

- Purpose.
- Information hierarchy.
- Required components.
- User actions.
- Loading states.
- Empty states.
- Error states.
- Accessibility considerations.
- Mobile behaviour.

Produce wireframe descriptions or visual wireframes where supported.

Do not generate application implementation code before the official building period.

## 6. Daily Insights experience

Design an interface that clearly communicates:

- What needs attention.
- Why it matters.
- What the farmer should do.
- Urgency.
- Relevant crop.
- Supporting evidence.
- Recommendation limitations.
- When professional assistance is needed.

Avoid overwhelming farmers with technical information.

## 7. Localisation and accessibility

Design for:

- English and Yoruba.
- Simple language.
- Readable typography.
- Large touch targets.
- Low-bandwidth usage.
- Small Android screens.
- Clear icons.
- Colour-independent urgency indicators.
- Accessible forms.
- Limited typing.

## 8. Visual identity

Propose a professional agricultural product identity.

Include:

- Colour palette.
- Typography.
- Component styles.
- Iconography.
- Dashboard hierarchy.
- Status indicators.
- Responsive layout principles.

Avoid generic AI dashboard aesthetics and unnecessary visual clutter.

## 9. Demo experience

Design a compelling 150-second live demonstration using one hypothetical Ogun farmer.

Ensure the demo shows a coherent journey from farm context to a practical agricultural action.

Identify:

- Essential screens.
- Required data.
- Expected interactions.
- Success states.
- Failure states.
- Features to omit from the demo.

## Required deliverables

1. Evidence-informed user research summary.
2. Farmer personas.
3. Jobs-to-be-done analysis.
4. User journey map.
5. Information architecture.
6. Screen-by-screen wireframe specifications.
7. Visual design system.
8. Accessibility and localisation requirements.
9. 150-second demonstration flow.
10. P0-P3 feature priorities.
11. UX acceptance criteria.

Optimise for farmer usability, local relevance and a convincing live demonstration rather than the largest number of screens.

---

## Chat 10 - Business model, impact and winning pitch

**standard: **

# RESEARCH ASSIGNMENT 10: BUSINESS MODEL, IMPACT AND HACKATHON PITCH STRATEGY

Act as an agritech startup strategist, agricultural economist, impact measurement specialist and experienced hackathon pitch coach.

Develop an evidence-backed commercial, social impact and presentation strategy for TerraSync.

Our primary market is Ogun State, with initial coverage across Ondo, Osun and Lagos.

## 1. Problem definition

Identify the strongest agricultural problems TerraSync can realistically address.

Investigate evidence for:

- Agricultural information gaps.
- Extension service accessibility.
- Delayed farm management decisions.
- Weather uncertainty.
- Crop disease management.
- Smallholder productivity constraints.

Separate problems TerraSync directly addresses from broader agricultural challenges it cannot solve.

Develop a concise and defensible problem statement.

## 2. Market opportunity

Investigate:

- Target farmer population.
- Smallholder farming demographics.
- Agricultural cooperatives.
- Digital agricultural adoption.
- Potential institutional customers.
- Regional market opportunities.

Where credible data permits, estimate TAM, SAM and SOM.

Show calculations, assumptions and source limitations.

Do not invent market sizes or extrapolate unsupported numbers.

## 3. Business model

Evaluate:

- Free farmer access.
- Freemium subscriptions.
- Cooperative subscriptions.
- B2B2C distribution.
- Extension service partnerships.
- Government programmes.
- Agricultural organisation licensing.
- Sponsored farmer access.

Compare willingness to pay, distribution complexity, sustainability and accessibility.

Recommend one primary business model and one alternative.

## 4. Go-to-market strategy

Develop a realistic adoption plan covering:

- Initial Ogun pilot.
- Farmer recruitment.
- Cooperative engagement.
- Agricultural extension collaboration.
- Farmer training.
- Feedback collection.
- Yoruba accessibility.
- Regional expansion.

Identify potential collaborators without claiming existing partnerships.

## 5. Impact measurement

Develop measurable indicators covering:

- Farmer engagement.
- Recommendation usefulness.
- Task completion.
- Time to identify agricultural problems.
- Agricultural knowledge improvement.
- User retention.
- Recommendation accuracy.
- Farmer trust.
- Accessibility.
- Cost per active farmer.

Distinguish pilot targets from demonstrated impact.

Do not claim yield increases or financial savings without evidence.

## 6. Financial sustainability

Estimate major cost categories:

- Cloud hosting.
- LLM usage.
- Weather API usage.
- Data storage.
- Agricultural content validation.
- Farmer support.
- User acquisition.

Provide transparent scenario assumptions for a small pilot and subsequent growth.

## 7. Judging criteria strategy

Develop a scoring strategy for:

- Live product: 30%.
- Problem understanding: 20%.
- Originality and local fit: 20%.
- Impact: 15%.
- Presentation: 15%.

Identify what evidence, functionality and presentation material would support each criterion.

## 8. Five-minute pitch

Develop a pitch structure using the official suggested timing:

- 0:00-0:45: Problem.
- 0:45-1:30: Solution.
- 1:30-4:00: Live demo.
- 4:00-5:00: Impact, next steps and team.

Develop a concise slide-by-slide outline.

Ensure the presentation does not claim features that have not yet been implemented.

Use placeholders where final research findings or development results are required.

## 9. Judges' questions

Generate at least 30 challenging questions and suggested evidence-based responses covering:

- Originality.
- Agricultural accuracy.
- AI hallucinations.
- Farmer adoption.
- Local relevance.
- Existing competitors.
- Crop disease reliability.
- Data availability.
- Weather forecast accuracy.
- Business sustainability.
- Scalability.
- Internet accessibility.
- Yoruba support.
- Technical architecture.
- Nobus Cloud deployment.
- Impact measurement.
- Product limitations.
- Fresh implementation and competition compliance.

## 10. Final positioning

Develop:

- A one-sentence elevator pitch.
- A memorable tagline.
- A 30-second table-review introduction.
- A two-minute product explanation.
- A five-minute stage pitch outline.
- A strong closing statement.

## Required deliverables

1. Evidence-backed problem statement.
2. Market opportunity assessment.
3. Recommended business model.
4. Pilot and adoption strategy.
5. Impact measurement framework.
6. Financial sustainability assumptions.
7. Judging criteria strategy.
8. Pitch deck outline.
9. Judges' Q&A preparation.
10. P0-P3 strategic recommendations.

Avoid exaggerated impact claims, generic startup language and unsupported promises. Make TerraSync's value specific, practical and measurable.

---

# 4\. Master synthesis prompt - Chat 11

This is the most important prompt after the individual agents finish. I would bring all their reports back into this conversation so we can consolidate them alongside the handbook and our existing understanding of TerraSync.

The synthesis agent should not merely summarise the reports. It must challenge contradictions, remove unnecessary features and make actual decisions.

**standard: **

# MASTER SYNTHESIS: TERRASYNC HACKATHON EXECUTION PLAN

Act as Team Zenith's chief technology officer, product strategist, agricultural intelligence coordinator and hackathon execution lead.

You have been provided with multiple specialised research reports concerning TerraSync.

Your objective is to synthesise these reports into one coherent, evidence-backed, technically feasible execution plan optimised for the Ogun Innovate Hackathon 2026.

Do not simply concatenate or summarise the reports.

Critically evaluate them, reconcile inconsistencies, remove duplication, challenge unsupported claims and make explicit product and engineering decisions.

## INPUT REPORTS

1. Ogun State agricultural intelligence.
2. Ondo State agricultural intelligence.
3. Osun State agricultural intelligence.
4. Lagos State agricultural intelligence.
5. Agricultural datasets and APIs.
6. Competitor analysis.
7. AI and system architecture.
8. Nobus Cloud deployment.
9. Farmer experience and product design.
10. Business model, impact and pitch strategy.

Also consider the official hackathon handbook and TerraSync's existing product concept.

## PHASE 1: Research audit

Review every report.

Identify:

- Contradictory findings.
- Unsupported claims.
- Duplicate recommendations.
- Outdated information.
- Unverified sources.
- Geographic inconsistencies.
- Data availability limitations.
- Licensing restrictions.
- Technical feasibility concerns.
- Competition compliance concerns.

Create a contradiction and evidence-resolution matrix.

Do not silently resolve disagreements without explaining the basis of the decision.

## PHASE 2: Product definition

Finalise:

- TerraSync's problem statement.
- Primary target user.
- Primary pilot location.
- Geographic coverage.
- Supported crops.
- Core value proposition.
- Unique differentiators.
- Product boundaries.
- Intended user outcomes.

Determine whether supporting all four states is feasible or whether some should have more limited initial functionality.

## PHASE 3: Feature selection

Evaluate every proposed feature against:

- Farmer value.
- Local relevance.
- Judging criteria contribution.
- Evidence availability.
- Development complexity.
- Integration complexity.
- Reliability.
- Demonstration value.
- Maintenance requirements.

Use a transparent prioritisation matrix.

Assign P0, P1, P2 or P3.

Identify features to explicitly exclude.

Do not approve a feature simply because multiple agents recommended it.

## PHASE 4: Agricultural intelligence specification

Finalise:

- State and LGA coverage.
- Priority crops.
- Growth-stage representation.
- Agricultural knowledge sources.
- Candidate agronomic rules.
- Weather-aware recommendation strategy.
- Source attribution.
- Uncertainty handling.
- Agricultural validation requirements.

Identify which recommendations are sufficiently supported for demonstration and which require further expert review.

## PHASE 5: Technical architecture

Select the final:

- Frontend framework.
- Backend framework.
- Database.
- Repository structure.
- AI provider.
- Retrieval approach.
- Weather provider.
- Geographic data source.
- Crop screening approach.
- Deployment architecture.

Provide reasons for every major decision and identify rejected alternatives.

Produce conceptual component diagrams, API contracts, data models and integration requirements.

Do not generate implementation code before the official building period.

## PHASE 6: Team execution

Assume Team Zenith has three members unless corrected.

Define three parallel workstreams:

1. AI, backend and agricultural intelligence.
2. Frontend, product experience and integration.
3. Infrastructure, deployment, testing and reliability.

Assign responsibilities based on confirmed team skills when available.

Identify:

- Dependencies.
- Critical path.
- Integration checkpoints.
- API contract freeze.
- Deployment milestones.
- Testing responsibilities.
- Pitch preparation responsibilities.

Use milestone-based planning because the exact development duration is not confirmed.

## PHASE 7: Progress checks

Define what must be demonstrable at:

- Initial planning.
- Progress check 1.
- Progress check 2.
- Feature freeze.
- Final table review.
- Final stage pitch.

For each milestone, define:

- Expected functionality.
- Required deliverables.
- Acceptance criteria.
- Failure contingency.
- Responsible workstream.

## PHASE 8: Demo and presentation

Design one compelling farmer journey in Ogun State.

Prepare:

- Demo scenario.
- Required screens.
- Required agricultural context.
- Expected recommendations.
- User actions.
- Live data dependencies.
- Failure-handling strategy.
- Five-minute pitch structure.
- Table-review explanation.
- Judges' Q&A.

Ensure all presentation claims match actual implemented functionality.

## PHASE 9: Risk management

Create a risk register covering:

- Deployment failure.
- API failure.
- Data availability.
- Model hallucination.
- Agricultural accuracy.
- Scope creep.
- Integration delays.
- Internet failure.
- Team coordination.
- Competition compliance.
- Demo failure.

Assign probability, severity, mitigation and fallback strategies.

## PHASE 10: Final master game plan

Produce one actionable document containing:

1. Executive summary.
2. Final product vision.
3. Verified problem statement.
4. Regional agricultural strategy.
5. Supported crops and locations.
6. Final MVP scope.
7. Features excluded.
8. Technical architecture.
9. Data and AI strategy.
10. UX requirements.
11. Repository strategy.
12. Nobus Cloud deployment plan.
13. Team responsibilities.
14. Development milestones.
15. Prioritised backlog.
16. Testing and acceptance criteria.
17. Progress-check strategy.
18. Live demonstration.
19. Business model and impact.
20. Pitch structure.
21. Judges' questions.
22. Risk register.
23. Competition compliance checklist.
24. Source register.
25. Final decisions and unresolved questions.

Finish with a concise one-page execution brief that every Team Zenith member can follow during the hackathon.

The final plan must be ambitious enough to compete for first place but realistic enough to produce a reliable working application in one day.

Our success metric is not how many features we build. It is how convincingly TerraSync satisfies all five judging criteria.

---

# 5\. How to organise the research outputs

I recommend saving each report with a consistent filename so we can easily combine them.

**TerraSync\_Hackathon\_Research/**

Markdown is preferable for consolidating AI-generated research because it preserves headings, tables and source links without unnecessary formatting overhead.

# 6\. Research progress tracker

**Team Zenith research command centre**  /11 complete

[Copy progress report]

# 7\. Which chats should you launch first?

Given that the hackathon is today, I would launch these five immediately\:

Then launch the remaining five in parallel.

One important limitation: these prompts are research assignments, not completed research. We haven't yet verified the agricultural sources, final crop selection, available Nobus credits or actual building duration. I have deliberately left those decisions open so that the research determines our final implementation.

**Keep this conversation as our central coordination chat.** As the other AI chats finish, bring their reports here. We can cross-check their findings, make the final architectural decisions, prepare the backlog and then develop detailed coding-agent prompts for each team member once the official building period begins.

That way, we don't have ten AI agents pulling TerraSync in ten different directions. We have ten specialists contributing to one coordinated plan.

## Prompt:
11/25/2026, 10:23:49 AM

What aspect of terrasync is food supply chain how can we solve the problem

## Response:
11/25/2026, 10:23:51 AM · gpt-6-2

TerraSync currently addresses the **production side of the food supply chain**, but it does not directly address how food moves from farmers to consumers.

This is an opportunity to strengthen our solution, particularly because our hackathon track is **Agritech and Food Security**\.

However, I would not recommend building an entire agricultural marketplace today. We can address food supply chain challenges by extending TerraSync's existing agricultural intelligence capabilities.

# 1\. Where TerraSync fits into the food supply chain

Our current features help farmers produce food more effectively. But producing food is only one part of food security. We also need to consider whether that food successfully reaches the market.

# 2\. Food supply chain problems TerraSync could address

| Problem | Proposed TerraSync solution |
|--------|--------|
| Crop losses before harvest | Proactive crop health and weather intelligence |
| Poor harvest timing | Crop maturity and harvest readiness recommendations |
| Post-harvest spoilage | Crop-specific storage and handling guidance |
| Unpredictable food supply | Expected harvest dates and estimated production volumes |
| Difficulty finding buyers | Produce availability listings |
| Farmers selling under pressure | Early buyer discovery before harvest |
| Poor coordination between farmers and aggregators | Regional produce availability dashboard |
| Limited market information | Verified market price intelligence, where available |
| Transportation delays | Weather-aware harvest and dispatch planning |

These are proposed problem-solution relationships. We still need regional evidence to establish their severity in our target states.

# 3\. My recommendation: TerraSync Harvest Intelligence

Rather than building a separate marketplace, introduce a new module called **Harvest Intelligence**, connecting farm production to the food supply chain.

TERRASYNC ECOSYSTEM

# From seed to market

Helping farmers grow, protect, harvest and distribute their produce.

This creates a coherent product rather than a collection of unrelated features.

## 4\. Features we could introduce

### 4.1. Harvest readiness and forecasting

TerraSync already conceptually tracks planting dates and crop growth stages.

We can extend this to provide\:

- Estimated harvest windows.
- Crop maturity indicators.
- Upcoming harvest reminders.
- Farmer-reported expected harvest quantities.
- Weather considerations before harvesting.
- Recommended post-harvest preparations.

[![Nigéria, o maior produtor de mandioca do mundo, não lucra no mercado global - MDig](https://images.openai.com/static-rsc-4/4RPtLuZpfwVimzpCsuwk0bwiSr--UBRKaX3CNDPZv8KN3Cw1cAYp742YUMSltGmuSZK6HFr6pU-FKaGWbBs-8sTz2ELw0-djmrdPGFjioCQ_2ogJMSSuS7WuewSHZKMRc7T6nnaL9GD5wvrqpkqlt9ZqhFHf7HNNs29qTR8LpFayYCKFfun3x3KR920ywg5b?purpose=fullsize)](https://www.mdig.com.br/index.php?itemid=56987)

HARVEST INTELLIGENCE

## Cassava

Odeda, Ogun State

(Upcoming)

---

Expected harvest

**December 2026**

Estimated quantity

**2,000 kg**

Farm size

**1 hectare**

Buyer status

**Not secured**

**Recommended next actions**

Confirm crop maturity

Arrange potential buyers

Prepare transportation

Review post-harvest handling guidance

Illustrative interface using hypothetical farmer-provided data, not an actual yield prediction.

The advantage is that farmers can begin preparing for distribution before harvesting.

### 4.2. Post-harvest loss prevention

This is one of the most natural extensions of TerraSync's Daily Insights engine.

Instead of recommendations ending when a crop matures, the platform continues supporting the farmer after harvesting.

| Crop | Example guidance areas |
|--------|--------|
| Cassava | Timely processing and transportation |
| Tomato | Careful handling, sorting and suitable packaging |
| Maize | Drying, moisture management and storage |
| Pepper | Sorting, preservation and storage |
| Yam | Handling, curing and appropriate storage |

Specific recommendations should be grounded in validated agricultural publications.

The system could generate post-harvest tasks just as it generates planting and crop management tasks.

### 4.3. Produce availability and buyer discovery

This is where we directly connect TerraSync to the supply chain.

Farmers can indicate what they expect to harvest, how much they expect to have available, where the produce is located and when it will be ready.

Buyers and aggregators can discover upcoming produce before it is harvested.

## Regional Produce Board

Illustrative buyer-facing interface

All listings are hypothetical examples.

We don't need payment processing, logistics management, bidding or a full marketplace for the MVP. A simple produce discovery and buyer-interest system is enough to demonstrate the concept.

### 4.4. Regional food supply intelligence

This could become a particularly interesting long-term differentiator.

As more farmers register their crops and expected harvests, TerraSync could aggregate that information into a regional dashboard.

## Upcoming cassava supply

Illustrative registered-farm estimates, tonnes

---

## Expected harvest distribution

Synthetic demonstration data. These figures are not actual state agricultural production statistics.

Potential users include agricultural cooperatives, food processors, aggregators, retailers and agricultural planning agencies.

The dashboard would only represent participating farms, not the entire state's food supply.

# 5\. How the entire system would work

**Farmer registers crop**

Location, crop, planting date and farm size

**Daily agricultural intelligence**

Weather, growth stages, risks and farm tasks

**Harvest Intelligence**

Harvest readiness and expected produce availability

**Post-harvest guidance**

Preserve produce

**Buyer discovery**

Connect supply to demand

**Regional supply visibility**

Cooperatives, aggregators and food processors

# 6\. What we should build today

Given the limited development time, I would prioritise the following\:

| Feature | Priority | Decision |
|--------|--------|--------|
| Crop lifecycle tracking | P0 | Build |
| Daily Insights | P0 | Build |
| Weather intelligence | P0 | Build |
| Harvest readiness | P0 | Build |
| Post-harvest recommendations | P0 | Build |
| Expected harvest quantity entry | P0 | Build |
| Produce availability board | P1 | Build if time permits |
| Buyer interest registration | P1 | Build if time permits |
| Regional supply dashboard | P1 | Build if time permits |
| Market price intelligence | P2 | Requires reliable data |
| Automated yield prediction | P2 | Requires validation |
| Logistics optimisation | P3 | Defer |
| Marketplace payments | P3 | Defer |

# 7\. How this strengthens our pitch

Previously, our story was primarily\:

> TerraSync helps farmers make better farming decisions.

Now, we could position it as\:

**TerraSync is an AI-powered agricultural intelligence platform that connects farm production to food supply, helping smallholder farmers grow healthier crops, anticipate harvests, reduce avoidable losses and connect their produce to potential markets.**

Our proposed impact spans three dimensions of food security\:

**Availability**

Support food production and harvest planning.

**Access**

Improve connections between producers and buyers.

**Stability**

Support proactive risk management and supply planning.

These are intended outcomes, not demonstrated impact.

# 8\. The live demonstration that could sell this idea

Imagine a hypothetical cassava farmer in Ogun State.

The farmer registers their farm on TerraSync. Throughout the crop lifecycle, TerraSync provides daily recommendations and weather-aware guidance.

As the crop approaches maturity, TerraSync identifies the expected harvest window and recommends preparing storage, transportation and potential buyers.

The farmer enters their expected harvest quantity and publishes it on the produce availability board.

A food processor or aggregator can discover that upcoming supply and register interest before the farmer harvests.

After harvesting, TerraSync continues providing handling and preservation guidance.

**One farmer. One crop. One complete journey from planting to market.**

That tells a much stronger food security story than simply demonstrating an agricultural chatbot.

My recommendation is to make **Harvest Intelligence and Post-Harvest Loss Prevention** the bridge between TerraSync's existing agricultural intelligence and the food supply chain.

We should retain our original product identity rather than pivoting into a marketplace. The proposed supply chain features have not yet been implemented or validated, but they offer a coherent direction that could strengthen our originality, local relevance and impact scores.

## Prompt:
11/25/2026, 11:38:38 AM

So we will be using livekit for calls for farmers with small phones so they can call and be getting insights. so now i need to understand what we are doing. so we are allowed to use our old code as in refactor our former codebase and follow the entire setup process we willl just be introducing the calls and then the agronomic layer would be tailored to southwest. so lets go over it and have understanding of what exactly we want to do and what we will be introducing to the frontend

## Response:
11/25/2026, 11:38:44 AM · gpt-6-2

> **Inspecting frontend and backend archives**
>
>
> **Inspecting frontend routes and backend docs**
>
>
> **Inspected frontend and backend archives, routes, and documentation**
>
> 
>
> **Searched 1 website**
>
> 
>
> Worked for 26s

Now we're getting somewhere. The introduction of voice calls changes TerraSync's accessibility strategy significantly, and I think we should consolidate everything before introducing any more features.

We are no longer talking about rebuilding a generic agricultural assistant. We are evolving TerraSync into a **regional agricultural intelligence and food supply chain platform that farmers can access through both a web application and voice conversations.**

Since you've confirmed that refactoring the previous codebase is permitted, we can focus our engineering effort on meaningful improvements rather than recreating functionality we already have. However, this differs from the written handbook's rules on page 4, so I'm proceeding on the basis that you've received updated permission from the organisers. I cannot independently confirm that permission.

# 1\. What exactly is TerraSync now?

TerraSync is an intelligent agricultural decision-support platform that helps smallholder farmers across Southwest Nigeria manage their crops, receive timely agricultural guidance, prepare for harvest and reduce avoidable food losses through digital and voice-based interactions.

Our initial coverage remains\:

- Ogun State - primary focus.
- Ondo State.
- Osun State.
- Lagos State.

The fundamental product philosophy remains unchanged: **What needs my attention today, why does it matter, and what should I do next?**

The difference is that farmers no longer necessarily need to navigate a dashboard to get those answers.

# 2\. The five pillars of TerraSync

These five pillars should work together. We are not building five separate products.

# 3\. Understanding the new agronomic layer

I've reopened the existing repositories and checked the Daily Insights documentation and frontend navigation.

One thing I particularly want us to preserve is the engineering principle behind the existing agronomic layer.

The current backend already has\:

- A deterministic Daily Insights engine.
- Individual crop-specific rule modules.
- Rule activation and governance mechanisms.
- Agricultural source references.
- Missing-context handling.
- Priority-based insight ranking.
- Farmer-confirmed inspection completion.

The AI Assistant consumes the output of the Daily Insights engine rather than independently overriding its decisions.

**We should retain that single source of truth.**

Source: `terrasync-backend-main/docs/INSIGHTS_ENGINE.md` and `insights/agronomy/`\.

## Existing versus proposed agronomic intelligence

| Dimension | Existing TerraSync | New TerraSync |
|--------|--------|--------|
| Geography | Farm location context | Four-state regional intelligence |
| Crop rules | Six supported crops | Regionally reviewed crop rules |
| Planting dates | Calendar-based evaluation | Calendar and locally relevant seasonal context |
| Weather | Separate weather advice | Weather-informed agronomic decisions |
| Soil | Farmer-provided information | Regional context where reliable |
| Harvest | Limited lifecycle support | Harvest readiness and planning |
| Post-harvest | Not a core module | Handling and preservation guidance |
| AI access | Text and images | Text, images and voice |
| Evidence | Internal rule references | More visible source attribution |

## How the new intelligence engine should work

**TerraSync Agronomic Intelligence Engine**

Evaluate · Prioritise · Explain

**Dashboard**

**AI Chat**

**Voice Calls**

Notice that the dashboard, chatbot and voice agent all consume the same intelligence.

We must not create a separate agricultural reasoning system specifically for LiveKit. Otherwise, the voice assistant could give advice that contradicts what the farmer sees on the dashboard.

## Regional localisation

The agricultural knowledge layer should consider the following hierarchy\:

**Nigeria → Southwest → State → LGA → Individual farm**

We should use the most geographically specific evidence available, falling back to broader guidance when local evidence is unavailable.

Selecting an LGA does not automatically mean that we possess verified soil, crop or disease information for that LGA.

The existing six crops are maize, cassava, tomato, groundnut, pepper and yam. I would retain them initially rather than introduce numerous additional crops without validated agricultural rules.

We can prioritise cassava and maize for the Ogun demonstration, subject to the research findings.

# 4\. TerraSync Voice - our biggest new feature

This is probably going to be our strongest demonstration of accessibility and local relevance.

We should approach voice as another way of accessing TerraSync, not merely a voice-enabled chatbot.

## 4.1. Two ways farmers can call TerraSync

[![Nokia 105 (2024) | En pålitlig telefon](https://images.openai.com/static-rsc-4/9Ag3UjOWDpIZu3AS5OgJwrSbKbmHRrM3h56nEU5D7auCEqbJ_FevKy6Qdnagii9ZPmlIGCgMvec5H3biw_68Ae63KL54q96UqgMQCkj0VkaEWQzSYJMQ0P85nJrQaV2y0Rc2MzH7-Aa5WS6RPYL0P1klrI4nrt1wZwlnPqCzVdPfY43gqo5bL34no5i8-zOE?purpose=fullsize)](https://www.hmd.com/sv_se/nokia-105-2024)

**Basic feature phone**

Farmer dials a telephone number using a normal cellular call.

No smartphone or mobile internet required on the farmer's side.

[![Test: Xiaomi Redmi A1 | Stiftung Warentest](https://images.openai.com/static-rsc-4/e9XTW0Ht9dvMZYxJ5SPGCvC1NHmclm0rwCIksLTjZqCVQGT2OamV6VKTsjajtge04itSXTJgML6D7vhjaF6ZtmRdOrJfUgB9tCeq6SDhsMikyabXLuNKDZ0DGl3AAj8G8NDb3QwvH44Ch255vnGARJAv0k8PPuJ7MT4nnbygV7WFe-H7w_bwpR6WDU7MrC_e?purpose=fullsize)](https://www.test.de/Handys-und-Smartphones-im-Test-4222793-detail/310000021850%21IC20006-0404-00/)

**Smartphone**

Farmer presses the Call TerraSync button inside the web application.

Internet-based audio call through LiveKit WebRTC.

There is an important technical distinction here.

LiveKit supports both browser-based audio sessions and traditional telephone calls through SIP telephony. However, its directly provisioned phone numbers are currently US-only according to its official documentation. For a Nigerian local number, we would need a suitable third-party telephony provider connected to LiveKit. \[[LiveKit Phone Numbers](https://docs.livekit.io/telephony/start/phone-numbers/?utm_source=chatgpt.com); [Telephony introduction](https://docs.livekit.io/telephony/?utm_source=chatgpt.com)\]

**LiveKit alone does not automatically give us a Nigerian telephone number.**

If we already have a compatible telephony provider, excellent. Otherwise, this is something the infrastructure team needs to resolve immediately.

## 4.2. Voice architecture

**Basic phone**

Cellular network

**SIP provider**

Telephone number

**Web application**

Smartphone browser

**WebRTC**

Internet audio

## LiveKit

Real-time audio transport and room management

**TerraSync Voice Agent**

Speech-to-text

LLM reasoning and tool calling

Text-to-speech

**TerraSync Django Backend**

Shared agricultural intelligence

LiveKit provides the real-time communication infrastructure and agent framework. Our backend remains responsible for the agricultural intelligence. \[[Introduction](https://docs.livekit.io/agents/?utm_source=chatgpt.com); [Workflow &amp; setup](https://docs.livekit.io/telephony/accepting-calls/workflow-setup/?utm_source=chatgpt.com)\]

## 4.3. What farmers should be able to do through calls

| Voice capability | Example farmer request |
|--------|--------|
| Daily Insights | What should I do on my farm today? |
| Weather advice | Will it rain in my area tomorrow? |
| Crop advisory | What should I check on my cassava farm? |
| Farm tasks | What activities have I not completed? |
| Symptom screening | My maize leaves are turning yellow. What should I check? |
| Harvest planning | How do I know when my cassava is ready? |
| Post-harvest guidance | How should I handle my tomatoes after harvesting? |
| Regional information | What crops can I consider growing in my area? |
| Language selection | Can we speak in Yoruba? |

The voice agent should retrieve real information from the backend rather than hallucinating a farm profile or weather forecast.

## 4.4. How farmers are identified

We need to support three different user journeys.

| User | Identification |
|--------|--------|
| Existing web user | Authenticated TerraSync session |
| Registered telephone caller | Verified phone number and appropriate identity confirmation |
| First-time telephone caller | Guest session with conversational onboarding |

An unregistered farmer should still receive general agricultural guidance without needing an email address or smartphone.

For personalised guidance, the agent can ask for the farmer's state, LGA, crop and planting information.

Caller ID alone should not authorise access to private farm records or account changes.

## 4.5. Example telephone conversation

This is a hypothetical demonstration of the intended functionality.

**TerraSync Voice**

Illustrative conversation

---

Notice how the agent asks follow-up questions instead of inventing answers.

That is consistent with the existing agronomic engine's handling of insufficient context.

For Yoruba, we must test the actual speech recognition and speech synthesis providers. Supporting Yoruba text does not automatically mean that our voice pipeline supports Yoruba accurately.

---

# 5\. The food supply chain component

I still believe we should introduce Harvest Intelligence, but we should keep it proportionate to the rest of the application.

TerraSync should help farmers not only grow crops but also prepare those crops to enter the food supply chain.

The proposed supply chain module can include harvest windows, expected quantities, harvest status, post-harvest guidance and optional produce listings.

The voice assistant should eventually be able to communicate these same insights.

For today, I would prioritise harvest and post-harvest guidance over building payments, delivery logistics or a full marketplace.

---

# 6\. What exactly are we introducing to the frontend?

I've checked the existing frontend structure.

The current bottom navigation in `src/components/navigation/BottomNav.tsx` contains five items\:

The existing frontend also includes a floating assistant button, farm onboarding, language selection, crop details, profile management and assistant conversation history.

We do not need to redesign everything. We should introduce the new capabilities into the existing design system.

The following are proposed frontend wireframes, not screenshots of implemented features.

## 6.1. Landing page

The landing page should reflect the product's new positioning.

**TerraSync**

BUILT FOR SOUTHWEST NIGERIA

# Better farming decisions. More food. Stronger communities.

Personalised agricultural intelligence for every farmer - through your smartphone or a simple phone call.

[![Safeguarding for Women In Sourcing and Enterpri](https://images.openai.com/static-rsc-4/ZYbPAgg5ukC_x-knHejL9owqpl5hpZ2XJ6OyBOWi28X5fUkD-bZpzHD0SB8nHTg06yAHCmuVg8t02EITFr1F8mDRH1z4l5-OGrAe994OT6Gb21ZyxsHu4esSeWRsA7MT-2Qlt_DSnbtL4loePaurKUwgwGRw2zOoCxWLdXd0ozwp88iNh2_-eSIa10khRNhY?purpose=fullsize)](https://idh.org/resources/call-for-consultants-feedback-response-and-complaints-mechanism-for-safeguarding-for-women-in-sourcing-and-enterprise-wise-program)

Get started

Call TerraSync

Ogun · Ondo · Osun · Lagos

Changes: updated value proposition, prominent voice accessibility, geographical coverage and a clear explanation of the farm-to-market vision.

The telephone contact should only be displayed once a working number is configured.

## 6.2. Onboarding and farm setup

The existing onboarding should be adapted rather than replaced.

Farm setup

# Where is your farm?

We'll use your location to personalise your agricultural recommendations.

State

Ogun State

Local Government Area

Odeda

Community (optional)

Enter your community

**Use my current location**

Optional location detection

Continue

Introduce dependent state and LGA selection, restrict initial coverage to the four states, and add preferred voice language and an optional verified telephone number.

Retain the existing crop context and soil information collection. Avoid forcing farmers to provide soil properties they do not know.

## 6.3. Home dashboard

This should become the central experience.

**TerraSync**

# Good morning, Farmer

Odeda, Ogun State

**Talk to TerraSync**

Get farming guidance using your voice.

Start voice call

English · Yoruba (subject to availability)

**Local weather**

Today's forecast appears here

**Today's Insights**  View all

NEEDS ATTENTION

**Inspect your cassava establishment**

Check for plants that have failed to establish.

View recommendation

**Harvest Intelligence**  View harvests

**Your upcoming harvests**

Plan harvesting, storage and distribution.

Explore your farm

---

I would make Voice and Daily Insights the two most prominent components on the homepage.

Weather and pests can remain clearly accessible from dashboard shortcuts, even if we change the bottom navigation.

## 6.4. Dedicated voice call interface

This is the main new frontend page.

TerraSync Voice

```svg
<svg viewBox="0 0 240 200" width="220px" xmlns="http://www.w3.org/2000/svg"><circle cx="120" cy="100" r="95" fill="#183d2d" /><circle cx="120" cy="100" r="76" fill="#21583b" /><circle cx="120" cy="100" r="57" fill="#36865a" /><circle cx="120" cy="100" r="40" fill="#67bf86" /><path d="M120 123 V90 M120 105 Q95 108 94 78 Q119 77 120 105 M120 97 Q120 76 146 73 Q147 98 120 97" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" /></svg>
```

# TerraSync

Listening to you...

00:42

Live conversation

Tell me what you have noticed on your farm today.

End call

The functional requirements for this screen are microphone permission handling, LiveKit room connection, call duration, mute and unmute, audio playback, agent state indicators, optional live transcripts, connection recovery, call termination and an optional post-call summary.

The screen should accurately distinguish these states\:

| State | Display |
|--------|--------|
| Connecting | Connecting to TerraSync... |
| Listening | Tell me about your farm |
| Thinking | Checking your farm information... |
| Speaking | TerraSync is speaking |
| Reconnecting | Connection interrupted |
| Failed | Unable to connect. Try again |
| Ended | Call completed |

No camera or video is necessary for the core voice calling experience.

## 6.5. Existing AI Assistant modifications

The current text and image assistant should remain. We simply introduce another interaction channel.

**TerraSync Assistant**

Personalised agricultural guidance

**Your farm context**

Ogun · Odeda · Cassava

Good morning\! I can help you understand today's farm insights, crop health, weather and harvest planning.

Ask about your farm...

The key improvement is that farmers can switch from typing to speaking without losing access to the same agricultural knowledge.

We should also introduce visible agricultural source references where available.

## 6.6. Harvest Intelligence page

## Harvest Intelligence

Prepare your crops for harvest and reduce avoidable losses.

Upcoming harvests

# 2

Ready for harvest

# 1

[![Nigeria: FarmERP launches AI platform to boost cassava cultivation - We are Tech](https://images.openai.com/static-rsc-4/XdwxuVXMYFEoWMw5Sv77tXZrHhel5QhRoeRNg1wFuE2AbPFA5jntqLfchc-xb0V5P36exDnZYLGAHM7c0908tTWj-9NoM58AnRYW3tfosg93008Ptu2jzPzMhJ7tsJ5cFilZEjHTIEI1Ax6XBGF9XyWjtXXxfPIYxE0OE4bU2e3Uh1MStP6vK7wydXAJUlJ1?purpose=fullsize)](https://www.wearetech.africa/en/fils-uk/news/tech/nigeria-farmerp-launches-ai-platform-to-boost-cassava-cultivation)

**Cassava**

Farm in Odeda, Ogun

Harvest preparation

Illustrative lifecycle progress

---

**Before harvesting**

Confirm maturity

Estimate available quantity

Arrange processing or buyers

Manage harvest

**Post-harvest guidance**

Crop-specific handling, preservation and storage information.

**Publish produce availability**

Illustrative sample data and proposed functionality.

The last feature, publishing produce availability, is optional depending on time. It should not distract us from the voice experience.

---

# 7\. Recommended navigation structure

I would make a deliberate change to the existing bottom navigation.

Before

---

Proposed

Weather and pest management are not being removed. They remain accessible through the homepage and crop management pages.

The reason for this proposed navigation is to give our two new capabilities - Voice and Harvest Intelligence - greater visibility.

# 8\. Frontend engineering breakdown

Based on the existing frontend file structure, here is what I would communicate to the frontend developer.

| Existing file or area | Required change |
|--------|--------|
| `Index.tsx` | Update dashboard and introduce voice and harvest cards |
| `FarmSetup.tsx` | Four-state and dependent LGA selection |
| `Onboarding.tsx` | Regional positioning and language preferences |
| `Assistant.tsx` | Voice entry point and better source attribution |
| `CropDetail.tsx` | Harvest readiness and local agricultural context |
| `CropAdvisory.tsx` | Region-specific crop knowledge |
| `Weather.tsx` | Connect weather to agricultural implications |
| `Profile.tsx` | Phone verification and preferred voice language |
| `Tasks.tsx` | Support harvest and post-harvest activities |
| `BottomNav.tsx` | Revised navigation |
| `FloatingAssistantButton.tsx` | Text and voice entry options |
| Landing page | Updated product positioning |
| Language context | Translate all newly introduced functionality |

### Proposed new frontend files

**src/**

These are proposed filenames and component boundaries. The developer should conform them to the existing repository's conventions rather than blindly creating duplicate abstractions.

---

# 9\. Backend changes

The backend responsibilities should be separated into three workstreams.

| Module | Responsibility |
|--------|--------|
| Existing Django backend | Authentication, farms, crops, tasks and agricultural intelligence |
| New voice agent service | LiveKit integration, speech processing and backend tool calling |
| Regional agronomic layer | Southwest knowledge, weather-aware rules and harvest guidance |

The LiveKit voice agent can run as a separate Python process alongside the Django application on Nobus Cloud.

Suggested agent tools include\:

| Agent tool | Purpose |
|--------|--------|
| `get_farm_profile` | Retrieve verified farmer context |
| `get_daily_insights` | Retrieve today's deterministic recommendations |
| `get_local_weather` | Fetch current weather and forecast information |
| `get_crop_details` | Retrieve registered crop information |
| `search_agricultural_knowledge` | Retrieve relevant agricultural evidence |
| `get_pending_tasks` | Retrieve outstanding farm tasks |
| `get_harvest_readiness` | Retrieve harvest-related information |
| `create_farm_task` | Save a task after farmer confirmation |

These are proposed tool contracts, not existing implemented functions.

We should adapt the existing assistant context assembly wherever appropriate so that text and voice are consistent.

# 10\. Proposed Nobus Cloud architecture

**Web users**

**Telephone callers**

**HTTPS / LiveKit / SIP gateway**

**Nobus Cloud**

Nginx gateway

We still need to decide whether the LiveKit media server will be self-hosted on Nobus or consumed through LiveKit Cloud as an external communication service. Confirm that the latter complies with the organisers' deployment requirements.

Also, the browser voice feature requires a secure microphone-capable context, so HTTPS should be treated as an essential deployment requirement.

---

# 11\. What is staying, changing and being introduced?

This is our proposed product scope.

| Feature | Decision |
|--------|--------|
| Authentication | Retain |
| Farm onboarding | Refactor for regional coverage |
| Crop management | Retain and improve |
| Daily Insights | Retain and regionalise |
| Weather | Retain and integrate more deeply |
| Agronomic rules | Refactor with regional evidence |
| AI text assistant | Retain and improve |
| Image screening | Retain |
| Existing localisation | Retain |
| English and Yoruba voice | Introduce, subject to speech testing |
| LiveKit web calling | Introduce |
| Feature-phone calling | Introduce, subject to SIP setup |
| Conversational onboarding | Introduce |
| Call summaries | Optional |
| Harvest intelligence | Introduce |
| Post-harvest guidance | Introduce |
| Produce availability | Optional |
| Regional supply dashboard | Optional |
| Payments | Defer |
| Logistics optimisation | Defer |
| Satellite analytics | Defer |

# 12\. Implementation priorities for today

**Team Zenith implementation checklist**  /

# 13\. Our final product narrative

I would position TerraSync as follows\:

**standard: **

TerraSync is a voice-enabled agricultural intelligence and food supply chain support platform designed for smallholder farmers in Southwest Nigeria.

By combining localised agronomic knowledge, real-time weather information, crop lifecycle tracking and context-aware artificial intelligence, TerraSync helps farmers understand what needs their attention, why it matters and what actions to take.

Through its mobile-first application and telephone-based voice assistant, TerraSync aims to make agricultural intelligence accessible even to farmers without smartphones or mobile internet.

From planting and crop management to harvest preparation and post-harvest handling, TerraSync supports better farming decisions and aims to reduce avoidable food losses.

Starting in Ogun State, TerraSync is designed to serve farmers across Ondo, Osun and Lagos, with the potential to expand throughout Nigeria.

**Potential tagline: Agricultural intelligence. Every farmer. Every phone.**

Use that tagline for the live product only if basic telephone calling actually works.

# 14\. What I want our winning demo to look like

Imagine standing in front of the judges with a laptop and a small keypad phone.

We open TerraSync on the laptop and show a farmer's profile in Ogun State, their registered crops, local weather and Daily Insights.

Then we pick up the basic phone.

We dial TerraSync.

The AI answers, identifies the farmer appropriately and provides actual insights derived from the same backend the judges just saw on the screen.

The farmer asks about their upcoming harvest and receives context-specific guidance.

We then return to the dashboard and show how TerraSync supports harvest preparation and post-harvest management.

That demonstrates agricultural intelligence, accessibility, local relevance, technical functionality and food security within one coherent user journey.

---

# 15\. Decisions we need to settle immediately

There are four important uncertainties before we finalise the implementation prompts\:

| Decision | Current status |
|--------|--------|
| Reusing the previous codebase | You report updated permission; not independently verified |
| Nigerian telephone number and SIP provider | Not confirmed |
| Yoruba speech recognition and synthesis provider | Not confirmed |
| Harvest and supply chain scope | Proposed, awaiting your approval |

I have reopened selected frontend and backend source files and documentation, but I have not executed the applications or completed a full integration audit. The new UI designs and architecture above are proposed changes rather than existing implementations.

The most important question I need answered now is\:

**When you say we are using LiveKit for farmers with small phones, do we already have a Nigerian telephone number and SIP provider that farmers can dial with a normal GSM call, or are we currently planning to use LiveKit's internet-based voice calling?**

That distinction determines how we design the entire voice infrastructure and whether we can deliver our strongest accessibility promise today.



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)