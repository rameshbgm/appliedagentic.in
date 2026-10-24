# Cybersecurity Case Study: Mapping an Attack Through the Kill Chain

**Summary:** The best way to understand the Cyber Kill Chain is to *apply* it to a real attack scenario. We've already seen how Lisa Mendez's story unfolded.

# Learning by Doing: The Lisa Mendez Case

The best way to understand the Cyber Kill Chain is to *apply* it to a real attack scenario. We've already seen how Lisa Mendez's story unfolded. Now let's use it as a teaching tool — mapping each phase of her breach to the Kill Chain framework.

> 💡 **Why Case Studies Matter**: Real attacks feel abstract when described in theory. Walking through an actual breach step by step reveals *exactly* where human decisions, system failures, and missed opportunities converged to create disaster.

## Recap: What Happened to Lisa

Lisa Mendez was an HR manager at a mid-sized investment firm. After attending a virtual HR tech webinar, she received a warm follow-up email from an apparent attendee, containing an Excel file called *"HR Connect, Final Attendee List.xlsx."*

She opened it. She enabled macros.

A Remote Access Trojan (RAT) silently installed itself. Over the next week, attackers used her credentials to navigate internal systems, locate client financial data, and trigger $4.3 million in fraudulent wire transfers.

# Applying the Kill Chain: Phase by Phase

### Phase 1: Reconnaissance
**What happened**: Attackers researched Lisa's job role, her webinar attendance, and her professional network — likely through LinkedIn and the company's public website.

**What they learned**: Lisa's role, her interest in digital transformation, and the fact she'd recently attended a networking event where she'd be expecting follow-up emails.

**The missed opportunity**: The firm had no policy limiting employee public social media exposure related to work. No one was trained on the social engineering risk of sharing attendance at professional events.


### Phase 2: Weaponization
**What happened**: Attackers created a convincing Excel file with malicious macros embedded — designed to look like an attendee list from the webinar.

**Why it was so effective**: The file format (Excel), the context (webinar follow-up), and the content (attendee list) all made perfect sense. There were no obvious red flags.

**The missed opportunity**: The firm lacked automatic scanning of outbound links and attachments for suspicious payloads in incoming emails.


### Phase 3: Delivery
**What happened**: The email arrived at precisely the right psychological moment — right after the webinar, when Lisa was energised, grateful, and expecting contact from new connections.

**Why it worked**: Attackers timed the message to exploit Lisa's emotional state and the plausibility of the context. Social engineering exploits *trust*, and trust was at its peak.

**The missed opportunity**: No cultural training existed around the concept that high-trust moments (after conferences, during exciting projects) are when people are *most* vulnerable to social engineering.


### Phase 4: Exploitation
**What happened**: Lisa opened the file and enabled macros when prompted.

**Why she did it**: The prompt looked routine — "Enable macros to view the full sheet" is a common request for Excel files. She had no reason to suspect it was malicious.

**The missed opportunity**: The organisation had not disabled macro auto-execution across its systems. A simple technical control would have prevented this step from working.


### Phase 5: Installation
**What happened**: The RAT installed silently and persistently on Lisa's machine, creating a backdoor that would survive reboots and remain undetected.

**Why it wasn't caught**: Without endpoint detection tools specifically looking for RAT behaviour (unusual outbound connections, file access patterns), the installation went unnoticed.

**The missed opportunity**: Modern Endpoint Detection and Response (EDR) software would likely have flagged this behaviour.


### Phase 6: Command & Control
**What happened**: Attackers remotely accessed Lisa's machine and credentials over the course of a week, quietly exploring internal systems.

**Why it took so long to detect**: No one was monitoring for unusual login patterns or access from unexpected geographic locations.

**The missed opportunity**: A simple alert — *"Login from unfamiliar IP address"* — would have triggered investigation before any damage occurred.


### Phase 7: Actions on Objectives
**What happened**: Attackers found client financial data and exploited Lisa's trusted internal access to submit fraudulent wire transfer requests to the finance team.

**Why finance approved it**: The requests came through Lisa's internal account, using familiar internal processes. They appeared legitimate.

**The missed opportunity**: Any significant financial transaction should require *multi-person authorisation* — at minimum, a callback to the requestor through a verified channel.

## The Complete Kill Chain Mapped

| Phase | The Attack | The Defence That Was Missing |
|-------|-----------|------------------------------|
| Reconnaissance | Found Lisa via LinkedIn, webinar records | Social media hygiene training |
| Weaponization | Built infected Excel file | Email payload scanning |
| Delivery | Sent at high-trust moment | Verification culture training |
| Exploitation | Lisa enabled macros | Macro auto-execution disabled |
| Installation | RAT installed silently | EDR software |
| Command & Control | Week-long silent access | Login anomaly detection |
| Actions | $4.3M transferred out | Multi-person financial authorisation |

# What Would Have Stopped This?

Any *single* one of these interventions would likely have broken the kill chain:

1. **Social media hygiene training** → Attackers couldn't have identified Lisa as a target
2. **Email payload scanning** → The infected Excel file would have been caught
3. **Macro execution disabled** → The RAT couldn't have installed
4. **EDR software** → The RAT's behaviour would have been flagged
5. **Anomaly detection** → The unusual login from offshore would have triggered an alert
6. **Multi-person wire authorisation** → The fraudulent transfers would have required independent verification

> ⚠️ **The Key Lesson**: Security is not about having one perfect defence. It's about having *multiple layers* so that when any single layer fails (and they will), the attack is caught at the next layer.

## Applying This to the AI Era

Lisa's case was a "classic" cyberattack. But the same kill chain framework applies to modern AI-era threats:

| AI Threat | Kill Chain Application |
|-----------|----------------------|
| **Deepfake executive video** | Delivery phase — exploiting trust in visual media |
| **Voice clone phone call** | Delivery + Exploitation — bypassing human verification |
| **Prompt injection on AI agent** | Exploitation phase — attacking AI decision logic |
| **AI-generated phishing at scale** | Weaponization — automated, personalised attack creation |

# Key Takeaways

- The **Cyber Kill Chain** is a powerful tool for *post-analysis* of what went wrong and *proactive planning* for what to prevent
- Lisa's case shows that most breaches involve **multiple missed opportunities** — any one of which could have stopped the attack
- **Layered security** (technical + human + process) is more resilient than relying on any single defence
- The same framework applies to AI-era threats — deepfakes, prompt injection, and AI-powered phishing all have kill chain phases where intervention is possible
- **Speed matters**: The sooner in the kill chain you detect and interrupt an attack, the less damage it causes
- Culture is a defence: a team that *asks questions* and *verifies unexpected requests* is harder to attack than one that defaults to trust
