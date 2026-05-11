# 🎌 AniTrack

> Современный трекер аниме — ищи, добавляй в списки, следи за прогрессом.

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

---

## Что умеет

**🔍 Поиск** — начни вводить название и сразу видишь результаты с обложкой и оценкой. Поддерживает фильтры по жанру, году, сезону и формату.

**🎬 Каталог** — тысячи аниме с бесконечной прокруткой. Переключай между сеткой и списком, сортируй по популярности, рейтингу или дате выхода.

**📋 Мои списки** — добавляй аниме в одну из пяти категорий: *Смотрю*, *Запланировано*, *Просмотрено*, *Брошено*, *Пересматриваю*. Отмечай просмотренные серии и выставляй оценки.

**💡 Рекомендации** — персональная лента на основе твоего списка.

**🌐 7 языков** — интерфейс и названия аниме на русском 🇷🇺, английском 🇬🇧, украинском 🇺🇦, японском 🇯🇵, немецком 🇩🇪, французском 🇫🇷 и испанском 🇪🇸. Русские названия подгружаются автоматически.

---

## Запуск

```bash
git clone https://github.com/undrsano/anime_tracker.git
cd anime_tracker
npm install
npm run dev
```

Открой [http://localhost:5173](http://localhost:5173)

---

## Сборка

```bash
npm run build    # собрать в /dist
npm run preview  # запустить сборку локально
```

---

## Стек

[Vite](https://vitejs.dev) · [React 18](https://react.dev) · [TypeScript](https://www.typescriptlang.org) · [Tailwind CSS](https://tailwindcss.com) · [TanStack Query](https://tanstack.com/query) · [Framer Motion](https://www.framer.com/motion) · [Zustand](https://zustand-demo.pmnd.rs)

Данные — [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs) и [Shikimori API](https://shikimori.one/api/doc). Авторизация не требуется.
