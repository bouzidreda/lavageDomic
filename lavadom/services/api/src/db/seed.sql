INSERT INTO users (id, role, name, email, phone, password_hash, account_status, email_verified)
VALUES ('00000000-0000-0000-0000-000000000001', 'PROVIDER', 'Provider One', 'provider1@lavadom.ma', '0600000001', 'salt:1000:hash', 'ACTIVE', 1);

INSERT INTO users (id, role, name, email, phone, password_hash, account_status, email_verified)
VALUES ('00000000-0000-0000-0000-000000000002', 'CLIENT', 'Client One', 'client1@lavadom.ma', '0600000002', 'salt:1000:hash', 'ACTIVE', 1);

INSERT INTO users (id, role, name, email, phone, password_hash, account_status, email_verified)
VALUES ('00000000-0000-0000-0000-000000000003', 'ADMIN', 'Admin', 'admin@lavadom.ma', '0600000003', 'salt:1000:hash', 'ACTIVE', 1);

INSERT INTO providers (id, user_id, bio, city, lat, lng, radius_km, price_from, verification_status)
VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Fast cleaning', 'Agadir', 30.4278, -9.5981, 10, 80, 'VERIFIED');

INSERT INTO services (id, provider_id, name, price) VALUES ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Exterior wash', 80);
INSERT INTO services (id, provider_id, name, price) VALUES ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Interior + exterior', 140);

INSERT INTO user_addresses (id, user_id, label, address_line, city, lat, lng, is_default)
VALUES ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Home', 'Rue Exemple, Agadir', 'Agadir', 30.4278, -9.5981, 1);

INSERT INTO user_vehicles (id, user_id, label, brand, model, plate_number, color)
VALUES ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Family Car', 'Dacia', 'Logan', '12345-A-1', 'White');

INSERT INTO cms_pages (id, slug, title, content)
VALUES ('50000000-0000-0000-0000-000000000001', 'reservation-flow', 'Reservation flow', 'From service discovery to payment capture, every booking step is tracked and visible to the client.');

INSERT INTO cms_pages (id, slug, title, content)
VALUES ('50000000-0000-0000-0000-000000000002', 'booking-and-kyc', 'Booking and KYC', 'Provider identity verification and secure booking flow are combined to reinforce trust before service execution.');

INSERT INTO cms_pages (id, slug, title, content)
VALUES ('50000000-0000-0000-0000-000000000003', 'kyc-policy', 'KYC policy', 'KYC checks are mandatory for provider onboarding, with document review, auditability, and compliance controls.');

INSERT INTO cms_pages (id, slug, title, content)
VALUES ('50000000-0000-0000-0000-000000000004', 'contact', 'Contact', 'Reach support, partnership, or trust and safety channels for any question related to platform operations.');

INSERT INTO cms_pages (id, slug, title, content)
VALUES ('50000000-0000-0000-0000-000000000005', 'service-car-wash', 'Car wash service', 'Car wash services include exterior cleaning, interior care, and advanced detailing delivered by verified providers.');

INSERT INTO cms_pages (id, slug, title, content)
VALUES ('50000000-0000-0000-0000-000000000006', 'service-carpet-cleaning', 'Carpets and rugs service', 'Carpet service covers routine maintenance, deep-fiber cleaning, and scheduled office interventions.');

INSERT INTO cms_pages (id, slug, title, content)
VALUES ('50000000-0000-0000-0000-000000000007', 'service-blanket-laundry', 'Blankets and linen service', 'Laundry services for blankets and linen focus on hygiene, fabric-safe cycles, and careful return handling.');
