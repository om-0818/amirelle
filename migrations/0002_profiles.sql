create table if not exists profiles (
  user_id     text primary key,
  birth_date  date not null,
  identity    text not null default 'belong',
  city        text not null default 'Pune',
  onboarded   boolean not null default false,
  updated_at  timestamptz not null default now()
);
