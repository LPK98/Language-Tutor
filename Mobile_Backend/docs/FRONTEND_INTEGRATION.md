# Connecting the React Native app to the backend

Nothing in `Mobile_Frontend` has been changed. The steps below are **optional and incremental**: switch one screen at a time, and keep the local constants as an offline fallback.

## Where each screen's data comes from

| Screen (file) | Local constant today | API endpoint |
|---|---|---|
| Home carousel (`src/app/tabs/home.tsx`) | `LESSONS` | `GET /api/lessons/featured` |
| Tutor (Home, Lessons, Profile) | `EMMA` | `GET /api/tutors`, or `tutor` in `GET /api/users/me` |
| Lessons path (`src/app/tabs/lessons.tsx`) | `LEARNING_PATHS` | `GET /api/learning-paths` |
| Practice (`src/app/tabs/practice.tsx`) | `RECOMMENDED`, `PRACTICE_CATEGORIES`, `PRACTICE_SECTIONS` | `GET /api/practice/recommended`, `/categories`, `/sections` |
| Practice set (`src/app/practice/[id].tsx`) | `PRACTICE_SETS` | `GET /api/practice/sets/{id}` |
| Profile (`src/app/tabs/profile.tsx`) | `PROFILE` | `GET /api/users/me` (sign-in required) |
| Streak modal (`src/app/streak/index.tsx`) | `PROFILE.streak` | `GET /api/progress/streak` (sign-in required) |

The response fields match the TypeScript types, with two deliberate differences:

1. **`image` → `imageKey`.** An API can't send `require(...)`, so it sends a name (`"grammar"`) and the app maps it to the bundled file (step 2 below). `avatar` → `avatarUrl` for the same reason.
2. **Learning paths send `lessons`, not `rows`.** Rows and connectors are layout, which the app already calculates in `buildLevel`. Node `color` is also left to the app.

---

## Step 1: API client

**FILE:** `Mobile_Frontend/src/services/api.ts` (new file)
**CHANGE:** add a small `fetch` wrapper.
**WHY:** keeps the base URL, JSON handling and errors in one place instead of in every screen.

```ts
/**
 * Base URL of the FastAPI backend, from `EXPO_PUBLIC_API_URL` in Mobile_Frontend/.env:
 * - Expo web / iOS simulator:  http://localhost:8000
 * - Android emulator:          http://10.0.2.2:8000
 * - Physical phone (Expo Go):  http://<your computer's LAN IP>:8000
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

export async function api<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // Backend errors are always {"detail": "..."}; validation errors (422) carry a list.
    const detail = typeof data?.detail === 'string' ? data.detail : 'Something went wrong';
    throw new ApiError(response.status, detail);
  }
  return data as T;
}
```

**FILE:** `Mobile_Frontend/.env` (new file, and add `.env` to `Mobile_Frontend/.gitignore` if it isn't there)

```
EXPO_PUBLIC_API_URL=http://192.168.1.20:8000
```

`EXPO_PUBLIC_` variables are bundled into the app, which is fine for a URL. Never put secrets there. Restart `npx expo start` after changing it.

## Step 2: Map image keys to bundled images

**FILE:** `Mobile_Frontend/src/constants/images.ts` (new file)
**WHY:** turns the API's `imageKey` back into the `require()` the components expect.

```ts
import type { ImageSourcePropType } from 'react-native';

const IMAGES: Record<string, ImageSourcePropType> = {
  grammar: require('@/assets/images/Grammer.png'),
  lesson: require('@/assets/images/lesson.png'),
  pronunciation: require('@/assets/images/Pronounce.png'),
};

export const imageFor = (key: string | null | undefined): ImageSourcePropType | null =>
  (key && IMAGES[key]) || null;
```

## Step 3: Example: the Home carousel

**FILE:** `Mobile_Frontend/src/app/tabs/home.tsx`
**CHANGE:** start from the local `LESSONS`, then replace them with API data when it arrives.
**WHY:** the screen renders immediately and still works offline or if the server is down.

Add the imports:

```ts
import { useEffect, useState } from 'react';

import { api } from '@/services/api';
import { imageFor } from '@/constants/images';
import { EMMA, LESSONS, categoryColor, type Lesson } from '@/constants/lessons';

type ApiLesson = Omit<Lesson, 'image'> & { imageKey: string | null };
```

Inside `HomeScreen`, replace `const activeLesson = LESSONS[activeIndex];` with:

```ts
  const [lessons, setLessons] = useState<Lesson[]>(LESSONS);

  useEffect(() => {
    api<ApiLesson[]>('/api/lessons/featured')
      .then((items) => setLessons(items.map(({ imageKey, ...lesson }) => ({ ...lesson, image: imageFor(imageKey) }))))
      .catch(() => {}); // keep the bundled lessons
  }, []);

  const activeLesson = lessons[activeIndex];
```

Then replace the remaining `LESSONS` with `lessons` in that file (in `handleMomentumEnd`, the `.map(...)`, and `CarouselDots count=`).

Practice, the practice set and the tutor follow the same pattern. Their response shapes already match the types in `practice.ts` and `vocabulary.ts`, apart from `imageKey`.

## Step 4: Learning paths

**FILE:** `Mobile_Frontend/src/constants/learningPath.ts`
**CHANGE:** add an exported function after `buildLevel`.
**WHY:** reuses the existing zig-zag layout for API data and applies `completed`. The ids match because the backend creates them with the same rule as `toNode`.

```ts
export type ApiLearningPath = {
  id: string;
  level: string;
  lessons: { id: string; title: string; emoji: string | null; completed: boolean }[];
};

export function levelFromApi(path: ApiLearningPath, hasMore: boolean): LearningPath {
  const built = buildLevel(
    path.id,
    path.level,
    path.lessons.map((lesson): NodeSpec => [lesson.title, lesson.emoji ?? '\u{1F4D8}']),
    hasMore,
  );
  const completed = new Set(path.lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.id));
  for (const row of built.rows) {
    for (const node of row.nodes) {
      node.completed = completed.has(node.id);
    }
  }
  return built;
}
```

In `lessons.tsx`: `const paths = apiPaths.map((path, i) => levelFromApi(path, i < apiPaths.length - 1));`

## Step 5: Sign-in (when you build the screens)

There are no Login or Register screens yet: the Profile "Sign In" button does nothing. When you add them:

1. Install secure storage: `npx expo install expo-secure-store` (in `Mobile_Frontend`).
2. Call `POST /api/auth/login` or `/register` and save `accessToken` with `SecureStore.setItemAsync('token', ...)`. Don't use AsyncStorage for tokens.
3. Pass `token` to `api(...)` for Profile, Streak and Progress calls.
4. On `ApiError` with `status === 401`, delete the token and show the sign-in screen.
5. To send the local date, use the app's existing helper: `api('/api/users/me?date=' + toISODate(new Date()), { token })`.

Guests can keep using Home, Lessons and Practice: those endpoints are public.

## Frontend points to know about

- `TutorHero` gets `streak={0}` and `giftCount={1}` hard-coded in `lessons.tsx`. The streak can come from `currentStreak` in `GET /api/progress/streak`. Gifts have no backend (no evidence of what they are).
- These buttons are placeholders (`onPress={() => {}}`) with no backend yet: lesson **Start**, path node press, topic cards, category chips, "see all", **Recap All**, pronunciation **listen/practice**, **Free Talk**, **Adjust Goal**, the Language/Level/Interest cards, and **PRO**. The endpoints for Adjust Goal and Level already exist (`PATCH /api/users/me`).
- Nothing in the UI sets a term's status yet, although `Term.status` exists and the progress card counts it. `PUT /api/practice/sets/{id}/terms/{termId}/status` is ready for when you add those buttons.
