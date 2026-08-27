# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# React Native Reusables first

- Before implementing a UI primitive, check both `src/components/ui` and the React Native Reusables component catalog at https://reactnativereusables.com/docs/components.
- If React Native Reusables provides the component and it is not installed, install it with its CLI and compose it into the feature. Do not hand-roll an equivalent basic component.
- The default installed set is: Text, Button, Input, Textarea, Label, Card, Badge, Separator, Skeleton, Alert, and Progress.
- Add other React Native Reusables components on demand as the product grows; do not install the entire registry preemptively.
- Custom components are for NOOVELLER-specific composite UI and domain behavior. Build them from the reusable primitives whenever possible.
- Keep one-off screen styling out of generated primitives. Prefer composition and variants; change a shared primitive only when the design-system behavior should change everywhere.
