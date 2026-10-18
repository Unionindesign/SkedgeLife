// Web (DOM) versions of the shared components, for apps/web. Same names and
// props as the React Native versions in ../index.ts, with the logic they share
// in ../shared. Import from "@skedgelife/ui/web".
export { ParallaxSection } from "./ParallaxSection";
export { Carousel } from "./Carousel";
export { TabsOrAccordion, type DisclosureItem } from "./TabsOrAccordion";
export { ExpandableText } from "./ExpandableText";
export { WIDE_SCREEN, collapseText, parallaxOffset } from "../shared/logic";
