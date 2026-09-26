// Living placeholder data for the Instructor Profile / mini-site screens.
//
// This is REAL content from Michelle Scutti's 2017 "Wild Rose Yoga" site
// (see wild-rose-yoga-content-asset-reference.md), used here only as
// realistic seed data so the app has something true-to-life to render
// while the real backend/DB doesn't exist yet. It is not a design template —
// see the "classic-yoga" skin note in the reference doc for the one piece of
// visual design that IS intentionally being carried forward.

import {
  Instructor,
  ScheduleEntry,
  ServiceModality,
  PrivateSessionType,
  Testimonial,
  GalleryImage,
} from "@skedgelife/types";

export const seedInstructor: Instructor = {
  id: "instructor-seed-1",
  displayName: "Michelle Scutti",
  bioShort:
    "Southern California-based yoga & Thai massage instructor, teaching Vinyasa, Yin, Hot, and Kids Yoga.",
  bioLong:
    "Michelle Scutti is a Southern California native raising that good vibration on and off the mat. She stands in her truth and radiantly and authentically shines. She has been practicing yoga for 15 years and teaching for 11 years. Light on her feet, consistent in her optimism and strong in her practice, she completed her first RYT 200 hour training 2011 in Denver, Colorado. Following her dream of adventure and living a more simple life, she moved to Montezuma Costa Rica and offered classes in the style of Vinyasa, Yin and Thai Massage for Montezuma Yoga. She also offered Vinyasa classes at the gorgeous Ylang Ylang Beach Resort and Rancho Delicioso a Permaculture Farm for Anamaya Resort.\n\nNow back in Orange County Michelle is offering public and private classes in the style of Hot Power Fusion, Yin Yoga, Hot Yoga, Vinyasa, Meditation, and Kids Yoga. She is humbled to connect with this ancient lineage on a deeper level. Lately she is intrigued by and studying Tantric Vinyasa. Each class explores intelligent Vinyasa sequences guided by principles of alignment, pranayama, meditation, and other techniques for awakening our inner fire and stabilizing the mind. She infuses her classes with compassion, joy, and love. She looks forward to meeting you!",
  certifications: [
    "RYT-200 (Hot Yoga / Hot Power Fusion)",
    "RYT-200 (Power Vinyasa)",
    "Thai Yoga Massage Certificate, TTC Spa School (Chiang Mai, Thailand)",
  ],
  specialties: [
    "Vinyasa",
    "Yin",
    "Hot Power Fusion",
    "Meditation",
    "Kids Yoga",
    "Thai Yoga Massage",
  ],
  logoUrl: "instructor-seed/logo-MichelleRose.png",
  headshotUrl: "instructor-seed/bio-sqSmile.png",
  contact: {
    email: "michellescutti@gmail.com",
    phone: "720-291-1930",
    instagramHandle: "@Michelle84Mabelle",
  },
  skin: "classic-yoga",
};

export const seedSchedule: ScheduleEntry[] = [
  {
    id: "schedule-ra-yoga",
    instructorId: seedInstructor.id,
    venueName: "Ra Yoga — Mission Viejo Studio",
    bookingUrl: "https://rayoga.com/locations/Mission-Viejo/",
    times: [
      { day: "Friday", label: "5:30pm Intro to Level 2" },
      { day: "Friday", label: "7:30pm Hot Ra - Candlelit" },
      { day: "Saturday", label: "8:30am Hot Ra" },
      { day: "Saturday", label: "10:00am Intro to Level 2" },
    ],
  },
];

export const seedServiceModalities: ServiceModality[] = [
  {
    id: "svc-vinyasa",
    title: "Vinyasa",
    description:
      'Vinyasa yoga teaches us to cultivate an awareness that links each action to the next — both on the mat and in our lives. This rigorous, flow-style practice links breath to movement.',
  },
  {
    id: "svc-hot",
    title: "Hot",
    description:
      "A 90-minute series of 26 postures and 2 breathing exercises in a room heated to 105°F, designed to warm muscles, flush toxins, and increase circulation.",
  },
  {
    id: "svc-yin",
    title: "Yin",
    description:
      "Stretches the connective tissue around the joints (knees, pelvis, sacrum, spine), holding poses for up to six minutes with little to no muscle engagement.",
  },
  {
    id: "svc-nidra",
    title: "Nidra",
    description:
      "A guided state of consciousness between waking and sleeping — deep relaxation via a set of verbal instructions, distinct from concentrative meditation.",
  },
  {
    id: "svc-prenatal",
    title: "Prenatal",
    description:
      "Positions specifically adapted for pregnant bodies, emphasizing breathing, stretching, and strengthening to help prepare for labor.",
  },
];

export const seedPrivateSessionTypes: PrivateSessionType[] = [
  {
    id: "priv-lesson",
    title: "Private Lesson",
    description:
      "Individual class. Choose a location or set up a private session at a public studio. Weekly and monthly packages available.",
  },
  {
    id: "priv-couples",
    title: "Couples",
    description:
      "Learn the practice of yoga as a couple with guided lessons arranged for your needs and bodies.",
  },
  {
    id: "priv-corporate",
    title: "Corporate Class",
    description:
      "A fun team-building activity, or a weekly wind-down — lunchtime or morning yoga at your place of business.",
  },
  {
    id: "priv-kids",
    title: "Kids Yoga",
    description:
      "Small groups and classes with parent. Custom yoga mats for kids available on request.",
  },
  {
    id: "priv-weddings",
    title: "Weddings",
    description: "Custom series for the Bride, Groom, or Wedding party.",
  },
];

export const seedTestimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    quote:
      "Yoga has been a part of my life for the past seven years. I truly appreciate the method and elegance that Michelle brings to each class.",
    authorName: "Michelle W.",
    authorLocation: "Denver, CO",
  },
  {
    id: "testimonial-2",
    quote:
      "I met Michelle as a studio cleaner doing yoga for trade. I couldn't believe what a sweet soul she had — I started taking her Hot Power Fusion class and after every class I felt amazing!",
    authorName: "Crystal C.",
  },
  {
    id: "testimonial-3",
    quote:
      "Michelle is a natural healer who truly lives her yoga. I met her in Costa Rica and instantly felt welcomed and inspired by her lifestyle.",
    authorName: "McKenzie",
    authorLocation: "Winter Park, CO",
  },
];

export const seedGallery: GalleryImage[] = [
  { id: "gal-1", url: "instructor-seed/gal-headStand.png" },
  { id: "gal-2", url: "instructor-seed/CamelGroup.jpeg" },
  { id: "gal-3", url: "instructor-seed/gal-treePool.png" },
];
