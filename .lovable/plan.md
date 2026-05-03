## Grant admin role

Insert a row into `public.user_roles` linking your user to the `admin` role.

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('d100ad20-7d5c-41b2-8d76-a4b3fb219d4f', 'admin')
ON CONFLICT DO NOTHING;
```

After approval, sign out and back in at `/auth`, then `/admin` will unlock so you can add, edit, and delete projects.