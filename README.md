# 🚀 YouTube Social Proof Widget - Claude Code Builder Pack

**🎥 Watch the Episode** ► [How to Build an MVP with Claude Code Subagents (The Right Way)](https://www.youtube.com/watch?v=3564u77Vyqk)

Welcome Builder Pack owners! This is the **complete implementation** from Episode 5, demonstrating the powerful 5-phase subagent pattern that builds production-ready MVPs in under 1 hour.

## 📦 What's Included

✅ **Complete Working Application** - YouTube Social Proof Widget MVP  
✅ **All Subagents** - 8 specialized agents (orchestrator, ui-designer, shadcn-expert, etc.)  
✅ **Custom Commands** - `/design-app` and `/implement-app` commands  
✅ **Design Outputs** - All agent specifications from the design phase  
✅ **Full Source Code** - Next.js 15 app with YouTube + OpenAI integration  
✅ **PRD & Documentation** - Complete requirements and lesson materials  
✅ **Bug Fixes & Solutions** - All issues encountered and their fixes

---

## 🎯 Quick Start Guide

### 1. Install Claude Code Components

```bash
# Copy subagents to your Claude Code directory
cp -r .claude/agents/* ~/.config/claude/agents/

# Copy custom commands
cp -r .claude/commands/* ~/.config/claude/commands/
```

### 2. Set Up the Application

```bash
# Navigate to the app directory
cd app

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys:
# - YOUTUBE_API_KEY (get from Google Console)
# - OPENAI_API_KEY (get from OpenAI Platform)

# Run the application
npm run dev
```

### 3. Test the Widget

1. Open [http://localhost:3000](http://localhost:3000)
2. Paste a YouTube URL: `https://www.youtube.com/watch?v=fb19HiCb8xk`
3. Click "Generate Widget"
4. Copy the embed code and use it anywhere!

---

## 📁 Repository Structure

```
yt-social-proof/
├── 📁 .claude/                  # Claude Code Configuration
│   ├── agents/                  # All 8 subagents
│   │   ├── orchestrator.md     # Coordinates all agents
│   │   ├── ui-designer.md      # Creates wireframes
│   │   ├── shadcn-expert.md    # Component selection
│   │   ├── youtube-api-expert.md
│   │   ├── chatgpt-expert.md
│   │   └── ...
│   ├── commands/                # Custom commands
│   │   ├── dev/
│   │   │   ├── design-app.md   # Design phase command
│   │   │   └── implement-app.md # Implementation command
│   └── outputs/                 # Design phase outputs
│       └── design/
│           ├── agents/          # Individual agent outputs
│           └── projects/        # Project manifests
│
├── 📁 app/                      # Next.js Application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── lib/                # Core services
│   │   │   ├── youtube/        # YouTube API integration
│   │   │   └── openai/         # Sentiment analysis
│   │   └── types/              # TypeScript definitions
│   ├── .env.example            # Environment template
│   └── README.md               # App documentation
│
├── 📄 lesson.md                # Complete tutorial & lessons learned
├── 📄 docs/PRD.md             # Product Requirements Document
└── 📄 prompts/                 # Original prompts used

```

---

## 🔧 The 5-Phase Pattern Explained

This repository demonstrates the **subagent pattern** that actually works:

### Phase 1: Orchestrator Init

- Creates project structure
- Initializes MANIFEST.md
- Sets up agent registry

### Phase 2: UI Designer

- Creates wireframes
- Defines color palette (#1f4e79 trust blue)
- Establishes component hierarchy

### Phase 3: Parallel Agents (The Magic!)

All run simultaneously:

- **shadcn-expert**: Selects UI components
- **youtube-api-expert**: Plans API integration
- **chatgpt-expert**: Designs sentiment analysis
- **stagehand-expert**: Creates test specifications

### Phase 4: Synthesis

- Synthesizes all agent outputs
- Creates integration architecture
- Validates requirements coverage

### Phase 5: Implementation

- Separate agents build the actual app
- Follows design specifications exactly
- Produces working MVP

---

## 💡 Key Lessons & Patterns

### What Makes This Pattern Work

1. **Complete Separation**: Design and implementation never mix
2. **Filesystem Memory**: Agents write outputs to disk (not context)
3. **One Orchestrator**: Single coordinator, not 50 conflicting agents
4. **Parallel Execution**: Independent tasks run simultaneously
5. **Iterative Improvement**: Agent prompts improve with each use

### Common Issues & Solutions

All the bugs encountered and fixed are documented:

**Issue 1: OpenAI Response Format**

- Problem: Zod validation failures
- Solution: Explicit JSON examples in prompts
- File: `app/src/lib/openai/sentiment-service.ts`

**Issue 2: Next.js 15 Breaking Changes**

- Problem: Async params/searchParams required
- Solution: Updated to Promise patterns
- File: `app/src/app/widget/[id]/page.tsx`

**Issue 3: Port Configuration**

- Problem: Hardcoded port 3001
- Solution: Dynamic port detection
- Files: Multiple API routes

---

## 🚀 Next Steps for Builders

### Use This Pattern for Your Projects

1. **Start with the PRD template** in `prompts/`
2. **Customize the subagents** for your needs
3. **Run the 5-phase pattern** with your requirements
4. **Expect 2-3 fix prompts** (this is normal!)

### Extend the Application

- Add database persistence (Supabase/PostgreSQL)
- Implement user authentication
- Create widget analytics dashboard
- Support multiple languages
- Add webhook notifications

---

## 📚 Additional Resources

### Documentation

- `lesson.md` - Complete tutorial and architecture explanation
- `docs/PRD.md` - Product requirements document
- `app/README.md` - Application-specific documentation

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 💬 Get Help

- **GitHub Issues**: Report bugs or request features
- **X/Twitter**: [@chongdashu](https://x.com/chongdashu)
- **Website**: [aioriented.dev](https://aioriented.dev)

---

**Ready to build your MVP?** Follow the pattern, use the agents, and create something amazing! 🚀
