# ProductHub – College Submission Screenshots Checklist

Capture genuine screenshots from the deployed application and Atlas. Save them under a `screenshots/` directory and label each figure in the report. Do not include credentials, connection strings, access tokens, or private keys.

## Required evidence

| # | Screenshot | What it must show | Status |
|---:|---|---|---|
| 1 | Production dashboard | Browser address bar, dashboard metrics, connected database status | Capture / confirm saved |
| 2 | Product catalogue | Vercel URL and 12 of 12 product cards | Captured in conversation |
| 3 | Search result | Search term and filtered product results | Pending capture |
| 4 | Add product | Add form and successful creation toast using a temporary test record | Pending clean capture |
| 5 | Update product | Updated product and success notification | Captured in conversation |
| 6 | Delete product | Deletion success notification and catalogue count change | Captured in conversation |
| 7 | Restored product | Logitech P1009 with correct image, description, specification | Captured in conversation |
| 8 | Render API root | Render URL and API running JSON response | Captured in conversation |
| 9 | Render health endpoint | `/api/health` showing Healthy and database Connected; redact no secrets because none should appear | Captured in conversation |
| 10 | Atlas collection | `product_catalogue.products` and 12 documents | Pending capture |
| 11 | Atlas sample document | Expanded BSON/JSON document showing nested `specifications` | Pending capture |
| 12 | Deployment dashboard | Render service LIVE and Vercel production deployment READY | Pending fresh capture |
| 13 | EC2 VM evidence (only if required) | Running Ubuntu EC2 instance and security group | Not available – EC2 not created |

## Capture instructions

- Keep the browser address bar visible for hosted application evidence.
- Capture full, readable pages at a consistent zoom level.
- Use a temporary product for create/update/delete demonstrations; restore the sample dataset to 12 after testing.
- Do not edit or fabricate screenshots. The screenshots already shared in the conversation are evidence, but save original image files locally for the final submission.
- If faculty requires EC2, capture the actual EC2 console and VM-hosted application only after it has been provisioned and tested.
