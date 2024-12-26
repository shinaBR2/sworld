# Database Management with Hasura

This guide outlines the database management workflow using Hasura. We use Hasura Cloud for development and the Hasura CLI for version control of our database migrations.

## Project Structure

```
📂 sworld-hasura-v2
├─ 📂 metadata
│  ├─ 📂 databases
│  │  ├─ 📂 default
│  │  │  └─ 📂 sworld
│  │  │     └─ 📂 tables
│  │  │       ├─ 📄 public_author.yaml
│  │  │       ├─ 📄 public_article.yaml
│  │  │       └─ 📄 tables.yaml
|  |  |     └─ 📄 databases.yaml
│  │  └── 📄 databases.yaml
│  ├─ 📄 actions.graphql
│  ├─ 📄 actions.yaml
│  ├─ 📄 allow_list.yaml
│  ├─ 📄 api_limits.yaml
│  ├─ 📄 cron_triggers.yaml
│  ├─ 📄 graphql_schema_introspection.yaml
│  ├─ 📄 inherited_roles.yaml
│  ├─ 📄 network.yaml
│  ├─ 📄 query_collections.yaml
│  ├─ 📄 remote_schemas.yaml
│  ├─ 📄 rest_endpoints.yaml
│  └─ 📄 version.yaml
├─ 📂 migrations
│  └─ 📂 sworld
│     └─ 📄 1734786850574_initial_schema.up.sql
├─ 📂 seeds
└─ 📄 config.yaml
└─ 📄 .env
```

## Prerequisites

- Hasura CLI installed (`npm install -g hasura-cli`)
- Access to Hasura Cloud Console

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# HASURA_GRAPHQL_ENDPOINT doesn't include "/v1/graphql"
HASURA_GRAPHQL_ENDPOINT=hasura-cloud-endpoint
HASURA_GRAPHQL_ADMIN_SECRET=admin-secret
```

Note: Although `.env` is tracked in the repository, ensure sensitive production credentials are never committed.

## Development Workflow

### 1. **Start Local Console**

```bash
hasura console
```

This will:

- Start Hasura console on your browser
- Auto-generate migration files for schema changes
- Auto-generate metadata files for permissions, relationships, etc.

### 2. **Review Changes**

```bash
# Check status of migrations
hasura migrate status

# Review metadata
git diff hasura/metadata
```

### 3. **Apply to Other Environments**

```
# Apply migrations
hasura migrate apply --endpoint https://your-prod.hasura.app

# Apply metadata
hasura metadata apply --endpoint https://your-prod.hasura.app
```

## Database Seeding

Seeds should be created for initial data required by all applications.

### 1. **Creating Seeds**

Create seed files in `hasura/seeds/`:

```bash
# Generate a seed file
hasura seed create <seed-name>
```

### 2. **Applying Seeds**

To apply seeds to your database:

```bash
# Apply all seeds
hasura seed apply
```

## Best Practices

### 1. **Migration Naming**

- Use descriptive names: `create_users_table`, `add_email_to_users`
- Include timestamp prefix (automatically added by Hasura)

### 2. **Metadata Management**

- Always export metadata after making changes
- Review metadata diffs before committing

### 3. **Version Control**

- Commit migrations and metadata together
- Include clear commit messages describing schema changes

## Common Commands

```bash
# Initialize Hasura project
hasura init hasura --endpoint <hasura-endpoint>

# Export current state
hasura metadata export
hasura migrate create <migration-name> --from-server

# Apply changes
hasura migrate apply
hasura metadata apply

# View status
hasura migrate status
hasura metadata status

# Create and apply seeds
hasura seed create <seed-name>
hasura seed apply
```

## Troubleshooting

If you encounter inconsistencies between your local state and the server:

### 1. Export the current server state:

```bash
hasura metadata export
hasura migrate create fix_inconsistency --from-server
```

### 2. Reset the local state:

```bash
hasura migrate squash --name "reset_to_current"
hasura metadata reload
```

## Important Notes

- Always backup your database before applying major changes
- Test migrations in a development environment first
- Keep migrations atomic and focused on specific changes
- Document any manual interventions required for specific migrations

For more information, refer to the [Hasura Documentation](https://hasura.io/docs/latest/migrations-metadata-seeds/index/).
