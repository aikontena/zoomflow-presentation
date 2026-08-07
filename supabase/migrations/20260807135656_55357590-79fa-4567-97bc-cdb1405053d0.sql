
-- Create enum for animation presets
create type public.animation_preset as enum (
  'smooth', 'ease-in', 'ease-out', 'ease-in-out', 'bounce', 'elastic', 'fast', 'slow', 'cinematic'
);

-- Create enum for transition effects
create type public.transition_effect as enum (
  'zoom', 'fade', 'cross-fade', 'slide', 'rotate', 'scale', 'morph'
);

-- Camera Paths
create table public.camera_paths (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_looping boolean default false,
  is_reverse boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Camera Keyframes (Sequence of frames/positions)
create table public.camera_keyframes (
  id uuid primary key default gen_random_uuid(),
  path_id uuid references public.camera_paths(id) on delete cascade not null,
  frame_id text not null, -- refers to the 'id' in our editor-store pages
  order_index int not null,
  transition_duration int default 1000, -- ms
  transition_type public.transition_effect default 'zoom',
  animation_preset public.animation_preset default 'cinematic',
  stay_duration int default 0, -- ms for autoplay
  is_skipped boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Camera Bookmarks
create table public.camera_bookmarks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  x float not null,
  y float not null,
  zoom float not null,
  rotation float default 0,
  target_frame_id text,
  created_at timestamptz default now()
);

-- Presentation Sessions
create table public.presentation_sessions (
  id uuid primary key default gen_random_uuid(),
  path_id uuid references public.camera_paths(id) on delete set null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  total_frames int default 0,
  completed_frames int default 0
);

-- Enable RLS and Grants
alter table public.camera_paths enable row level security;
alter table public.camera_keyframes enable row level security;
alter table public.camera_bookmarks enable row level security;
alter table public.presentation_sessions enable row level security;

grant select, insert, update, delete on public.camera_paths to authenticated;
grant select, insert, update, delete on public.camera_keyframes to authenticated;
grant select, insert, update, delete on public.camera_bookmarks to authenticated;
grant select, insert, update, delete on public.presentation_sessions to authenticated;

grant all on public.camera_paths to service_role;
grant all on public.camera_keyframes to service_role;
grant all on public.camera_bookmarks to service_role;
grant all on public.presentation_sessions to service_role;

-- Public policies (simplified for now, ideally scoped to user)
create policy "Allow all for authenticated paths" on public.camera_paths for all to authenticated using (true);
create policy "Allow all for authenticated keyframes" on public.camera_keyframes for all to authenticated using (true);
create policy "Allow all for authenticated bookmarks" on public.camera_bookmarks for all to authenticated using (true);
create policy "Allow all for authenticated sessions" on public.presentation_sessions for all to authenticated using (true);
