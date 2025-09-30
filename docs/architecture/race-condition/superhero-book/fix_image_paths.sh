#!/bin/bash
# Fix image paths in superhero book markdown files

echo "🔧 Fixing image paths in superhero book markdown files..."

# Fix character references in README
sed -i 's|images/characters/captain-architecture-hero\.png|images/characters/captain-architecture-portrait.png|g' README.md
sed -i 's|images/characters/subtask-handler-villain\.png|images/characters/subtask-handler-portrait.png|g' README.md

# Fix chapter cover images - update from chapters/ to covers/
sed -i 's|images/chapters/prologue-hero-origin\.png|images/covers/prologue-cover.png|g' prologue.md
sed -i 's|images/chapters/epilogue-heros-wisdom\.png|images/covers/epilogue-cover.png|g' epilogue.md

# Fix part chapter images - update from chapters/ to covers/
sed -i 's|\.\./images/chapters/chapter1-mysterious-bug\.png|../images/covers/part1-cover.png|g' part1/chapter1.md
sed -i 's|\.\./images/chapters/chapter2-investigation\.png|../images/scenes/part1-scene-01.png|g' part1/chapter2.md
sed -i 's|\.\./images/chapters/chapter3-red-herring\.png|../images/scenes/part1-scene-02.png|g' part1/chapter3.md

sed -i 's|\.\./images/chapters/chapter4-task-vs-session\.png|../images/covers/part2-cover.png|g' part2/chapter4.md
sed -i 's|\.\./images/chapters/chapter5-subtask-handler-secret\.png|../images/scenes/part2-scene-01.png|g' part2/chapter5.md
sed -i 's|\.\./images/chapters/chapter6-state-management-nightmare\.png|../images/scenes/part2-scene-01.png|g' part2/chapter6.md

sed -i 's|\.\./images/chapters/chapter7-truth-about-race-conditions\.png|../images/covers/part3-cover.png|g' part3/chapter7.md
sed -i 's|\.\./images/chapters/chapter8-redundant-condition-discovery\.png|../images/scenes/part3-scene-01.png|g' part3/chapter8.md
sed -i 's|\.\./images/chapters/chapter9-missing-property-mystery\.png|../images/scenes/part3-scene-01.png|g' part3/chapter9.md

sed -i 's|\.\./images/chapters/chapter10-clean-architecture-vision\.png|../images/scenes/part4-scene-01.png|g' part4/chapter10.md
sed -i 's|\.\./images/chapters/chapter11-implementation-plan\.png|../images/scenes/part4-scene-01.png|g' part4/chapter11.md
sed -i 's|\.\./images/chapters/chapter12-heros-victory\.png|../images/scenes/epilogue-scene-01.png|g' part4/chapter12.md

echo "✅ Image paths fixed!"
