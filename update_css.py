import re

with open('src/index.css', 'r') as f:
    css = f.read()

# 1. Remove tokens
css = re.sub(r'\s*--purple:.*?;', '', css)
css = re.sub(r'\s*--cyan:.*?;', '', css)

# 2. General color replacements
css = css.replace('var(--purple)', 'var(--text)')
css = css.replace('var(--cyan)', 'var(--text)')

# 3. rgba replacements for nav-cta hover
css = css.replace('rgba(126,20,255,.1)', 'rgba(255,255,255,.1)')
# and live badge
css = css.replace('rgba(71,191,255,.25)', 'var(--border)')
css = css.replace('rgba(71,191,255,.05)', 'rgba(255,255,255,.02)')

# 4. Fix selection colors
css = css.replace('::selection { background: var(--text); color: #fff; }', '::selection { background: var(--text); color: #0e0e0c; }')

# 5. Fix button text colors (hero-cta, btn-primary)
# They were `color: #fff;` and now background is `var(--text)`. So we need `color: var(--bg);` or `#0e0e0c;`
css = re.sub(r'(\.hero-cta\s*\{[^}]*)color:\s*#fff;', r'\1color: var(--bg);', css)
css = re.sub(r'(\.btn-primary\s*\{[^}]*)color:\s*#fff;', r'\1color: var(--bg);', css)

# Fix hero-cta hover (was #9333ff)
css = css.replace('background: #9333ff;', 'background: #ffffff;')

# Fix btn-primary hover
css = css.replace('.btn-primary:hover { background: #9333ff;', '.btn-primary:hover { background: #ffffff;')

# 6. Delete glow orb classes
css = re.sub(r'\.glow-orb.*?\n}', '', css, flags=re.DOTALL)
css = re.sub(r'@keyframes orbFloat.*?}', '', css, flags=re.DOTALL)

with open('src/index.css', 'w') as f:
    f.write(css)

print("CSS updated successfully!")
