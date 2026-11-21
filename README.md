# О проекте

«МастерПлюс» — портал, на котором доступен заявки на ремонт бытовой техники с выездом мастера.

# База данных

Запусти MariaDB в Docker. Подключись через HeidiSQL и выполни по порядку sql/setup.sql, затем sql/optional-reviews.sql. Скрипты используют базу exam_repairs.

# Настройка окружения

Скопируй server/.env.example в server/.env. Заполни параметры подключения к MariaDB и JWT_SECRET. Для DB_PORT укажи порт Docker на хосте, по которому подключается HeidiSQL.

# Запуск и вход

Сервер — из корня Exam_Repairs, после импорта SQL и настройки .env:

```
cd server
npm ci
npm run create-admin
npm run dev
```

Клиент — в новом терминале, тоже из корня Exam_Repairs:

```
cd client
npm ci
npm run dev
```

Открой адрес, который выведет Vite. Для кода администратора укажи экзаменационные реквизиты Admin26 / Demo20.

[ER-диаграмма](docs/er-diagram.md)

[Скриншоты](client/public/screenshots)