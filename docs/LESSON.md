# How to Build an MVP with Claude Code Subagents (The Right Way)

## Episode 10: From PRD to Working Prototype

---

## 🎯 What You'll Learn Today

Stop building 40-50 agent teams that conflict with each other. In this tutorial, I'll show you the **5-phase pattern** that actually works for Claude Code subagents - the same pattern I used to build a complete YouTube Social Proof Widget in under an hour.

### The App We're Building

- **YouTube Social Proof Widget**: Takes any YouTube URL and generates an embeddable widget
- **Real API Integrations**: YouTube Data API v3 + OpenAI GPT-3.5 sentiment analysis
- **Production Features**: Caching, embed codes, responsive design
- **Total Build Time**: 47 minutes from PRD to working MVP

---

## 📚 The Problem with Most Subagent Approaches

I'm sure you've seen those repositories showing "how to replace an entire dev team with 40-50 subagent types."

**Here's the reality**: If you actually dive deeper, you'll quickly realize it's not practical for day-to-day use.

### What People Do Wrong:

- ❌ Running dozens of agents that fight for context
- ❌ No orchestrator to coordinate outputs
- ❌ Mixing design and implementation phases
- ❌ Sequential execution when parallel would work
- ❌ No persistent memory strategy (agents can't share context!)

### What Actually Works:

✅ **One orchestrator** managing specialized agents  
✅ **Complete separation** of design and implementation  
✅ **Parallel execution** where possible  
✅ **Filesystem outputs** for persistent memory  
✅ **5-phase pattern** with clear dependencies

---

## 🏗️ The 5-Phase Pattern Explained

```
Phase 1: Orchestrator Init → Project structure
Phase 2: UI Designer → Wireframes & specs
Phase 3: Parallel Agents → Run simultaneously!
         ├── shadcn-expert
         ├── youtube-api-expert
         └── chatgpt-expert
Phase 4: System Architect → Synthesis
Phase 5: Implementation → Separate agents
```

**Key Insight**: Phases 1, 2, 4, 5 run sequentially (they have dependencies). Phase 3 runs in parallel (independent agents).

---

## 🎬 Step-by-Step Tutorial

### Step 1: Creating the PRD (The Smart Way)

Don't ask Claude to "create a PRD" directly - that usually gives you something impractical.

**The 2-Stage Method:**

1. **First**: Ask Claude to optimize a prompt for PRD creation

   ```
   "Optimize a prompt for me that will be used for generating a PRD for building a web app..."
   ```

2. **Second**: Iterate on the prompt (not the PRD!)

   ```
   "Consider the prompt and how I can include the ability for my app to provide embed widgets..."
   ```

3. **Finally**: Pass the optimized prompt to a PRD writer agent

This approach gives you a much more robust, implementation-ready PRD.

### Step 2: The Design Phase

Use the `/design-app` command with your PRD:

```bash
/design-app path/to/prd.md
```

**What happens:**

1. Orchestrator creates project structure and manifest
2. UI Designer creates wireframes and design specs
3. Multiple agents run IN PARALLEL:
   - shadcn-expert selects components
   - youtube-api-expert plans integration
   - chatgpt-expert designs sentiment analysis
4. System architect synthesizes everything
5. Orchestrator validates against PRD requirements

**Output**: Complete design specifications in `.claude/outputs/design/`

### Step 3: The Implementation Phase

Use the `/implement-app` command with design outputs:

```bash
/implement-app .claude/outputs/design/[project-folder] ./app
```

**What happens:**

- Reads all design specifications from manifest
- Uses different implementation agents
- Builds the actual application
- Tests and validates against requirements

---

## 🔧 Real Issues You'll Hit (And How to Fix Them)

### Issue 1: API Wiring Problems

**What happened**: Claude built all the components but forgot to wire up API calls  
**Fix**: One prompt to connect the rendering logic to actual API responses

### Issue 2: Next.js 15 Breaking Changes

**What happened**: Dynamic routes changed in Next.js 15  
**Fix**: Update params to use Promise pattern:

```typescript
// Before
params: {
  id: string;
}
// After
params: Promise<{ id: string }>;
```

### Issue 3: Mock Data vs Real Data

**What happened**: Widget showed mock data instead of real API data  
**Fix**: Ensure API routes are properly connected to frontend components

**Pro Tip**: Expect 2-3 prompts to fix wiring issues. This is normal!

---

## 💡 Key Patterns for Success

### Pattern 1: Filesystem as Memory

Subagents start with blank context. They MUST write outputs to filesystem:

```
.claude/outputs/design/
├── agents/
│   ├── ui-designer/
│   ├── shadcn-expert/
│   └── youtube-api-expert/
└── projects/
    └── [project-name]/
        └── MANIFEST.md
```

### Pattern 2: Orchestrator Coordination

The orchestrator doesn't do the work - it coordinates:

- Initializes project structure
- Manages where outputs go
- Validates completeness
- Synthesizes results

### Pattern 3: Complete Separation

**Design Phase**: No implementation, only planning  
**Implementation Phase**: No redesign, only building

This prevents context pollution and conflicts.

---

## 🚀 Your Action Items

### 1. Get the Resources

- **AI Insiders Club** (FREE): Full lesson plans, source code, PRD templates
- **Claude Code Builder Pack**: All subagents, commands, and design outputs

### 2. Try the Pattern

Start with a simple app:

1. Create PRD using 2-stage method
2. Run design phase with parallel agents
3. Implement with complete separation
4. Expect 2-3 fix prompts (normal!)

### 3. Iterate Your Agents

- Don't expect perfection first try
- Update agent prompts based on failures
- Add specialized agents as needed (I added nextjs-expert after hitting Next.js 15 issues)

---

## 📊 Results You Can Expect

With this pattern, I achieved:

- **Development Time**: <1 hour from PRD to MVP
- **Design Phase**: ~15 minutes
- **Implementation**: ~30 minutes
- **Bug Fixes**: 2 prompts (~5 minutes)
- **API Costs**: <$0.02 per widget (with caching)

---

## 🎯 The Bottom Line

> "The best Claude Code workflows separate thinking (design) from doing (implementation), just like the best human workflows do."

You don't need 50 agents. You need the RIGHT pattern with 5-10 specialized agents working in coordination.

**Remember**:

- One orchestrator to rule them all
- Parallel where possible, sequential where necessary
- Filesystem for memory, not context sharing
- Complete separation of design and implementation
- Iterate and improve your agents over time

---

## Next Steps

1. **Watch the full tutorial** for the complete walkthrough
2. **Join AI Insiders Club** for the PRD template and source code
3. **Try the pattern** on your own project
4. **Share your results** - what did you build?

Ready to build your MVP the right way? Let's go! 🚀

---
