# Terminal Best Practices

Guidelines to avoid terminal hang-ups and ensure smooth command execution during development and deployment.

## 🚨 Common Terminal Hang-Up Scenarios

### 1. Multi-line Echo Commands
**❌ AVOID:**
```bash
echo "Line 1
Line 2 with 'quotes'
Line 3"
```
**Problem:** Unclosed quotes create `dquote>` prompt hang-ups

**✅ USE INSTEAD:**
```bash
# Option A: Separate echo statements
echo "Line 1"
echo "Line 2 with quotes"
echo "Line 3"

# Option B: Heredoc with cat
cat << 'EOF'
Line 1
Line 2 with 'quotes'
Line 3
EOF
```

### 2. Interactive Commands
**❌ AVOID:**
```bash
npm install          # May prompt for input
git push            # May ask for credentials
rm -rf folder       # May ask for confirmation
```

**✅ USE INSTEAD:**
```bash
npm install --yes
git push --force-with-lease
rm -rf folder --force
```

### 3. Pager Commands
**❌ AVOID:**
```bash
git log             # Opens pager that can hang
man command         # Opens manual pager
less file.txt       # Interactive pager
```

**✅ USE INSTEAD:**
```bash
git log | cat
man command | cat
cat file.txt
```

### 4. Long-Running Commands
**❌ AVOID:**
```bash
docker build .                    # Blocks terminal
yarn install                      # Long running, blocks
npm run dev                       # Runs indefinitely
```

**✅ USE INSTEAD:**
```bash
docker build . &                  # Background
yarn install --silent            # Less verbose
npm run dev > /dev/null 2>&1 &   # Background with output redirect
```

## 🛡️ Safe Command Patterns

### Quote Handling
```bash
# Safe quote patterns
echo 'Single quotes prevent expansion'
echo "Double quotes allow \$variables"
echo "Mixed 'quotes' need careful escaping"

# Complex strings - use variables
MSG="Complex message with 'quotes' and $variables"
echo "$MSG"
```

### Command Chaining
```bash
# ❌ Long chains can break mid-way
command1 && command2 && command3 && command4

# ✅ Break into steps with error checking
command1 || exit 1
command2 || exit 1
command3 || exit 1
command4 || exit 1
```

### File Operations
```bash
# ✅ Safe file operations
[ -f "file.txt" ] && rm "file.txt"        # Check before delete
mkdir -p "directory"                       # No error if exists
cp "source" "dest" 2>/dev/null || true    # Ignore errors if needed
```

### Network/Database Commands
```bash
# ✅ Add timeouts to prevent hangs
curl --max-time 30 "https://api.example.com"
psql --command="SELECT 1;" --quiet
ssh -o ConnectTimeout=10 user@host
```

## 🔧 Recovery Techniques

### When Terminal Hangs
1. **Ctrl+C** - Interrupt current command
2. **Ctrl+D** - Send EOF (end of file)
3. **Ctrl+Z** - Suspend process
4. **ESC** - Sometimes helps with prompt issues
5. **Type `exit` or `quit`** - For interactive programs

### Clear Terminal State
```bash
# Reset terminal if things get weird
reset
# Or
tput reset
# Or
clear && printf '\e[3J'
```

### Kill Hung Processes
```bash
# Find and kill process
ps aux | grep process_name
kill -9 PID

# Kill by name
pkill -f "process_name"
```

## 📋 Pre-Command Checklist

Before running complex commands:

- [ ] **Check for interactive prompts** - Add non-interactive flags
- [ ] **Test quote escaping** - Verify nested quotes work
- [ ] **Add timeouts** - For network/database operations
- [ ] **Plan error handling** - What happens if it fails?
- [ ] **Consider background execution** - For long-running tasks
- [ ] **Test in isolation** - Try command parts separately first

## 🚀 Deployment-Safe Patterns

### Environment Setup
```bash
# ✅ Safe environment variable handling
export VAR="${VAR:-default_value}"
[ -z "$REQUIRED_VAR" ] && { echo "ERROR: REQUIRED_VAR not set"; exit 1; }
```

### Database Operations
```bash
# ✅ Safe database commands
psql "$DATABASE_URL" --command="SELECT 1;" --quiet --tuples-only
# Add connection timeout
psql "$DATABASE_URL" --command="SELECT 1;" --quiet --set=ON_ERROR_STOP=1
```

### File Transfers
```bash
# ✅ Safe file operations with verification
rsync -av --timeout=300 source/ dest/
scp -o ConnectTimeout=30 file user@host:/path/
```

## 🔍 Debugging Commands

### Safe Ways to Inspect State
```bash
# Check what's running
ps aux | head -20
jobs -l

# Check file system
ls -la | head -10
df -h

# Check network
netstat -tuln | head -10
```

### Log Everything Important
```bash
# Capture output safely
command 2>&1 | tee output.log
command > output.log 2>&1 &  # Background with logging
```

## ⚠️ Emergency Procedures

### If Terminal Completely Hangs
1. **Open new terminal window/tab**
2. **Find hung process:** `ps aux | grep bash`
3. **Kill hung terminal:** `kill -9 PID`
4. **Clean up any background processes**

### If SSH/Remote Session Hangs
1. **Try escape sequence:** `~.` (tilde dot)
2. **Open new SSH session**
3. **Kill hung session from new session**
4. **Check for network issues**

## 📝 Script Writing Guidelines

### Safe Script Headers
```bash
#!/bin/bash
set -e          # Exit on any error
set -u          # Exit on undefined variable
set -o pipefail # Exit on pipe failure

# Trap cleanup on exit
trap 'echo "Script interrupted"; exit 1' INT TERM
```

### Safe User Input
```bash
# ✅ Safe prompts with timeout
read -t 30 -p "Continue? (y/N): " -n 1 -r
echo
[[ ! $REPLY =~ ^[Yy]$ ]] && exit 1

# ✅ Default to safe option
read -p "Delete files? (y/N): " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && rm -rf files/
```

## 🎯 Key Takeaways

1. **Keep commands simple** - Complex one-liners are error-prone
2. **Always plan for failure** - What happens when commands fail?
3. **Test interactively first** - Before putting in scripts
4. **Use timeouts** - Prevent infinite hangs
5. **Background long tasks** - Don't block the terminal
6. **Document recovery steps** - How to get unstuck
7. **Practice safe quoting** - Avoid quote-related hangs

---

**Remember:** When in doubt, break it down into smaller, testable commands. It's better to have 5 simple commands than 1 complex command that hangs the terminal during a critical deployment.