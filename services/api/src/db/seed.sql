INSERT INTO users (id, role, name, phone, password_hash)
VALUES ('00000000-0000-0000-0000-000000000001', 'PROVIDER', 'Provider One', '0600000001', 'salt:1000:hash');

INSERT INTO providers (id, user_id, bio, city, lat, lng, radius_km, price_from)
VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Fast cleaning', 'Agadir', 30.4278, -9.5981, 10, 80);

INSERT INTO services (id, provider_id, name, price) VALUES ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Exterior wash', 80);
INSERT INTO services (id, provider_id, name, price) VALUES ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Interior + exterior', 140);
