interface ExplodeEmojiConfig {
  emoji: string;
  fontSize: string;
  origin: { x: number; y: number };
  count?: number;
  onComplete?: () => void;
}

export function exlpodeEmoji({
  emoji,
  fontSize,
  origin,
  count = 5,
  onComplete = () => {},
}: ExplodeEmojiConfig) {
  const gravity = 2.5; // pixel/s^2
  const xDrag = 0.75; // pixel/s^2

  // Create a wrapper for the emoji to explode
  const emojiWrapper = document.createElement("div");
  emojiWrapper.style.overflow = "hidden";
  emojiWrapper.style.position = "absolute";
  emojiWrapper.style.left = "0px";
  emojiWrapper.style.top = "0px";
  emojiWrapper.style.right = "0px";
  emojiWrapper.style.bottom = "0px";
  document.body.appendChild(emojiWrapper);

  // Create the emoji elements and generate random impulses
  const emojis = Array(count)
    .fill(emoji)
    .map<{ p: HTMLParagraphElement; impulse: { x: number; y: number } }>(
      (emoji) => {
        // Create element for emoji
        const p = document.createElement("p");
        p.textContent = emoji;
        p.style.fontSize = fontSize;

        // Set initial position
        p.style.position = "absolute";
        p.style.left = `${origin.x}px`;
        p.style.top = `${origin.y}px`;

        // Set physics attributes
        const impulseX =
          (2 * Math.random() + 4) * (Math.random() < 0.5 ? -1 : 1); // pixel/s
        const impulseY = -10 * Math.random(); // pixel/s

        // Add element to the wrapper
        emojiWrapper.appendChild(p);

        return { p, impulse: { x: impulseX, y: impulseY } };
      }
    );

  let exploding = count;
  let deltaTime = 0; // s
  const tick = setInterval(() => {
    emojis.forEach(({ p, impulse }, i) => {
      // Skip if element has already finished its arc and been removed
      if (!emojiWrapper.contains(p)) {
        return;
      }

      // calculate next position
      const directionalDragX = (impulse.x > 0 ? -1 : 1) * xDrag;
      let nextXVelocity = impulse.x + directionalDragX * deltaTime;
      if (
        (nextXVelocity < 0 && impulse.x > 0) ||
        (nextXVelocity > 0 && impulse.x < 0)
      ) {
        nextXVelocity = 0;
      }
      const nextX = p.getBoundingClientRect().x + nextXVelocity * deltaTime;
      const nextY =
        p.getBoundingClientRect().y +
        (impulse.y + gravity * deltaTime) * deltaTime;

      // remove the element if it will go off screen this frame
      if (nextY > window.innerHeight) {
        p.remove();
        --exploding;

        // clean up the wrapper and kill the interval if all explosions have finished
        if (exploding === 0) {
          emojiWrapper.remove();
          onComplete();
          clearInterval(tick);
        }

        // No need to update the position since this element is now off screen
        return;
      }

      // set next position
      p.style.left = `${nextX}px`;
      p.style.top = `${nextY}px`;

      // Update delta time
      deltaTime += 0.01;
    });
  }, 10);
}
