# Documentação da API - Uppi

## Índice
- [Autenticação](#autenticação)
- [Corridas](#corridas)
- [Ofertas](#ofertas)
- [Avaliações](#avaliações)
- [Perfil](#perfil)
- [Carteira](#carteira)
- [Favoritos](#favoritos)
- [Notificações](#notificações)
- [Mensagens](#mensagens)
- [Cupons](#cupons)
- [Geocoding](#geocoding)
- [Motorista](#motorista)
- [Estatísticas](#estatísticas)

---

## Autenticação

Todas as rotas da API requerem autenticação via Supabase Auth. O token JWT deve ser enviado automaticamente pelo cliente Supabase.

### Middleware

O middleware (`middleware.ts`) protege todas as rotas `/app/*` redirecionando usuários não autenticados para `/onboarding/splash`.

---

## Corridas

### POST /api/rides
Cria uma nova solicitação de corrida.

**Body:**
```json
{
  "pickup_address": "Av. Paulista, 1000",
  "dropoff_address": "Av. Faria Lima, 2000",
  "pickup_lat": -23.561414,
  "pickup_lng": -46.655882,
  "dropoff_lat": -23.578014,
  "dropoff_lng": -46.689234,
  "passenger_price_offer": 25.00,
  "distance_km": 5.2,
  "estimated_duration_minutes": 15,
  "payment_method": "pix"
}
```

**Response:**
```json
{
  "id": "uuid",
  "passenger_id": "uuid",
  "pickup_address": "Av. Paulista, 1000",
  "dropoff_address": "Av. Faria Lima, 2000",
  "status": "pending",
  "created_at": "2024-01-01T10:00:00Z"
}
```

### GET /api/rides
Lista corridas do usuário autenticado.

**Query Params:**
- `status` (opcional): Filtrar por status (pending, accepted, in_progress, completed, cancelled)

**Response:**
```json
{
  "rides": [
    {
      "id": "uuid",
      "pickup_address": "Av. Paulista, 1000",
      "dropoff_address": "Av. Faria Lima, 2000",
      "status": "pending",
      "passenger_price_offer": 25.00,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### POST /api/rides/[id]/cancel
Cancela uma corrida.

**Body:**
```json
{
  "reason": "Mudança de planos"
}
```

**Response:**
```json
{
  "success": true,
  "ride": {
    "id": "uuid",
    "status": "cancelled"
  }
}
```

### POST /api/rides/[id]/status
Atualiza o status de uma corrida.

**Body:**
```json
{
  "status": "in_progress"
}
```

**Response:**
```json
{
  "success": true,
  "ride": {
    "id": "uuid",
    "status": "in_progress"
  }
}
```

---

## Ofertas

### POST /api/offers
Motorista cria uma oferta para uma corrida.

**Body:**
```json
{
  "ride_id": "uuid",
  "offer_price": 22.50,
  "message": "Posso chegar em 5 minutos!"
}
```

**Response:**
```json
{
  "id": "uuid",
  "ride_id": "uuid",
  "driver_id": "uuid",
  "offered_price": 22.50,
  "message": "Posso chegar em 5 minutos!",
  "status": "pending",
  "expires_at": "2024-01-01T11:00:00Z"
}
```

### GET /api/offers
Lista ofertas para uma corrida.

**Query Params:**
- `ride_id` (obrigatório): ID da corrida

**Response:**
```json
{
  "offers": [
    {
      "id": "uuid",
      "offered_price": 22.50,
      "message": "Posso chegar em 5 minutos!",
      "status": "pending",
      "driver": {
        "id": "uuid",
        "full_name": "João Silva",
        "avatar_url": "https://...",
        "rating": 4.8,
        "total_rides": 150,
        "driver_profile": {
          "vehicle_type": "comfort",
          "vehicle_brand": "Fiat",
          "vehicle_model": "Cronos",
          "vehicle_color": "Branco",
          "vehicle_plate": "ABC1234"
        }
      }
    }
  ]
}
```

### POST /api/offers/[id]/accept
Passageiro aceita uma oferta.

**Response:**
```json
{
  "success": true,
  "ride": {
    "id": "uuid",
    "driver_id": "uuid",
    "final_price": 22.50,
    "status": "accepted"
  }
}
```

---

## Avaliações

### POST /api/ratings
Cria uma avaliação para uma corrida concluída.

**Body:**
```json
{
  "ride_id": "uuid",
  "reviewed_id": "uuid",
  "rating": 5,
  "comment": "Excelente motorista!",
  "tags": ["pontual", "educado", "carro_limpo"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "ride_id": "uuid",
  "reviewer_id": "uuid",
  "reviewed_id": "uuid",
  "rating": 5,
  "comment": "Excelente motorista!",
  "tags": ["pontual", "educado", "carro_limpo"]
}
```

### GET /api/ratings
Lista avaliações de um usuário.

**Query Params:**
- `user_id` (opcional): ID do usuário avaliado

**Response:**
```json
{
  "ratings": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Excelente motorista!",
      "tags": ["pontual", "educado"],
      "reviewer": {
        "full_name": "Maria Santos",
        "avatar_url": "https://..."
      },
      "ride": {
        "pickup_address": "Av. Paulista",
        "dropoff_address": "Av. Faria Lima"
      },
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

## Perfil

### GET /api/profile
Obtém perfil do usuário autenticado.

**Response:**
```json
{
  "id": "uuid",
  "full_name": "João Silva",
  "phone": "+5511999999999",
  "avatar_url": "https://...",
  "user_type": "passenger",
  "rating": 4.8,
  "total_rides": 45
}
```

### PUT /api/profile
Atualiza perfil do usuário.

**Body:**
```json
{
  "full_name": "João Silva Santos",
  "phone": "+5511999999999",
  "avatar_url": "https://..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "full_name": "João Silva Santos",
  "phone": "+5511999999999",
  "avatar_url": "https://...",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

---

## Carteira

### GET /api/wallet
Obtém saldo e transações da carteira.

**Response:**
```json
{
  "balance": 150.50,
  "transactions": [
    {
      "id": "uuid",
      "amount": 50.00,
      "type": "credit",
      "description": "Recarga via PIX",
      "created_at": "2024-01-01T10:00:00Z"
    },
    {
      "id": "uuid",
      "amount": 25.00,
      "type": "debit",
      "description": "Pagamento corrida #123",
      "ride_id": "uuid",
      "created_at": "2024-01-01T09:00:00Z"
    }
  ]
}
```

### POST /api/wallet
Adiciona crédito à carteira.

**Body:**
```json
{
  "amount": 50.00,
  "type": "credit",
  "description": "Recarga via PIX"
}
```

**Response:**
```json
{
  "transaction": {
    "id": "uuid",
    "amount": 50.00,
    "type": "credit",
    "description": "Recarga via PIX",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

---

## Favoritos

### GET /api/favorites
Lista endereços favoritos.

**Response:**
```json
{
  "favorites": [
    {
      "id": "uuid",
      "label": "Casa",
      "address": "Rua das Flores, 123",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### POST /api/favorites
Adiciona endereço favorito.

**Body:**
```json
{
  "label": "Trabalho",
  "address": "Av. Paulista, 1000",
  "latitude": -23.561414,
  "longitude": -46.655882
}
```

### DELETE /api/favorites/[id]
Remove endereço favorito.

---

## Notificações

### GET /api/notifications
Lista notificações do usuário.

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "Nova oferta recebida",
      "message": "Você recebeu uma oferta de R$ 22,50",
      "type": "offer",
      "read": false,
      "ride_id": "uuid",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### PUT /api/notifications/[id]
Marca notificação como lida.

**Body:**
```json
{
  "read": true
}
```

---

## Mensagens

### GET /api/messages
Lista mensagens de uma corrida.

**Query Params:**
- `ride_id` (obrigatório): ID da corrida

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "ride_id": "uuid",
      "sender_id": "uuid",
      "message": "Estou chegando!",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### POST /api/messages
Envia mensagem no chat da corrida.

**Body:**
```json
{
  "ride_id": "uuid",
  "message": "Estou chegando!"
}
```

---

## Cupons

### GET /api/coupons
Lista cupons disponíveis.

**Response:**
```json
{
  "coupons": [
    {
      "id": "uuid",
      "code": "PRIMEIRA10",
      "discount_percentage": 10,
      "valid_until": "2024-12-31T23:59:59Z",
      "is_active": true
    }
  ]
}
```

### POST /api/coupons
Adiciona cupom à conta do usuário.

**Body:**
```json
{
  "code": "PRIMEIRA10"
}
```

**Response:**
```json
{
  "coupon": {
    "id": "uuid",
    "user_id": "uuid",
    "coupon_id": "uuid",
    "used": false
  }
}
```

---

## Geocoding

### GET /api/geocode
Converte endereço em coordenadas (geocoding).

**Query Params:**
- `address` (obrigatório): Endereço para geocodificar

**Response:**
```json
{
  "latitude": -23.561414,
  "longitude": -46.655882,
  "formatted_address": "Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
}
```

### POST /api/geocode
Converte coordenadas em endereço (reverse geocoding).

**Body:**
```json
{
  "latitude": -23.561414,
  "longitude": -46.655882
}
```

**Response:**
```json
{
  "address": "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
  "latitude": -23.561414,
  "longitude": -46.655882
}
```

---

## Places (Google)

### GET /api/places/autocomplete
Autocomplete de endereços usando Google Places.

**Query Params:**
- `input` (obrigatório): Texto para busca

**Response:**
```json
{
  "predictions": [
    {
      "place_id": "ChIJ...",
      "description": "Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
    }
  ]
}
```

### GET /api/places/details
Detalhes de um local usando Google Places.

**Query Params:**
- `place_id` (obrigatório): Google Place ID

**Response:**
```json
{
  "result": {
    "place_id": "ChIJ...",
    "formatted_address": "Av. Paulista, 1000",
    "geometry": {
      "location": {
        "lat": -23.561414,
        "lng": -46.655882
      }
    }
  }
}
```

---

## Motorista

### GET /api/driver/documents
Obtém documentos do motorista.

**Response:**
```json
{
  "vehicle_type": "comfort",
  "vehicle_brand": "Fiat",
  "vehicle_model": "Cronos",
  "vehicle_year": 2022,
  "vehicle_plate": "ABC1234",
  "vehicle_color": "Branco",
  "license_number": "12345678900",
  "is_verified": true
}
```

### POST /api/driver/documents
Atualiza ou cria perfil de motorista.

**Body:**
```json
{
  "vehicle_type": "comfort",
  "vehicle_brand": "Fiat",
  "vehicle_model": "Cronos",
  "vehicle_year": 2022,
  "vehicle_plate": "ABC1234",
  "vehicle_color": "Branco",
  "license_number": "12345678900"
}
```

---

## Estatísticas

### GET /api/stats
Obtém estatísticas do usuário.

**Response:**
```json
{
  "total_rides": 45,
  "total_spent": 1250.50,
  "average_rating": 4.8,
  "favorite_destinations": [
    {
      "address": "Av. Paulista",
      "count": 10
    }
  ]
}
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Proibido |
| 404 | Não encontrado |
| 500 | Erro interno do servidor |

---

## Rate Limiting

Atualmente não há rate limiting implementado, mas recomenda-se:
- Máximo de 100 requisições por minuto por usuário
- Máximo de 1000 requisições por hora por usuário

---

## Realtime Subscriptions

O app usa Supabase Realtime para atualizações em tempo real:

### Ofertas
```typescript
supabase
  .channel(`offers-${rideId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'price_offers',
    filter: `ride_id=eq.${rideId}`
  }, (payload) => {
    // Nova oferta recebida
  })
  .subscribe()
```

### Mensagens
```typescript
supabase
  .channel(`chat-${rideId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `ride_id=eq.${rideId}`
  }, (payload) => {
    // Nova mensagem recebida
  })
  .subscribe()
```

---

**Última atualização:** 2024
