CREATE TABLE users (
  id VARCHAR2(36) PRIMARY KEY,
  role VARCHAR2(20) NOT NULL CHECK (role IN ('CLIENT','PROVIDER','ADMIN')),
  name VARCHAR2(120) NOT NULL,
  phone VARCHAR2(40) NOT NULL UNIQUE,
  password_hash VARCHAR2(200) NOT NULL,
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
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_providers_lat ON providers(lat);
CREATE INDEX idx_providers_lng ON providers(lng);
CREATE INDEX idx_providers_rating ON providers(rating_avg);

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
  status VARCHAR2(20) NOT NULL CHECK (status IN ('PENDING','CONFIRMED','IN_PROGRESS','DONE','CANCELLED')),
  scheduled_at TIMESTAMP NOT NULL,
  address VARCHAR2(300) NOT NULL,
  notes CLOB NULL,
  total_price NUMBER(10,2) NOT NULL,
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
  comment CLOB NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_reviews_provider ON reviews(provider_id);
