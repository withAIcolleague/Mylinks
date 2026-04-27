# Mylinks

개인 즐겨찾기 링크를 모아두는 홈 화면 앱. Next.js + Tailwind로 만든 정적 SPA이며, 모든 데이터는 **브라우저 localStorage**에만 저장됩니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| 링크 추가 | `+` 버튼 또는 북마클릿으로 현재 탭 URL 즉시 추가 |
| 링크 삭제 | 링크 박스 우클릭 → 삭제 / 롱프레스(모바일) → 다중 선택 삭제 |
| 레이아웃 편집 | 설정 → 레이아웃 편집 → 드래그앤드롭으로 순서 변경 |
| 테마 | 시스템 / 라이트 / 다크 전환 |
| 컬럼 수 | 2 / 3 / 4 / 5열 선택 |
| 박스 크기 | 소 / 중 / 대 선택 |

## 기술 스택

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS**
- **shadcn/ui**
- **@dnd-kit** (드래그앤드롭)
- **lucide-react** (아이콘)

## 로컬 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속.

## 북마클릿 설치

브라우저 북마크 바에 아래 코드를 새 북마크로 추가하면, 클릭 시 현재 탭 URL과 제목이 자동으로 Mylinks 추가 모달로 전달됩니다.

```javascript
javascript:(function(){location.href='https://<배포URL>/?add=1&url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title)})();
```

`<배포URL>` 부분을 실제 배포 주소로 교체하세요.

## 기본 링크 수정 방법

`app/page.tsx`의 `DEFAULT_LINKS` 배열을 편집합니다.

```ts
const DEFAULT_LINKS: Link[] = [
  { id: "1", title: "사이트명", url: "https://example.com/" },
  // ...
]
```

링크를 추가·삭제·수정한 뒤 `LINKS_VERSION` 값을 올려주면, 기존 사용자에게도 새 기본 링크가 반영됩니다.

```ts
const LINKS_VERSION = "5"  // 수정할 때마다 숫자 1씩 증가
```

> **주의**: 버전을 올리면 사용자가 직접 추가/재배열한 링크가 기본값으로 초기화됩니다.

## 데이터 저장 구조

| localStorage 키 | 내용 |
|-----------------|------|
| `my-links` | 현재 링크 배열 (JSON) |
| `my-links-version` | 버전 문자열 (기본값 리셋 트리거) |
| `my-links-settings` | 테마·컬럼·박스크기 설정 (JSON) |

## 배포

Vercel에 레포지토리를 연결하면 `main` 브랜치 푸시 시 자동 배포됩니다.
