# Инструкция по запуску Seed (тестовые данные)

## Что делает seed.js

Скрипт `backApi/src/seed/seed.js` заполняет базу данных тестовыми данными:

- **Категории**: 8 категорий (Классические роллы, Запечённые роллы, Суши, и т.д.)
- **Товары**: 3 тестовых товара с изображениями
- **Акция**: Скидка 20% при заказе от 2000₽
- **Администратор**: логин `admin`, пароль `admin123`

## Подготовка изображений

Изображения для seed уже скопированы в `backApi/uploads/`:
- `card-1.png` - Запечённая филадельфия
- `card-2.png` - Запечённый Эби
- `card-3.png` - Запечённый Цезарь

## Как запустить seed

### 1. Убедитесь, что MongoDB запущен

```bash
# Проверьте статус MongoDB
brew services list | grep mongodb

# Если не запущен, запустите:
brew services start mongodb-community
```

### 2. Перейдите в папку backend

```bash
cd backApi
```

### 3. Установите зависимости (если ещё не установлены)

```bash
npm install
```

### 4. Запустите seed

```bash
npm run seed
```

Или напрямую:

```bash
node src/seed/seed.js
```

## Что произойдёт

1. **Очистка**: Все существующие категории, товары, акции и пользователи будут удалены
2. **Создание**: Будут созданы новые тестовые данные
3. **Завершение**: Скрипт автоматически завершится с сообщением "Готово!"

## Проверка результата

### Через MongoDB Compass или mongosh

```javascript
// Подключитесь к базе tokyo-express
use tokyo-express

// Проверьте категории
db.categories.find().pretty()

// Проверьте товары
db.products.find().pretty()

// Проверьте администратора
db.users.find().pretty()
```

### Через приложение

1. Запустите backend: `npm run dev`
2. Запустите frontend: `cd ../front && npm run dev`
3. Откройте http://localhost:5173
4. Вы увидите 3 товара на главной странице с изображениями
5. Войдите в админ-панель: логин `admin`, пароль `admin123`

## Проверка изображений

После запуска seed изображения должны отображаться по адресам:
- http://localhost:5001/uploads/card-1.png
- http://localhost:5001/uploads/card-2.png
- http://localhost:5001/uploads/card-3.png

## Устранение проблем

### Ошибка подключения к MongoDB

```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Решение**: Запустите MongoDB
```bash
brew services start mongodb-community
```

### Изображения не отображаются

**Проверьте**:
1. Папка `backApi/uploads/` существует и содержит файлы `card-1.png`, `card-2.png`, `card-3.png`
2. Backend раздаёт статику на `/uploads` (проверьте в `server.js`)
3. Frontend использует правильный API URL в `.env`: `VITE_API_URL=http://localhost:5001`

**Переcкопируйте изображения**:
```bash
cp front/public/images/card-*.png backApi/uploads/
```

### Товары не отображаются на фронтенде

**Проверьте**:
1. Backend запущен и доступен на http://localhost:5001
2. API возвращает товары: http://localhost:5001/api/catalog/products
3. Frontend настроен на правильный API URL

## Добавление новых тестовых данных

Отредактируйте `backApi/src/seed/seed.js`:

1. **Добавить категорию**: Добавьте в массив `categoriesData`
2. **Добавить товар**: Добавьте в массив `productsRaw`
3. **Изображения**: Поместите файл в `backApi/uploads/` и укажите путь `/uploads/filename.png`

Пример добавления товара:

```javascript
{
    name: "Калифорния",
    slug: "kalifornia",
    categorySlug: "classic",
    price: 450,
    weight: "240 г",
    composition: "рис, нори, краб, авокадо, огурец, икра масаго",
    image: "/uploads/kalifornia.png",
    popularity: 9,
    position: 4,
},
```

Не забудьте скопировать изображение:
```bash
cp path/to/kalifornia.png backApi/uploads/
```

## Скрипты package.json

Убедитесь, что в `backApi/package.json` есть скрипт:

```json
{
  "scripts": {
    "seed": "node src/seed/seed.js"
  }
}
```
