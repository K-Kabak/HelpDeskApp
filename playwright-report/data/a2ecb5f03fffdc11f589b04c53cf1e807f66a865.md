# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e3]:
    - heading "SerwisDesk" [level=1] [ref=e4]
    - paragraph [ref=e5]: Zaloguj si?t
    - generic [ref=e6]:
      - generic [ref=e7]:
        - text: Email
        - textbox "Email" [active] [ref=e8]: agent@serwisdesk.local
      - generic [ref=e9]:
        - text: Haslo
        - textbox "Haslo" [ref=e10]
      - button "Zaloguj się" [ref=e11] [cursor=pointer]: Zaloguj
    - paragraph [ref=e12]: "Konto demo: admin@serwisdesk.local / Admin123!"
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e20] [cursor=pointer]:
    - img [ref=e21]
  - alert [ref=e24]
```