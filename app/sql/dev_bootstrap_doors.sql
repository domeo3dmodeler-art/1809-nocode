-- products (витрина)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category TEXT DEFAULT 'doors',
  model TEXT NOT NULL,
  style TEXT,
  finish TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL,
  width INT NOT NULL,
  height INT NOT NULL,
  rrc_price NUMERIC(12,2) NOT NULL,
  model_photo TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_products_key
  ON products(category, model, finish, color, type, width, height);

-- fixtures: kits / handles (минимум полей для расчёта)
CREATE TABLE IF NOT EXISTS kits (
  id TEXT PRIMARY KEY,
  name TEXT,
  price_rrc NUMERIC(12,2),
  price_opt NUMERIC(12,2)
);
CREATE TABLE IF NOT EXISTS handles (
  id TEXT PRIMARY KEY,
  name_web TEXT,
  supplier_name TEXT,
  supplier_sku TEXT,
  price_opt NUMERIC(12,2),
  price_group_multiplier NUMERIC(12,2) DEFAULT 1
);

-- seed: ровно то, что используем в smoke
INSERT INTO products (model, finish, color, type, width, height, rrc_price)
VALUES ('PG Base 1','Нанотекс','Белый','Распашная',800,2000,21280)
ON CONFLICT (category, model, finish, color, type, width, height)
DO UPDATE SET rrc_price = EXCLUDED.rrc_price;
