# Documentação do Banco de Dados - Uppi

## Visão Geral

O banco de dados do Uppi usa **PostgreSQL 15+** com a extensão **PostGIS** para funcionalidades de geolocalização. Todas as tabelas possuem **Row Level Security (RLS)** habilitado para garantir segurança dos dados.

---

## Diagrama ER

```
┌──────────────┐         ┌──────────────────┐
│   profiles   │◄───────►│ driver_profiles  │
└──────┬───────┘         └──────────────────┘
       │
       │ 1:N
       │
       ▼
┌──────────────┐         ┌──────────────────┐
│    rides     │◄───────►│  price_offers    │
└──────┬───────┘         └──────────────────┘
       │
       ├──────────► ratings
       ├──────────► messages
       └──────────► wallet_transactions

profiles ──► favorites
profiles ──► emergency_contacts
profiles ──► notifications
profiles ──► user_coupons ◄─── coupons
```

---

## Tabelas

### profiles

Armazena informações básicas de todos os usuários (passageiros e motoristas).

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK, referência auth.users |
| full_name | TEXT | Nome completo |
| phone | TEXT | Telefone (UNIQUE) |
| avatar_url | TEXT | URL da foto |
| user_type | user_type | Tipo de usuário |
| rating | DECIMAL(3,2) | Avaliação média |
| total_rides | INTEGER | Total de corridas |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Data de atualização |

**Triggers:**
- `handle_new_user()`: Cria perfil automaticamente quando usuário se registra
- `update_updated_at_column()`: Atualiza `updated_at` em modificações

**RLS Policies:**
- Usuários podem ver e editar apenas seu próprio perfil

---

### driver_profiles

Dados específicos de motoristas (veículo, documentos, etc).

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK, FK profiles(id) |
| license_number | TEXT | CNH (UNIQUE) |
| vehicle_type | vehicle_type | Tipo do veículo |
| vehicle_brand | TEXT | Marca do veículo |
| vehicle_model | TEXT | Modelo do veículo |
| vehicle_year | INTEGER | Ano do veículo |
| vehicle_plate | TEXT | Placa (UNIQUE) |
| vehicle_color | TEXT | Cor do veículo |
| is_verified | BOOLEAN | Verificado? |
| is_available | BOOLEAN | Disponível? |
| current_location | GEOGRAPHY(POINT) | Localização atual |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Data de atualização |

**Índices:**
- `idx_driver_location`: GiST index para buscas geoespaciais

**RLS Policies:**
- Motoristas podem ver e editar apenas seu próprio perfil
- Motoristas podem inserir seu próprio perfil

---

### rides

Corridas solicitadas e em andamento.

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| passenger_id | UUID | FK profiles(id) |
| driver_id | UUID | FK profiles(id), nullable |
| pickup_location | GEOGRAPHY(POINT) | Localização de origem |
| pickup_address | TEXT | Endereço de origem |
| dropoff_location | GEOGRAPHY(POINT) | Localização de destino |
| dropoff_address | TEXT | Endereço de destino |
| distance_km | DECIMAL(10,2) | Distância em km |
| estimated_duration_minutes | INTEGER | Duração estimada |
| passenger_price_offer | DECIMAL(10,2) | Oferta do passageiro |
| final_price | DECIMAL(10,2) | Preço final acordado |
| payment_method | payment_method | Método de pagamento |
| status | ride_status | Status da corrida |
| scheduled_time | TIMESTAMPTZ | Agendamento |
| started_at | TIMESTAMPTZ | Início da corrida |
| completed_at | TIMESTAMPTZ | Conclusão |
| cancelled_at | TIMESTAMPTZ | Cancelamento |
| cancellation_reason | TEXT | Motivo do cancelamento |
| notes | TEXT | Observações |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Data de atualização |

**Índices:**
- `idx_rides_passenger`: Index em passenger_id
- `idx_rides_driver`: Index em driver_id
- `idx_rides_status`: Index em status
- `idx_rides_created`: Index em created_at (DESC)

**RLS Policies:**
- Usuários veem apenas corridas onde são passageiro ou motorista
- Passageiros podem criar corridas
- Passageiros e motoristas podem atualizar corridas

---

### price_offers

Ofertas de preço feitas por motoristas.

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| ride_id | UUID | FK rides(id) |
| driver_id | UUID | FK profiles(id) |
| offered_price | DECIMAL(10,2) | Preço oferecido |
| message | TEXT | Mensagem do motorista |
| status | offer_status | Status da oferta |
| expires_at | TIMESTAMPTZ | Expiração da oferta |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Data de atualização |

**Índices:**
- `idx_price_offers_ride`: Index em ride_id
- `idx_price_offers_driver`: Index em driver_id

**RLS Policies:**
- Usuários veem ofertas para suas corridas ou ofertas que fizeram
- Motoristas podem criar ofertas
- Motoristas podem atualizar suas ofertas

---

### ratings

Avaliações entre passageiros e motoristas.

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| ride_id | UUID | FK rides(id) |
| reviewer_id | UUID | FK profiles(id) - quem avaliou |
| reviewed_id | UUID | FK profiles(id) - quem foi avaliado |
| rating | INTEGER | Nota (1-5) |
| comment | TEXT | Comentário |
| tags | TEXT[] | Tags (pontual, educado, etc) |
| created_at | TIMESTAMPTZ | Data de criação |

**Constraints:**
- UNIQUE(ride_id, reviewer_id): Uma avaliação por pessoa por corrida
- CHECK(rating >= 1 AND rating <= 5)

**RLS Policies:**
- Usuários veem avaliações onde são avaliador ou avaliado
- Usuários podem criar avaliações (se forem reviewer)

---

### notifications

Notificações do sistema.

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK profiles(id) |
| title | TEXT | Título |
| message | TEXT | Mensagem |
| type | TEXT | Tipo (offer, ride, payment, etc) |
| ride_id | UUID | FK rides(id), nullable |
| data | JSONB | Dados adicionais |
| read | BOOLEAN | Lida? |
| created_at | TIMESTAMPTZ | Data de criação |

**Índices:**
- `idx_notifications_user`: Index em user_id
- `idx_notifications_read`: Index em read

**RLS Policies:**
- Usuários veem apenas suas notificações
- Usuários podem atualizar suas notificações (marcar como lida)

---

### messages

Mensagens do chat entre passageiro e motorista.

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| ride_id | UUID | FK rides(id) |
| sender_id | UUID | FK profiles(id) |
| message | TEXT | Conteúdo da mensagem |
| created_at | TIMESTAMPTZ | Data de criação |

**Índices:**
- `idx_messages_ride`: Index em ride_id

**RLS Policies:**
- Usuários veem mensagens das corridas que participam
- Usuários podem enviar mensagens nas corridas que participam

---

### favorites

Endereços favoritos dos usuários.

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK profiles(id) |
| address | TEXT | Endereço |
| label | TEXT | Rótulo (Casa, Trabalho, etc) |
| location | GEOGRAPHY(POINT) | Coordenadas |
| created_at | TIMESTAMPTZ | Data de criação |

**Constraints:**
- UNIQUE(user_id, address): Endereço único por usuário

**Índices:**
- `idx_favorites_user`: Index em user_id

**RLS Policies:**
- Usuários gerenciam apenas seus favoritos

---

### wallet_transactions

Transações da carteira digital.

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK profiles(id) |
| amount | DECIMAL(10,2) | Valor |
| type | transaction_type | Tipo (credit, debit, refund, withdrawal) |
| description | TEXT | Descrição |
| ride_id | UUID | FK rides(id), nullable |
| created_at | TIMESTAMPTZ | Data de criação |

**Índices:**
- `idx_wallet_transactions_user`: Index em user_id

**RLS Policies:**
- Usuários veem apenas suas transações
- Usuários podem criar transações

---

### coupons

Cupons de desconto.

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| code | TEXT | Código (UNIQUE) |
| discount_percentage | INTEGER | % de desconto |
| discount_amount | DECIMAL(10,2) | Valor fixo de desconto |
| max_uses | INTEGER | Usos máximos |
| current_uses | INTEGER | Usos atuais |
| valid_from | TIMESTAMPTZ | Válido de |
| valid_until | TIMESTAMPTZ | Válido até |
| is_active | BOOLEAN | Ativo? |
| created_at | TIMESTAMPTZ | Data de criação |

**Constraints:**
- UNIQUE(code)
- CHECK(discount_percentage >= 0 AND discount_percentage <= 100)

---

### user_coupons

Relação many-to-many entre usuários e cupons.

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK profiles(id) |
| coupon_id | UUID | FK coupons(id) |
| used | BOOLEAN | Usado? |
| used_at | TIMESTAMPTZ | Data de uso |
| created_at | TIMESTAMPTZ | Data de criação |

**Constraints:**
- UNIQUE(user_id, coupon_id): Cupom único por usuário

**RLS Policies:**
- Usuários veem apenas seus cupons
- Usuários podem atualizar seus cupons (usar)

---

### emergency_contacts

Contatos de emergência dos usuários.

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK profiles(id) |
| name | TEXT | Nome do contato |
| phone | TEXT | Telefone |
| relationship | TEXT | Relacionamento |
| created_at | TIMESTAMPTZ | Data de criação |

**RLS Policies:**
- Usuários gerenciam apenas seus contatos

---

### driver_documents

Documentos do motorista (CNH, CRLV, etc).

**Colunas:**
| Nome | Tipo | Descrição |
|------|------|-----------|
| id | UUID | PK |
| driver_id | UUID | FK driver_profiles(id) |
| document_type | TEXT | Tipo do documento |
| document_url | TEXT | URL do arquivo |
| verified | BOOLEAN | Verificado? |
| verified_at | TIMESTAMPTZ | Data de verificação |
| expires_at | TIMESTAMPTZ | Data de expiração |
| created_at | TIMESTAMPTZ | Data de criação |
| updated_at | TIMESTAMPTZ | Data de atualização |

**RLS Policies:**
- Motoristas gerenciam apenas seus documentos

---

## Enums

### user_type
```sql
CREATE TYPE user_type AS ENUM ('passenger', 'driver', 'both');
```

### ride_status
```sql
CREATE TYPE ride_status AS ENUM (
  'pending',
  'negotiating',
  'accepted',
  'in_progress',
  'completed',
  'cancelled'
);
```

### offer_status
```sql
CREATE TYPE offer_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'expired'
);
```

### payment_method
```sql
CREATE TYPE payment_method AS ENUM (
  'cash',
  'credit_card',
  'debit_card',
  'pix',
  'wallet'
);
```

### vehicle_type
```sql
CREATE TYPE vehicle_type AS ENUM (
  'economy',
  'comfort',
  'premium',
  'suv',
  'moto'
);
```

### transaction_type
```sql
CREATE TYPE transaction_type AS ENUM (
  'credit',
  'debit',
  'refund',
  'withdrawal'
);
```

---

## Funções e Triggers

### handle_new_user()

Cria automaticamente um perfil quando usuário se registra.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'passenger')::user_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### update_updated_at_column()

Atualiza automaticamente a coluna `updated_at`.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Migrations

Para criar o schema completo, execute:

```bash
psql -h [host] -U [user] -d [database] -f scripts/setup-database.sql
```

---

## Backup e Restore

### Backup
```bash
pg_dump -h [host] -U [user] -d [database] > backup.sql
```

### Restore
```bash
psql -h [host] -U [user] -d [database] < backup.sql
```

---

## Performance

### Índices Importantes

1. **Geoespaciais**: driver_profiles.current_location (GiST)
2. **Foreign Keys**: Todos os IDs têm índices
3. **Status**: rides.status para queries frequentes
4. **Datas**: rides.created_at para ordenação

### Queries Otimizadas

```sql
-- Buscar motoristas próximos (dentro de 5km)
SELECT * FROM driver_profiles
WHERE is_available = true
  AND ST_DWithin(
    current_location,
    ST_SetSRID(ST_MakePoint(-46.655882, -23.561414), 4326)::geography,
    5000
  );

-- Calcular distância entre dois pontos
SELECT ST_Distance(
  ST_SetSRID(ST_MakePoint(-46.655882, -23.561414), 4326)::geography,
  ST_SetSRID(ST_MakePoint(-46.689234, -23.578014), 4326)::geography
) / 1000 as distance_km;
```

---

## Segurança (RLS)

Todas as tabelas possuem RLS habilitado. Políticas principais:

1. **Isolamento de dados**: Usuários só acessam seus próprios dados
2. **Visibilidade controlada**: Motoristas veem corridas disponíveis
3. **Proteção de escrita**: Apenas donos podem modificar dados
4. **Auditoria**: `created_at` e `updated_at` em todas as tabelas

---

**Última atualização:** 2024
