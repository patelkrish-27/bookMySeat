# Integration Steps

## 1. pom.xml — add these dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

## 1b. application.yml — mail config (Gmail SMTP, fastest to set up for a demo)

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-gmail-address@gmail.com
    password: <16-char Google App Password, NOT your real Gmail password>
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

**Important:** Gmail blocks plain password login. Generate an "App Password":
Google Account → Security → 2-Step Verification (turn on) → App Passwords →
generate one for "Mail". Use that 16-character value, not your login password.

If Gmail SMTP feels risky this close to a deadline, **Mailtrap** (sandbox inbox,
free tier, no real emails sent) or **Brevo/Sendinblue** free SMTP are solid
fallbacks — same `spring.mail.*` properties, different host/port/credentials.

## 1c. Add the new table

```sql
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempt_count INT NOT NULL DEFAULT 0
);

ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
```
(Or let Hibernate `ddl-auto: update` create these for you in dev.)

## 2. Update your `User` entity to implement `UserDetails`

In `BookMySeatEntities.java`, change the `User` class:

```java
@Entity
@Table(name = "users")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String role; // "USER" or "ADMIN"

    @Builder.Default
    private boolean emailVerified = false;

    private Instant createdAt;

    // ---- UserDetails contract ----
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getUsername() {
        return email; // we authenticate by email, not a separate username field
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}
```

## 3. Add to `UserRepository`

```java
Optional<User> findByEmail(String email);
```

## 4. Fix package imports

I assumed package roots `com.bookmyseat.entity`, `com.bookmyseat.repository`,
`com.bookmyseat.security`, `com.bookmyseat.auth`. Update the `import` lines
in `ApplicationConfig.java` and `AuthenticationService.java` to match your
actual package structure.

## 5. application.yml — add JWT config

```yaml
jwt:
  secret: <base64-encoded-256-bit-secret>   # generate your own, don't reuse the placeholder
  expiration-ms: 3600000                     # 1 hour
```

Generate a real secret, e.g.:
```bash
openssl rand -base64 32
```

## 6. Frontend usage

- On register/login, store the returned `token` (e.g. in memory or an httpOnly
  cookie set by a backend proxy — avoid localStorage if you can, to reduce XSS risk).
- On every subsequent request to a protected endpoint (booking, payment), send:
  ```
  Authorization: Bearer <token>
  ```

## 7. What's now protected vs public

- Public: `/api/v1/auth/**`, `/api/v1/search/**`
- Protected (needs valid JWT): everything else — this is exactly where your
  upcoming `/api/v1/bookings/tentative` and `/api/v1/payments/confirm`
  endpoints will land, so Phase 2 will automatically require login.

## 8. Getting the logged-in user inside a controller (for Phase 2)

```java
@AuthenticationPrincipal User currentUser
```
as a controller method parameter gives you the authenticated `User` directly —
useful for `BookingController` to know who is booking.

## 9. New auth flow with email verification

```
POST /api/v1/auth/register     { name, email, password }
                                → 201, "Check your email for the code" (no token yet)

POST /api/v1/auth/verify-otp   { email, otp }
                                → 200, { token, name, email, role }  (now logged in)

POST /api/v1/auth/resend-otp   { email }
                                → 200, "A new code has been sent"

POST /api/v1/auth/login        { email, password }
                                → 200, { token, ... } if emailVerified=true
                                → 400 "Please verify your email before logging in" otherwise
```

## 10. Frontend changes needed

- After register succeeds, route the user to an **"Enter the code we emailed you"**
  screen instead of straight to login.
- That screen calls `/verify-otp`; on success you get the JWT immediately — store it
  and route to the homepage, no separate login step needed right after signup.
  Add a "Resend code" button hitting `/resend-otp`.
- If login returns the "verify your email" error, show the same OTP screen instead
  of a generic error, pre-filled with their email.

## 11. Interview talking points (this is the part that matters for Mastercard/fintech)

- **Why OTP over a verification link:** no email-client redirect issues, easier
  to demo live, same UX pattern as most fintech OTP flows (matches the domain).
- **Rate limiting:** `attemptCount` caps wrong guesses at 5 before forcing a resend —
  prevents brute-forcing a 6-digit code (1M combinations, but still finite).
- **One active token per user:** old OTP is deleted on resend/register, so a
  leaked older code can't be replayed.
- **Race condition handling:** duplicate concurrent registrations on the same
  email are caught via the DB unique constraint + `DataIntegrityViolationException`,
  not just an app-level check (which has a TOCTOU gap under concurrency —
  directly relevant to the same "double booking" concurrency theme as your
  seat-locking system).
- **Next natural step (mention even if you don't build it):** move OTP storage to
  Redis with a native TTL instead of a Postgres row + manual expiry check —
  same tool you're already using for seat locks, reused for a second purpose.
