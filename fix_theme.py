import re

with open('src/index.css', 'r') as f:
    css = f.read()

# 1. Replace the root variables entirely
root_pattern = r':root\s*\{[^}]*\}'
new_root = """:root {
  --bg: #f8f7f4;
  --surface: #f5f3ef;
  --border: #dad6cc;
  --text: #1a1a18;
  --muted: #696762;
  --brand: #1a1a18;
  --brand-hover: #3c3c38;
  
  --t-xs: .75rem;
  --t-sm: .875rem;
  --t-base: 1rem;
  --t-lg: 1.25rem;
  --t-xl: clamp(1.5rem, 3vw, 2rem);
  --t-2xl: clamp(2rem, 4vw, 3rem);
  --t-3xl: clamp(2.5rem, 6vw, 4rem);
  --t-4xl: clamp(3rem, 8vw, 6rem);
}"""
css = re.sub(root_pattern, new_root, css)

# 2. Fix hs-canvas-fade gradient to use the new light bg color (#f8f7f4 -> 248, 247, 244)
css = css.replace('rgba(14,14,12', 'rgba(248,247,244')

# 3. Clean up the glow orbs completely
css = re.sub(r'/\*\s*─── Glow Orbs.*?(?=\/\*|$)', '', css, flags=re.DOTALL)
# if they are not at the end:
css = re.sub(r'\.glow-orb\b.*?\n}', '', css, flags=re.DOTALL)
css = re.sub(r'@keyframes orbFloat\b.*?\}', '', css, flags=re.DOTALL)

# 4. Global replacements for the old purple/cyan/text colors inside specific components
css = css.replace('var(--purple)', 'var(--brand)')
css = css.replace('var(--cyan)', 'var(--text)')

# Navigation
css = css.replace('.nav-cta a:hover { border-color: var(--brand); background: rgba(126,20,255,.1); }', '.nav-cta a:hover { border-color: var(--brand); background: rgba(26,26,24,.05); }')

# Selection & Scrollbar
css = css.replace('::selection { background: var(--brand); color: #fff; }', '::selection { background: var(--text); color: var(--bg); }')
css = css.replace('::-webkit-scrollbar-thumb { background: var(--brand); border-radius: 99px; }', '::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }')

# Hero CTA & Btn Primary
css = re.sub(r'(\.hero-cta\s*\{[^}]*)background:\s*var\(--brand\);\s*color:\s*#fff;', r'\1background: var(--brand);\n  color: var(--bg);', css)
css = re.sub(r'(\.hero-cta:hover\s*\{) background: #9333ff;', r'\1 background: var(--brand-hover);', css)

css = re.sub(r'(\.btn-primary\s*\{[^}]*)background:\s*var\(--brand\);\s*color:\s*#fff;', r'\1background: var(--brand);\n  color: var(--bg);', css)
css = re.sub(r'(\.btn-primary:hover\s*\{) background: #9333ff;', r'\1 background: var(--brand-hover);', css)

# Live badge (was using cyan and opacity)
css = re.sub(r'\.live-badge\s*\{[^}]*\}', 
""".live-badge {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .35rem 1rem;
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: var(--t-xs);
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--text);
  margin-bottom: 2.5rem;
  background: var(--surface);
}""", css)
css = re.sub(r'\.live-badge \.pulse\s*\{[^}]*\}',
""".live-badge .pulse {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--brand);
  animation: pulse 2s infinite;
}""", css)

# Fix title stroke for light theme (was -webkit-text-stroke: 1.5px rgba(240,236,228,.3); )
css = css.replace('-webkit-text-stroke: 1.5px rgba(240,236,228,.3)', '-webkit-text-stroke: 1.5px var(--border)')
# Also scrub big text stroke
css = css.replace('-webkit-text-stroke: 1px rgba(240,236,228,.15)', '-webkit-text-stroke: 1.5px var(--border)')

# Add grid lines/borders if needed (light theme often uses subtle borders)
css = css.replace('border: 1px solid rgba(255,255,255,.05)', 'border: 1px solid var(--border)')

# Footer border
css = css.replace('border-top: 1px solid var(--border)', 'border-top: 1px solid var(--border)')

# Make sure we don't have leftover --cyan references if any
css = css.replace('var(--cyan)', 'var(--text)')

# Write back
with open('src/index.css', 'w') as f:
    f.write(css)

print('Updated index.css for light theme!')
