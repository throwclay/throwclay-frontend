# ThrowClay Database Schema (Supabase)

**Last updated:** From live Supabase project `hdvbppcufzrkgzxxrqvk`.  
**Migrations:** None tracked via Supabase MCP (schema may have been applied outside MCP).

---

## Schemas & table counts

| Schema   | Purpose              | Table count |
|----------|----------------------|-------------|
| **public** | App business data   | 36 tables   |
| **auth**   | Supabase Auth       | 20 tables  |
| **storage**| Supabase Storage    | 8 tables   |

---

## Public schema – core entities

### Identity & studios
- **profiles** – Users (id = auth.users.id); `type` (e.g. artist), `artist_plan` enum, handle, email, phone, etc.
- **studios** – Studios; name, handle, email, plan (e.g. studio-solo), website, max_members, max_locations.
- **studio_locations** – Locations per studio; name, address, city, state, zip_code, phone, email.
- **studio_memberships** – User ↔ studio; `studio_role` enum, `studio_membership_status` enum, location_id, membership_type.
- **studio_membership_plans** – Plan definitions; plan_code (PK), name, price_cents, billing_interval.
- **studio_membership_applications** – Applications to join; profile_id, location_id, requested_membership_type → studio_membership_plans.plan_code, status enum, experience, interests, goals, referral_source, emergency_contact (jsonb), custom_fields (jsonb).
- **studio_invites** – Invites by email; studio_id, location_id, role, token, status, invited_by, accepted_by.
- **subscriptions** – Polymorphic (owner_type, owner_id); plan_code, status, external_customer_id, external_subscription_id, current_period_start/end.

### Classes (template → instance)
- **class_templates** – Reusable class definitions per studio; name, description, category, level, duration, capacity, materials, prerequisites, what_you_learn (array), thumbnail_url, images (array), base_template_id (self FK), created_by → profiles.
- **template_pricing_tiers** – Pricing per template; name, price_cents, is_default.
- **template_discount_codes** – Discount codes per template; code, type, value, expiry_date, usage_limit.
- **studio_classes** – Scheduled class instances; studio_id, location_id, template_id, name, instructor_id, capacity, enrolled_count, waitlist_count, start_date, end_date, schedule, status (e.g. draft), total_sessions, sessions_completed, revenue_cents, average_rating, total_reviews, created_by.
- **class_pricing_tiers** – Per-class pricing; class_id → studio_classes, name, price_cents, enrollment_count.
- **class_discount_codes** – Per-class codes; class_id, code, type, value, usage_limit, usage_count, is_active.
- **class_enrollments** – Student signups; class_id, student_id, pricing_tier_id, discount_code_id, status, payment_status, amount_paid_cents, emergency_contact.
- **class_attendance** – Per-session attendance; class_id, student_id, session_date, status, notes, recorded_by.
- **class_waitlist** – Waitlist; class_id, student_id, position, notifications_enabled.
- **class_reviews** – Reviews; class_id, student_id, rating, comment, is_public.
- **class_images** – Images per class; class_id, url, alt_text, is_main.

### Kiln operations
- **kilns** – Kilns per studio/location; studio_id, location_id, name, type, manufacturer, model, capacity, max_temp, shelf_count, status, shelf_configuration (jsonb), last_fired, total_firings, maintenance_schedule (jsonb), is_active.
- **kiln_firing_templates** – Firing programs; studio_id, kiln_id (optional), name, temperature_curve (jsonb), atmosphere, estimated_duration, clay_compatibility/glaze_compatibility (arrays), parent_template_id (self), created_by, usage_count, average_success_rate, is_shared.
- **custom_firing_types** – Custom firing types per studio; studio_id, name, base_type, temperature_curve (jsonb), atmosphere, clay_compatibility/glaze_compatibility (arrays), created_by.
- **kiln_firings** – Firing runs; studio_id, kiln_id, template_id, operator_id, name, scheduled_start, actual_start, actual_end, status, atmosphere, target_cone, target_temperature, actual_temperature, firing_type, booked_slots, created_by.
- **kiln_assignments** – Staff assignments to firings; kiln_id, firing_id, assigned_employee_id, assigned_employee_name, assignment_type, scheduled_start/end, actual_start/end, status, assigned_by.
- **kiln_assignment_tasks** – Tasks per assignment; assignment_id, description, is_completed, completed_at.
- **kiln_assignment_cover_requests** – Cover requests; assignment_id, requested_by, covered_by, reason, status.
- **kiln_assignment_notifications** – Notifications; assignment_id, type, sent_at, acknowledged.
- **kiln_loads** – Loads per firing; kiln_id, firing_id, loaded_by, assigned_employee_id, total_items, load_started, load_completed, photos (array).
- **kiln_shelves** – Shelves per load; kiln_load_id, level, capacity, used_capacity.
- **kiln_load_items** – Items on shelves; kiln_shelf_id, artist_id, artist_name, item_name, clay_type, glazes (array), loaded_by, status.
- **kiln_cameras** – Cameras per kiln; kiln_id, camera_id, position, monitoring_settings (jsonb), health_status.
- **kiln_camera_recordings** – Recordings; camera_id, firing_id, recording_type, start_time, end_time, file_url, duration.
- **kiln_performance_logs** – Logs; kiln_id, firing_id, timestamp, temperature, target_temperature, phase, gas_usage, electric_usage, recorded_by.

### Integrations
- **ring_integrations** – Ring (e.g. doorbell) per studio; studio_id, is_enabled, api_key, refresh_token, connected_devices (jsonb), settings (jsonb), webhook_url, last_sync, sync_status, error_log (jsonb).

---

## Key foreign key relationships (public)

- **profiles** – Referenced by: class_attendance (student_id, recorded_by), class_enrollments (student_id), class_reviews (student_id), class_templates (created_by), class_waitlist (student_id), custom_firing_types (created_by), kiln_assignments (assigned_employee_id, assigned_by), kiln_assignment_cover_requests (requested_by, covered_by), kiln_firing_templates (created_by), kiln_firings (operator_id, created_by), kiln_load_items (artist_id, loaded_by), kiln_loads (loaded_by, assigned_employee_id), kiln_performance_logs (recorded_by), studio_classes (instructor_id, created_by), studio_invites (invited_by, accepted_by), studio_membership_applications (profile_id, decided_by), studio_memberships (user_id).
- **studios** – Referenced by: class_templates, custom_firing_types, kiln_firing_templates, kilns, ring_integrations, studio_classes, studio_invites, studio_membership_applications, studio_memberships, studio_locations.
- **studio_locations** – Referenced by: kilns, studio_classes, studio_invites, studio_membership_applications, studio_memberships.
- **studio_classes** – Referenced by: class_attendance, class_discount_codes, class_enrollments, class_images, class_pricing_tiers, class_reviews, class_waitlist.
- **class_templates** – Referenced by: studio_classes (template_id), template_discount_codes, template_pricing_tiers; self: base_template_id.
- **kilns** – Referenced by: kiln_assignments, kiln_cameras, kiln_firing_templates, kiln_firings, kiln_loads, kiln_performance_logs.
- **kiln_firings** – Referenced by: kiln_assignments, kiln_camera_recordings, kiln_loads, kiln_performance_logs.
- **kiln_assignments** – Referenced by: kiln_assignment_cover_requests, kiln_assignment_notifications, kiln_assignment_tasks.
- **kiln_loads** – Referenced by: kiln_shelves.
- **kiln_shelves** – Referenced by: kiln_load_items.

---

## Enums (public)

| Enum                                 | Values                                                                 |
|--------------------------------------|------------------------------------------------------------------------|
| **artist_plan**                      | artist-free, artist-plus, artist-studio-lite, artist-studio-enterprise |
| **studio_role**                     | owner, admin, manager, instructor, employee, member                    |
| **studio_membership_status**        | pending, active, inactive, revoked                                    |
| **studio_membership_application_status** | pending, approved, rejected, withdrawn                          |
| **studio_membership_plan** (if used) | basic, premium, unlimited                                            |

---

## Installed extensions (relevant)

- **extensions**: pgcrypto, uuid-ossp
- **graphql**: pg_graphql
- **vault**: supabase_vault
- **extensions**: pg_stat_statements

---

## Auth & storage

- **auth** – Standard Supabase Auth tables (users, sessions, identities, refresh_tokens, mfa_*, oauth_*, etc.).
- **storage** – buckets, objects, migrations, s3_multipart_*, etc.

---

## Usage notes for development

1. **profiles.id** = `auth.users.id`; create/update profile on signup if using custom profile flow.
2. **Studio hierarchy**: studios → studio_locations; studio_memberships tie users to a studio and a location_id.
3. **Classes**: class_templates define reusable offerings; studio_classes are instances with schedule/capacity; enrollments, attendance, waitlist, reviews, and images hang off studio_classes.
4. **Kiln flow**: kilns → kiln_firings (optionally from kiln_firing_templates) → kiln_assignments & kiln_loads → kiln_shelves → kiln_load_items; cameras and performance_logs attach to kilns/firings.
5. **subscriptions** – owner_type/owner_id for polymorphic link to profiles or studios.
6. **studio_membership_applications.requested_membership_type** references **studio_membership_plans.plan_code** (text), not a UUID.
