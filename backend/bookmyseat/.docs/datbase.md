## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `email` | `varchar` |  Unique |
| `created_at` | `timestamp` |  Nullable |

## Table `movies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `varchar` |  |
| `description` | `text` |  Nullable |
| `duration_mins` | `int4` |  |
| `language` | `varchar` |  Nullable |
| `release_date` | `date` |  Nullable |
| `poster_url` | `varchar` |  Nullable |
| `backdrop_url` | `varchar` |  Nullable |

## Table `theaters`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  |
| `city` | `varchar` |  |
| `address` | `text` |  |
| `total_screens` | `int4` |  Nullable |

## Table `screens`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `theater_id` | `uuid` |  |
| `name` | `varchar` |  |
| `total_seats` | `int4` |  |

## Table `seats`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `screen_id` | `uuid` |  |
| `seat_row` | `varchar` |  |
| `seat_number` | `int4` |  |
| `seat_type` | `varchar` |  |

## Table `shows`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `movie_id` | `uuid` |  |
| `screen_id` | `uuid` |  |
| `start_time` | `timestamp` |  |
| `end_time` | `timestamp` |  |

## Table `show_seats`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `show_id` | `uuid` |  |
| `seat_id` | `uuid` |  |
| `price` | `numeric` |  |
| `status` | `varchar` |  Nullable |

## Table `bookings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `show_id` | `uuid` |  |
| `total_amount` | `numeric` |  |
| `status` | `varchar` |  |
| `created_at` | `timestamp` |  Nullable |

## Table `booking_seats`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `booking_id` | `uuid` | Primary |
| `show_seat_id` | `uuid` | Primary |

## Table `payments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `booking_id` | `uuid` |  |
| `amount` | `numeric` |  |
| `payment_method` | `varchar` |  Nullable |
| `payment_status` | `varchar` |  |
| `transaction_id` | `varchar` |  Nullable Unique |
| `idempotency_key` | `uuid` |  Nullable Unique |
| `created_at` | `timestamp` |  Nullable |

## Custom Types / Enums

### `seat_type_enum`

`REGULAR` | `PREMIUM` | `RECLINER`

### `seat_status_enum`

`AVAILABLE` | `LOCKED` | `BOOKED`

### `booking_status_enum`

`PENDING` | `CONFIRMED` | `CANCELLED` | `FAILED`

### `payment_status_enum`

`PENDING` | `SUCCESS` | `FAILED` | `REFUNDED`

