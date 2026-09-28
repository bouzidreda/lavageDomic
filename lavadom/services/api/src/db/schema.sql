CREATE TABLE users (
  id VARCHAR2(36) PRIMARY KEY,
  role VARCHAR2(20) NOT NULL CHECK (role IN ('CLIENT','PROVIDER','ADMIN')),
  name VARCHAR2(120) NOT NULL,
  email VARCHAR2(190) NOT NULL UNIQUE,
  phone VARCHAR2(40) NOT NULL UNIQUE,
  password_hash VARCHAR2(200) NOT NULL,
  account_status VARCHAR2(30) DEFAULT 'ACTIVE' NOT NULL CHECK (account_status IN ('ACTIVE','SUSPENDED','PENDING_VERIFICATION')),
  suspension_reason VARCHAR2(500) NULL,
  email_verified NUMBER(1) DEFAULT 0 NOT NULL CHECK (email_verified IN (0,1)),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE password_resets (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id),
  token_hash VARCHAR2(128) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_password_resets_user ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token_hash);

CREATE TABLE user_addresses (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id),
  label VARCHAR2(80) NOT NULL,
  address_line VARCHAR2(300) NOT NULL,
  city VARCHAR2(120) NULL,
  lat NUMBER(9,6) NULL,
  lng NUMBER(9,6) NULL,
  is_default NUMBER(1) DEFAULT 0 NOT NULL CHECK (is_default IN (0,1)),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);

CREATE TABLE user_vehicles (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id),
  label VARCHAR2(120) NOT NULL,
  brand VARCHAR2(80) NULL,
  model VARCHAR2(120) NULL,
  plate_number VARCHAR2(40) NULL,
  color VARCHAR2(40) NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE providers (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES users(id),
  bio CLOB NULL,
  city VARCHAR2(120) NULL,
  lat NUMBER(9,6) NOT NULL,
  lng NUMBER(9,6) NOT NULL,
  radius_km NUMBER(6,2) DEFAULT 10 NOT NULL,
  price_from NUMBER(10,2) DEFAULT 0 NOT NULL,
  rating_avg NUMBER(4,2) DEFAULT 0 NOT NULL,
  rating_count NUMBER(10) DEFAULT 0 NOT NULL,
  verification_status VARCHAR2(20) DEFAULT 'PENDING' NOT NULL CHECK (verification_status IN ('PENDING','VERIFIED','REJECTED')),
  verification_notes VARCHAR2(500) NULL,
  identity_doc_url VARCHAR2(500) NULL,
  availability_json CLOB NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_providers_lat ON providers(lat);
CREATE INDEX idx_providers_lng ON providers(lng);
CREATE INDEX idx_providers_rating ON providers(rating_avg);

CREATE TABLE provider_documents (
  id VARCHAR2(36) PRIMARY KEY,
  provider_id VARCHAR2(36) NOT NULL REFERENCES providers(id),
  doc_type VARCHAR2(40) NOT NULL CHECK (doc_type IN ('NATIONAL_ID','DRIVING_LICENSE','PASSPORT','OWNERSHIP_PAPER')),
  doc_label VARCHAR2(160) NULL,
  encrypted_payload CLOB NOT NULL,
  payload_hash VARCHAR2(128) NOT NULL,
  status VARCHAR2(20) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  rejection_reason VARCHAR2(500) NULL,
  reviewed_by VARCHAR2(36) NULL REFERENCES users(id),
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_provider_documents_provider ON provider_documents(provider_id);
CREATE INDEX idx_provider_documents_status ON provider_documents(status);

CREATE TABLE services (
  id VARCHAR2(36) PRIMARY KEY,
  provider_id VARCHAR2(36) NOT NULL REFERENCES providers(id),
  name VARCHAR2(120) NOT NULL,
  price NUMBER(10,2) NOT NULL,
  active NUMBER(1) DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_services_provider ON services(provider_id);

CREATE TABLE bookings (
  id VARCHAR2(36) PRIMARY KEY,
  provider_id VARCHAR2(36) NOT NULL REFERENCES providers(id),
  client_id VARCHAR2(36) NOT NULL REFERENCES users(id),
  status VARCHAR2(20) NOT NULL CHECK (status IN ('REQUESTED','ACCEPTED','DECLINED','ON_THE_WAY','ARRIVED','IN_PROGRESS','DONE','CANCELLED')),
  scheduled_at TIMESTAMP NOT NULL,
  address VARCHAR2(300) NOT NULL,
  notes CLOB NULL,
  total_price NUMBER(10,2) NOT NULL,
  commission_amount NUMBER(10,2) DEFAULT 0 NOT NULL,
  provider_amount NUMBER(10,2) DEFAULT 0 NOT NULL,
  payment_status VARCHAR2(20) DEFAULT 'UNPAID' NOT NULL CHECK (payment_status IN ('UNPAID','PENDING','PAID','REFUNDED','FAILED')),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE TABLE booking_services (
  booking_id VARCHAR2(36) NOT NULL REFERENCES bookings(id),
  service_id VARCHAR2(36) NOT NULL REFERENCES services(id),
  PRIMARY KEY (booking_id, service_id)
);

CREATE TABLE reviews (
  id VARCHAR2(36) PRIMARY KEY,
  booking_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES bookings(id),
  provider_id VARCHAR2(36) NOT NULL REFERENCES providers(id),
  client_id VARCHAR2(36) NOT NULL REFERENCES users(id),
  rating NUMBER(2) NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment_text CLOB NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_reviews_provider ON reviews(provider_id);

CREATE TABLE payments (
  id VARCHAR2(36) PRIMARY KEY,
  booking_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES bookings(id),
  provider_id VARCHAR2(36) NOT NULL REFERENCES providers(id),
  client_id VARCHAR2(36) NOT NULL REFERENCES users(id),
  provider_amount NUMBER(10,2) NOT NULL,
  commission_amount NUMBER(10,2) NOT NULL,
  gross_amount NUMBER(10,2) NOT NULL,
  currency VARCHAR2(10) DEFAULT 'MAD' NOT NULL,
  method VARCHAR2(30) NOT NULL CHECK (method IN ('PAYPAL','CASH','CARD')),
  status VARCHAR2(20) NOT NULL CHECK (status IN ('CREATED','APPROVED','CAPTURED','FAILED','REFUNDED')),
  provider_paypal_order_id VARCHAR2(190) NULL,
  provider_paypal_capture_id VARCHAR2(190) NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_payments_provider ON payments(provider_id);
CREATE INDEX idx_payments_client ON payments(client_id);

CREATE TABLE invoices (
  id VARCHAR2(36) PRIMARY KEY,
  booking_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES bookings(id),
  payment_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES payments(id),
  invoice_number VARCHAR2(60) NOT NULL UNIQUE,
  subtotal NUMBER(10,2) NOT NULL,
  commission_amount NUMBER(10,2) NOT NULL,
  total NUMBER(10,2) NOT NULL,
  currency VARCHAR2(10) DEFAULT 'MAD' NOT NULL,
  issued_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE notifications (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id),
  channel VARCHAR2(20) NOT NULL CHECK (channel IN ('EMAIL','SMS','IN_APP')),
  kind VARCHAR2(50) NOT NULL,
  payload CLOB NULL,
  status VARCHAR2(20) NOT NULL CHECK (status IN ('QUEUED','SENT','FAILED')),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE cms_pages (
  id VARCHAR2(36) PRIMARY KEY,
  slug VARCHAR2(80) NOT NULL UNIQUE,
  title VARCHAR2(160) NOT NULL,
  content CLOB NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);
