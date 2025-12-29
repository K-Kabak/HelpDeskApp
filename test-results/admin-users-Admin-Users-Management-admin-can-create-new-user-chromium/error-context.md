# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - heading "SerwisDesk" [level=1] [ref=e4]
    - paragraph [ref=e5]: Zaloguj si?t
    - generic [ref=e6]:
      - generic [ref=e7]:
        - text: Email
        - textbox "Email" [ref=e8]
      - generic [ref=e9]:
        - text: Haslo
        - textbox "Haslo" [ref=e10]
      - button "Zaloguj się" [ref=e11] [cursor=pointer]: Zaloguj
    - paragraph [ref=e12]: "Konto demo: admin@serwisdesk.local / Admin123!"
  - region "Notifications alt+T"
  - generic [ref=e19] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e20]:
      - img [ref=e21]
    - generic [ref=e24]:
      - button "Open issues overlay" [ref=e25]:
        - generic [ref=e26]:
          - generic [ref=e27]: "0"
          - generic [ref=e28]: "1"
        - generic [ref=e29]: Issue
      - button "Collapse issues badge" [ref=e30]:
        - img [ref=e31]
  - alert [ref=e33]
```