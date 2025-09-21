# TestSprite MCP Server Installation Complete! 🎉

## ✅ Installation Status
- **Package**: @testsprite/testsprite-mcp@0.0.13
- **Status**: Successfully installed globally
- **Command**: Available via `npx @testsprite/testsprite-mcp@latest`

## 🔑 API Key Required
Before using TestSprite MCP, you need to get an API key:
1. Visit: https://docs.testsprite.com/web-portal/api-keys
2. Sign up/login to TestSprite
3. Generate an API key
4. Use it in the configuration below

## 🛠️ IDE Configuration

### For Claude Code (Recommended)
Run this command in your project directory:
```bash
claude mcp add --env API_KEY=your_api_key -- npx @testsprite/testsprite-mcp@latest
```

### For VS Code
Add this to your MCP settings:
```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### For Other IDEs
Use this configuration:
```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

## 🧪 Testing the Installation

### 1. Verify MCP Server
Run this command to verify:
```bash
claude mcp list
```

You should see:
```
TestSprite: npx @testsprite/testsprite-mcp@latest - ✓ Connected
```

### 2. Test with AI Assistant
Try prompting your AI assistant:
```
Help me test this project with TestSprite.
```

The assistant should offer to use TestSprite MCP tools.

## 🎯 What TestSprite MCP Does

TestSprite MCP Server turns your IDE's AI assistant into a fully autonomous testing agent that can:

- **Generate Tests**: Create comprehensive test suites for your code
- **Execute Tests**: Run tests and analyze results
- **Debug Issues**: Identify and help fix test failures
- **Code Analysis**: Analyze code quality and suggest improvements
- **Test Reports**: Generate detailed testing reports

## 🚀 Quick Start

1. **Get API Key**: Visit TestSprite portal and generate an API key
2. **Configure IDE**: Add the MCP server configuration with your API key
3. **Test Integration**: Ask your AI assistant to help test your project
4. **Start Testing**: Let TestSprite analyze and test your code automatically

## 📁 Current Project
TestSprite MCP is now available for the HeartVoice Monitor project in:
- **Directory**: `/mnt/c/Users/jeffr/Downloads/CHF-working`
- **Project**: Heart failure monitoring voice biomarker platform
- **Tech Stack**: Next.js, TypeScript, Node.js

## 🔧 Troubleshooting

### Common Issues:
1. **"Command not found"**: Make sure npx is available and the package is installed
2. **"API key invalid"**: Verify your API key from TestSprite portal
3. **"Connection failed"**: Check network connectivity and firewall settings

### Verification Commands:
```bash
# Check if package is installed
npm list -g @testsprite/testsprite-mcp

# Test the command
npx @testsprite/testsprite-mcp@latest --help

# Check MCP server status (if using Claude Code)
claude mcp list
```

## 📚 Next Steps

1. **Get your API key** from TestSprite portal
2. **Configure your IDE** with the MCP server settings
3. **Test the integration** by asking your AI assistant to help with testing
4. **Start using TestSprite** to improve your code quality and testing coverage

The TestSprite MCP server is now ready to boost your AI coding accuracy to over 90%! 🚀
