---
name: bash-safety
description: Enforce safe, read-only Unix text tools for file inspection in bash. Use whenever inspecting, viewing, or reading file contents in the shell.
---

# Bash File Inspection Safety

When inspecting or viewing file contents in bash, always prefer read-only Unix
text tools so commands can be auto-accepted without manual security review.

## Preferred tools (in order)
`sed`, `grep`, `awk`, `head`, `tail`, `cat`, `cut`, `wc`, `strings`

## Never use for file viewing
`node -e`, `python -c`, `perl -e`, or any piped interpreter one-liner.

## Examples

✅ Do this:
```bash
sed -n '/SomeComponent =/,+30p' "$FILE"
grep -n "export default" "$FILE"
head -100 "$FILE"
```

❌ Not this:
```bash
cat file.js | node -e "const data = require('fs').readFileSync('/dev/stdin', 'utf8'); ..."
```

## Exception
If a task genuinely cannot be done with standard Unix tools, say so explicitly
before using an interpreter, and keep the command minimal and transparent.
