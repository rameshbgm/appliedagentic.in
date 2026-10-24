# Voice Agents: The Promise, the Pitfalls, and What Good Looks Like

**Summary:** We live in a voice-first world. People talk on the phone, speak to smart speakers, use voice search, and call customer service lines millions of times a day.

# Why Voice Matters

We live in a voice-first world. People talk on the phone, speak to smart speakers, use voice search, and call customer service lines millions of times a day. Yet most AI conversations focus on *text* — chatbots, email assistants, document processors.

Voice is increasingly where AI meets people in their most natural, often most stressful, moments — when they're sick and calling a clinic, frustrated and calling support, or elderly and struggling with technology.

Getting voice AI right matters enormously. Getting it wrong has real human consequences.

## What Is a Voice Agent?

A **voice agent** is an AI system that:
1. **Listens** — converts spoken words to text (speech-to-text)
2. **Understands** — uses a language model to interpret what the person wants
3. **Decides** — determines the appropriate action or response
4. **Speaks** — converts its response back to natural-sounding speech (text-to-speech)

> 💡 **What This Means**: Unlike the old automated phone systems that made you press "1 for English" and "3 for billing," modern voice agents can hold a genuine conversation — understanding natural language, handling follow-up questions, and escalating to humans when needed.

**Common uses in healthcare:**
- Appointment scheduling and rescheduling
- Hours and location information
- Prescription refill requests
- Test result notifications
- Triage routing (connecting urgent calls to human staff)

# The Case Study: Maple Heights Family Clinic

*The following is a representative case study designed to illustrate common deployment pitfalls.*

### The Setup

**Maple Heights Family Clinic** serves 150 patients a day in a busy city. Their administrative team is overwhelmed — mornings begin with voicemail backlogs, and phone lines are jammed until mid-afternoon.

The operations director proposes an AI voice agent to handle three key functions:
- Booking appointments
- Answering questions about hours of operation
- Routing complex calls to human staff

**The Pilot**: Internal testing with staff posing as patients. Scripted, clear questions. Consistent results. Leadership approves a live rollout.


### What Went Wrong — In Detail

#### Problem 1: Real Callers Don't Speak Like Test Users

From day one of live deployment, real patients behaved nothing like the testers.

- *Elderly patients* spoke slowly, paused mid-sentence, or used outdated phrasings
- *Parents calling from cars* had background noise and interrupted themselves
- *Non-native speakers* used unexpected accents or phrasing

> 🌍 **Real Example**: A mother calls to reschedule her child's flu shot while GPS instructions interrupt her mid-sentence. The voice agent can't parse the fragmented audio. It repeats the same prompt three times. Then it hangs up.

**What this reveals**: The system was trained on *clean, scripted* speech. Real conversation is messy. A pilot that only tests ideal conditions doesn't predict real-world performance.

#### Problem 2: System Integration Broke Under Pressure

The voice agent connected to the clinic's scheduling system. But during high-demand periods, that connection became unreliable — returning outdated appointment availability.

**Result**: The AI offered patients time slots that were already taken. Patients arrived at appointments that didn't exist. Front-desk staff scrambled to accommodate them. Double-bookings created chaos.

> ⚠️ **The Integration Trap**: An AI agent is only as reliable as the systems it connects to. Fragile API connections become obvious failure points under real-world load.

#### Problem 3: Escalation Pathways Were Too Narrow

The voice agent had a built-in escalation option — but it only triggered when patients used specific phrases: *"speak to someone"* or *"talk to a human."*

Real patients in distress don't read the manual.

> 🌍 **Real Examples**:
> - An elderly caller says: *"I need to talk to the nurse about my blood sugar."* The agent doesn't recognise this as an escalation request. It loops her back to the main menu.
> - A patient recently discharged from hospital, in visible distress, can't reach a human. He gives up and hangs up.

**What this reveals**: Escalation logic must be *broad and forgiving* — designed around how distressed, confused, or elderly people actually communicate.

#### Problem 4: Patient Trust Collapsed Publicly

Within a week, complaints appeared on public review sites:

*"This clinic has replaced people with a robot that doesn't listen. I just want to speak to a real person."*

*"Terrible phone system. My mum is 78. She couldn't get through and ended up missing her appointment."*

Staff morale suffered too. Instead of reducing their workload, the voice agent created new problems for them to clean up — rebooking missed appointments, fielding angry calls.

**The intended efficiency gains never materialised.**


### Root Cause Analysis: Why the Pilot Didn't Predict This

| What Was Tested | What Wasn't Tested |
|-----------------|-------------------|
| Clear, scripted patient queries | Real messy human speech |
| Ideal network conditions | High-load API reliability |
| Standard escalation phrases | Natural distress language |
| Young, healthy testers | Elderly, non-native, distressed callers |
| Single-intent requests | Multi-intent, interrupted requests |

> 💡 **The Core Lesson**: A pilot that tests *best-case scenarios* tells you whether the technology can work. It doesn't tell you whether it *will* work in reality. Stress testing, edge case testing, and representative user testing are essential before go-live.

## What Good Looks Like: The Cencora Success Story

To balance the cautionary tale, here's a real-world success demonstrating what's possible with proper planning and oversight.

**Company**: Cencora — a large US healthcare distributor
**AI System**: Eva, a voice agent built by Infinitus

### What Eva Does
Eva handles critical administrative calls:
- Benefits verification
- Drug-service management requests
- Routine patient follow-up calls

### The Results
- Eva handles the workload of **100+ full-time staff**
- Processes requests **4× faster** than the previous human team
- Uncertain or complex cases are *automatically triaged to human review*
- **Every call is recorded and spot-checked** for quality control

> ⚠️ **What Made the Difference**: Cencora didn't just deploy the technology — they built quality control processes *around* it. Every call is reviewed. Humans stay in the loop for edge cases. The AI handles volume; humans handle nuance.

# Lessons for Your Organisation

| Lesson | What to Do |
|--------|-----------|
| Test with real users, not just staff | Include elderly users, non-native speakers, and people under stress |
| Stress test integrations | Simulate high-load conditions before go-live |
| Design broad escalation logic | Build in *multiple* ways for callers to reach a human |
| Plan for monitoring from day one | Set up dashboards before launch, not after problems emerge |
| Keep humans in the quality loop | Record, review, and learn from every failed interaction |
| Communicate the change | Tell patients what to expect from the new system before they encounter it |

# Key Takeaways

- Voice agents are powerful but require far more careful testing than most organisations realise
- **Real callers** behave completely differently from test participants — always test with representative users
- **Integration reliability** is as important as AI capability — a brilliant agent connected to a fragile system will fail
- **Escalation paths must be natural** — design for how upset, confused, or elderly people actually communicate
- **Patient trust is fragile** — one bad experience shared publicly can undermine months of careful deployment
- The Cencora case shows what's possible: *high volume + human oversight + quality control = sustainable success*
