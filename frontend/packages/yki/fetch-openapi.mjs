// Requires Node.js 17 or later
// Looks for GH_TOKEN env variable to access the GitHub API
import fs from 'fs';

const fetchAndWrite = async (filename) => {
  const url = 'http://localhost:8080/akr/api/api-docs';

  // const GH_TOKEN = process.env.GH_TOKEN;
  // eslint-disable-next-line no-console
  console.info(`Fetching ${url}`);

  // Uses the experimental fetch API to make a request to the GitHub API
  const response = await fetch(url, {
    // headers: {
    //   Accept: 'application/vnd.github.raw',
    //   Authorization: `Bearer ${GH_TOKEN}`,
    //   'X-GitHub-Api-Version': '2022-11-28',
    // },
  });

  if (!response.ok) {
    throw new Error(`HTTP status: ${response.status}`);
  }

  const json = await response.json();
  const text = await JSON.stringify(json, null, 2);

  fs.writeFileSync(filename, text);
};

const fetchAll = async () => {
  await fetchAndWrite('openapi.json');
  // await fetchAndWrite('openapi.yaml');
};

fetchAll();
