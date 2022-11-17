# Washingbook

This is a digitalized version of the washingbook used in the student dormitories of the RWTH Aachen university. 
It is a simple web application that allows students to book a washing machine in their dormitory. 

The frontend and backend are built in [svelte-kit](https://kit.svelte.dev/) using TypeScript,
for styling [tailwindcss](https://tailwindcss.com/) has been used
and authentication is done using a dormitory wide [keycloak](https://www.keycloak.org/) SSO that will not be published.
All data is stored in a [mongodb](https://www.mongodb.com/) database.
For deployment a [docker file](https://www.docker.com/) is provided.

## Setup
1. Start docker container with mongodb
1. Set up your Keycloak instance
1. Input the client configuration in `./src/lib/keycloak.ts`
1. Copy the client public key into `./src/lib/server/public.pem`
1. Run this with npm
