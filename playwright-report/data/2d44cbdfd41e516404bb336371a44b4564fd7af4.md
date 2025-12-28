# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - heading "SerwisDesk" [level=1] [ref=e4]
    - paragraph [ref=e5]: Zaloguj się
    - generic [ref=e6]:
      - generic [ref=e7]:
        - text: Email
        - textbox "Email" [ref=e8]: agent@serwisdesk.local
      - generic [ref=e9]:
        - text: Hasło
        - textbox "Hasło" [ref=e10]: Agent123!
      - alert [ref=e11]: Błędny email lub hasło
      - button "Zaloguj" [ref=e12] [cursor=pointer]
    - paragraph [ref=e13]: "Konto demo: admin@serwisdesk.local / Admin123!"
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e21] [cursor=pointer]:
    - img [ref=e22]
  - alert [ref=e25]
```