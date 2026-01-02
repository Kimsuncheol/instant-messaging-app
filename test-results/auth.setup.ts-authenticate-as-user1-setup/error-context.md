# Page snapshot

```yaml
- generic [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - main [ref=e12]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - img [ref=e19]
        - heading "WhatsApp" [level=4] [ref=e21]
        - paragraph [ref=e22]: Simple. Secure. Reliable messaging.
      - generic [ref=e23]:
        - heading "Sign in to continue" [level=6] [ref=e24]
        - paragraph [ref=e25]: Enter your credentials or use Google
        - generic [ref=e26]:
          - generic [ref=e28]:
            - textbox "Email address" [ref=e29]: user1@example.com
            - group
          - generic [ref=e31]:
            - textbox "Password" [active] [ref=e32]: user1@
            - button [ref=e34] [cursor=pointer]:
              - img [ref=e35]
            - group
          - button "Sign In" [ref=e37] [cursor=pointer]
        - generic [ref=e38]:
          - separator [ref=e39]
          - generic [ref=e40]: or
          - separator [ref=e41]
        - button "Continue with Google" [ref=e42] [cursor=pointer]:
          - img [ref=e44]
          - text: Continue with Google
      - generic [ref=e46]:
        - paragraph [ref=e47]: New to WhatsApp? Sign up
        - paragraph [ref=e48]: Forgot your password? Reset Password
```