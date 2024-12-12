---
sidebar_position: 10
---

# Upgrade Firebase Cloud Functions to v2

## Key benefits

The most important ones are:

- **Enhanced Concurrency**: Better handling of simultaneous function executions
- **Improved Resource Limits**: higher memory allocation, extended request timeout, increased CPU options
- **Better Cold Start Performance**: Functions initialize faster

In short, an improvement in terms of performance.

## Faced problems

Required IAM Roles

- Higher version of `firebase-tools` required
- `Firebase Extensions Viewer` role for service account required, otherwise we'll got
  ```
  GET https://firebaseextensions.googleapis.com/v1beta/projects/PROJECT_ID/instances
  {
    "error": {
      "code": 403,
      "message": "The caller does not have permission",
      "status": "PERMISSION_DENIED"
    }
  }
  ```
- "Cloud Billing API" required even if we already have billing setup.
