## 1. Architecture design

```mermaid
graph TD
    A[Open-Meteo API] --> B[Python ETL Pipeline]
    B --> C[Supabase Database]
    D[GitHub Actions] --> B
    E[User Browser] --> F[React Frontend]
    F --> G[Supabase Auth]
    F --> C
    F --> H[ML Pipeline Service]
    H --> C
    
    subgraph "Data Sources"
        A
    end
    
    subgraph "ETL Layer"
        B
        D
    end
    
    subgraph "Frontend Layer"
        F
    end
    
    subgraph "Backend Services"
        G
        H
    end
    
    subgraph "Data Layer"
        C
    end
```

## 2. Technology Description

- **Frontend**: React@18 + TypeScript + TailwindCSS@3 + Vite
- **Initialization Tool**: vite-init
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **ETL Pipeline**: Python@3.10+ + requests + pandas + python-dotenv
- **ML Pipeline**: scikit-learn + tensorflow + shap + lime
- **CI/CD**: GitHub Actions
- **Monitoring**: Supabase Analytics + Custom Event Tracking

## 3. Route definitions

| Route | Purpose |
|-------|---------|
| / | Login page, autenticación de usuarios |
| /register | Registro de nuevos visualizadores |
| /dashboard | Dashboard principal para visualizadores |
| /admin | Panel de administración completo |
| /predictions | Página de modelos predictivos y XAI |
| /downloads | Centro de descarga de datasets |
| /profile | Configuración de perfil de usuario |

## 4. API definitions

### 4.1 Authentication APIs

```
POST /auth/v1/token
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|-------------|-------------|-------------|
| email | string | true | Email del usuario |
| password | string | true | Contraseña del usuario |

Response:
| Param Name | Param Type | Description |
|------------|-------------|-------------|
| access_token | string | JWT token para autenticación |
| refresh_token | string | Token para renovar sesión |
| user | object | Datos del usuario autenticado |

### 4.2 Weather Data APIs

```
GET /rest/v1/weather_data
```

Query Parameters:
| Param Name | Param Type | isRequired | Description |
|------------|-------------|-------------|-------------|
| city | string | false | Filtrar por ciudad |
| start_date | string | false | Fecha inicial (ISO 8601) |
| end_date | string | false | Fecha final (ISO 8601) |
| limit | number | false | Límite de resultados (max 1000) |

### 4.3 ML Prediction APIs

```
POST /functions/v1/predict-temperature
```

Request:
| Param Name | Param Type | isRequired | Description |
|------------|-------------|-------------|-------------|
| city | string | true | Ciudad para predecir |
| days_ahead | number | true | Días a predecir (1-7) |
| model_type | string | false | Tipo de modelo ('linear', 'random_forest', 'lstm') |

## 5. Server architecture diagram

```mermaid
graph TD
    A[Client / Frontend] --> B[Supabase Auth Layer]
    B --> C[Database Layer]
    C --> D[RLS Policies]
    D --> E[Data Access]
    
    F[Python ETL Service] --> C
    G[ML Pipeline Service] --> C
    
    subgraph "Supabase Backend"
        B
        C
        D
    end
    
    subgraph "External Services"
        F
        G
    end
```

## 6. Data model

### 6.1 Data model definition

```mermaid
erDiagram
    USERS ||--o{ WEATHER_DATA : "views/downloads"
    USERS ||--o{ USER_ACTIVITY : "generates"
    USERS ||--o{ PREDICTIONS : "creates"
    WEATHER_DATA ||--o{ PREDICTIONS : "based_on"
    
    USERS {
        uuid id PK
        string email UK
        string role
        timestamp created_at
        timestamp last_login
        boolean is_active
    }
    
    WEATHER_DATA {
        bigint id PK
        string city
        float latitude
        float longitude
        float temperature
        float humidity
        timestamp weather_timestamp
        timestamp ingestion_time
        string data_source
    }
    
    USER_ACTIVITY {
        bigint id PK
        uuid user_id FK
        string activity_type
        json metadata
        timestamp created_at
    }
    
    PREDICTIONS {
        bigint id PK
        uuid user_id FK
        string city
        string model_type
        json prediction_results
        float accuracy_score
        timestamp created_at
    }
```

### 6.2 Data Definition Language

**Users Table (users)**
```sql
-- create table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'visualizador' CHECK (role IN ('admin', 'visualizador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- create policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can view all users" ON users FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

**Weather Data Table (weather_data)**
```sql
-- create table
CREATE TABLE weather_data (
    id BIGSERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(8,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    weather_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    ingestion_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_source VARCHAR(50) DEFAULT 'open-meteo'
);

-- create indexes
CREATE INDEX idx_weather_data_city ON weather_data(city);
CREATE INDEX idx_weather_data_timestamp ON weather_data(weather_timestamp);
CREATE INDEX idx_weather_data_ingestion ON weather_data(ingestion_time);
CREATE UNIQUE INDEX idx_weather_data_unique ON weather_data(city, weather_timestamp);

-- enable RLS
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

-- create policies
CREATE POLICY "Anyone can view weather data" ON weather_data FOR SELECT USING (true);
CREATE POLICY "Admin can insert weather data" ON weather_data FOR INSERT USING (auth.jwt() ->> 'role' = 'admin');
```

**User Activity Table (user_activity)**
```sql
-- create table
CREATE TABLE user_activity (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create indexes
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at DESC);

-- enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- create policies
CREATE POLICY "Users can view own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all activity" ON user_activity FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

**Predictions Table (predictions)**
```sql
-- create table
CREATE TABLE predictions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    prediction_results JSONB NOT NULL,
    accuracy_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- create indexes
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_city ON predictions(city);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);

-- enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- create policies
CREATE POLICY "Users can view own predictions" ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all predictions" ON predictions FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

### 6.3 Grant Permissions
```sql
-- Grant basic read access to anon role
GRANT SELECT ON weather_data TO anon;

-- Grant full access to authenticated role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```