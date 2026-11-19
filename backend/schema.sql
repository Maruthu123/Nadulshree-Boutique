-- Nadulshree Boutique - Neon SQL (PostgreSQL) schema
-- Safe to run many times (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(160)  NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash TEXT          NOT NULL,
  role          VARCHAR(10)   NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_verified   BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otps (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(160) NOT NULL,
  code_hash  TEXT         NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  attempts   INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otps_email ON otps (email);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(80) NOT NULL UNIQUE,
  slug       VARCHAR(80) NOT NULL UNIQUE,
  sort_order INT         NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories (id) ON DELETE SET NULL,
  name        VARCHAR(160)  NOT NULL,
  description TEXT          NOT NULL DEFAULT '',
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  mrp         NUMERIC(10,2),
  sizes       TEXT[]        NOT NULL DEFAULT '{}',
  colors      TEXT[]        NOT NULL DEFAULT '{}',
  images      TEXT[]        NOT NULL DEFAULT '{}',
  stock       INT           NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);

CREATE TABLE IF NOT EXISTS orders (
  id                   SERIAL PRIMARY KEY,
  order_no             VARCHAR(30)   NOT NULL UNIQUE,
  user_id              INT REFERENCES users (id) ON DELETE SET NULL,
  subtotal             NUMERIC(10,2) NOT NULL,
  shipping_fee         NUMERIC(10,2) NOT NULL DEFAULT 0,
  total                NUMERIC(10,2) NOT NULL,
  payment_method       VARCHAR(10)   NOT NULL CHECK (payment_method IN ('cod', 'online')),
  payment_status       VARCHAR(10)   NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id    VARCHAR(60),
  razorpay_payment_id  VARCHAR(60),
  status               VARCHAR(20)   NOT NULL DEFAULT 'placed'
                       CHECK (status IN ('placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled')),
  current_location     VARCHAR(160),
  ship_name            VARCHAR(120)  NOT NULL,
  ship_phone           VARCHAR(20)   NOT NULL,
  ship_address         TEXT          NOT NULL,
  ship_city            VARCHAR(80)   NOT NULL,
  ship_state           VARCHAR(80)   NOT NULL,
  ship_pincode         VARCHAR(10)   NOT NULL,
  notes                TEXT,
  expected_delivery    DATE,
  delivered_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user    ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INT           NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id INT REFERENCES products (id) ON DELETE SET NULL,
  name       VARCHAR(160)  NOT NULL,
  image      TEXT,
  price      NUMERIC(10,2) NOT NULL,
  qty        INT           NOT NULL CHECK (qty > 0),
  size       VARCHAR(30),
  color      VARCHAR(40)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

CREATE TABLE IF NOT EXISTS tracking_events (
  id         SERIAL PRIMARY KEY,
  order_id   INT          NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  status     VARCHAR(20)  NOT NULL,
  location   VARCHAR(160),
  note       TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tracking_order ON tracking_events (order_id);

CREATE TABLE IF NOT EXISTS testimonials (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users (id) ON DELETE SET NULL,
  name        VARCHAR(120) NOT NULL,
  city        VARCHAR(80),
  rating      INT          NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  message     TEXT         NOT NULL,
  is_approved BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  phone      VARCHAR(20),
  email      VARCHAR(160),
  message    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ===== v2 additions (safe to run again) =====
ALTER TABLE otps ADD COLUMN IF NOT EXISTS purpose VARCHAR(10) NOT NULL DEFAULT 'verify';  -- 'verify' | 'reset'

-- Photos uploaded from phone / computer (stored in Neon, no extra service needed)
CREATE TABLE IF NOT EXISTS uploads (
  id         SERIAL PRIMARY KEY,
  mime       VARCHAR(30) NOT NULL,
  data       BYTEA       NOT NULL,
  created_by INT REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Happy customer feedback can carry a screenshot / photo
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ===== v3: Nexora Menswear (second shop on the same site) =====
-- Every category belongs to one shop: 'boutique' (Nadulshree) or 'menswear' (Nexora). Existing rows stay 'boutique'.
ALTER TABLE categories ADD COLUMN IF NOT EXISTS store VARCHAR(12) NOT NULL DEFAULT 'boutique';
ALTER TABLE orders     ADD COLUMN IF NOT EXISTS store VARCHAR(12) NOT NULL DEFAULT 'boutique';
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders (store);

-- Happy-customer reviews belong to one shop too
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS store VARCHAR(12) NOT NULL DEFAULT 'boutique';

-- ===== v4: Hero photos for Nexora Menswear (edited in /menswear/admin > Hero). Same database, no new database needed. =====
CREATE TABLE IF NOT EXISTS hero_slides (
  id         SERIAL PRIMARY KEY,
  store      VARCHAR(12)  NOT NULL DEFAULT 'menswear',
  image_url  TEXT         NOT NULL,
  title      VARCHAR(120) NOT NULL DEFAULT '',
  subtitle   VARCHAR(200) NOT NULL DEFAULT '',
  product_id INT REFERENCES products (id) ON DELETE SET NULL,
  link       VARCHAR(300),
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hero_store ON hero_slides (store, sort_order);

-- ===== v5: separate Nexora admin + cancellation reasons (safe to run again) =====
-- admin_store NULL = main owner admin (sees everything, as before). 'menswear' = Nexora admin: sees ONLY Nexora data.
ALTER TABLE users  ADD COLUMN IF NOT EXISTS admin_store   VARCHAR(12);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(80);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_note   TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at  TIMESTAMPTZ;
