-- Local development seed: Michelle Scutti's profile (content from her 2017
-- Wild Rose Yoga site, see docs/reference/WILD-R~1.MD).
-- Runs on `supabase db reset`. Local only; never run against production.
--
-- Local login: michelle@skedgelife.test / skedgelife-dev

-- The auth user; the on_auth_user_created trigger creates the profile row.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated', 'authenticated',
  'michelle@skedgelife.test',
  extensions.crypt('skedgelife-dev', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"handle": "michellescutti", "display_name": "Michelle Scutti"}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  '{"sub": "11111111-1111-4111-8111-111111111111", "email": "michelle@skedgelife.test"}',
  'email', now(), now(), now()
);

update public.profiles set
  bio_short = 'Southern California-based yoga & Thai massage instructor, teaching Vinyasa, Yin, Hot, and Kids Yoga.',
  bio_long = 'Michelle Scutti is a Southern California native raising that good vibration on and off the mat. She stands in her truth and radiantly and authentically shines. She has been practicing yoga for 15 years and teaching for 11 years. Light on her feet, consistent in her optimism and strong in her practice, she completed her first RYT 200 hour training 2011 in Denver, Colorado. Following her dream of adventure and living a more simple life, she moved to Montezuma Costa Rica and offered classes in the style of Vinyasa, Yin and Thai Massage for Montezuma Yoga. She also offered Vinyasa classes at the gorgeous Ylang Ylang Beach Resort and Rancho Delicioso a Permaculture Farm for Anamaya Resort.

Now back in Orange County Michelle is offering public and private classes in the style of Hot Power Fusion, Yin Yoga, Hot Yoga, Vinyasa, Meditation, and Kids Yoga. She is humbled to connect with this ancient lineage on a deeper level. Lately she is intrigued by and studying Tantric Vinyasa. Each class explores intelligent Vinyasa sequences guided by principles of alignment, pranayama, meditation, and other techniques for awakening our inner fire and stabilizing the mind. She infuses her classes with compassion, joy, and love. She looks forward to meeting you!',
  avatar_url = 'instructor-seed/bio-sqSmile.png',
  logo_url = 'instructor-seed/logo-MichelleRose.png',
  teaches = true,
  -- Paid, so the seed shows a full gallery (the free plan allows 3 photos).
  plan = 'paid',
  certifications = array[
    'RYT-200 (Hot Yoga / Hot Power Fusion)',
    'RYT-200 (Power Vinyasa)',
    'Thai Yoga Massage Certificate, TTC Spa School (Chiang Mai, Thailand)'
  ],
  specialties = array['Vinyasa', 'Yin', 'Hot Power Fusion', 'Meditation', 'Kids Yoga', 'Thai Yoga Massage'],
  contact_email = 'michellescutti@gmail.com',
  contact_phone = '720-291-1930',
  instagram_handle = '@Michelle84Mabelle',
  skin = 'classic-yoga'
where id = '11111111-1111-4111-8111-111111111111';

insert into public.schedule_entries (id, profile_id, venue_name, booking_url, sort_order) values
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111',
   'Ra Yoga — Mission Viejo Studio', 'https://rayoga.com/locations/Mission-Viejo/', 0);

insert into public.schedule_times (schedule_entry_id, day_of_week, label, sort_order) values
  ('22222222-2222-4222-8222-222222222222', 5, '5:30pm Intro to Level 2', 0),
  ('22222222-2222-4222-8222-222222222222', 5, '7:30pm Hot Ra - Candlelit', 1),
  ('22222222-2222-4222-8222-222222222222', 6, '8:30am Hot Ra', 2),
  ('22222222-2222-4222-8222-222222222222', 6, '10:00am Intro to Level 2', 3);

insert into public.service_modalities (profile_id, title, description, sort_order) values
  ('11111111-1111-4111-8111-111111111111', 'Vinyasa', 'Vinyasa yoga teaches us to cultivate an awareness that links each action to the next — both on the mat and in our lives. This rigorous, flow-style practice links breath to movement.', 0),
  ('11111111-1111-4111-8111-111111111111', 'Hot', 'A 90-minute series of 26 postures and 2 breathing exercises in a room heated to 105°F, designed to warm muscles, flush toxins, and increase circulation.', 1),
  ('11111111-1111-4111-8111-111111111111', 'Yin', 'Stretches the connective tissue around the joints (knees, pelvis, sacrum, spine), holding poses for up to six minutes with little to no muscle engagement.', 2),
  ('11111111-1111-4111-8111-111111111111', 'Nidra', 'A guided state of consciousness between waking and sleeping — deep relaxation via a set of verbal instructions, distinct from concentrative meditation.', 3),
  ('11111111-1111-4111-8111-111111111111', 'Prenatal', 'Positions specifically adapted for pregnant bodies, emphasizing breathing, stretching, and strengthening to help prepare for labor.', 4);

insert into public.private_session_types (profile_id, title, description, sort_order) values
  ('11111111-1111-4111-8111-111111111111', 'Private Lesson', 'Individual class. Choose a location or set up a private session at a public studio. Weekly and monthly packages available.', 0),
  ('11111111-1111-4111-8111-111111111111', 'Couples', 'Learn the practice of yoga as a couple with guided lessons arranged for your needs and bodies.', 1),
  ('11111111-1111-4111-8111-111111111111', 'Corporate Class', 'A fun team-building activity, or a weekly wind-down — lunchtime or morning yoga at your place of business.', 2),
  ('11111111-1111-4111-8111-111111111111', 'Kids Yoga', 'Small groups and classes with parent. Custom yoga mats for kids available on request.', 3),
  ('11111111-1111-4111-8111-111111111111', 'Weddings', 'Custom series for the Bride, Groom, or Wedding party.', 4);

insert into public.testimonials (profile_id, quote, author_name, author_location, sort_order) values
  ('11111111-1111-4111-8111-111111111111', 'Yoga has been a part of my life for the past seven years. I truly appreciate the method and elegance that Michelle brings to each class.', 'Michelle W.', 'Denver, CO', 0),
  ('11111111-1111-4111-8111-111111111111', 'I met Michelle as a studio cleaner doing yoga for trade. I couldn''t believe what a sweet soul she had — I started taking her Hot Power Fusion class and after every class I felt amazing!', 'Crystal C.', null, 1),
  ('11111111-1111-4111-8111-111111111111', 'Michelle is a natural healer who truly lives her yoga. I met her in Costa Rica and instantly felt welcomed and inspired by her lifestyle.', 'McKenzie', 'Winter Park, CO', 2);

insert into public.gallery_images (profile_id, url, sort_order) values
  ('11111111-1111-4111-8111-111111111111', 'instructor-seed/gal-headStand.png', 0),
  ('11111111-1111-4111-8111-111111111111', 'instructor-seed/CamelGroup.jpeg', 1),
  ('11111111-1111-4111-8111-111111111111', 'instructor-seed/gal-treePool.png', 2);
