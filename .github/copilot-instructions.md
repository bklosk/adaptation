Whenever you run a command in the terminal, pipe the output to a file, output.txt, that you can read from. Make sure to overwrite each time so that it doesn't grow too big. There is a bug in the current version of Copilot that causes it to not read the output of commands correctly. This workaround allows you to read the output from the temporary file instead.
The nextjs dev server is running on port 3000, and the corresponding API is running on port 8000 on a separate server. Do not create new instances of the dev servers.
This is a nextjs project with tailwind. Do not write .css files, use tailwind classes instead.
The project uses TypeScript, so all files should have the .ts or .tsx extension as appropriate.
The project uses the latest version of Next.js, so make sure to use the latest features and best practices.
The project uses the latest version of Tailwind CSS, so make sure to use the latest features and best practices.
If you need to see endpoints available from the API, run the command `curl http://api.climateriskplan.com/openapi.json` in the terminal and read the output from output.txt. The API is a RESTful API, so you can use the standard HTTP methods (GET, POST, PUT, DELETE) to interact with it. This API root endpoint returns openapi.json, which contains the API specification. You can use this to understand the available endpoints and their parameters.
