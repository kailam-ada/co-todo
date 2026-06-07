-- Rendre le modèle pleinement référentiel : family_id → families(id).
-- 1) backfill des lignes families manquantes
-- 2) trigger d'inscription : crée le foyer AVANT le profil (FK satisfaite)
-- 3) appairage : migre les données de l'ancien foyer puis le supprime s'il est vide
-- 4) contraintes FK (CASCADE pour tasks/templates, RESTRICT pour profiles)

-- 1) Backfill (idempotent)
insert into public.families (id)
select distinct family_id from public.profiles
union select distinct family_id from public.tasks
union select distinct family_id from public.task_templates
on conflict (id) do nothing;

-- 2) Inscription : foyer créé avant le profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_family uuid := gen_random_uuid();
begin
  insert into public.families (id) values (v_family);
  insert into public.profiles (id, email, first_name, family_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    v_family
  );
  return new;
end;
$$;

-- 3) Appairage : rejoindre le foyer émetteur, migrer les données, nettoyer
create or replace function public.redeem_family_invitation(p_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.family_invitations;
  v_inviter_family uuid;
  v_old_family uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  select * into v_inv
  from public.family_invitations
  where code = upper(trim(p_code))
  for update;

  if v_inv.id is null then
    raise exception 'Code invalide';
  end if;

  if v_inv.expires_at < now() then
    delete from public.family_invitations where id = v_inv.id;
    raise exception 'Code expiré';
  end if;

  if v_inv.inviter_profile_id = auth.uid() then
    raise exception 'Vous ne pouvez pas utiliser votre propre code';
  end if;

  select family_id into v_inviter_family
  from public.profiles
  where id = v_inv.inviter_profile_id;

  if v_inviter_family is null then
    raise exception 'Foyer émetteur introuvable';
  end if;

  select family_id into v_old_family
  from public.profiles
  where id = auth.uid();

  if v_old_family is distinct from v_inviter_family then
    -- Le compte courant rejoint le foyer de l'émetteur
    update public.profiles set family_id = v_inviter_family where id = auth.uid();
    -- Migration des données de l'ancien foyer (évite toute perte)
    update public.tasks set family_id = v_inviter_family where family_id = v_old_family;
    update public.task_templates set family_id = v_inviter_family where family_id = v_old_family;
    -- Suppression de l'ancien foyer s'il est désormais vide
    delete from public.families f
    where f.id = v_old_family
      and not exists (select 1 from public.profiles p where p.family_id = f.id);
  end if;

  delete from public.family_invitations where id = v_inv.id;
end;
$$;

-- 4) Contraintes de clé étrangère
alter table public.profiles
  add constraint profiles_family_id_fkey
  foreign key (family_id) references public.families (id) on delete restrict;

alter table public.tasks
  add constraint tasks_family_id_fkey
  foreign key (family_id) references public.families (id) on delete cascade;

alter table public.task_templates
  add constraint task_templates_family_id_fkey
  foreign key (family_id) references public.families (id) on delete cascade;
