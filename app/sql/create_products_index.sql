CREATE UNIQUE INDEX IF NOT EXISTS ux_products_key
ON products(category, model, finish, color, type, width, height);
