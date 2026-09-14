import re

with open('src/index.css', 'r') as f:
    css = f.read()

# Tone down spacing globally
css = css.replace('padding: 12rem 3rem;', 'padding: 6rem 1.5rem;')
css = css.replace('padding: 10rem 3rem;', 'padding: 5rem 1.5rem;')
css = css.replace('padding: 8rem 3rem;', 'padding: 5rem 1.5rem;')
css = css.replace('padding: 6rem 0;', 'padding: 3rem 0;')
css = css.replace('padding: 0 3rem 4.5rem;', 'padding: 0 1.5rem 2.5rem;')

# For App.tsx Nav
with open('src/App.tsx', 'r') as f:
    app = f.read()

# Remove the backdrop filter scroll trigger from Nav
app = re.sub(r'ScrollTrigger\.create\(\{\n\s*start: \'top -80\',\n\s*onToggle: \(self\) => \{\n\s*gsap\.to\(navRef\.current, \{\n\s*backdropFilter:.*?\n\s*background:.*?\n\s*duration: \.4,\n\s*\}\);\n\s*\},\n\s*\}\);', '', app, flags=re.DOTALL)

with open('src/index.css', 'w') as f:
    f.write(css)

with open('src/App.tsx', 'w') as f:
    f.write(app)

print("Spacing toned down and Nav simplified!")
