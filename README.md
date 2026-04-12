# 🤖 AI Tools Platform

Платформа за управление и организиране на AI инструменти по категории и роли.

## 📋 Изисквания

- PHP 8.3+
- Composer
- Node.js 18+
- npm
- SQLite
- Redis 3.0+

## 🚀 Инсталация

### 1. Клонирай проекта

```bash
git clone https://github.com/your-username/ai-tools-platform.git
cd ai-tools-platform
```

### 2. Настрой Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=RoleSeeder
php artisan serve
```

### 3. Настрой Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### 4. Отвори браузъра
http://localhost:3000

## 🔑 Default данни за вход

След инсталация създай първи потребител чрез:

```bash
php artisan tinker
```

```php
App\Models\User::create([
    "name" => "Admin",
    "email" => "admin@admin.local",
    "password" => bcrypt("password"),
    "role" => "owner"
])
```

След това влез с:
- **Email:** admin@admin.local
- **Парола:** password

## ⚙️ Environment Variables

Основните променливи в `.env`:

```env
APP_NAME=Laravel
APP_ENV=local
APP_DEBUG=true

DB_CONNECTION=sqlite

REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

CACHE_STORE=redis

MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@example.com"
```

> За production смени `APP_ENV=production`, `APP_DEBUG=false` и настрой реален mail сървър.

## 🐳 Стартиране с Docker

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DB_CONNECTION=sqlite
      - REDIS_HOST=redis
      - REDIS_CLIENT=predis
    depends_on:
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

```bash
docker-compose up -d
```

## 🛠️ Как се добавят тулове

1. Влез в системата с твоя акаунт
2. Натисни **"Добави инструмент"** от dashboard-а или navbar-а
3. Попълни полетата:
   - **Име** — задължително
   - **Линк** — URL към инструмента
   - **Документация** — линк към официалната документация
   - **Описание** — кратко описание
   - **Как се използва** — стъпки за употреба
   - **Реални примери** — опционални примери
   - **Категории** — избери една или повече
   - **Роли** — препоръчителни роли за инструмента
   - **Тагове** — разделени със запетая
   - **Скрийншоти** — линкове разделени със запетая
4. Натисни **"Запази инструмент"**

> Инструментът получава статус **"Чакащ"** и трябва да бъде одобрен от owner.

## 👥 Ролева система и права

| Роля | Преглед | Добавяне | Редактиране | Изтриване | Админ панел |
|------|---------|----------|-------------|-----------|-------------|
| owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| backend | ✅ | ✅ | ✅ | ❌ | ❌ |
| frontend | ✅ | ✅ | ✅ | ❌ | ❌ |
| designer | ✅ | ❌ | ❌ | ❌ | ❌ |
| qa | ✅ | ❌ | ❌ | ❌ | ❌ |
| pm | ✅ | ❌ | ❌ | ❌ | ❌ |

## 📡 API Endpoints

### Публични
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /api/login | Вход в системата |
| POST | /api/two-factor/verify | Верификация на 2FA код |
| GET | /api/categories | Списък с категории |
| GET | /api/roles | Списък с роли |

### Защитени (изискват токен)
| Метод | Endpoint | Роли | Описание |
|-------|----------|------|----------|
| GET | /api/me | всички | Текущ потребител |
| PUT | /api/me/update | всички | Обнови профил |
| POST | /api/me/two-factor | всички | Включи/изключи 2FA |
| GET | /api/tools | всички | Списък с инструменти |
| POST | /api/tools | owner/backend/frontend | Добави инструмент |
| PUT | /api/tools/{id} | owner/backend/frontend | Редактирай инструмент |
| DELETE | /api/tools/{id} | owner | Изтрий инструмент |
| GET | /api/admin/tools | owner | Всички инструменти |
| GET | /api/admin/logs | owner | Одит лог |
| PUT | /api/admin/tools/{id}/approve | owner | Одобри инструмент |
| PUT | /api/admin/tools/{id}/reject | owner | Откажи инструмент |
| GET | /api/tools/{id}/comments | всички | Коментари на инструмент |
| POST | /api/tools/{id}/comments | всички | Добави коментар |
| DELETE | /api/comments/{id} | всички | Изтрий коментар |
| GET | /api/tools/{id}/ratings | всички | Рейтинг на инструмент |
| POST | /api/tools/{id}/ratings | всички | Добави рейтинг |

## 🤖 AI Агенти и промтове

За пълна документация на AI агентите и промтовете вижте [AGENTS.md](./AGENTS.md).

## 🔐 Сигурност

- Автентикация с Laravel Sanctum
- Двуфакторна автентикация (Email 2FA)
- Middleware защита на routes според роли
- Валидация на всички входни данни на backend и frontend ниво

## 📊 Кеширане

- Категориите се кешират в Redis за 1 час
- Броят на инструментите се кешира и обновява при промяна
- При добавяне, редактиране или изтриване кешът се изчиства автоматично

## 📝 Одит лог

Системата записва всички действия с потребител, дата и час:

| Действие | Описание |
|----------|----------|
| ➕ create | Добавен нов инструмент |
| ✏️ update | Редактиран инструмент |
| 🗑️ delete | Изтрит инструмент |
| ✅ approve | Одобрен инструмент |
| ❌ reject | Отказан инструмент |

## 📁 Структура на проекта


ai-tools-platform/
├── backend/
│ ├── app/
│ │ ├── Http/
│ │ │ ├── Controllers/
│ │ │ └── Middleware/
│ │ ├── Models/
│ ├── database/
│ │ ├── migrations/
│ │ └── seeders/
│ └── routes/
│ └── api.php
│
├── frontend/
│ ├── app/
│ │ ├── dashboard/
│ │ ├── tools/
│ │ ├── tools/[id]/
│ │ ├── add-tool/
│ │ ├── admin/
│ │ ├── profile/
│ │ └── components/
│
├── README.md
└── AGENTS.md