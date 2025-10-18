CREATE TABLE fees (
                      id SERIAL PRIMARY KEY,
                      code VARCHAR(50) NOT NULL UNIQUE,
                      value NUMERIC(10, 2) NOT NULL, -- For monetary values
                      description VARCHAR(255),
                      status VARCHAR(50),
                      start_date TIMESTAMP,
                      end_date TIMESTAMP,
                      type VARCHAR(50),
                      service VARCHAR(100),
                      jurisdiction1 VARCHAR(50),
                      jurisdiction2 VARCHAR(50),
                      created_at TIMESTAMP DEFAULT NOW(),
                      updated_at TIMESTAMP DEFAULT NOW(),
                      CONSTRAINT check_dates CHECK (end_date IS NULL OR end_date >= start_date)
);
