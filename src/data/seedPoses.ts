// Starter pose vocabulary — covers common vinyasa/hatha basics per the
// ideation doc's recommendation to start with ~40-60 poses rather than
// trying to match a mature pose-library competitor (Tummee, FLOW, etc.)
// on day one. This is a small seed set (10) to exercise the Sequence
// Builder UI; expand via the real pose library workstream later.

import { Pose } from "../types";

export const seedPoses: Pose[] = [
  { id: "pose-mountain", nameEn: "Mountain Pose", nameSanskrit: "Tadasana", category: "standing", defaultDurationSec: 20 },
  { id: "pose-down-dog", nameEn: "Downward Dog", nameSanskrit: "Adho Mukha Svanasana", category: "inversion", defaultDurationSec: 30 },
  { id: "pose-warrior-1", nameEn: "Warrior I", nameSanskrit: "Virabhadrasana I", category: "standing", defaultDurationSec: 30 },
  { id: "pose-warrior-2", nameEn: "Warrior II", nameSanskrit: "Virabhadrasana II", category: "standing", defaultDurationSec: 30 },
  { id: "pose-triangle", nameEn: "Triangle Pose", nameSanskrit: "Trikonasana", category: "standing", defaultDurationSec: 30 },
  { id: "pose-chair", nameEn: "Chair Pose", nameSanskrit: "Utkatasana", category: "standing", defaultDurationSec: 20 },
  { id: "pose-cobra", nameEn: "Cobra Pose", nameSanskrit: "Bhujangasana", category: "backbend", defaultDurationSec: 20 },
  { id: "pose-childs", nameEn: "Child's Pose", nameSanskrit: "Balasana", category: "seated", defaultDurationSec: 45 },
  { id: "pose-tree", nameEn: "Tree Pose", nameSanskrit: "Vrksasana", category: "standing", defaultDurationSec: 30 },
  { id: "pose-camel", nameEn: "Camel Pose", nameSanskrit: "Ustrasana", category: "backbend", defaultDurationSec: 20 },
];
