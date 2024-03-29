# Washingbook

This is a digitalized version of the washingbook used in the student dormitories of the RWTH Aachen university. 
It is a simple web application that allows students to book a washing machine in their dormitory. 

The frontend and backend are built in [svelte-kit](https://kit.svelte.dev/) using TypeScript,
for styling [tailwindcss](https://tailwindcss.com/) has been used.<br>
Authentication is done using a dormitory wide [keycloak](https://www.keycloak.org/) SSO that will not be published.<br>
All data is stored in either a [mongodb](https://www.mongodb.com/) or a [postgres](https://www.postgresql.org/) database. <br>
For deployment a [docker file](https://www.docker.com/) is provided.

## Setup
1. Start docker container with postgres
1. Initialize database with `psql -U postgres -d postgres -a -f schema.sql`
1. Configure database connection in `./src/lib/server/db/db.json`
1. Set up your Keycloak instance
1. Input the client configuration in `./src/lib/keycloak.ts`
1. Copy the client public key into `./src/lib/server/public.pem`
1. Run this with npm
