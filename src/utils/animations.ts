
// Simple animation utility using CSS transitions instead of framer-motion
export const fadeIn = {
  className: "transition-opacity duration-300 ease-in-out",
  initial: "opacity-0",
  animate: "opacity-100",
  exit: "opacity-0"
};

export const slideUp = {
  className: "transition-all duration-300 ease-in-out transform",
  initial: "translate-y-4 opacity-0",
  animate: "translate-y-0 opacity-100",
  exit: "translate-y-4 opacity-0"
};

// Helper function to apply animation classes based on state
export const applyAnimation = (animation: any, state: 'initial' | 'animate' | 'exit') => {
  const baseClass = animation.className;
  const stateClass = animation[state].replace(/-/g, '-');
  return `${baseClass} ${stateClass}`;
};
